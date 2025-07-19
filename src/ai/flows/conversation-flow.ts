
'use server';
/**
 * @fileOverview An AI conversation practice agent with objectives and evaluation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { DialogueMessageSchema, EvaluationSchema } from '@/lib/types';


// Define the schema for the AI's standard conversational response
const ConversationResponseSchema = z.object({
  farsi: z.string().describe("The AI's response in Farsi."),
  finglish: z.string().describe("The Finglish transliteration of the AI's response."),
  objectiveMet: z.boolean().describe("Set to true ONLY if the user has successfully and explicitly met all parts of their objective in their last message.")
});

const PersonaSchema = z.object({
  name: z.string().describe("The name of the AI persona."),
  role: z.string().describe("The role or personality of the AI persona (e.g., 'a friendly waiter', 'a busy shopkeeper')."),
});
export type Persona = z.infer<typeof PersonaSchema>;


// Define the input for the main flow
const ConversationInputSchema = z.object({
  persona: PersonaSchema.describe("The persona the AI should adopt for the conversation."),
  history: z.array(DialogueMessageSchema).describe("The history of the conversation so far."),
  vocabulary: z.array(z.string()).describe("A list of Farsi words/phrases the user has learned, in the format 'English: [English] - Farsi: [Farsi] - Finglish: [Finglish]'."),
  objective: z.string().describe("The specific objective the user is trying to achieve in this conversation."),
});
export type ConversationInput = z.infer<typeof ConversationInputSchema>;

// Define the final output schema for the entire action
const ConversationOutputSchema = z.object({
    response: z.object({
        farsi: z.string(),
        finglish: z.string(),
    }),
    isComplete: z.boolean(),
    evaluation: EvaluationSchema.nullable(),
});
export type ConversationOutput = z.infer<typeof ConversationOutputSchema>;

// Define a schema for history items that includes a boolean helper
const HistoryItemWithUserFlagSchema = DialogueMessageSchema.extend({
    isUser: z.boolean(),
});

// Prompt for the evaluation phase
const evaluationPrompt = ai.definePrompt({
    name: 'evaluationPrompt',
    input: { schema: z.object({
        conversationHistory: z.array(HistoryItemWithUserFlagSchema),
        personaName: z.string(),
        objective: z.string(),
        objectiveMet: z.boolean(),
    }) },
    output: { schema: EvaluationSchema },
    prompt: `You are a Farsi language teaching expert. The user is a student who has just completed a practice conversation.
Analyze the entire conversation history provided below and give a detailed evaluation.

- The user's objective was: {{{objective}}}
- The user's messages are from the 'user' role.
- Your persona in the conversation was '{{{personaName}}}', from the 'model' role.
- The user is learning modern, conversational Tehrani dialect Farsi, not formal 'ketaabi' Farsi. Their goal is to speak and listen in real-world scenarios.

**Evaluation Criteria:**

1.  **Objective Completion:** State clearly whether the user successfully completed their objective. The \`objectiveMet\` flag is '{{{objectiveMet}}}'. If they didn't complete it, provide specific, constructive feedback on what they could have said to meet the objective. Explain *why* they didn't meet it (e.g., they didn't proactively include the required information). Give examples of more natural or conversational ways to phrase things, for instance, dropping 'ast' in speech (e.g., 'Karaam ziadeh' is more conversational than 'karam ziaad ast').

2.  **Tone & Formality (score 1-5):** Rate their performance on using the correct level of politeness. Provide specific examples and corrections. **CRITICAL: If you provide any corrections, the score CANNOT be 5.** Be aware of conversational nuances. For example, 'haletoon chetore?' is a perfectly acceptable formal greeting. The suffix '-toon' corresponds to formal 'shomaa', while '-et' corresponds to informal 'to'. For example, 'delam bara*toon* tang shodeh' is the formal version of 'I miss you'.

3.  **Grammar & Spelling (score 1-5):** Identify any grammatical errors or significant spelling mistakes in their Farsi or Finglish. Provide corrections and explanations. **CRITICAL: If you provide any corrections, the score CANNOT be 5.** If there are no errors, commend them. Focus on natural phrasing. For example, suggesting 'yek porseye bozorg ghorme sabzi' is more natural than 'ghorme sabzi-ye bozorg'.

4.  **Taarof:** Did the student correctly use or respond to any instances of 'taarof'? Taarof is a complex form of Iranian etiquette. Note any missed opportunities or incorrect usage. If none occurred, state that. Acknowledge that expressions of affection like 'Ghorboonet beram' are not taarof, but signs of warmth.

5.  **Overall Feedback:** Give general, encouraging feedback and suggestions for improvement. Comment on cultural context, like explaining that 'mersi' is commonly used, or that a phrase like 'delam baratoon tang shodeh' implies a close relationship.

**IMPORTANT FORMATTING:** For all feedback fields, use newline characters (\\n) to break up long paragraphs and create a clear, readable structure. Do not return a single wall of text.

Provide the output as a structured JSON object.

<conversationHistory>
{{#each conversationHistory}}
{{#if isUser}}
User: {{{this.content}}}
{{else}}
{{{personaName}}}: {{{this.content}}}
{{/if}}
{{/each}}
</conversationHistory>
`,
});

// The main conversation prompt
const conversationPrompt = ai.definePrompt({
    name: 'conversationPrompt',
    input: { schema: z.object({ ...ConversationInputSchema.shape, history: z.array(HistoryItemWithUserFlagSchema) }) },
    output: { schema: ConversationResponseSchema },
    prompt: `You are an AI Farsi language practice partner. You are role-playing to help a user practice. Your entire identity is that of a practice partner, and your single most important goal is to help the user meet their objective.

Your persona is {{{persona.name}}}, who is {{{persona.role}}}.
Your Farsi MUST be modern, conversational Tehrani dialect. For example, for the plural 'you', prefer verb suffixes like '-in' instead of the more formal '-id'.

The user's objective is: {{{objective}}}.

Your entire goal is to analyze the user's most recent message and determine if they have EXPLICITLY met all parts of their objective. Do not infer. The user must state the required information.
- Keep your conversational responses simple, short, and directly related to the scenario. Do not ask a new question if it's not necessary.
- The user may respond in English, Farsi, or Finglish. Respond appropriately in Farsi.
- Primarily use words from the user's known vocabulary list provided below.

**CRITICAL ANALYSIS:** Based on the last user message, have they fully and explicitly met their objective?
- If YES, provide a simple concluding response (like "Of course, here is your bill." or "It was good talking to you!") and set \`objectiveMet\` to \`true\`.
- If NO, provide a natural conversational response to keep the scenario going and set \`objectiveMet\` to \`false\`. Do not end the conversation if the objective is not met.

<vocabulary>
{{#each vocabulary}}
- {{{this}}}
{{/each}}
</vocabulary>

Here is the conversation history so far:
{{#each history}}
{{#if isUser}}
User: {{{this.content}}}
{{else}}
{{{persona.name}}}: {{{this.content}}}
{{/if}}
{{/each}}

Analyze the last user message and provide your response and the \`objectiveMet\` flag as a JSON object.
`,
});

const evaluationFlow = ai.defineFlow({
    name: 'evaluationFlow',
    inputSchema: z.object({
        history: z.array(DialogueMessageSchema),
        personaName: z.string(),
        objective: z.string(),
        objectiveMet: z.boolean(),
    }),
    outputSchema: EvaluationSchema,
}, async ({ history, personaName, objective, objectiveMet }) => {
    // Add the isUser flag for the template
    const historyWithFlags = history.map(h => ({...h, isUser: h.role === 'user'}));
    const response = await evaluationPrompt({
        conversationHistory: historyWithFlags,
        personaName,
        objective,
        objectiveMet
    });
    return response.output!;
});


const conversationFlow = ai.defineFlow(
  {
    name: 'conversationFlow',
    inputSchema: ConversationInputSchema,
    outputSchema: ConversationOutputSchema,
  },
  async (input) => {
    // Add the isUser flag for the template
    const historyWithFlags = input.history.map(h => ({...h, isUser: h.role === 'user'}));
    const llmResponse = await conversationPrompt({...input, history: historyWithFlags });

    const output = llmResponse.output;
    if (!output) {
        throw new Error("Failed to generate a conversation response.");
    }

    // Append the AI's own response to the history for the evaluation step
    const updatedHistory = [...input.history, { role: 'model', content: output.farsi, finglish: output.finglish }];

    if (output.objectiveMet) {
        // Objective met, end conversation and run evaluation
        const evaluation = await evaluationFlow({
            history: updatedHistory,
            personaName: input.persona.name,
            objective: input.objective,
            objectiveMet: true
        });
        
        return {
            response: {
                farsi: output.farsi,
                finglish: output.finglish,
            },
            isComplete: true,
            evaluation: evaluation,
        }
    }
    
    // Conversation is ongoing
    return {
        response: {
            farsi: output.farsi,
            finglish: output.finglish,
        },
        isComplete: false,
        evaluation: null,
    };
  }
);

export async function practiceDialogueAction(input: ConversationInput): Promise<ConversationOutput> {
    const validatedInput = ConversationInputSchema.parse(input);
    return await conversationFlow(validatedInput);
}

// Action to run just the evaluation when a user gives up
const EvaluateConversationInputSchema = z.object({
    personaName: z.string(),
    objective: z.string(),
    history: z.array(DialogueMessageSchema),
});
export type EvaluateConversationInput = z.infer<typeof EvaluateConversationInputSchema>;

export async function evaluateConversationAction(input: EvaluateConversationInput): Promise<EvaluationSchema> {
    const validatedInput = EvaluateConversationInputSchema.parse(input);
    return await evaluationFlow({
        ...validatedInput,
        objectiveMet: false // If user gives up, objective was not met
    });
}

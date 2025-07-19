
"use client";

import { create } from 'zustand';
import type { ContentItem } from '@/lib/types';

export type Answer = {
  question: ContentItem;
  userAnswer: string;
  isCorrect: boolean;
  usedHint?: boolean;
};

type QuizState = {
  questions: ContentItem[];
  currentQuestionIndex: number;
  answers: Answer[];
  quizConfig: {
    questionCount: number | 'all';
    tags: string[];
    categories: string[];
    direction: 'en-fa' | 'fa-en';
    answerFormat: 'farsi' | 'finglish' | null;
    questionFormat: 'reading' | 'listening';
    answerMethod: 'writing' | 'speaking';
  };
  hintedQuestionIndexes: number[];
  setQuizConfig: (config: Partial<QuizState['quizConfig']>) => void;
  startQuiz: (questions: ContentItem[]) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  useHint: () => void;
};

const initialState: Omit<QuizState, 'setQuizConfig' | 'startQuiz' | 'submitAnswer' | 'nextQuestion' | 'resetQuiz' | 'useHint'> = {
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    hintedQuestionIndexes: [],
    quizConfig: {
        questionCount: 10,
        tags: [],
        categories: [],
        direction: 'en-fa',
        answerFormat: 'farsi',
        questionFormat: 'reading',
        answerMethod: 'writing',
    },
};

export const useQuizStore = create<QuizState>((set, get) => ({
    ...initialState,

    setQuizConfig: (config) => set(state => ({
        quizConfig: { ...state.quizConfig, ...config }
    })),

    startQuiz: (questions) => {
        const { questionCount, questionFormat } = get().quizConfig;
        
        let selectedQuestions = [...questions];
        
        // If listening quiz, filter for items that have audio
        if (questionFormat === 'listening') {
          selectedQuestions = selectedQuestions.filter(q => !!q.audioUrl);
        }

        // Shuffle questions
        selectedQuestions.sort(() => Math.random() - 0.5);

        // Limit question count
        if (questionCount !== 'all' && selectedQuestions.length > questionCount) {
            selectedQuestions = selectedQuestions.slice(0, questionCount);
        }

        set({ questions: selectedQuestions, currentQuestionIndex: 0, answers: [], hintedQuestionIndexes: [] });
    },

    submitAnswer: (answer) => {
        const state = get();
        const currentQuestion = state.questions[state.currentQuestionIndex];
        if (!currentQuestion || !('english' in currentQuestion)) return;

        const { direction, answerFormat } = state.quizConfig;
        
        let correctAnswer = '';
        if (direction === 'en-fa') {
            correctAnswer = answerFormat === 'farsi' ? currentQuestion.farsi : currentQuestion.finglish;
        } else { // fa-en
            correctAnswer = currentQuestion.english;
        }

        // Simple case-insensitive and whitespace-trimming comparison
        const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        
        const usedHint = state.hintedQuestionIndexes.includes(state.currentQuestionIndex);

        const newAnswer: Answer = {
            question: currentQuestion,
            userAnswer: answer,
            isCorrect,
            usedHint,
        };
        
        set({ answers: [...state.answers, newAnswer] });
    },

    nextQuestion: () => {
        set(state => ({
            currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
    },

    resetQuiz: () => {
        set(initialState);
    },

    useHint: () => {
        set(state => {
            if (!state.hintedQuestionIndexes.includes(state.currentQuestionIndex)) {
                return { hintedQuestionIndexes: [...state.hintedQuestionIndexes, state.currentQuestionIndex] };
            }
            return {}; // Return empty object if no change is needed
        });
    }
}));

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Loader2, PlusCircle, Trash2, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addContentItemAction, updateContentItemAction } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { generateFarsiAction, generateConjugationsAction, generateCategoryAction } from "@/app/ai-actions"
import type { ContentItem, VerbConjugation, Category } from "@/lib/types"
import { getCategories } from "@/lib/firestore"
import { ContentItemFormValuesSchema } from "@/lib/types"

const createFormSchema = (type: ContentItem['type'], isLessonContext: boolean) => {
  return ContentItemFormValuesSchema(type, isLessonContext);
};

type ContentItemFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface AdminFormProps {
    contentType: ContentItem['type'];
    lessonId: string | null;
    initialData?: Partial<ContentItem> & { tags?: string[] | string } | null;
    onFormSubmit?: () => void;
}

export default function AdminForm({ contentType, lessonId, initialData, onFormSubmit }: AdminFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingFarsi, setIsGeneratingFarsi] = useState<number | boolean>(false);
  const [isGeneratingConjugations, setIsGeneratingConjugations] = useState(false);
  const [isGeneratingCategory, setIsGeneratingCategory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  const isLessonContext = !!lessonId;
  const isEditMode = !!initialData;
  const formSchema = createFormSchema(contentType, isLessonContext);

  const getDefaultValues = (): ContentItemFormValues => {
    if (initialData) {
      const defaults: any = {
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
      };
      if (initialData.type === 'verb' && 'conjugations' in initialData) {
        defaults.conjugations = initialData.conjugations?.map(c => ({...c, person: c.person !== null ? String(c.person) : null })) || [];
      }
       if (initialData.type === 'dialogue' && 'dialogue' in initialData) {
        defaults.dialogue = initialData.dialogue?.map(d => ({ ...d, farsi: d.farsi || '' })) || [];
      }
      return defaults;
    }
    // Default values for new items
    const baseDefaults = {
      tags: "",
      status: isLessonContext ? 'draft' : 'published',
    } as const;

    switch(contentType) {
      case 'word':
        return {
          ...baseDefaults,
          type: 'word',
          english: "",
          finglish: "",
          farsi: "",
          notes: "",
          category: "",
        }
      case 'phrase':
        return {
          ...baseDefaults,
          type: 'phrase',
          english: "",
          finglish: "",
          farsi: "",
          notes: "",
        }
      case 'verb':
        return {
          ...baseDefaults,
          type: 'verb',
          english: "",
          finglish: "",
          farsi: "",
          category: "",
          notes: "",
          conjugations: [],
        }
      case 'cultural_note':
        return {
          ...baseDefaults,
          type: 'cultural_note',
          title: "",
          content: "",
        }
      case 'dialogue':
        return {
          ...baseDefaults,
          type: 'dialogue',
          title: "",
          dialogue: [{ speaker: '', english: '', finglish: '', farsi: '' }],
          notes: "",
        }
      default:
        const _exhaustiveCheck: never = contentType;
        throw new Error("Invalid content type");
    }
  }

  const form = useForm<ContentItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset the form if the type or initial data changes (e.g., closing and reopening dialog)
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [contentType, initialData, isLessonContext]);


  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "conjugations",
  });
  
  const { fields: dialogueFields, append: appendDialogueLine, remove: removeDialogueLine } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "dialogue",
  });

  const watchedContentType = form.watch("type");

  const handleGenerateFarsi = async (index?: number) => {
    const isDialogue = typeof index === 'number';
    const english = isDialogue ? form.getValues(`dialogue.${index}.english` as any) : form.getValues("english" as any);
    const finglish = isDialogue ? form.getValues(`dialogue.${index}.finglish` as any) : form.getValues("finglish" as any);

    if (!english || !finglish) {
      toast({ title: "Missing fields", description: "Please enter both English and Finglish text.", variant: "destructive" });
      return;
    }
    
    setIsGeneratingFarsi(isDialogue ? index : true);
    try {
      const result = await generateFarsiAction({ english, finglish });
      if (result.farsi) {
        if (isDialogue) {
            form.setValue(`dialogue.${index}.farsi` as any, result.farsi, { shouldValidate: true });
        } else {
            form.setValue("farsi" as any, result.farsi, { shouldValidate: true });
        }
        toast({ title: "Farsi Generated!", description: "The Farsi script has been populated." });
      } else { throw new Error("Received an empty response from the AI."); }
    } catch (error: any) {
      console.error("Error generating Farsi:", error);
      toast({ title: "Generation Failed", description: error.message || "Could not generate Farsi script.", variant: "destructive" });
    } finally {
      setIsGeneratingFarsi(false);
    }
  };

  const handleGenerateConjugations = async () => {
    // @ts-ignore
    const verbEnglish = form.getValues("english");
    // @ts-ignore
    const verbFinglish = form.getValues("finglish");

    if (!verbEnglish || !verbFinglish) {
        toast({ title: "Missing Verb", description: "Please enter the English and Finglish for the verb first.", variant: "destructive" });
        return;
    }

    setIsGeneratingConjugations(true);
    try {
        const result = await generateConjugationsAction({ verbEnglish, verbFinglish });
        if (result.conjugations && result.conjugations.length > 0) {
            const formConjugations = result.conjugations.map(c => ({ ...c, person: c.person !== null ? String(c.person) : null }));
            // @ts-ignore
            replace(formConjugations);
            toast({ title: "Conjugations Generated!", description: `Successfully generated ${result.conjugations.length} conjugations.` });
        } else { throw new Error("AI returned no conjugations."); }
    } catch (error: any) {
        console.error("Error generating conjugations:", error);
        toast({ title: "Generation Failed", description: error.message || "Could not generate conjugations.", variant: "destructive" });
    } finally {
        setIsGeneratingConjugations(false);
    }
  };

  const handleGenerateCategory = async () => {
    // @ts-ignore
    const english = form.getValues("english");
    if (!english) {
      toast({ title: "Missing field", description: "Please enter the English text first.", variant: "destructive" });
      return;
    }
    if (categories.length === 0) {
      toast({ title: "No Categories", description: "No categories found to suggest from.", variant: "destructive" });
      return;
    }

    setIsGeneratingCategory(true);
    try {
      const availableCategories = categories.map(c => c.name);
      const result = await generateCategoryAction({ english, availableCategories });
      const suggestedCategory = categories.find(c => c.name === result.categoryName);

      if (suggestedCategory) {
        // @ts-ignore
        form.setValue("category", suggestedCategory.id, { shouldValidate: true });
        toast({ title: "Category Suggested!", description: `The category has been set to "${suggestedCategory.name}".` });
      } else {
        throw new Error("AI returned an invalid or empty category.");
      }
    } catch (error: any) {
      console.error("Error generating category:", error);
      toast({ title: "Suggestion Failed", description: error.message || "Could not suggest a category.", variant: "destructive" });
    } finally {
      setIsGeneratingCategory(false);
    }
  };

  async function onSubmit(values: ContentItemFormValues) {
    setIsSubmitting(true);
    
    // The Zod transform handles converting the tag string to an array of names
    let dataToSubmit: any = {
        id: initialData?.id,
        ...values,
    };

    if (values.type === 'verb') {
        dataToSubmit.conjugations = values.conjugations?.map(c => ({ ...c, person: c.person && c.person !== 'none' ? Number(c.person) : null })) || [];
    }
    
    const actionPayload = { 
        ...dataToSubmit,
        lessonId: lessonId
    };

    if (!isEditMode) {
      actionPayload.lessonIds = lessonId ? [lessonId] : [];
    }


    const result = isEditMode
        ? await updateContentItemAction(actionPayload)
        : await addContentItemAction(actionPayload);

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: `Content Item ${isEditMode ? 'Updated' : 'Submitted'}!`, description: "Your changes have been saved." });
      form.reset();
      remove();
      if (onFormSubmit) onFormSubmit();
    } else {
      toast({ title: "Error", description: result.error || "Something went wrong.", variant: "destructive" });
    }
  }


  const renderFormFields = () => {
    switch(watchedContentType) {
      case 'word':
      case 'verb':
        return <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="english" render={({ field }) => (<FormItem><FormLabel>English</FormLabel><FormControl><Input placeholder="e.g., 'Hello'" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="finglish" render={({ field }) => (<FormItem><FormLabel>Finglish (Pronunciation)</FormLabel><FormControl><Input placeholder="e.g., 'Salaam'" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          
          <FormField control={form.control} name="farsi" render={({ field }) => (
              <FormItem>
                <FormLabel>Farsi</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input placeholder="AI can generate this..." {...field} dir="rtl" className="text-right" /></FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleGenerateFarsi()} disabled={isGeneratingFarsi === true}>
                      {isGeneratingFarsi === true ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="sr-only">Generate Farsi</span>
                    </Button>
                  </div>
                <FormMessage />
              </FormItem>
            )} />

          <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional notes about the item..." {...field} /></FormControl><FormMessage /></FormItem>)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category {isLessonContext && <span className="text-muted-foreground text-xs">(optional)</span>}</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={handleGenerateCategory} disabled={isGeneratingCategory}>
                          {isGeneratingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                          <span className="sr-only">Suggest Category</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
               <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                     <FormControl><Input placeholder="food, travel (comma separated)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
          </div>
        </>
      case 'phrase':
        return <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="english" render={({ field }) => (<FormItem><FormLabel>English</FormLabel><FormControl><Input placeholder="e.g., 'Hello'" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="finglish" render={({ field }) => (<FormItem><FormLabel>Finglish (Pronunciation)</FormLabel><FormControl><Input placeholder="e.g., 'Salaam'" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="farsi" render={({ field }) => (
              <FormItem>
                <FormLabel>Farsi</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input placeholder="AI can generate this..." {...field} dir="rtl" className="text-right" /></FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleGenerateFarsi()} disabled={isGeneratingFarsi === true}>
                      {isGeneratingFarsi === true ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="sr-only">Generate Farsi</span>
                    </Button>
                  </div>
                <FormMessage />
              </FormItem>
            )} />
          <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional notes about the phrase..." {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                  <FormControl><Input placeholder="food, travel (comma separated)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
        </>
      case 'cultural_note':
        return <>
          <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., 'Nowruz'" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea placeholder="Explain the cultural note here..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                  <FormControl><Input placeholder="culture, tradition (comma separated)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
        </>
      case 'dialogue':
        return <>
          <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., 'At the bakery'" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <Card className="bg-muted/30">
            <CardHeader><CardTitle>Dialogue Lines</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {dialogueFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative space-y-4 bg-background">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeDialogueLine(index)}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                  <FormField control={form.control} name={`dialogue.${index}.speaker`} render={({ field }) => (<FormItem><FormLabel>Speaker (Optional)</FormLabel><FormControl><Input placeholder="e.g., 'Yusha'" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`dialogue.${index}.english`} render={({ field }) => (<FormItem><FormLabel>English</FormLabel><FormControl><Input placeholder="e.g., 'Hello, how are you?'" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`dialogue.${index}.finglish`} render={({ field }) => (<FormItem><FormLabel>Finglish</FormLabel><FormControl><Input placeholder="e.g., 'Salaam, chetori?'" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`dialogue.${index}.farsi`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Farsi</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl><Input placeholder="AI can generate this..." {...field} dir="rtl" className="text-right" /></FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => handleGenerateFarsi(index)} disabled={isGeneratingFarsi === index}>
                                {isGeneratingFarsi === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                <span className="sr-only">Generate Farsi for this line</span>
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                  )} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendDialogueLine({ speaker: '', farsi: '', english: '', finglish: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Line
              </Button>
            </CardContent>
          </Card>
           <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional notes about the dialogue..." {...field} /></FormControl><FormMessage /></FormItem>)} />
           <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                  <FormControl><Input placeholder="conversation, food (comma separated)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
        </>
      default:
        return <p>Invalid content type.</p>
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField control={form.control} name="type" render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)} />
        
        {renderFormFields()}

        {isEditMode && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  'Draft' items only appear in lessons. 'Published' items appear on the main page.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        {watchedContentType === 'verb' && (
          <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Conjugations</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateConjugations} disabled={isGeneratingConjugations}>
                    {isGeneratingConjugations ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate with AI
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative space-y-4 bg-background">
                   <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                   </Button>
                   <FormField control={form.control} name={`conjugations.${index}.tense`} render={({ field }) => (<FormItem><FormLabel>Tense</FormLabel><FormControl><Input placeholder="Present Simple" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`conjugations.${index}.farsi`} render={({ field }) => (<FormItem><FormLabel>Farsi</FormLabel><FormControl><Input {...field} dir="rtl" className="text-right" /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`conjugations.${index}.english`} render={({ field }) => (<FormItem><FormLabel>English</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`conjugations.${index}.finglish`} render={({ field }) => (<FormItem><FormLabel>Finglish</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        <FormField control={form.control} name={`conjugations.${index}.person`} render={({ field }) => (<FormItem><FormLabel>Person</FormLabel><Select onValueChange={field.onChange} value={field.value ?? "none"}><FormControl><SelectTrigger><SelectValue placeholder="Person" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1st</SelectItem><SelectItem value="2">2nd</SelectItem><SelectItem value="3">3rd</SelectItem><SelectItem value="none">N/A</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`conjugations.${index}.stem`} render={({ field }) => (<FormItem><FormLabel>Stem</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`conjugations.${index}.formal`} render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-auto"><FormLabel>Formal</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`conjugations.${index}.plural`} render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-auto"><FormLabel>Plural</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                   </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ tense: '', farsi: '', english: '', finglish: '', person: null, stem: null, formal: false, plural: false })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Conjugation Manually
              </Button>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Content Item')}
        </Button>
      </form>
    </Form>
  )
}

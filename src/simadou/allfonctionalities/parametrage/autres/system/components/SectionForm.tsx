import { Resolver, useForm, type DefaultValues } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2, RotateCcw } from 'lucide-react'

interface SectionFormProps<TSchema extends z.ZodType<any, any, any>> {
  schema:        TSchema
  defaultValues: DefaultValues<z.infer<TSchema>>
  onSave:        (data: z.infer<TSchema>) => void
  isSaving:      boolean
  children:      (form: ReturnType<typeof useForm<z.infer<TSchema>>>) => React.ReactNode
}

export function SectionForm<TSchema extends z.ZodType<any, any, any>>({
  schema,
  defaultValues,
  onSave,
  isSaving,
  children,
}: SectionFormProps<TSchema>) {
  type TValues = z.infer<TSchema>

  const form = useForm<TValues>({
    resolver:      zodResolver(schema) as unknown as Resolver<TValues>,
    defaultValues,
  })

  const isDirty = form.formState.isDirty

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="flex flex-col gap-6"
      >
        {children(form)}
        <Separator />
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isDirty}
            onClick={() => form.reset()}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Restaurer les paramètres
          </Button>
          <Button type="submit" size="sm" disabled={!isDirty || isSaving}>
            {isSaving && <Loader2 className="size-3.5 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  )
}
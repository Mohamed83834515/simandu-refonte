import { useEffect, useImperativeHandle, forwardRef } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  AlertCircle,
  PenLine,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormField } from '../Fields/FormField'
import type { FormConfig } from '../types/formConfig'
import {
  formPrimaryButtonClassName,
  formSecondaryButtonClassName,
} from './form-footer-styles'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DynamicFormProps {
  config: FormConfig
  schema: z.ZodType<any, any>
  defaultValues: any
  onSubmit: (data: any) => void
  isLoading?: boolean
  submitText?: string
  loadingText?: string
  onFieldChange?: (fieldName: string, value: unknown) => void
  /** Bouton secondaire (ex. Annuler / Retour) dans le pied du formulaire */
  onCancel?: () => void
  cancelText?: string
  /** Bouton retour étape précédente (ex. formulaire multi-étapes) */
  onBack?: () => void
  backText?: string
}

export interface DynamicFormHandle {
  setValue: (name: string, value: any) => void
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const DynamicForm = forwardRef<DynamicFormHandle, DynamicFormProps>(
  (
    {
      config,
      schema,
      defaultValues,
      onSubmit,
      isLoading = false,
      submitText = 'Soumettre',
      loadingText = 'En cours…',
      onFieldChange,
      onCancel,
      cancelText = 'Annuler',
      onBack,
      backText = 'Précédent',
    },
    ref
  ) => {
    const form = useForm({
      resolver: zodResolver(schema) as any,
      defaultValues: defaultValues as any,
      mode: 'onBlur' as const,
    })

    const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
      control,
      watch,
      trigger,
      setValue,
      reset
    } = form

    useEffect(() => {
  reset(defaultValues);
}, [defaultValues]);

    useImperativeHandle(ref, () => ({
      setValue: (name: string, value: any) =>
        setValue(name as any, value, {
          shouldDirty: true,
          shouldValidate: false,
        }),
    }))

    useEffect(() => {
      if (!onFieldChange) return
      const sub = watch((data, { name }) => {
        if (name && data[name] !== undefined) onFieldChange(name, data[name])
      })
      return () => sub.unsubscribe()
    }, [watch, onFieldChange])

    const shouldShowField = (field: any) => {
      if (field.hidden) return false
      if (field.showWhen)
        return Object.entries(field.showWhen).every(([k, v]) => watch(k) === v)
      if (field.condition) return field.condition(watch())
      return true
    }

    const visibleFields = config.fields.filter(shouldShowField)
    const hasErrors = Object.keys(errors).length > 0
    const errorCount = Object.keys(errors).length

    // ── Status ────────────────────────────────────────────────────────────────

    const status = hasErrors
      ? {
          icon: <AlertCircle className='h-3.5 w-3.5' />,
          label: `${errorCount} erreur${errorCount > 1 ? 's' : ''} à corriger`,
          variant: 'destructive' as const,
          dot: 'bg-destructive',
        }
      : isDirty
        ? {
            icon: <PenLine className='h-3.5 w-3.5' />,
            label: 'Modifications en attente',
            variant: 'secondary' as const,
            dot: 'bg-amber-400',
          }
        : {
            icon: <CheckCircle2 className='h-3.5 w-3.5' />,
            label: 'Formulaire prêt',
            variant: 'outline' as const,
            dot: 'bg-emerald-400',
          }

    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm',
          'transition-shadow duration-300 hover:shadow-md'
        )}
      >
        <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

        {/* ── Corps du formulaire ── */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit as any)}>
            <div className='p-6'>
              <div className='grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2'>
                {visibleFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={cn(
                      'animate-in duration-300 fade-in-0 fill-mode-both slide-in-from-bottom-2 min-w-0',
                      field.gridCols === 1
                        ? 'col-span-1 sm:col-span-2'
                        : 'col-span-1'
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <FormField
                      field={field}
                      register={register}
                      control={control}
                      errors={errors}
                      watch={watch}
                      trigger={trigger}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='mx-6 h-px bg-border/50' />

            {/* ── Pied du formulaire (aligné StepDynamicForm / PTBA) ── */}
            <div className='flex items-center justify-between gap-4 px-6 py-4'>
                {/* Indicateur de statut */}
                <div className='flex items-center gap-2'>
                  <span className='relative flex h-2 w-2'>
                    {(isDirty || hasErrors) && (
                      <span
                        className={cn(
                          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
                          status.dot
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative inline-flex h-2 w-2 rounded-full',
                        status.dot
                      )}
                    />
                  </span>

                  <Badge
                    variant={status.variant}
                    className='gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium'
                  >
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>

                <div className='flex items-center gap-2'>
                  {onBack && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={onBack}
                      className={formSecondaryButtonClassName}
                    >
                      <ArrowLeft className='h-3.5 w-3.5' />
                      <span>{backText}</span>
                    </Button>
                  )}

                  {onCancel && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={onCancel}
                      className={formSecondaryButtonClassName}
                    >
                      {cancelText === 'Retour' ? (
                        <ArrowLeft className='h-3.5 w-3.5' />
                      ) : (
                        <X className='h-3.5 w-3.5' />
                      )}
                      <span>{cancelText}</span>
                    </Button>
                  )}

                  <Button
                    type='submit'
                    disabled={isLoading}
                    size='sm'
                    className={formPrimaryButtonClassName}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <span>{submitText}</span>
                        <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                      </>
                    )}
                  </Button>
                </div>
            </div>
          </form>
        </Form>
      </div>
    )
  }
)

DynamicForm.displayName = 'DynamicForm'

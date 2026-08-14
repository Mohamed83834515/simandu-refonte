import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
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
  onCancel?: () => void
  cancelText?: string
  onBack?: () => void
  backText?: string
  embedded?: boolean
  className?: string
  hideFormFooter?: boolean
  formId?: string
  renderAfter?: React.ReactNode // ← Ajoute cette ligne
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
      embedded = false,
      className,
      hideFormFooter,
      formId,
      renderAfter,
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
      reset,
    } = form

    const defaultValuesKeyRef = useRef<string | null>(null)

    useEffect(() => {
      const nextKey = JSON.stringify(defaultValues)
      if (defaultValuesKeyRef.current === nextKey) return
      defaultValuesKeyRef.current = nextKey
      reset(defaultValues)
    }, [defaultValues, reset])

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

    const visibleFields = config.fields.filter(
      (field) => field.type !== 'hidden' && shouldShowField(field)
    )
    const hiddenFields = config.fields.filter(
      (field) => field.type === 'hidden'
    )
    const useThreeColumnGrid = visibleFields.some(
      (field) => field.gridCols === 3
    )
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
          embedded
            ? 'overflow-visible border-0 bg-transparent shadow-none'
            : 'overflow-visible border-0 bg-transparent shadow-none',
          className
        )}
      >
        {/* ── Corps du formulaire ── */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit as any)} id={formId}>
            {hiddenFields.map((field) => (
              <input key={field.name} type='hidden' {...register(field.name)} />
            ))}
            <div className={cn(embedded ? 'px-0 pt-0 pb-1' : 'px-2 pt-0 pb-1')}>
              <div
                className={cn(
                  'grid grid-cols-1',
                  useThreeColumnGrid ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
                  embedded ? 'gap-x-5 gap-y-3' : 'gap-x-4 gap-y-3'
                )}
              >
                {visibleFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={cn(
                      'min-w-0 animate-in duration-300 fade-in-0 fill-mode-both slide-in-from-bottom-2',
                      useThreeColumnGrid
                        ? field.gridCols === 1
                          ? 'col-span-1 sm:col-span-3'
                          : 'col-span-1'
                        : field.gridCols === 1
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
              {renderAfter && <div className='mt-6'>{renderAfter}</div>}
            </div>

            <div
              className={cn(
                'h-px bg-border/50',
                embedded ? 'mt-3' : 'mx-2 mt-3'
              )}
            />

            {/* ── Pied du formulaire (aligné StepDynamicForm / PTBA) ── Cacher si hideFormFooter */}
            {!hideFormFooter && (
              <div
                className={cn(
                  'flex items-center gap-4',
                  embedded ? 'justify-end pt-3' : 'justify-between px-2 pt-3'
                )}
              >
                {/* Indicateur de statut (masqué en modal embarqué sauf erreurs) */}
                {(!embedded || hasErrors) && (
                  <div className='flex min-w-0 shrink items-center gap-2'>
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
                )}

                <div className='flex shrink-0 items-center gap-2'>
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
            )}
          </form>
        </Form>
      </div>
    )
  }
)

DynamicForm.displayName = 'DynamicForm'

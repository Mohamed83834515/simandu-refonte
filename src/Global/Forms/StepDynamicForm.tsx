// // components/Global/Forms/StepDynamicForm.tsx
// import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
// import type { z } from 'zod'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   Loader2,
//   ArrowRight,
//   ArrowLeft,
//   Check,
//   CircleAlert,
//   CircleDot,
//   CircleCheck,
// } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Form } from '@/components/ui/form'
// import { FormField } from '../Fields/FormField'
// import type { FormConfig, StepConfig } from '../types/formConfig'
// import {
//   formPrimaryButtonClassName,
//   formSecondaryButtonClassName,
// } from './form-footer-styles'

// // ── Types ──────────────────────────────────────────────────────────────────
// interface StepDynamicFormProps {
//   config: FormConfig
//   schema: z.ZodType<any, any>
//   defaultValues: any
//   onSubmit: (data: any) => void
//   isLoading?: boolean
//   submitText?: string
//   loadingText?: string
//   onFieldChange?: (fieldName: string, value: unknown) => void
// }

// export interface StepDynamicFormHandle {
//   setValue: (name: string, value: any) => void
// }

// //────────────────────────────────────
// const getFieldStep = (field: any): number => field.formStep ?? field.step ?? 1

// //────────────────────────────────────
// export const StepDynamicForm = forwardRef<
//   StepDynamicFormHandle,
//   StepDynamicFormProps
// >(
//   (
//     {
//       config,
//       schema,
//       defaultValues,
//       onSubmit,
//       isLoading = false,
//       submitText = 'Soumettre',
//       loadingText = 'En cours…',
//       onFieldChange,
//     },
//     ref
//   ) => {
//     const stepsConfig: StepConfig[] = config.steps ?? [
//       { step: 1, title: 'Formulaire' },
//     ]
//     const totalSteps = stepsConfig.length
//     const [currentStep, setCurrentStep] = useState(1)

//     const form = useForm({
//       resolver: zodResolver(schema) as any,
//       defaultValues: defaultValues as any,
//       mode: 'onBlur',
//     })

//     const {
//       register,
//       handleSubmit,
//       formState: { errors, isDirty },
//       control,
//       watch,
//       trigger,
//       setValue,
//     } = form

//     useImperativeHandle(ref, () => ({
//       setValue: (name: string, value: any) =>
//         setValue(name as any, value, {
//           shouldDirty: true,
//           shouldValidate: false,
//         }),
//     }))

//     useEffect(() => {
//       if (!onFieldChange) return
//       const sub = watch((data, { name }) => {
//         if (name && data[name] !== undefined) onFieldChange(name, data[name])
//       })
//       return () => sub.unsubscribe()
//     }, [watch, onFieldChange])

//     const shouldShowField = (field: any): boolean => {
//       if (field.hidden) return false
//       if (field.showWhen)
//         return Object.entries(field.showWhen).every(([k, v]) => watch(k) === v)
//       if (field.condition) return field.condition(watch())
//       return true
//     }

//     const fieldsForStep = (step: number) =>
//       config.fields.filter(
//         (f) => getFieldStep(f) === step && shouldShowField(f)
//       )

//     const visibleFields = fieldsForStep(currentStep)
//     const currentStepFieldNames = visibleFields.map((f) => f.name)

//     const currentStepErrors = Object.keys(errors).filter((k) =>
//       currentStepFieldNames.includes(k)
//     )
//     const hasErrors = currentStepErrors.length > 0

//     const statusConfig = hasErrors
//       ? {
//         icon: <CircleAlert className='h-3.5 w-3.5 text-destructive' />,
//         label: 'Corrigez les erreurs avant de continuer',
//         className: 'text-destructive',
//       }
//       : isDirty
//         ? {
//           icon: <CircleDot className='h-3.5 w-3.5 text-muted-foreground' />,
//           label: 'Modifications non enregistrées',
//           className: 'text-muted-foreground',
//         }
//         : {
//           icon: (
//             <CircleCheck className='h-3.5 w-3.5 text-muted-foreground/50' />
//           ),
//           label: `Étape ${currentStep} sur ${totalSteps}`,
//           className: 'text-muted-foreground/50',
//         }

//     const handleNext = async () => {
//       const valid = await trigger(currentStepFieldNames as any)
//       if (valid) setCurrentStep((s) => Math.min(s + 1, totalSteps))
//     }

//     const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

//     const isLastStep = currentStep === totalSteps
//     const currentStepConfig = stepsConfig.find((s) => s.step === currentStep)!

//     return (
//       <div
//         className={cn(
//           'rounded-xl border border-border/60 bg-card shadow-sm',
//           'overflow-hidden transition-shadow duration-300 hover:shadow-md'
//         )}
//       >
//         <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

//         {/*─────────────────────────────────────── */}
//         <div className='border-b border-border/40 px-6 pt-5 pb-4'>
//           {/* Barre de progression globale */}
//           <div className='mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
//             <div
//               className='h-full rounded-full bg-primary transition-all duration-500 ease-out'
//               style={{
//                 width: `${((currentStep - 1) / Math.max(totalSteps - 1, 1)) * 100}%`,
//               }}
//             />
//           </div>

//           {/* Cercles + connecteurs */}
//           <div className='flex items-center'>
//             {stepsConfig.map((s, i) => {
//               const isDone = currentStep > s.step
//               const isActive = currentStep === s.step

//               return (
//                 <div
//                   key={s.step}
//                   className='flex min-w-0 flex-1 items-center last:flex-none'
//                 >
//                   {/* ── Cercle ── */}
//                   <button
//                     type='button'
//                     disabled={!isDone}
//                     onClick={() => isDone && setCurrentStep(s.step)}
//                     title={s.title}
//                     className={cn(
//                       'relative flex h-8 w-8 items-center justify-center rounded-full',
//                       'shrink-0 border-2 text-xs font-bold transition-all duration-300',

//                       //Terminé : vert plein, cliquable
//                       isDone && [
//                         'border-emerald-500 bg-emerald-500 text-white',
//                         'cursor-pointer hover:border-emerald-600 hover:bg-emerald-600',
//                         'shadow-md shadow-emerald-500/30',
//                       ],

//                       //Actif : couleur primaire + halo pulsant
//                       isActive && [
//                         'border-primary bg-primary text-primary-foreground',
//                         'shadow-lg shadow-primary/40',
//                         'ring-4 ring-primary/20',
//                       ],

//                       //Non atteint : gris discret
//                       !isDone &&
//                       !isActive && [
//                         'border-border bg-muted text-muted-foreground/60',
//                         'cursor-default',
//                       ]
//                     )}
//                   >
//                     {isDone ? (
//                       <Check className='h-4 w-4 stroke-[2.5]' />
//                     ) : (
//                       s.step
//                     )}

//                     {/* Halo pulsant sur l'étape active uniquement */}
//                     {isActive && (
//                       <span className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
//                     )}
//                   </button>

//                   {/* ── Label (visible sm+) ── */}
//                   <span
//                     className={cn(
//                       'ml-1.5 hidden max-w-[52px] truncate text-[11px] font-medium transition-colors duration-200 sm:block',
//                       isDone && 'text-emerald-500',
//                       isActive && 'font-semibold text-primary',
//                       !isDone && !isActive && 'text-muted-foreground/50'
//                     )}
//                   >
//                     {s.title}
//                   </span>

//                   {/* ── Connecteur entre cercles ── */}
//                   {i < stepsConfig.length - 1 && (
//                     <div className='mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border/40'>
//                       <div
//                         className={cn(
//                           'h-full rounded-full transition-all duration-500',
//                           isDone ? 'w-full bg-emerald-400' : 'w-0'
//                         )}
//                       />
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>

//           {/* ── Titre + description de l'étape courante ── */}
//           <div className='mt-4 animate-in duration-300 fade-in-0 slide-in-from-left-2'>
//             <div className='flex items-center gap-2'>
//               <span className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary'>
//                 {currentStep}
//               </span>
//               <h3 className='text-sm leading-tight font-semibold text-foreground'>
//                 {currentStepConfig.title}
//               </h3>
//             </div>
//             {currentStepConfig.description && (
//               <p className='mt-1 ml-7 text-xs text-muted-foreground'>
//                 {currentStepConfig.description}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ── Champs du formulaire ────────────────────────────────── */}
//         <Form {...form}>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault()

//               if (!isLastStep) return

//               handleSubmit(onSubmit as any)(e)
//             }}
//           >
//             <div className='p-6'>
//               <div className='grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2'>
//                 {visibleFields.map((field, index) => (
//                   <div
//                     key={field.name}
//                     className={cn(
//                       'animate-in duration-300 fade-in-0 fill-mode-both slide-in-from-bottom-2',
//                       field.gridCols === 1
//                         ? 'col-span-1 sm:col-span-2'
//                         : 'col-span-1'
//                     )}
//                     style={{ animationDelay: `${index * 45}ms` }}
//                   >
//                     <FormField
//                       field={field}
//                       register={register}
//                       control={control}
//                       errors={errors}
//                       watch={watch}
//                       trigger={trigger}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Divider */}
//             <div className='mx-6 h-px bg-border/50' />

//             {/* ── Footer navigation ────────────────────────────────── */}
//             <div className='flex items-center justify-between gap-4 px-6 py-4'>
//               <div
//                 className={cn(
//                   'flex items-center gap-2 text-xs font-medium tracking-wide',
//                   statusConfig.className
//                 )}
//               >
//                 {statusConfig.icon}
//                 <span>{statusConfig.label}</span>
//               </div>

//               <div className='flex items-center gap-2'>
//                 {currentStep > 1 && (
//                   <Button
//                     type='button'
//                     variant='outline'
//                     size='sm'
//                     onClick={handleBack}
//                     className={formSecondaryButtonClassName}
//                   >
//                     <ArrowLeft className='h-3.5 w-3.5' />
//                     <span>Retour</span>
//                   </Button>
//                 )}

//                 {isLastStep ? (
//                   <Button
//                     type='submit'
//                     disabled={isLoading}
//                     size='sm'
//                     className={formPrimaryButtonClassName}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2 className='h-3.5 w-3.5 animate-spin' />
//                         <span>{loadingText}</span>
//                       </>
//                     ) : (
//                       <>
//                         <span>{submitText}</span>
//                         <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
//                       </>
//                     )}
//                   </Button>
//                 ) : (
//                   <Button
//                     type='button'
//                     size='sm'
//                     onClick={handleNext}
//                     className={formPrimaryButtonClassName}
//                   >
//                     <span>Suivant</span>
//                     <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </form>
//         </Form>
//       </div>
//     )
//   }
// )

// StepDynamicForm.displayName = 'StepDynamicForm'




// components/Global/Forms/StepDynamicForm.tsx
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  CircleAlert,
  CircleDot,
  CircleCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormField } from '../Fields/FormField'
import type { FormConfig, StepConfig } from '../types/formConfig'
import {
  formPrimaryButtonClassName,
  formSecondaryButtonClassName,
} from './form-footer-styles'

// ── Types ──────────────────────────────────────────────────────────────────
interface StepDynamicFormProps {
  config: FormConfig
  schema: z.ZodType<any, any>
  defaultValues: any
  onSubmit: (data: any) => void
  isLoading?: boolean
  submitText?: string
  loadingText?: string
  onFieldChange?: (fieldName: string, value: unknown) => void
}

export interface StepDynamicFormHandle {
  setValue: (name: string, value: any) => void
}

//────────────────────────────────────
const getFieldStep = (field: any): number => field.formStep ?? field.step ?? 1

//────────────────────────────────────
export const StepDynamicForm = forwardRef<
  StepDynamicFormHandle,
  StepDynamicFormProps
>(
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
    },
    ref
  ) => {
    const stepsConfig: StepConfig[] = config.steps ?? [
      { step: 1, title: 'Formulaire' },
    ]
    const totalSteps = stepsConfig.length
    const [currentStep, setCurrentStep] = useState(1)

    const form = useForm({
      resolver: zodResolver(schema) as any,
      defaultValues: defaultValues as any,
      mode: 'onBlur',
      shouldUnregister: false,
    })

    const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
      control,
      watch,
      trigger,
      setValue,
    } = form

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

    const shouldShowField = (field: any): boolean => {
      if (field.hidden) return false
      if (field.showWhen)
        return Object.entries(field.showWhen).every(([k, v]) => watch(k) === v)
      if (field.condition) return field.condition(watch())
      return true
    }

    const fieldsForStep = (step: number) =>
      config.fields.filter(
        (f) => getFieldStep(f) === step && shouldShowField(f)
      )

    const visibleFields = fieldsForStep(currentStep)
    const currentStepFieldNames = visibleFields.map((f) => f.name)

    const currentStepErrors = Object.keys(errors).filter((k) =>
      currentStepFieldNames.includes(k)
    )
    const hasErrors = currentStepErrors.length > 0

    const statusConfig = hasErrors
      ? {
          icon: <CircleAlert className='h-3.5 w-3.5 text-destructive' />,
          label: 'Corrigez les erreurs avant de continuer',
          className: 'text-destructive',
        }
      : isDirty
        ? {
            icon: <CircleDot className='h-3.5 w-3.5 text-muted-foreground' />,
            label: 'Modifications non enregistrées',
            className: 'text-muted-foreground',
          }
        : {
            icon: (
              <CircleCheck className='h-3.5 w-3.5 text-muted-foreground/50' />
            ),
            label: `Étape ${currentStep} sur ${totalSteps}`,
            className: 'text-muted-foreground/50',
          }

    const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault()
      e?.stopPropagation()

      const valid = await trigger(currentStepFieldNames as any)
      if (!valid) return

      // Évite qu'un même clic active le bouton « Soumettre » après le changement d'étape.
      requestAnimationFrame(() => {
        setCurrentStep((s) => Math.min(s + 1, totalSteps))
      })
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
    }

    const handleFinalSubmit = () => {
      void handleSubmit(onSubmit as any)()
    }

    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

    const isLastStep = currentStep === totalSteps
    return (
      <div
        className={cn(
          'rounded-xl border border-border/50 bg-card shadow-sm',
          'overflow-hidden transition-shadow duration-300 hover:shadow-md'
        )}
      >
        <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

        {/*─────────────────────────────────────── */}
        <div className='border-b border-border/40 px-6 pt-5 pb-2'>
          {/* Barre de progression globale */}
          <div className='mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary transition-all duration-500 ease-out'
              style={{
                width: `${((currentStep - 1) / Math.max(totalSteps - 1, 1)) * 100}%`,
              }}
            />
          </div>

          {/* Cercles + connecteurs */}
          <div className='flex items-center'>
            {stepsConfig.map((s, i) => {
              const isDone = currentStep > s.step
              const isActive = currentStep === s.step

              return (
                <div
                  key={s.step}
                  className='flex min-w-0 flex-1 items-center last:flex-none'
                >
                  {/* ── Cercle ── */}
                  <button
                    type='button'
                    disabled={!isDone}
                    onClick={() => isDone && setCurrentStep(s.step)}
                    title={s.title}
                    className={cn(
                      'relative flex h-8 w-8 items-center justify-center rounded-full',
                      'shrink-0 border-2 text-xs font-bold transition-all duration-300',

                      // Terminé : vert plein, cliquable
                      isDone && [
                        'border-emerald-500 bg-emerald-500 text-white',
                        'cursor-pointer hover:border-emerald-600 hover:bg-emerald-600',
                        'shadow-md shadow-emerald-500/30',
                      ],

                      // Actif : couleur primaire + halo pulsant
                      isActive && [
                        'border-primary bg-primary text-primary-foreground',
                        'shadow-lg shadow-primary/40',
                        'ring-4 ring-primary/20',
                      ],

                      // Non atteint : gris discret
                      !isDone &&
                        !isActive && [
                          'border-border bg-muted text-muted-foreground/60',
                          'cursor-default',
                        ]
                    )}
                  >
                    {isDone ? (
                      <Check className='h-4 w-4 stroke-[2.5]' />
                    ) : (
                      s.step
                    )}

                    {/* Halo pulsant sur l'étape active uniquement */}
                    {isActive && (
                      <span className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
                    )}
                  </button>

                  {/* ── Label (visible sm+) ── */}
                  <span
                    className={cn(
                      'ml-1.5 hidden max-w-[52px] truncate text-[11px] font-medium transition-colors duration-200 sm:block',
                      isDone && 'text-emerald-500',
                      isActive && 'font-semibold text-primary',
                      !isDone && !isActive && 'text-muted-foreground/50'
                    )}
                  >
                    {s.title}
                  </span>

                  {/* ── Connecteur entre cercles ── */}
                  {i < stepsConfig.length - 1 && (
                    <div className='mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border/40'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isDone ? 'w-full bg-emerald-400' : 'w-0'
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {/* ── Champs du formulaire ────────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <div className='p-3'>
              <div className='grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2'>
                {visibleFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={cn(
                      'animate-in duration-300 fade-in-0 fill-mode-both slide-in-from-bottom-2',
                      field.gridCols === 1
                        ? 'col-span-1 sm:col-span-2'
                        : 'col-span-1'
                    )}
                    style={{ animationDelay: `${index * 45}ms` }}
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

            {/* Divider */}
            <div className='mx-6 h-px bg-border/50' />

            {/* ── Footer navigation ────────────────────────────────── */}
            <div className='flex items-center justify-between gap-4 px-6 py-4'>
              <div
                className={cn(
                  'flex items-center gap-2 text-xs font-medium tracking-wide',
                  statusConfig.className
                )}
              >
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>

              <div className='flex items-center gap-2'>
                {currentStep > 1 && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleBack}
                    className={formSecondaryButtonClassName}
                  >
                    <ArrowLeft className='h-3.5 w-3.5' />
                    <span>Retour</span>
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    type='button'
                    disabled={isLoading}
                    size='sm'
                    onClick={handleFinalSubmit}
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
                ) : (
                  <Button
                    type='button'
                    size='sm'
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleNext}
                    className={formPrimaryButtonClassName}
                  >
                    <span>Suivant</span>
                    <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    )
  }
)

StepDynamicForm.displayName = 'StepDynamicForm'
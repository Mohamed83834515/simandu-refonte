import { useState } from 'react'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { Controller, type Control, type FieldErrors, type UseFormTrigger } from 'react-hook-form'
import {
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  FileVideo,
  FileAudio,
  Image,
  Pencil,
  Trash2,
  ChevronsUpDown,
  FileText,
  Calendar,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { DateRangeField } from '../DateRange/DateRangeField'
import type { FieldConfig } from '../types/formConfig'
import PasswordChecker from '@/simadou/allfonctionalities/settings/profile/PasswordChecker'

/** Calendrier natif invisible à droite ; icône Lucide visible au même endroit. */
const dateInputPickerClasses =
  'pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:end-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0'

export interface RichSelectOption {
  value: string | number
  label: string
  disabled?: boolean
  isInscrit?: boolean
  className?: string
  suffix?: string
}

function selectValuesMatch(a: unknown, b: unknown): boolean {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return String(a) === String(b)
}

interface FormFieldProps {
  field: FieldConfig & { options?: RichSelectOption[] }
  register: any
  control: Control<any>
  errors: FieldErrors
  watch: any
  trigger?: UseFormTrigger<any>
}

export const FormField = ({
  field,
  register,
  control,
  errors,
  watch,
  trigger,
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const newPassword = watch("newPassword")

  const error = errors[field.name]
  const fieldValue = watch(field.name)

  const hasValue =
    fieldValue !== undefined && fieldValue !== '' && fieldValue !== null
  const isValid = !error && hasValue && touched
  const isInvalid = error && touched

  const handleBlur = async () => {
    setTouched(true)
    if (trigger) {
      await trigger(field.name)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | File[] | null) => void
  ) => {
    const files = e.target.files

    if (!files || files.length === 0) {
      onChange(null)
      setFilePreview(null)
      return
    }

    if (field.multiple) {
      const fileArray = Array.from(files)
      if (fileArray.length > 3) {
        alert('Vous ne pouvez sélectionner que 3 bulletins maximum')
        e.target.value = ''
        return
      }
      for (const file of fileArray) {
        if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
          alert(
            `Le fichier ${file.name} ne doit pas dépasser ${field.maxSize}MB`
          )
          e.target.value = ''
          return
        }
      }
      onChange(fileArray)
      setTouched(true)
      if (trigger) trigger(field.name)
      return
    }

    const file = files[0]
    if (field.maxSize && file.size > field.maxSize * 1024 * 1024) {
      alert(`Le fichier ne doit pas dépasser ${field.maxSize}MB`)
      e.target.value = ''
      return
    }
    if (field.type === 'image' || file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setFilePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else if (field.type === 'video' || file.type.startsWith('video/')) {
      setFilePreview(URL.createObjectURL(file))
    } else if (field.type === 'audio' || file.type.startsWith('audio/')) {
      setFilePreview(URL.createObjectURL(file))
    } else {
      setFilePreview(null)
    }
    onChange(file)
    setTouched(true)
    if (trigger) trigger(field.name)
  }

  const handleRemoveFile = (
    onChange: (file: File | File[] | null) => void,
    fieldName: string
  ) => {
    onChange(null)
    setFilePreview(null)
    const input = document.getElementById(fieldName) as HTMLInputElement
    if (input) input.value = ''
  }

  const handleChangeFile = (fieldName: string) => {
    document.getElementById(fieldName)?.click()
  }

  const handleRemoveFileAtIndex = (
    index: number,
    files: File[],
    onChange: (file: File | File[] | null) => void,
    fieldName: string
  ) => {
    const next = files.filter((_, i) => i !== index)
    if (next.length === 0) {
      handleRemoveFile(onChange, fieldName)
      return
    }
    onChange(next)
    setTouched(true)
    if (trigger) trigger(field.name)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
  }

  const fileNameFromUrl = (url: string, index: number) => {
    try {
      const segment = url.split('/').pop()?.split('?')[0]
      if (segment) return decodeURIComponent(segment)
    } catch {
      /* ignore */
    }
    return `Document ${index + 1}`
  }

  const isFileArray = (value: any): value is File[] =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => item instanceof File)

  const isStringArray = (value: any): value is string[] =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string')

  const renderInput = () => {
    switch (field.type) {
      // ========== DATE RANGE ==========
      case 'daterange':
        return (
          <DateRangeField field={field} control={control} errors={errors} />
        )

      // ========== FICHIERS ==========
      case 'file':
      case 'image':
      case 'video':
      case 'audio':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => {
              const isCompactFile = field.className?.includes('compact-file')
              return (
              <div className={cn('space-y-2', isCompactFile && 'space-y-1')}>
                <div
                  className={cn(
                    'relative rounded-lg border transition-colors',
                    isCompactFile
                      ? 'border-dashed p-2'
                      : 'border-2 border-dashed p-4',
                    controllerField.value instanceof File
                      ? 'border-solid'
                      : 'cursor-pointer hover:border-primary/50',
                    isValid ? 'border-green-500 bg-green-50' : '',
                    isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  )}
                >
                  <FileText className='h-3.5 w-3.5 shrink-0 text-primary/70' />
                  <div className='min-w-0 flex-1'>
                    {href ? (
                      <a
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block truncate text-xs font-medium text-primary hover:underline'
                      >
                        {name}
                      </a>
                    ) : (
                      <p className='truncate text-xs font-medium text-foreground'>
                        {name}
                      </p>
                    )}
                    {meta && (
                      <p className='text-[10px] text-muted-foreground'>{meta}</p>
                    )}
                  </div>
                  {onRemove && (
                    <button
                      type='button'
                      onClick={onRemove}
                      className='rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive'
                      aria-label={`Retirer ${name}`}
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  )}
                </div>
              )

              return (
                <div className={cn('space-y-1.5', isCompactFile && 'space-y-1')}>
                  <div
                    className={cn(
                      'relative rounded-lg border transition-colors',
                      isCompactFile ? 'p-2' : 'p-3',
                      controllerField.value
                        ? 'border-border bg-muted/20'
                        : 'cursor-pointer border-dashed hover:border-primary/40 hover:bg-muted/30',
                      isValid && 'border-green-500/60',
                      isInvalid && 'border-red-500/60'
                    )}
                  >
                    <input
                      id={field.name}
                      type='file'
                      accept={field.accept}
                      multiple={field.multiple}
                      className='hidden'
                      onChange={(e) =>
                        handleFileChange(e, controllerField.onChange)
                      }
                    />

                    {isFileArray(controllerField.value) ? (
                      <div className='w-full space-y-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <p className='text-sm font-medium text-gray-700'>
                            {controllerField.value.length} fichier
                            {controllerField.value.length > 1 ? 's' : ''}{' '}
                            sélectionné
                            {controllerField.value.length > 1 ? 's' : ''}
                          </p>
                          <span
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              controllerField.value.length >= 3
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {controllerField.value.length}/3
                          </span>
                        </div>
                        <div className={cn(
                          'space-y-2 overflow-y-auto',
                          isCompactFile ? 'max-h-28' : 'max-h-60'
                        )}>
                          {controllerField.value.map(
                            (file: File, index: number) => (
                              <div
                                key={index}
                                className='flex items-center rounded-lg bg-gray-50 p-3'
                              >
                                <FileText className='mr-3 h-6 w-6 flex-shrink-0 text-blue-500' />
                                <div className='min-w-0 flex-1 text-left'>
                                  <p className='truncate text-sm font-medium text-gray-700'>
                                    {file.name}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            )
                        )}
                        <div className='flex flex-col gap-1'>
                          {controllerField.value.map(
                            (file: File, index: number) =>
                              renderFileChip({
                                name: file.name,
                                meta: formatFileSize(file.size),
                                onRemove: () =>
                                  handleRemoveFileAtIndex(
                                    index,
                                    controllerField.value as File[],
                                    controllerField.onChange,
                                    field.name
                                  ),
                              })
                          )}
                        </div>
                      </div>
                    ) : controllerField.value instanceof File ? (
                      <div className='w-full space-y-2'>
                        {(field.type === 'image' ||
                          field.type === 'video' ||
                          field.type === 'audio') &&
                        filePreview ? (
                          <div className='flex items-start gap-2'>
                            {field.type === 'image' && (
                              <img
                                src={filePreview}
                                alt=''
                                className={cn(
                                  'rounded object-cover',
                                  isCompactFile
                                    ? 'h-10 w-10'
                                    : 'h-14 w-14'
                                )}
                              />
                            )}
                            {field.type === 'video' && (
                              <video
                                src={filePreview}
                                className={cn(
                                  'rounded object-cover',
                                  isCompactFile
                                    ? 'h-10 w-14'
                                    : 'h-14 w-20'
                                )}
                              />
                            )}
                            {field.type === 'audio' && (
                              <audio
                                src={filePreview}
                                controls
                                className='h-8 max-w-full flex-1'
                              />
                            )}
                            {field.type !== 'audio' &&
                              renderFileChip({
                                name: controllerField.value.name,
                                meta: formatFileSize(
                                  controllerField.value.size
                                ),
                              })}
                          </div>
                        ) : (
                          renderFileChip({
                            name: controllerField.value.name,
                            meta: formatFileSize(controllerField.value.size),
                          })
                        )}
                        <div className='flex justify-end gap-0.5'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs'
                            onClick={() => handleChangeFile(field.name)}
                          >
                            <Pencil className='me-1 h-3 w-3' />
                            Remplacer
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs text-destructive hover:text-destructive'
                            onClick={() =>
                              handleRemoveFile(
                                controllerField.onChange,
                                field.name
                              )
                            }
                          >
                            <Trash2 className='me-1 h-3 w-3' />
                            Retirer
                          </Button>
                        </div>
                      </div>
                    ) : isStringArray(controllerField.value) ? (
                      <div className='w-full space-y-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <p className='text-sm font-medium text-gray-700'>
                            {controllerField.value.length} fichier
                            {controllerField.value.length > 1 ? 's' : ''} actuel
                            {controllerField.value.length > 1 ? 's' : ''}
                          </p>
                          <span
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              controllerField.value.length >= 3
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {controllerField.value.length}/3
                          </span>
                        </div>
                        <div className={cn(
                          'space-y-2 overflow-y-auto',
                          isCompactFile ? 'max-h-28' : 'max-h-60'
                        )}>
                          {controllerField.value.map(
                            (url: string, index: number) => (
                              <div
                                key={index}
                                className='flex items-center rounded-lg bg-blue-50 p-3'
                              >
                                <FileText className='mr-3 h-6 w-6 flex-shrink-0 text-blue-500' />
                                <div className='min-w-0 flex-1 text-left'>
                                  <p className='text-sm font-medium text-gray-700'>
                                    Bulletin {index + 1}
                                  </p>
                                  <a
                                    href={url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-xs text-blue-600 hover:underline'
                                  >
                                    Voir le fichier
                                  </a>
                                </div>
                              </div>
                            )
                        )}
                        <div className='flex flex-col gap-1'>
                          {controllerField.value.map(
                            (url: string, index: number) =>
                              renderFileChip({
                                name: fileNameFromUrl(url, index),
                                meta: 'Fichier existant',
                                href: url,
                              })
                          )}
                        </div>
                      </div>
                    ) : controllerField.value &&
                      typeof controllerField.value === 'string' ? (
                      <div className='w-full space-y-2'>
                        {renderFileChip({
                          name: 'Fichier actuel',
                          meta: 'Cliquez pour ouvrir',
                          href: controllerField.value,
                        })}
                        <div className='flex justify-end gap-0.5'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs'
                            onClick={() => handleChangeFile(field.name)}
                          >
                            <Pencil className='me-1 h-3 w-3' />
                            Remplacer
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs text-destructive hover:text-destructive'
                            onClick={() =>
                              handleRemoveFile(
                                controllerField.onChange,
                                field.name
                              )
                            }
                          >
                            <Trash2 className='me-1 h-3 w-3' />
                            Retirer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex w-full cursor-pointer flex-col items-center text-center',
                          isCompactFile && 'py-1'
                        )}
                        onClick={() =>
                          document.getElementById(field.name)?.click()
                        }
                      >
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted'>
                          {field.type === 'image' ? (
                            <Image className='h-4 w-4 text-muted-foreground' />
                          ) : field.type === 'video' ? (
                            <FileVideo className='h-4 w-4 text-muted-foreground' />
                          ) : field.type === 'audio' ? (
                            <FileAudio className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Upload className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                        <div className={cn(isCompactFile ? 'mt-1' : 'mt-2')}>
                          <p
                            className={cn(
                              'font-medium text-gray-600',
                              isCompactFile ? 'text-xs' : 'text-sm'
                            )}
                          >
                            Cliquez pour choisir{' '}
                            {field.multiple ? 'des fichiers' : 'un fichier'}
                          </p>
                          {!isCompactFile && field.multiple && (
                            <p className='mt-1 text-xs text-gray-400'>
                              Maximum 3 fichiers
                            </p>
                          )}
                          {!isCompactFile && field.accept && (
                            <p className='mt-1 text-xs text-gray-400'>
                              Formats: {field.accept}
                            </p>
                          )}
                          {!isCompactFile && field.maxSize && (
                            <p className='text-xs text-gray-400'>
                              Taille max: {field.maxSize}MB{' '}
                              {field.multiple ? 'par fichier' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isValid && (
                      <div className='absolute top-1.5 right-1.5'>
                        <Check className='h-4 w-4 text-green-500' />
                      </div>
                    )}
                    {isInvalid && (
                      <div className='absolute top-1.5 right-1.5'>
                        <X className='h-4 w-4 text-red-500' />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            }}
          />
        )

      // ========== MULTISELECT ==========
      case 'multiselect':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className='relative'>
                <MultiSelect
                  options={field.options || []}
                  selected={
                    Array.isArray(controllerField.value)
                      ? controllerField.value
                      : []
                  }
                  onChange={(values) => {
                    controllerField.onChange(values)
                    setTouched(true)

                    if (trigger) trigger(field.name)
                  }}
                  placeholder={field.placeholder || 'Sélectionner'}
                  disabled={field.isLoading || field.disabled}
                  className={cn(
                    isValid && 'border-green-500 focus:ring-green-500',
                    isInvalid && 'border-red-500 focus:ring-red-500'
                  )}
                />
                {isValid && controllerField.value?.length > 0 && (
                  <div className='pointer-events-none absolute top-3 right-3'>
                    <Check className='h-5 w-5 text-green-500' />
                  </div>
                )}
                {isInvalid && (
                  <div className='pointer-events-none absolute top-3 right-3'>
                    <X className='h-5 w-5 text-red-500' />
                  </div>
                )}
              </div>
            )}
          />
        )

      // ========== SELECT ==========
      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => {
              const options = (field.options || []) as RichSelectOption[]
              const selectedOption = options.find((opt) =>
                selectValuesMatch(opt.value, controllerField.value)
              )
              const canClear = !field.required
              return (
                <div className='relative min-w-0'>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={comboboxOpen}
                        disabled={field.isLoading || field.disabled}
                        title={
                          selectedOption ? selectedOption.label : undefined
                        }
                        className={cn(
                          'h-auto min-h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal whitespace-normal',
                          !selectedOption && 'text-muted-foreground',
                          isValid && 'border-green-500 focus:ring-green-500',
                          isInvalid && 'border-red-500 focus:ring-red-500'
                        )}
                        onClick={() => setTouched(true)}
                      >
                        {selectedOption ? (
                          <span className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left'>
                            <span
                              className={cn(
                                'truncate',
                                selectedOption.isInscrit &&
                                'font-medium text-green-700 dark:text-green-400'
                              )}
                            >
                              {selectedOption.label}
                            </span>
                            {selectedOption.isInscrit && (
                              <span className='shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900 dark:text-green-300'>
                                ✓ Inscrit
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className='min-w-0 flex-1 truncate text-left'>
                            {field.placeholder || 'Sélectionner'}
                          </span>
                        )}
                        <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className='p-0'
                      style={{ width: 'var(--radix-popover-trigger-width)' }}
                      align='start'
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      <Command>
                        <CommandInput
                          placeholder='Rechercher...'
                          className='h-9'
                        />
                        <CommandList>
                          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                          <CommandGroup>
                            {canClear ? (
                              <CommandItem
                                value='__none__'
                                className='cursor-pointer text-muted-foreground italic'
                                onSelect={() => {
                                  controllerField.onChange(null)
                                  setComboboxOpen(false)
                                  setTouched(true)
                                  if (trigger) trigger(field.name)
                                }}
                              >
                                Aucun
                                <Check
                                  className={cn(
                                    'ml-2 h-4 w-4 shrink-0',
                                    controllerField.value == null
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ) : null}
                            {options.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                disabled={option.disabled}
                                className={cn(
                                  'cursor-pointer',
                                  option.isInscrit &&
                                  'bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-950/60'
                                )}
                                onSelect={() => {
                                  controllerField.onChange(option.value)
                                  setComboboxOpen(false)
                                  setTouched(true)

                                  if (trigger) trigger(field.name)
                                }}
                              >
                                <span
                                  className={cn(
                                    'flex-1',
                                    option.isInscrit &&
                                    'font-medium text-green-700 dark:text-green-400'
                                  )}
                                >
                                  {option.label}
                                </span>
                                {option.isInscrit && (
                                  <span className='ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-green-700 dark:bg-green-900 dark:text-green-300'>
                                    ✓ Inscrit
                                  </span>
                                )}
                                <Check
                                  className={cn(
                                    'ml-2 h-4 w-4 shrink-0',
                                    selectValuesMatch(
                                      controllerField.value,
                                      option.value
                                    )
                                      ? 'text-green-600 opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {isValid && (
                    <div className='pointer-events-none absolute top-1/2 right-10 -translate-y-1/2'>
                      <Check className='h-5 w-5 text-green-500' />
                    </div>
                  )}
                  {isInvalid && (
                    <div className='pointer-events-none absolute top-1/2 right-10 -translate-y-1/2'>
                      <X className='h-5 w-5 text-red-500' />
                    </div>
                  )}
                </div>
              )
            }}
          />
        )

      // ========== SELECT WITH OTHER ==========
      case 'select-with-other':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => {
              const isOtherSelected = controllerField.value === 'Autre'
              const options = (field.options || []) as RichSelectOption[]
              const selectedOption = options.find(
                (opt) =>
                  opt.value.toString() === controllerField.value?.toString()
              )

              return (
                <div className='space-y-3'>
                  <div className='relative min-w-0'>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal={false}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          aria-expanded={comboboxOpen}
                          disabled={field.isLoading || field.disabled}
                          title={selectedOption?.label}
                          className={cn(
                            'h-auto min-h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal whitespace-normal',
                            !controllerField.value && 'text-muted-foreground',
                            isValid &&
                            !isOtherSelected &&
                            'border-green-500 focus:ring-green-500',
                            isInvalid && 'border-red-500 focus:ring-red-500'
                          )}
                          onClick={() => setTouched(true)}
                        >
                          <span className='min-w-0 flex-1 truncate text-left'>
                            {selectedOption?.label ||
                              (isOtherSelected
                                ? 'Autre'
                                : field.placeholder || 'Sélectionner')}
                          </span>
                          <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='p-0'
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                        align='start'
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        <Command>
                          <CommandInput
                            placeholder='Rechercher...'
                            className='h-9'
                          />
                          <CommandList>
                            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                            <CommandGroup>
                              {options.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  disabled={option.disabled}
                                  onSelect={() => {
                                    const parsedValue = isNaN(
                                      Number(option.value)
                                    )
                                      ? option.value
                                      : Number(option.value)
                                    controllerField.onChange(parsedValue)
                                    setComboboxOpen(false)
                                    setTouched(true)
                                    if (trigger) trigger(field.name)
                                  }}
                                >
                                  {option.label}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      controllerField.value?.toString() ===
                                        option.value.toString()
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                              <CommandItem
                                value='Autre'
                                onSelect={() => {
                                  controllerField.onChange('Autre')
                                  setComboboxOpen(false)
                                  setTouched(true)
                                  if (trigger) trigger(field.name)
                                }}
                              >
                                Autre
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    isOtherSelected
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {isValid && !isOtherSelected && (
                      <div className='pointer-events-none absolute top-1/2 right-10 -translate-y-1/2'>
                        <Check className='h-5 w-5 text-green-500' />
                      </div>
                    )}
                    {isInvalid && (
                      <div className='pointer-events-none absolute top-1/2 right-10 -translate-y-1/2'>
                        <X className='h-5 w-5 text-red-500' />
                      </div>
                    )}
                  </div>

                  {isOtherSelected && field.otherFieldName && (
                    <Controller
                      name={field.otherFieldName}
                      control={control}
                      render={({ field: otherField }) => {
                        const otherError = errors[field.otherFieldName!]
                        const otherValue = watch(field.otherFieldName!)
                        const otherHasValue =
                          otherValue !== undefined &&
                          otherValue !== '' &&
                          otherValue !== null
                        const otherIsValid =
                          !otherError && otherHasValue && touched
                        const otherIsInvalid = otherError && touched
                        return (
                          <div className='relative'>
                            <Input
                              {...otherField}
                              type='text'
                              placeholder={
                                field.otherPlaceholder ||
                                'Saisissez une nouvelle valeur'
                              }
                              className={cn(
                                otherIsValid &&
                                'border-green-500 pr-10 focus:ring-green-500',
                                otherIsInvalid &&
                                'border-red-500 focus:ring-red-500'
                              )}
                              onBlur={async () => {
                                setTouched(true)
                                if (trigger)
                                  await trigger(field.otherFieldName!)
                              }}
                            />
                            {otherIsValid && (
                              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                                <Check className='h-5 w-5 text-green-500' />
                              </div>
                            )}
                            {otherIsInvalid && (
                              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                                <X className='h-5 w-5 text-red-500' />
                              </div>
                            )}
                            {otherError && (
                              <p className='mt-1 text-sm text-red-500'>
                                {otherError.message?.toString()}
                              </p>
                            )}
                          </div>
                        )
                      }}
                    />
                  )}
                </div>
              )
            }}
          />
        )

      // ========== TEXTAREA ==========
      case 'textarea':
        return (
          <div className='relative'>
            <Textarea
              placeholder={field.placeholder}
              {...register(field.name)}
              rows={field.rows || 4}
              onBlur={handleBlur}
              className={cn(
                field.className?.includes('resize-y') &&
                'field-sizing-fixed min-h-[4.5rem] max-h-[min(24vh,9.5rem)] resize-y overflow-y-auto',
                field.className,
                isValid && 'border-green-500 focus:ring-green-500',
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            {isValid && (
              <div className='pointer-events-none absolute top-3 right-3'>
                <Check className='h-5 w-5 text-green-500' />
              </div>
            )}
            {isInvalid && (
              <div className='pointer-events-none absolute top-3 right-3'>
                <X className='h-5 w-5 text-red-500' />
              </div>
            )}
          </div>
        )

      // ========== CHECKBOX-GROUP ==========
      case "checkbox-group":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField, fieldState }) => {

              // IMPORTANT
              const selectedMois: string[] =
                typeof controllerField.value === "string" &&
                  controllerField.value.length > 0
                  ? controllerField.value.split(",").map((m) => m.trim())
                  : []

              const moisOptions = field.options || []

              const updateValue = (values: string[]) => {
                controllerField.onChange(values.join(","))
              }

              const toggleMois = (val: string) => {
                const exists = selectedMois.includes(val)

                const newValue = exists
                  ? selectedMois.filter((v) => v !== val)
                  : [...selectedMois, val]

                updateValue(newValue)
              }

              const selectAll = () => {
                updateValue(moisOptions.map((m: any) => m.value))
              }

              const clearAll = () => {
                controllerField.onChange("")
              }

              const error = fieldState.error?.message

              return (
                <div className="space-y-3">

                  {/* HEADER */}
                  <div className="flex items-center justify-between">
                    <p className="block text-sm font-medium text-gray-700">
                      Sélectionnez les mois de réalisation de l’activité.
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Tout sélectionner
                      </button>

                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>

                  {/* GRID MOIS */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
                    {moisOptions.map((mois: any) => {
                      const isSelected = selectedMois.includes(mois.value)

                      return (
                        <button
                          key={mois.value}
                          type="button"
                          onClick={() => toggleMois(mois.value)}
                          className={`
                      relative flex flex-col items-center justify-center gap-1
                      p-3 rounded-lg border-2 transition-all duration-150
                      ${isSelected
                              ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            }
                    `}
                        >
                          <span className="text-xs font-semibold">
                            {mois.value}
                          </span>

                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {/* 
                  {selectedMois.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      <strong>Mois sélectionnés :</strong>{" "}
                      {selectedMois.join(", ")}
                    </div>
                  )} */}

                  {/* ERROR */}
                  {error && (
                    <p className="text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              )
            }}
          />
        )
      // ========== PASSWORD ==========
      case 'password':
        if (field.showPasswordToggle) {
          return (
            <div>

              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  onBlur={handleBlur}
                  className={cn(
                    'pr-20',
                    isValid && 'border-green-500 focus:ring-green-500',
                    isInvalid && 'border-red-500 focus:ring-red-500'
                  )}
                />
                {isValid && (
                  <div className='pointer-events-none absolute top-1/2 right-12 -translate-y-1/2'>
                    <Check className='h-5 w-5 text-green-500' />
                  </div>
                )}
                {isInvalid && (
                  <div className='pointer-events-none absolute top-1/2 right-12 -translate-y-1/2'>
                    <X className='h-5 w-5 text-red-500' />
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {field.showPasswordChecker && (
                <PasswordChecker password={newPassword} />
              )}

            </div>

          )
        }
        return (
          <div className='relative'>
            <Input
              type='password'
              placeholder={field.placeholder}
              {...register(field.name)}
              onBlur={handleBlur}
              className={cn(
                'pr-10',
                isValid && 'border-green-500 focus:ring-green-500',
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            {isValid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <Check className='h-5 w-5 text-green-500' />
              </div>
            )}
            {isInvalid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <X className='h-5 w-5 text-red-500' />
              </div>
            )}
          </div>
        )

      // ========== TEXT AVEC MULTIPLE (tags) ==========
      case 'text':
        if (field.multiple) {
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => {
                const values: string[] = Array.isArray(controllerField.value)
                  ? controllerField.value
                  : []

                const addTag = () => {
                  const trimmed = tagInput.trim()
                  if (trimmed && !values.includes(trimmed)) {
                    controllerField.onChange([...values, trimmed])
                    setTouched(true)
                    if (trigger) trigger(field.name)
                  }
                  setTagInput('')
                }

                return (
                  <div className='space-y-2'>
                    <div className='flex gap-2'>
                      <Input
                        value={tagInput}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        className={cn(
                          isInvalid && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      <Button type='button' variant='outline' onClick={addTag}>
                        +
                      </Button>
                    </div>
                    {values.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {values.map((tag, i) => (
                          <span
                            key={i}
                            className='flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm'
                          >
                            {tag}
                            <X
                              className='h-3 w-3 cursor-pointer hover:text-red-500'
                              onClick={() => {
                                controllerField.onChange(
                                  values.filter((_, idx) => idx !== i)
                                )
                                setTouched(true)
                                if (trigger) trigger(field.name)
                              }}
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }}
            />
          )
        }
        return (
          <div className='relative'>
            <Input
              type='text'
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              minLength={field.minLength}
              {...register(field.name)}
              onBlur={handleBlur}
              className={cn(
                'pr-10',
                isValid && 'border-green-500 focus:ring-green-500',
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            {isValid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <Check className='h-5 w-5 text-green-500' />
              </div>
            )}
            {isInvalid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <X className='h-5 w-5 text-red-500' />
              </div>
            )}
          </div>
        )

      // ========== CHECKBOX / SWITCH ==========
      case 'checkbox':
      case 'switch': {
        const isSwitch = field.type === 'switch'
        const useCard = field.className?.includes('field-card')

        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <div
                className={cn(
                  'flex items-center justify-between gap-4',
                  useCard &&
                  'rounded-lg border border-border/60 bg-muted/20 px-4 py-3',
                  field.className
                )}
              >
                <div className='min-w-0 space-y-0.5'>
                  <span className='text-sm font-medium leading-none'>
                    {field.label}
                    {field.required && (
                      <span className='text-destructive'> *</span>
                    )}
                  </span>
                  {field.helperText && (
                    <p className='text-xs text-muted-foreground'>
                      {field.helperText}
                    </p>
                  )}
                </div>
                {isSwitch ? (
                  <Switch
                    checked={!!value}
                    onCheckedChange={(checked) => {
                      onChange(checked)
                      setTouched(true)
                      if (trigger) void trigger(field.name)
                    }}
                    onBlur={handleBlur}
                    aria-invalid={isInvalid}
                  />
                ) : (
                  <Checkbox
                    checked={!!value}
                    onCheckedChange={(checked) => {
                      onChange(checked === true)
                      setTouched(true)
                      if (trigger) void trigger(field.name)
                    }}
                    onBlur={handleBlur}
                    aria-invalid={isInvalid}
                  />
                )}
              </div>
            )}
          />
        )
      }

      // ========== TEL ==========
      case 'tel':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className='relative'>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry={'GN'}
                  value={value || undefined}
                  onChange={(phoneValue: any) => {
                    onChange(phoneValue ?? '')
                    setTouched(true)
                    if (trigger) trigger(field.name)
                  }}
                  onBlur={handleBlur}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    isValid && 'border-green-500 focus-within:ring-green-500',
                    isInvalid && 'border-red-500 focus-within:ring-red-500',
                    'pr-10'
                  )}
                />
                {isValid && (
                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                    <Check className='h-5 w-5 text-green-500' />
                  </div>
                )}
                {isInvalid && (
                  <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                    <X className='h-5 w-5 text-red-500' />
                  </div>
                )}
              </div>
            )}
          />
        )

      // ========== DATE / HEURE ==========
      case 'date':
      case 'datetime-local':
      case 'month':
      case 'week':
      case 'time': {
        const PickerIcon = field.type === 'time' ? Clock : Calendar
        return (
          <div className='relative'>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              onBlur={handleBlur}
              className={cn(
                dateInputPickerClasses,
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            <PickerIcon
              className='pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
          </div>
        )
      }

      // ========== NUMBER ==========
      case 'number':
        return (
          <div className='relative'>
            <Input
              type='number'
              inputMode='numeric'
              placeholder={field.placeholder}
              {...register(field.name, {
                setValueAs: (value: any) => {
                  if (value === '' || value === null || value === undefined) {
                    return undefined
                  }
                  const num = Number(value)
                  return isNaN(num) ? undefined : num
                },
              })}
              onBlur={handleBlur}
              className={cn(
                'pr-10',
                isValid && 'border-green-500 focus:ring-green-500',
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            {isValid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <Check className='h-5 w-5 text-green-500' />
              </div>
            )}
            {isInvalid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <X className='h-5 w-5 text-red-500' />
              </div>
            )}
          </div>
        )
      // ========== DEFAULT ==========
      default:
        return (
          <div className='relative'>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              minLength={field.minLength}
              {...register(field.name)}
              onBlur={handleBlur}
              className={cn(
                'pr-10',
                isValid && 'border-green-500 focus:ring-green-500',
                isInvalid && 'border-red-500 focus:ring-red-500'
              )}
            />
            {isValid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <Check className='h-5 w-5 text-green-500' />
              </div>
            )}
            {isInvalid && (
              <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <X className='h-5 w-5 text-red-500' />
              </div>
            )}
          </div>
        )
    }
  }

  const isInlineBooleanField =
    field.type === 'checkbox' || field.type === 'switch'

  return (
    <div className='min-w-0'>
      {field.type !== 'daterange' && !isInlineBooleanField && (
        <label className='mb-2 block text-sm font-medium'>
          {field.label}
          {field.required && <span className='text-red-500'> *</span>}
        </label> 
      )}
      {renderInput()}
      {field.type !== 'daterange' &&
        !isInlineBooleanField &&
        field.helperText &&
        !error && (
          <p className='mt-1 text-xs text-muted-foreground'>{field.helperText}</p>
        )}
      {field.type !== 'daterange' && error && (
        <p className='mt-1 text-sm text-destructive'>{error.message as string}</p>
      )}
    </div>
  )
}

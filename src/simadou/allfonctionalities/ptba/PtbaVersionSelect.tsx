import Select from 'react-select'

export type PtbaVersionSelectOption = {
  label: string
  value: string
}

type Props = {
  options: PtbaVersionSelectOption[]
  value: string | null
  onChange: (versionId: string | null) => void
}

/** Filtre version PTBA (react-select), aligné sur la branche mohamed. */
export function PtbaVersionSelect({ options, value, onChange }: Props) {
  return (
    <Select<PtbaVersionSelectOption, false>
      placeholder='Rechercher une version...'
      options={options}
      value={options.find((opt) => opt.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      isClearable
      className='min-w-[280px] text-sm'
      classNamePrefix='ptba-version'
    />
  )
}

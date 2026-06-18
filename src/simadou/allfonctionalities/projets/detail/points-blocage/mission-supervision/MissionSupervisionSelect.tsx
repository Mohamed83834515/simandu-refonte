import Select from 'react-select'

export type MissionSupervisionSelectOption = {
  label: string
  value: string
}

type Props = {
  options: MissionSupervisionSelectOption[]
  value: string | null
  onChange: (missionId: string | null) => void
}

export function MissionSupervisionSelect({
  options,
  value,
  onChange,
}: Props) {
  return (
    <Select<MissionSupervisionSelectOption, false>
      placeholder='Rechercher une mission…'
      options={options}
      value={options.find((opt) => opt.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      isClearable
      className='min-w-[280px] text-sm'
      classNamePrefix='mission-supervision'
    />
  )
}

import type { SelectOption } from "../../Global/types/formConfig";

export function buildAnneeCibleOptionValue(year: number): string {
  return `${year}-01-01`;
}

export function buildAnneeCibleOptions(): SelectOption[] {
  const currentYear = new Date().getFullYear();
  const options: SelectOption[] = [];

  for (let i = 10; i >= 0; i--) {
    const year = currentYear - i;
    options.push({
      value: buildAnneeCibleOptionValue(year),
      label: String(year),
    });
  }

  for (let i = 1; i <= 10; i++) {
    const year = currentYear + i;
    options.push({
      value: buildAnneeCibleOptionValue(year),
      label: String(year),
    });
  }

  return options;
}

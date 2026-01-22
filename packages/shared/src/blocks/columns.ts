export const columnSizeOptions = [
  { label: 'One Third', value: 'oneThird' },
  { label: 'Half', value: 'half' },
  { label: 'Two Thirds', value: 'twoThirds' },
  { label: 'Full', value: 'full' },
] as const

export const columnSpanBySize = {
  full: '12',
  half: '6',
  oneThird: '4',
  twoThirds: '8',
} as const

export type ColumnSize = keyof typeof columnSpanBySize

export const getColumnSpanValue = (size?: ColumnSize | null) => {
  if (!size) return columnSpanBySize.full
  return columnSpanBySize[size] ?? columnSpanBySize.full
}

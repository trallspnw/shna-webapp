export type DateParts = {
  year: number
  month: number
  day: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const getDatePartsInTimeZone = (date: Date, timeZone: string): DateParts => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? 0)
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? 0)
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? 0)

  return { year, month, day }
}

const getTimeZoneOffsetMinutes = (timeZone: string, date: Date): number => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? 0)
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? 0)
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? 0)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  const second = Number(parts.find((part) => part.type === 'second')?.value ?? 0)

  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return (asUtc - date.getTime()) / 60000
}

const toUtcDateFromParts = (parts: DateParts): Date => {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0))
}

export const compareDateParts = (a: DateParts, b: DateParts): number => {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1
  if (a.month !== b.month) return a.month < b.month ? -1 : 1
  if (a.day !== b.day) return a.day < b.day ? -1 : 1
  return 0
}

export const addDaysToParts = (parts: DateParts, days: number): DateParts => {
  const date = toUtcDateFromParts(parts)
  date.setUTCDate(date.getUTCDate() + days)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

export const addYearsToParts = (parts: DateParts, years: number): DateParts => {
  const date = toUtcDateFromParts(parts)
  date.setUTCFullYear(date.getUTCFullYear() + years)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

export const daysBetweenParts = (start: DateParts, end: DateParts): number => {
  const startUtc = Date.UTC(start.year, start.month - 1, start.day)
  const endUtc = Date.UTC(end.year, end.month - 1, end.day)
  return Math.round((endUtc - startUtc) / MS_PER_DAY)
}

export const getDatePartsInPacific = (date: Date = new Date()): DateParts => {
  return getDatePartsInTimeZone(date, 'America/Los_Angeles')
}

export const toPacificMidnightISO = (parts: DateParts): string => {
  const utcMidnight = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0))
  const offsetMinutes = getTimeZoneOffsetMinutes('America/Los_Angeles', utcMidnight)
  const pacificMidnight = new Date(utcMidnight.getTime() - offsetMinutes * 60000)
  return pacificMidnight.toISOString()
}

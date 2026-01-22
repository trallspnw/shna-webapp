import type { DateParts } from './dates'
import {
  addDaysToParts,
  addYearsToParts,
  compareDateParts,
  daysBetweenParts,
  getDatePartsInPacific,
  toPacificMidnightISO,
} from './dates'

export type MembershipTermLike = {
  startDay?: string | null
  endDay?: string | null
}

export const isActiveMembership = (
  term: MembershipTermLike | null,
  now: Date = new Date(),
): boolean => {
  if (!term?.startDay || !term?.endDay) return false
  const todayParts = getDatePartsInPacific(now)
  const startParts = getDatePartsInPacific(new Date(term.startDay))
  const endParts = getDatePartsInPacific(new Date(term.endDay))

  return compareDateParts(todayParts, startParts) >= 0 && compareDateParts(todayParts, endParts) <= 0
}

export const isRenewalWindowOpen = (
  term: MembershipTermLike | null,
  renewalWindowDays: number,
  now: Date = new Date(),
): boolean => {
  if (!term?.endDay) return false
  const todayParts = getDatePartsInPacific(now)
  const endParts = getDatePartsInPacific(new Date(term.endDay))
  return daysBetweenParts(todayParts, endParts) <= renewalWindowDays
}

export const calculateMembershipTermDates = (
  now: Date,
  previous: MembershipTermLike | null,
  renewalWindowDays: number,
): { startParts: DateParts; endParts: DateParts; startISO: string; endISO: string } => {
  const todayParts = getDatePartsInPacific(now)

  let startParts = todayParts
  if (previous?.startDay && previous?.endDay) {
    const prevStartParts = getDatePartsInPacific(new Date(previous.startDay))
    const prevEndParts = getDatePartsInPacific(new Date(previous.endDay))
    const active =
      compareDateParts(todayParts, prevStartParts) >= 0 &&
      compareDateParts(todayParts, prevEndParts) <= 0

    if (active && isRenewalWindowOpen(previous, renewalWindowDays, now)) {
      startParts = addDaysToParts(prevEndParts, 1)
    }
  }

  const endParts = addDaysToParts(addYearsToParts(startParts, 1), -1)

  return {
    startParts,
    endParts,
    startISO: toPacificMidnightISO(startParts),
    endISO: toPacificMidnightISO(endParts),
  }
}

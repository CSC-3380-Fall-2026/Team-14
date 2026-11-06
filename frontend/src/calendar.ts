export const MAX_TRIP_DAYS = 31

export function calendarTime(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Enter a valid calendar date.')
  const time = Date.parse(`${date}T00:00:00Z`)
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date) {
    throw new Error('Enter a valid calendar date.')
  }
  return time
}

export function getTripDates(start: string, end: string): string[] {
  const first = calendarTime(start)
  const last = calendarTime(end)
  const count = (last - first) / 86400000 + 1
  if (count < 1) throw new Error('End date cannot be before start date.')
  if (count > MAX_TRIP_DAYS) throw new Error(`Example plans can cover up to ${MAX_TRIP_DAYS} days.`)
  return Array.from({ length: count }, (_, index) => new Date(first + index * 86400000).toISOString().slice(0, 10))
}

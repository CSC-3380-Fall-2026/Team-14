import { calendarTime } from './calendar.ts'
import { parseMoney } from './money.ts'

export type FlightQuoteFields = { airline: string; origin: string; destination: string; departureDate: string;
  returnDate: string; tripType: string; price: string; currency: string; durationMinutes: string; stops: string }
export type FlightQuote = { id: string; airline: string; origin: string; destination: string; departureDate: string;
  returnDate: string; tripType: 'one-way' | 'round-trip'; priceMinor: number; currency: 'USD' | 'EUR'; durationMinutes: number; stops: number }
export type FlightQuoteErrors = Partial<Record<keyof FlightQuoteFields, string>>
export type FlightSort = 'price' | 'duration'

export function parseFlightQuote(fields: FlightQuoteFields): { quote: FlightQuote | null; errors: FlightQuoteErrors } {
  const errors: FlightQuoteErrors = {}
  const airline = fields.airline.trim()
  const origin = fields.origin.trim().toUpperCase()
  const destination = fields.destination.trim().toUpperCase()
  if (!airline || airline.length > 80) errors.airline = 'Enter an airline or quote label of up to 80 characters.'
  if (!/^[A-Z]{3}$/.test(origin)) errors.origin = 'Enter a three-letter departure airport code.'
  if (!/^[A-Z]{3}$/.test(destination) || destination === origin) errors.destination = 'Enter a different three-letter arrival airport code.'
  try { calendarTime(fields.departureDate) } catch { errors.departureDate = 'Enter a valid departure date.' }
  if (!['one-way', 'round-trip'].includes(fields.tripType)) errors.tripType = 'Choose a one-way or round-trip quote.'
  if (fields.tripType === 'round-trip') {
    try {
      if (calendarTime(fields.returnDate) < calendarTime(fields.departureDate)) throw new Error('Dates reversed')
    } catch { errors.returnDate = 'Return date must be on or after departure.' }
  }
  const priceMinor = parseMoney(fields.price)
  if (priceMinor === null) errors.price = 'Enter a positive total price with up to two decimal places.'
  if (!['USD', 'EUR'].includes(fields.currency)) errors.currency = 'Choose USD or EUR.'
  const durationMinutes = Number(fields.durationMinutes)
  const stops = Number(fields.stops)
  if (!/^\d+$/.test(fields.durationMinutes) || !Number.isSafeInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 10080) {
    errors.durationMinutes = 'Enter a duration from 1 to 10,080 minutes.'
  }
  if (!/^\d+$/.test(fields.stops) || !Number.isSafeInteger(stops) || stops > 10) errors.stops = 'Enter a whole number of stops from 0 to 10.'
  if (Object.keys(errors).length) return { quote: null, errors }
  return { errors, quote: { id: crypto.randomUUID(), airline, origin, destination, departureDate: fields.departureDate,
    returnDate: fields.tripType === 'round-trip' ? fields.returnDate : '', tripType: fields.tripType as FlightQuote['tripType'],
    priceMinor: priceMinor!, currency: fields.currency as FlightQuote['currency'], durationMinutes, stops } }
}

export function compareFlightQuotes(quotes: FlightQuote[], sort: FlightSort): FlightQuote[] {
  const first = quotes[0]
  if (quotes.some(quote => quote.currency !== first.currency || quote.origin !== first.origin || quote.destination !== first.destination
    || quote.departureDate !== first.departureDate || quote.returnDate !== first.returnDate || quote.tripType !== first.tripType)) {
    throw new Error('Compare quotes for the same airports, dates, trip type, and currency.')
  }
  return [...quotes].sort((a, b) => sort === 'duration'
    ? a.durationMinutes - b.durationMinutes || a.priceMinor - b.priceMinor
    : a.priceMinor - b.priceMinor || a.durationMinutes - b.durationMinutes)
}

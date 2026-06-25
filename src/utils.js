export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function computeTimes(stops, startDate, startTime) {
  if (!stops.length) return []
  const base = new Date(`${startDate}T${startTime || '06:00'}:00`)
  let cursor = new Date(base)
  return stops.map((s) => {
    const arrival = new Date(cursor)
    const departure = new Date(cursor.getTime() + (s.stayHours || 0) * 3_600_000)
    cursor = new Date(departure.getTime() + (s.driveToNext || 0) * 3_600_000)
    return { arrival, departure, nextDeparture: new Date(cursor) }
  })
}

export function fmtDateTime(dt) {
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  }) + ' · ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDuration(hours) {
  if (!hours || hours === 0) return null
  const h = parseFloat(hours)
  const days = Math.floor(h / 24)
  const rem = Math.round((h % 24) * 10) / 10
  const parts = []
  if (days) parts.push(`${days}d`)
  if (rem || !days) parts.push(`${rem}h`)
  return parts.join(' ')
}

export function totalTripHours(stops) {
  return stops.reduce((acc, s) => acc + (parseFloat(s.stayHours) || 0) + (parseFloat(s.driveToNext) || 0), 0)
}

export function defaultStops() {
  return [
    {
      id: uid(), name: 'Doncaster DN9 1PG', stayHours: 0, driveToNext: 3.5,
      note: 'Home — departure point', type: 'start',
    },
    {
      id: uid(), name: 'Folkestone / Eurotunnel', stayHours: 1, driveToNext: 0.5,
      note: 'Pet Reception — scan microchip, get car sticker. £22 pet supplement.', type: 'stop',
    },
    {
      id: uid(), name: 'B&B Hotel Calais Centre', stayHours: 10, driveToNext: 8.5,
      note: 'Overnight stay. Check out 7am sharp.', type: 'overnight',
    },
    {
      id: uid(), name: 'Interlaken — Camping Jungfrau', stayHours: 96, driveToNext: 5,
      note: '4 nights. Lauterbrunnen valley, Jungfrau railway, Trümmelbach falls. Dogs free on Jungfraubahn.', type: 'camp',
    },
    {
      id: uid(), name: 'Engadin / St Moritz', stayHours: 60, driveToNext: 4,
      note: '3 nights. Inn River cycling, Muottas Muragl funicular, Sils-Maria walks.', type: 'camp',
    },
    {
      id: uid(), name: 'Alpe di Siusi — Camping Seiser Alm', stayHours: 96, driveToNext: 3.5,
      note: "4 nights. Europe's largest high alpine meadow. Cable car with bikes. Dog-friendly trails.", type: 'camp',
    },
    {
      id: uid(), name: 'Cortina & Lago di Braies', stayHours: 48, driveToNext: 10.5,
      note: '2 nights. Tre Cime di Lavaredo, rowing on Lago di Braies. ⚠️ Tapeworm vet appointment here before leaving.', type: 'camp',
    },
    {
      id: uid(), name: 'Calais — Eurotunnel return', stayHours: 1, driveToNext: 3,
      note: 'Pet Reception return. Tapeworm certificate must be within 24–120h window.', type: 'stop',
    },
    {
      id: uid(), name: 'Doncaster DN9 1PG', stayHours: 0, driveToNext: 0,
      note: 'Home 🏠', type: 'end',
    },
  ]
}

export const STOP_TYPES = [
  { value: 'start', label: 'Start', color: '#1D9E75' },
  { value: 'end', label: 'End', color: '#185FA5' },
  { value: 'camp', label: 'Campsite', color: '#1D9E75' },
  { value: 'overnight', label: 'Overnight', color: '#EF9F27' },
  { value: 'stop', label: 'Stop', color: '#888780' },
  { value: 'waypoint', label: 'Waypoint', color: '#D3D1C7' },
]

export function stopColor(type) {
  return STOP_TYPES.find(t => t.value === type)?.color || '#888780'
}

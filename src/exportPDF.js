import jsPDF from 'jspdf'
import { computeTimes, fmtDateTime, fmtDuration } from './utils.js'

export function exportTripToPDF(trip) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const stops = trip.stops || []
  const times = computeTimes(stops, trip.startDate, trip.startTime)
  const margin = 18
  const pageW = 210
  const pageH = 297
  const contentW = pageW - margin * 2
  let y = 0

  const GREEN = [29, 158, 117]
  const BLUE = [24, 95, 165]
  const DARK = [26, 26, 24]
  const GRAY = [95, 94, 90]
  const LIGHTGRAY = [220, 218, 210]
  const WHITE = [255, 255, 255]
  const BG = [248, 248, 246]

  function newPage() { doc.addPage(); y = margin }
  function checkSpace(needed) { if (y + needed > pageH - margin) newPage() }

  doc.setFillColor(...GREEN)
  doc.rect(0, 0, pageW, 42, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(trip.name || 'Trip Itinerary', margin, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(trip.startDate ? `Departs ${trip.startDate} at ${trip.startTime || '06:00'}` : '', margin, 27)
  const totalH = stops.reduce((a, s) => a + (parseFloat(s.stayHours) || 0) + (parseFloat(s.driveToNext) || 0), 0)
  doc.text(`${stops.length} stops  ·  ${Math.round(totalH / 24 * 10) / 10} days total`, margin, 35)
  y = 52

  stops.forEach((stop, i) => {
    const timing = times[i]
    const isLast = i === stops.length - 1
    const stayStr = fmtDuration(stop.stayHours)
    const driveStr = fmtDuration(stop.driveToNext)
    const noteLines = stop.note ? doc.splitTextToSize(stop.note, contentW - 20).length : 0
    const blockH = 22 + (noteLines * 4.5) + (stayStr ? 5 : 0) + (stop.stayHours > 0 ? 5 : 0)
    checkSpace(blockH + 6)

    doc.setFillColor(...BG)
    doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F')
    const accentColor = i === 0 || isLast ? BLUE : GREEN
    doc.setFillColor(...accentColor)
    doc.roundedRect(margin, y, 3, blockH, 1, 1, 'F')
    doc.setFillColor(...accentColor)
    doc.circle(margin + 12, y + 8, 5, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(String(i + 1), margin + 12, y + 10.5, { align: 'center' })
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(stop.name || 'Stop', margin + 22, y + 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    if (timing) {
      doc.text('Arrives: ' + fmtDateTime(timing.arrival), margin + 22, y + 15)
      if (stop.stayHours > 0) doc.text('Departs: ' + fmtDateTime(timing.departure), margin + 22, y + 20)
    }
    let innerY = y + (stop.stayHours > 0 ? 26 : 21)
    if (stayStr) {
      doc.setFillColor(...GREEN)
      doc.roundedRect(margin + 22, innerY - 3.5, 28, 5, 1, 1, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.text(`${stayStr} stay`, margin + 36, innerY, { align: 'center' })
      innerY += 6
    }
    if (stop.note) {
      doc.setTextColor(...GRAY)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      const nl = doc.splitTextToSize(stop.note, contentW - 25)
      doc.text(nl, margin + 22, innerY)
    }
    y += blockH + 4
    if (!isLast && driveStr) {
      checkSpace(10)
      doc.setFillColor(...LIGHTGRAY)
      doc.roundedRect(margin + 4, y + 2, 55, 5, 2, 2, 'F')
      doc.setTextColor(...GRAY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text(`${driveStr} drive`, margin + 7, y + 5.8)
      y += 12
    }
  })

  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setDrawColor(...LIGHTGRAY)
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text(`${trip.name || 'Trip Planner'}  ·  Generated ${new Date().toLocaleDateString('en-GB')}`, margin, pageH - 7)
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin, pageH - 7, { align: 'right' })
  }

  doc.save((trip.name || 'trip').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf')
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { subscribeTrips, createTrip, saveStops, saveMeta, deleteTrip } from './firebaseService.js'
import { uid, defaultStops } from './utils.js'

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [activeTripId, setActiveTripId] = useState(null)
  const [status, setStatus] = useState('connecting') // connecting | ok | error
  const saveTimer = useRef(null)

  // Subscribe to all trips from Firestore
  useEffect(() => {
    const unsub = subscribeTrips(
      (data) => {
        setTrips(data)
        setStatus('ok')
        // Auto-select first trip
        if (data.length > 0 && !activeTripId) {
          setActiveTripId(prev => prev || data[0].id)
        }
      },
      (err) => {
        console.error('Firestore error:', err)
        setStatus('error')
      }
    )
    return unsub
  }, [])

  const activeTrip = trips.find(t => t.id === activeTripId) || null

  // Debounced save to Firestore
  const scheduleSave = useCallback((tripId, stops) => {
    clearTimeout(saveTimer.current)
    setStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await saveStops(tripId, stops)
        setStatus('ok')
      } catch (e) {
        console.error(e)
        setStatus('error')
      }
    }, 600)
  }, [])

  // Mutate stops for the active trip (optimistic update + debounced save)
  const mutateStops = useCallback((updater) => {
    if (!activeTripId) return
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTripId) return t
      const newStops = typeof updater === 'function' ? updater(t.stops || []) : updater
      scheduleSave(activeTripId, newStops)
      return { ...t, stops: newStops }
    }))
  }, [activeTripId, scheduleSave])

  const updateMeta = useCallback(async (field, value) => {
    if (!activeTripId) return
    setTrips(prev => prev.map(t => t.id === activeTripId ? { ...t, [field]: value } : t))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await saveMeta(activeTripId, { [field]: value })
        setStatus('ok')
      } catch (e) { setStatus('error') }
    }, 600)
  }, [activeTripId])

  const addTrip = useCallback(async () => {
    const id = await createTrip({
      name: 'New Trip',
      startDate: new Date().toISOString().slice(0, 10),
      startTime: '06:00',
      stops: defaultStops(),
    })
    setActiveTripId(id)
  }, [])

  const removeTrip = useCallback(async (tripId) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return
    await deleteTrip(tripId)
    setActiveTripId(prev => prev === tripId ? null : prev)
  }, [])

  // Stop operations
  const addStop = useCallback((afterIndex) => {
    mutateStops(stops => {
      const next = [...stops]
      next.splice(afterIndex + 1, 0, {
        id: uid(), name: 'New stop', stayHours: 24, driveToNext: 3, note: '', type: 'stop',
      })
      return next
    })
  }, [mutateStops])

  const removeStop = useCallback((stopId) => {
    mutateStops(stops => stops.filter(s => s.id !== stopId))
  }, [mutateStops])

  const updateStop = useCallback((stopId, field, value) => {
    mutateStops(stops => stops.map(s => s.id === stopId ? { ...s, [field]: value } : s))
  }, [mutateStops])

  const moveStop = useCallback((stopId, direction) => {
    mutateStops(stops => {
      const i = stops.findIndex(s => s.id === stopId)
      const j = i + direction
      if (j < 0 || j >= stops.length) return stops
      const next = [...stops]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }, [mutateStops])

  const reorderStops = useCallback((newStops) => {
    mutateStops(() => newStops)
  }, [mutateStops])

  return {
    trips, activeTrip, activeTripId, setActiveTripId,
    status, addTrip, removeTrip,
    addStop, removeStop, updateStop, moveStop, reorderStops,
    updateMeta,
  }
}

import { db } from './firebase.js'
import {
  collection, doc, onSnapshot, setDoc, addDoc,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore'

const TRIPS_COL = 'trips'

// ── Trip CRUD ────────────────────────────────────────────────────────────────

export function subscribeTrips(onChange, onError) {
  const q = query(collection(db, TRIPS_COL), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => {
    const trips = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    onChange(trips)
  }, onError)
}

export async function createTrip(meta) {
  const ref = await addDoc(collection(db, TRIPS_COL), {
    name: meta.name || 'New Trip',
    startDate: meta.startDate || new Date().toISOString().slice(0, 10),
    startTime: meta.startTime || '06:00',
    stops: meta.stops || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTrip(tripId, data) {
  const ref = doc(db, TRIPS_COL, tripId)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function deleteTrip(tripId) {
  await deleteDoc(doc(db, TRIPS_COL, tripId))
}

// ── Stop helpers (stops live as array inside the trip doc) ───────────────────

export async function saveStops(tripId, stops) {
  const ref = doc(db, TRIPS_COL, tripId)
  await updateDoc(ref, { stops, updatedAt: serverTimestamp() })
}

export async function saveMeta(tripId, meta) {
  const ref = doc(db, TRIPS_COL, tripId)
  await updateDoc(ref, { ...meta, updatedAt: serverTimestamp() })
}

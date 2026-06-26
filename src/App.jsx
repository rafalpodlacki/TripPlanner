import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useAuth } from './useAuth.js'
import { useTrips } from './useTrips.js'
import { computeTimes } from './utils.js'
import TripSidebar from './components/TripSidebar.jsx'
import TripHeader from './components/TripHeader.jsx'
import StopCard from './components/StopCard.jsx'
import DriveSegment from './components/DriveSegment.jsx'
import LoginScreen from './LoginScreen.jsx'
import styles from './App.module.css'

function SortableStop({ stop, index, total, timing, onUpdate, onRemove, onMoveUp, onMoveDown, onAddAfter }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style}>
      <div className={styles.stopRow}>
        <div className={styles.dragHandle} {...attributes} {...listeners} title="Drag to reorder">⠿</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StopCard
            stop={stop} index={index} total={total} timing={timing}
            onUpdate={(field, val) => onUpdate(stop.id, field, val)}
            onRemove={() => onRemove(stop.id)}
            onMoveUp={() => onMoveUp(stop.id, -1)}
            onMoveDown={() => onMoveDown(stop.id, 1)}
            onAddAfter={() => onAddAfter(index)}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading: authLoading, error: authError, login, logout } = useAuth()
  const {
    trips, activeTrip, activeTripId, setActiveTripId,
    status, addTrip, removeTrip,
    addStop, removeStop, updateStop, moveStop, reorderStops, updateMeta,
  } = useTrips()

  const stops = activeTrip?.stops || []
  const times = computeTimes(stops, activeTrip?.startDate, activeTrip?.startTime)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = stops.findIndex(s => s.id === active.id)
    const newIndex = stops.findIndex(s => s.id === over.id)
    reorderStops(arrayMove(stops, oldIndex, newIndex))
  }

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={login} error={authError} />
  }

  if (status === 'connecting' && trips.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Connecting to Firebase…</p>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <TripSidebar
        trips={trips}
        activeTripId={activeTripId}
        onSelect={setActiveTripId}
        onAdd={addTrip}
        onDelete={removeTrip}
      />
      <div className={styles.main}>
        <div className={styles.userBar}>
          <span className={styles.userEmail}>{user.email}</span>
          <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
        {!activeTrip ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🗺️</div>
            <h2>No trip selected</h2>
            <p>Select a trip from the sidebar or create a new one.</p>
            <button className={styles.createBtn} onClick={addTrip}>+ Create trip</button>
          </div>
        ) : (
          <>
            <TripHeader trip={activeTrip} status={status} onUpdateMeta={updateMeta} />
            <div className={styles.content}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {stops.map((stop, i) => (
                    <div key={stop.id}>
                      <SortableStop
                        stop={stop} index={i} total={stops.length} timing={times[i]}
                        onUpdate={updateStop} onRemove={removeStop}
                        onMoveUp={moveStop} onMoveDown={moveStop} onAddAfter={addStop}
                      />
                      {i < stops.length - 1 && (
                        <DriveSegment stop={stop} nextStop={stops[i + 1]} onUpdate={updateStop} />
                      )}
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
              <div className={styles.addRow}>
                <button className={styles.addBtn} onClick={() => addStop(stops.length - 1)}>+ Add stop</button>
                <button className={styles.addBtnSecondary} onClick={() => addStop(stops.length)}>+ Add at end</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { fmtDateTime, fmtDuration, STOP_TYPES, stopColor } from '../utils.js'
import styles from './StopCard.module.css'

export default function StopCard({
  stop, index, total, timing,
  onUpdate, onRemove, onMoveUp, onMoveDown, onAddAfter,
  isDragging,
}) {
  const [expanded, setExpanded] = useState(false)
  const nameRef = useRef(null)

  const color = stopColor(stop.type)
  const isFirst = index === 0
  const isLast = index === total - 1

  function handleNameBlur() {
    const val = nameRef.current?.innerText?.trim()
    if (val && val !== stop.name) onUpdate('name', val)
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.blur() }
  }

  const arrivalStr = timing ? fmtDateTime(timing.arrival) : '—'
  const departStr = timing && stop.stayHours > 0 ? fmtDateTime(timing.departure) : null
  const stayStr = fmtDuration(stop.stayHours)
  const driveStr = fmtDuration(stop.driveToNext)

  return (
    <div className={`${styles.card} ${expanded ? styles.expanded : ''} ${isDragging ? styles.dragging : ''}`}>
      {/* Colour accent bar */}
      <div className={styles.accent} style={{ background: color }} />

      <div className={styles.body}>
        {/* Header row */}
        <div className={styles.header}>
          <div className={styles.nameWrap}>
            <div
              ref={nameRef}
              className={styles.name}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              data-placeholder="Stop name…"
            >
              {stop.name}
            </div>
            <div className={styles.meta}>
              <span className={styles.arrivalIcon}>📅</span>
              <span className={styles.arrivalTime}>{arrivalStr}</span>
              {departStr && (
                <span className={styles.departTime}>→ departs {departStr}</span>
              )}
              {stayStr && (
                <span className={styles.tag} style={{ background: color + '22', color }}>
                  {stayStr} stay
                </span>
              )}
            </div>
            {stop.note && !expanded && (
              <div className={styles.note}>{stop.note}</div>
            )}
          </div>

          <div className={styles.actions}>
            <button title="Move up" onClick={onMoveUp} disabled={isFirst} className={styles.iconBtn}>↑</button>
            <button title="Move down" onClick={onMoveDown} disabled={isLast} className={styles.iconBtn}>↓</button>
            <button
              title={expanded ? 'Close' : 'Edit'}
              onClick={() => setExpanded(e => !e)}
              className={`${styles.iconBtn} ${expanded ? styles.active : ''}`}
            >
              {expanded ? '✕' : '✎'}
            </button>
            <button title="Remove stop" onClick={onRemove} className={`${styles.iconBtn} ${styles.danger}`}>
              🗑
            </button>
          </div>
        </div>

        {/* Expanded edit fields */}
        {expanded && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Stop name</label>
              <input
                className={styles.fieldInput}
                defaultValue={stop.name}
                onBlur={e => onUpdate('name', e.target.value.trim())}
                placeholder="City, campsite, attraction…"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Stop type</label>
              <select
                className={styles.fieldInput}
                value={stop.type || 'stop'}
                onChange={e => onUpdate('type', e.target.value)}
              >
                {STOP_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Stay duration (hours)</label>
              <input
                className={styles.fieldInput}
                type="number" min="0" step="0.5"
                value={stop.stayHours}
                onChange={e => onUpdate('stayHours', parseFloat(e.target.value) || 0)}
              />
              <span className={styles.fieldHint}>
                {stayStr || '0h'} · changing this shifts all later stops automatically
              </span>
            </div>

            {!isLast && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Drive to next stop (hours)</label>
                <input
                  className={styles.fieldInput}
                  type="number" min="0" step="0.5"
                  value={stop.driveToNext}
                  onChange={e => onUpdate('driveToNext', parseFloat(e.target.value) || 0)}
                />
                <span className={styles.fieldHint}>{driveStr || '0h'} driving</span>
              </div>
            )}

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel}>Notes</label>
              <textarea
                className={`${styles.fieldInput} ${styles.textarea}`}
                value={stop.note || ''}
                onChange={e => onUpdate('note', e.target.value)}
                placeholder="Activities, campsite details, reminders…"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add stop button below */}
      {!isLast && (
        <button className={styles.addBelow} onClick={onAddAfter} title="Add stop after this one">
          + add stop
        </button>
      )}
    </div>
  )
}

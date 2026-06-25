import { totalTripHours, fmtDuration } from '../utils.js'
import styles from './TripHeader.module.css'

const STATUS_LABELS = {
  connecting: { text: 'Connecting…', cls: 'loading' },
  ok:         { text: 'Saved ✓',    cls: 'ok' },
  saving:     { text: 'Saving…',    cls: 'loading' },
  error:      { text: 'Save error', cls: 'error' },
}

export default function TripHeader({ trip, status, onUpdateMeta }) {
  const stops = trip?.stops || []
  const totalH = totalTripHours(stops)
  const totalDays = Math.round(totalH / 24 * 10) / 10
  const s = STATUS_LABELS[status] || STATUS_LABELS.ok

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <input
          className={styles.tripName}
          value={trip?.name || ''}
          onChange={e => onUpdateMeta('name', e.target.value)}
          placeholder="Trip name…"
        />
        <span className={`${styles.statusBadge} ${styles[s.cls]}`}>{s.text}</span>
      </div>

      <div className={styles.row}>
        <div className={styles.metaGroup}>
          <label className={styles.metaLabel}>Start date</label>
          <input
            className={styles.metaInput}
            type="date"
            value={trip?.startDate || ''}
            onChange={e => onUpdateMeta('startDate', e.target.value)}
          />
        </div>
        <div className={styles.metaGroup}>
          <label className={styles.metaLabel}>Departure time</label>
          <input
            className={styles.metaInput}
            type="time"
            value={trip?.startTime || '06:00'}
            onChange={e => onUpdateMeta('startTime', e.target.value)}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{stops.length}</span>
            <span className={styles.statLbl}>stops</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <span className={styles.statVal}>{totalDays}</span>
            <span className={styles.statLbl}>days</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <span className={styles.statVal}>{fmtDuration(totalH) || '0h'}</span>
            <span className={styles.statLbl}>total</span>
          </div>
        </div>
      </div>
    </header>
  )
}

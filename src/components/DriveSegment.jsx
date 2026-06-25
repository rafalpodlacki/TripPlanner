import styles from './DriveSegment.module.css'
import { fmtDuration } from '../utils.js'

export default function DriveSegment({ stop, nextStop, onUpdate }) {
  const driveStr = fmtDuration(stop.driveToNext)

  return (
    <div className={styles.segment}>
      <div className={styles.line} />
      <div className={styles.pill}>
        <span className={styles.car}>🚗</span>
        <input
          className={styles.hoursInput}
          type="number"
          min="0"
          step="0.5"
          value={stop.driveToNext}
          title="Drive hours to next stop"
          onChange={e => onUpdate(stop.id, 'driveToNext', parseFloat(e.target.value) || 0)}
        />
        <span className={styles.label}>h drive</span>
        {nextStop && (
          <span className={styles.dest}>→ {nextStop.name.length > 28 ? nextStop.name.slice(0, 28) + '…' : nextStop.name}</span>
        )}
      </div>
      <div className={styles.line} />
    </div>
  )
}

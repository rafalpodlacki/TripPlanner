import styles from './TripSidebar.module.css'

export default function TripSidebar({ trips, activeTripId, onSelect, onAdd, onDelete }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>My Trips</span>
        <button className={styles.addBtn} onClick={onAdd} title="New trip">+</button>
      </div>
      <ul className={styles.list}>
        {trips.map(trip => (
          <li key={trip.id} className={`${styles.item} ${trip.id === activeTripId ? styles.active : ''}`}>
            <button className={styles.itemBtn} onClick={() => onSelect(trip.id)}>
              <span className={styles.itemName}>{trip.name || 'Untitled'}</span>
              <span className={styles.itemDate}>{trip.startDate}</span>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(trip.id)}
              title="Delete trip"
            >✕</button>
          </li>
        ))}
        {trips.length === 0 && (
          <li className={styles.empty}>No trips yet.<br />Click + to create one.</li>
        )}
      </ul>
    </aside>
  )
}

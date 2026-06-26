export default function SageActivityLog({ activity = [] }) {
  return (
    <div className="sage-activity-log">
      <div><span>ACTIVITY LOG</span><small>{activity.length} EVENTS</small></div>
      {activity.length === 0 ? <p>No actions yet. Suggestions and approvals will appear here.</p> : activity.slice(0, 8).map((item) => <article key={item.id}><i /><div><strong>{item.label}</strong><small>{item.detail || new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div></article>)}
    </div>
  )
}


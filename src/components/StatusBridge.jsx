const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     icon: '⏳', bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
  ASSIGNED:    { label: 'Assigned',    icon: '👥', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  IN_PROGRESS: { label: 'In Progress', icon: '🔧', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  RESOLVED:    { label: 'Resolved',    icon: '✅', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

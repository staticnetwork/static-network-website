export default function PremiumMotionLayer({ variant = 'city', density = 'standard', label = 'STATIC MOTION SYSTEM' }) {
  return (
    <div className={`premium-motion premium-motion--${variant} premium-motion--${density}`} aria-hidden="true" data-label={label}>
      <span className="premium-motion__sweep premium-motion__sweep--one" />
      <span className="premium-motion__sweep premium-motion__sweep--two" />
      <span className="premium-motion__pulse premium-motion__pulse--one" />
      <span className="premium-motion__pulse premium-motion__pulse--two" />
      <span className="premium-motion__scan" />
      <span className="premium-motion__ticker" />
    </div>
  )
}

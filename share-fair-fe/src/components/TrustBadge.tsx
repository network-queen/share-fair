import type { TrustTier } from '../types'

interface TrustBadgeProps {
  score: number
  tier: TrustTier
  size?: 'sm' | 'md' | 'lg'
}

const tierColors: Record<TrustTier, string> = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-gray-200 text-gray-700',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

const TrustBadge = ({ score, tier, size = 'md' }: TrustBadgeProps) => {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${tierColors[tier]} ${sizeClasses[size]}`}>
      {tier} ({score})
    </span>
  )
}

export default TrustBadge

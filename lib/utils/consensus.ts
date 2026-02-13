/**
 * Consensus utility functions
 *
 * Centralizes health-status-to-color mapping and participation-rate-to-color
 * logic that was duplicated across NetworkHealth, ValidatorLeaderboard,
 * ValidatorHeatmap, ParticipationChart, ParticipationRate, EpochDetail,
 * and ValidatorStatsOverview components.
 */

import { THRESHOLDS, CONSENSUS } from '@/lib/config/constants'

// ============================================================================
// Health Status Styles
// ============================================================================

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor'

export interface HealthStatusStyles {
  /** Tailwind text color class (e.g. 'text-green-400') */
  textColor: string
  /** Tailwind background color class (e.g. 'bg-green-500') */
  bgColor: string
  /** Emoji icon representing the status */
  icon: string
  /** Capitalized label (e.g. 'Excellent') */
  label: string
}

const HEALTH_STATUS_MAP: Record<HealthStatus, HealthStatusStyles> = {
  excellent: {
    textColor: 'text-green-400',
    bgColor: 'bg-green-500',
    icon: '\u{1F7E2}', // green circle emoji
    label: 'Excellent',
  },
  good: {
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    icon: '\u{1F7E1}', // yellow circle emoji
    label: 'Good',
  },
  fair: {
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500',
    icon: '\u{1F7E0}', // orange circle emoji
    label: 'Fair',
  },
  poor: {
    textColor: 'text-red-400',
    bgColor: 'bg-red-500',
    icon: '\u{1F534}', // red circle emoji
    label: 'Poor',
  },
}

const DEFAULT_HEALTH_STYLES: HealthStatusStyles = {
  textColor: 'text-gray-400',
  bgColor: 'bg-gray-500',
  icon: '\u26AA', // white circle emoji
  label: 'Unknown',
}

/**
 * Returns text color, background color, icon, and label for a given
 * network health status string.
 *
 * Replaces the three separate useMemo hooks in NetworkHealth.tsx and the
 * statusColor useMemo in NetworkHealthIndicator.
 */
export function getHealthStatusStyles(status: HealthStatus | string): HealthStatusStyles {
  return HEALTH_STATUS_MAP[status as HealthStatus] ?? DEFAULT_HEALTH_STYLES
}

// ============================================================================
// Participation Rate Colors
// ============================================================================

export interface ParticipationRateColors {
  /** Tailwind text color class */
  text: string
  /** Tailwind background color class */
  bg: string
}

/**
 * Returns the text and background color classes for a given participation
 * rate percentage, using the standard THRESHOLDS breakpoints.
 *
 * Thresholds:
 *  - >= 95% (EXCELLENT): accent-green
 *  - >= 80% (GOOD):      accent-cyan
 *  - >= 67% (MINIMUM):   yellow-500
 *  - <  67%:              accent-red
 *
 * Replaces duplicated ternary chains in ParticipationRate, ValidatorLeaderboard,
 * ValidatorHeatmap, EpochDetail, and ValidatorStatsOverview.
 */
export function getParticipationRateColor(rate: number): ParticipationRateColors {
  if (rate >= THRESHOLDS.PARTICIPATION_EXCELLENT) {
    return { text: 'text-accent-green', bg: 'bg-accent-green' }
  }
  if (rate >= THRESHOLDS.PARTICIPATION_GOOD) {
    return { text: 'text-accent-cyan', bg: 'bg-accent-cyan' }
  }
  if (rate >= THRESHOLDS.PARTICIPATION_MINIMUM) {
    return { text: 'text-yellow-500', bg: 'bg-yellow-500' }
  }
  return { text: 'text-accent-red', bg: 'bg-accent-red' }
}

/**
 * Returns the text color class for a participation value using the
 * consensus warning/critical thresholds.
 *
 * Thresholds:
 *  - >= 75% (WARNING):   accent-green
 *  - >= 66.7% (CRITICAL): yellow-400
 *  - < 66.7%:             accent-red
 *
 * Replaces duplicated ternary chains in ParticipationChart.
 */
export function getConsensusParticipationColor(value: number): string {
  if (value >= CONSENSUS.PARTICIPATION_WARNING_THRESHOLD) {
    return 'text-accent-green'
  }
  if (value >= CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD) {
    return 'text-yellow-400'
  }
  return 'text-accent-red'
}

/**
 * Shared Recharts theme constants
 *
 * Centralizes tooltip, axis, grid, and legend styles that were
 * previously duplicated across AreaChart, BarChart, LineChart,
 * and BlocksOverTimeChart components.
 */

import type { CSSProperties } from 'react'

// ============================================================================
// Standard Chart Theme (used by AreaChart, BarChart, LineChart)
// ============================================================================

/** Tooltip content container styles */
export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
}

/** Tooltip label text styles */
export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: 'rgba(255, 255, 255, 0.9)',
}

/** Tooltip item text styles */
export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: 'rgba(255, 255, 255, 0.7)',
}

/** Axis stroke color */
export const AXIS_STROKE = 'rgba(255, 255, 255, 0.5)'

/** Axis tick style */
export const AXIS_TICK = {
  fill: 'rgba(255, 255, 255, 0.7)',
  fontSize: 12,
} as const

/** CartesianGrid stroke color */
export const GRID_STROKE = 'rgba(255, 255, 255, 0.1)'

/** Standard CartesianGrid dash array */
export const GRID_DASH_ARRAY = '3 3'

/** Legend wrapper styles */
export const LEGEND_WRAPPER_STYLE: CSSProperties = {
  fontSize: '12px',
  fontFamily: 'monospace',
}

// ============================================================================
// Blocks-Over-Time Chart Theme (darker, hex-based variant)
// ============================================================================

/** Tooltip styles for the BlocksOverTimeChart */
export const BLOCKS_TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: '#1A202C',
  border: '1px solid #2D3748',
  borderRadius: 0,
  fontFamily: 'monospace',
  fontSize: '11px',
}

/** Tooltip label styles for the BlocksOverTimeChart */
export const BLOCKS_TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: '#00D4FF',
  marginBottom: '4px',
}

/** Axis stroke color for the BlocksOverTimeChart */
export const BLOCKS_AXIS_STROKE = '#718096'

/** Axis inline style for the BlocksOverTimeChart */
export const BLOCKS_AXIS_STYLE: CSSProperties = {
  fontSize: '10px',
  fontFamily: 'monospace',
}

/** CartesianGrid stroke color for the BlocksOverTimeChart */
export const BLOCKS_GRID_STROKE = '#2D3748'

/** CartesianGrid opacity for the BlocksOverTimeChart */
export const BLOCKS_GRID_OPACITY = 0.3

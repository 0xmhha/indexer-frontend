/**
 * Code Quality Constants
 *
 * Defines thresholds for SOLID principles and Clean Code practices.
 * These values are calibrated for production-ready code.
 */

// ============================================================
// Complexity Thresholds
// ============================================================

/**
 * Cyclomatic Complexity Thresholds
 * Measures the number of linearly independent paths through code
 *
 * 1-5: Simple, low risk
 * 6-10: Moderate complexity
 * 11-20: High complexity, consider refactoring
 * 21+: Very high risk, refactor immediately
 */
export const COMPLEXITY = {
  /** Excellent - Simple, easy to test */
  EXCELLENT: 5,
  /** Good - Acceptable complexity */
  GOOD: 10,
  /** Warning - Consider refactoring */
  WARNING: 15,
  /** Critical - Must refactor */
  CRITICAL: 20,
} as const

/**
 * Cognitive Complexity Thresholds
 * Measures how difficult code is to understand
 */
export const COGNITIVE_COMPLEXITY = {
  EXCELLENT: 8,
  GOOD: 15,
  WARNING: 25,
  CRITICAL: 35,
} as const

/**
 * Nesting Depth Thresholds
 * Measures the maximum depth of nested blocks
 */
export const NESTING_DEPTH = {
  /** Ideal - Flat structure */
  EXCELLENT: 2,
  /** Acceptable */
  GOOD: 4,
  /** Too deep - Refactor */
  WARNING: 5,
  /** Critical - Must refactor */
  CRITICAL: 6,
} as const

// ============================================================
// Size Thresholds (Lines of Code)
// ============================================================

/**
 * Function Size Thresholds (Lines)
 * Aligned with Single Responsibility Principle
 */
export const FUNCTION_LINES = {
  /** Ideal - Small, focused function */
  EXCELLENT: 20,
  /** Acceptable */
  GOOD: 50,
  /** Too large - Consider splitting */
  WARNING: 80,
  /** Critical - Must split */
  CRITICAL: 100,
} as const

/**
 * File Size Thresholds (Lines)
 * Promotes modular file organization
 */
export const FILE_LINES = {
  /** Ideal - Focused module */
  EXCELLENT: 150,
  /** Acceptable */
  GOOD: 300,
  /** Large - Consider splitting */
  WARNING: 500,
  /** Critical - Must split */
  CRITICAL: 750,
} as const

/**
 * Component Size Thresholds (Lines)
 * For React components
 */
export const COMPONENT_LINES = {
  EXCELLENT: 100,
  GOOD: 200,
  WARNING: 300,
  CRITICAL: 400,
} as const

// ============================================================
// Parameter Thresholds
// ============================================================

/**
 * Function Parameter Count Thresholds
 * Many parameters indicate the function is doing too much
 */
export const PARAMETERS = {
  /** Ideal */
  EXCELLENT: 2,
  /** Acceptable */
  GOOD: 4,
  /** Too many - Use object parameter */
  WARNING: 5,
  /** Critical - Must refactor */
  CRITICAL: 7,
} as const

// ============================================================
// Coupling & Cohesion
// ============================================================

/**
 * Import Count Thresholds (per file)
 * High import count may indicate low cohesion
 */
export const IMPORTS = {
  EXCELLENT: 10,
  GOOD: 20,
  WARNING: 30,
  CRITICAL: 40,
} as const

/**
 * Export Count Thresholds (per file)
 * High export count may indicate the module is doing too much
 */
export const EXPORTS = {
  EXCELLENT: 5,
  GOOD: 10,
  WARNING: 15,
  CRITICAL: 20,
} as const

// ============================================================
// Quality Score Weights
// ============================================================

/**
 * Weights for calculating overall quality score
 * Total: 100%
 */
export const QUALITY_WEIGHTS = {
  /** Code complexity metrics */
  COMPLEXITY: 25,
  /** Code maintainability */
  MAINTAINABILITY: 20,
  /** Test coverage */
  TEST_COVERAGE: 20,
  /** Documentation coverage */
  DOCUMENTATION: 10,
  /** Code duplication */
  DUPLICATION: 15,
  /** Type safety */
  TYPE_SAFETY: 10,
} as const

// ============================================================
// Quality Grade Thresholds
// ============================================================

/**
 * Overall Quality Score Grades
 */
export const QUALITY_GRADES = {
  /** A: Excellent - Production ready */
  A: { min: 90, label: 'Excellent', color: '#22c55e' },
  /** B: Good - Minor improvements needed */
  B: { min: 80, label: 'Good', color: '#84cc16' },
  /** C: Acceptable - Some improvements needed */
  C: { min: 70, label: 'Acceptable', color: '#eab308' },
  /** D: Poor - Significant improvements needed */
  D: { min: 60, label: 'Poor', color: '#f97316' },
  /** F: Critical - Major refactoring needed */
  F: { min: 0, label: 'Critical', color: '#ef4444' },
} as const

// ============================================================
// Score Thresholds
// ============================================================

/**
 * Score thresholds for quality assessments
 */
export const SCORE_THRESHOLDS = {
  /** Perfect score */
  PERFECT: 100,
  /** Passing threshold */
  PASSING: 70,
} as const

/**
 * Default scores for simplified analysis
 */
export const DEFAULT_SCORES = {
  READABILITY: 80,
  TESTABILITY: 75,
  DOCUMENTATION: 70,
  DUPLICATION: 85,
  TYPE_SAFETY: 90,
  SOLID: 80,
  OCP: 85,
  LSP: 90,
  ISP: 85,
} as const

/**
 * SRP Analysis Thresholds
 */
export const SRP_THRESHOLDS = {
  /** Maximum recommended function count per file */
  MAX_FUNCTIONS: 10,
  /** High function count threshold */
  HIGH_FUNCTIONS: 15,
  /** Score deduction multiplier for function count */
  FUNCTION_DEDUCTION_MULTIPLIER: 5,
  /** Maximum deduction for function count */
  FUNCTION_DEDUCTION_MAX: 30,
  /** Score deduction multiplier for export count */
  EXPORT_DEDUCTION_MULTIPLIER: 3,
  /** Maximum deduction for export count */
  EXPORT_DEDUCTION_MAX: 20,
  /** Critical file size deduction */
  CRITICAL_SIZE_DEDUCTION: 25,
  /** Warning file size deduction */
  WARNING_SIZE_DEDUCTION: 15,
} as const

/**
 * DIP Analysis Thresholds
 */
export const DIP_THRESHOLDS = {
  /** High import count threshold */
  HIGH_IMPORTS: 20,
  /** Very high import count threshold */
  VERY_HIGH_IMPORTS: 30,
  /** Score deduction multiplier */
  DEDUCTION_MULTIPLIER: 2,
  /** Maximum deduction */
  DEDUCTION_MAX: 25,
} as const

/**
 * Hotspot Analysis Thresholds
 */
export const HOTSPOT_THRESHOLDS = {
  /** Minimum score to be considered a hotspot */
  MIN_SCORE: 50,
  /** Maximum hotspots to return */
  MAX_COUNT: 10,
  /** Complexity multiplier */
  COMPLEXITY_MULTIPLIER: 5,
  /** File size divisor */
  FILE_SIZE_DIVISOR: 10,
  /** Function count multiplier */
  FUNCTION_MULTIPLIER: 3,
  /** Error issue multiplier */
  ERROR_MULTIPLIER: 10,
  /** Warning issue multiplier */
  WARNING_MULTIPLIER: 5,
  /** Maximum hotspot score */
  MAX_SCORE: 100,
} as const

/**
 * Weight divisor for percentage calculation
 */
export const WEIGHT_DIVISOR = 100

// ============================================================
// SOLID Principle Indicators
// ============================================================

/**
 * SOLID Principle Check Patterns
 */
export const SOLID_PATTERNS = {
  /**
   * Single Responsibility Principle
   * A class/module should have only one reason to change
   */
  SRP: {
    maxFunctionCount: 10,
    maxExportCount: 10,
    maxLineCount: 300,
  },
  /**
   * Open/Closed Principle
   * Open for extension, closed for modification
   */
  OCP: {
    preferInterfacesOverConcreteTypes: true,
    preferCompositionOverInheritance: true,
  },
  /**
   * Liskov Substitution Principle
   * Subtypes must be substitutable for base types
   */
  LSP: {
    enforceContractConsistency: true,
  },
  /**
   * Interface Segregation Principle
   * Many client-specific interfaces are better than one general-purpose interface
   */
  ISP: {
    maxInterfaceMembers: 10,
  },
  /**
   * Dependency Inversion Principle
   * Depend on abstractions, not concretions
   */
  DIP: {
    preferDependencyInjection: true,
    avoidHardcodedDependencies: true,
  },
} as const

// ============================================================
// File Pattern Categories
// ============================================================

/**
 * File patterns for different code categories
 */
export const FILE_PATTERNS = {
  COMPONENTS: /^components\/.*\.tsx?$/,
  HOOKS: /^lib\/hooks\/.*\.ts$/,
  UTILS: /^lib\/utils\/.*\.ts$/,
  TYPES: /^types\/.*\.ts$/,
  SERVICES: /^lib\/services\/.*\.ts$/,
  PAGES: /^app\/.*\/page\.tsx?$/,
  TESTS: /\.(test|spec)\.(ts|tsx)$/,
  CONFIGS: /\.(config|setup)\.(ts|js|mjs)$/,
} as const

export type QualityGrade = keyof typeof QUALITY_GRADES
export type ThresholdLevel = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'

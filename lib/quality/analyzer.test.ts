/**
 * Code Quality Analyzer Tests
 *
 * Tests for code quality analysis utilities including
 * SOLID principles and Clean Code metrics.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateMetric,
  getScoreFromLevel,
  getGradeFromScore,
  analyzeComplexity,
  analyzeNestingDepth,
  analyzeFunctionSize,
  analyzeFileSize,
  analyzeParameters,
  analyzeImports,
  analyzeExports,
  analyzeSRP,
  analyzeDIP,
  detectFunctionIssues,
  createIssue,
  calculateQualitySummary,
} from './analyzer'
import { COMPLEXITY } from './constants'
import type { FunctionMetrics, FileMetrics } from './types'

// ============================================================
// Threshold Evaluation Tests
// ============================================================

describe('evaluateMetric', () => {
  it('should return EXCELLENT for values at or below excellent threshold', () => {
    expect(evaluateMetric(3, COMPLEXITY)).toBe('EXCELLENT')
    expect(evaluateMetric(5, COMPLEXITY)).toBe('EXCELLENT')
  })

  it('should return GOOD for values between excellent and good thresholds', () => {
    expect(evaluateMetric(7, COMPLEXITY)).toBe('GOOD')
    expect(evaluateMetric(10, COMPLEXITY)).toBe('GOOD')
  })

  it('should return WARNING for values between good and warning thresholds', () => {
    expect(evaluateMetric(12, COMPLEXITY)).toBe('WARNING')
    expect(evaluateMetric(15, COMPLEXITY)).toBe('WARNING')
  })

  it('should return CRITICAL for values above warning threshold', () => {
    expect(evaluateMetric(21, COMPLEXITY)).toBe('CRITICAL')
    expect(evaluateMetric(30, COMPLEXITY)).toBe('CRITICAL')
  })

  it('should handle higher-is-better metrics when lowerIsBetter is false', () => {
    const coverageThresholds = { EXCELLENT: 90, GOOD: 80, WARNING: 70, CRITICAL: 60 }
    expect(evaluateMetric(95, coverageThresholds, false)).toBe('EXCELLENT')
    expect(evaluateMetric(85, coverageThresholds, false)).toBe('GOOD')
    expect(evaluateMetric(75, coverageThresholds, false)).toBe('WARNING')
    expect(evaluateMetric(50, coverageThresholds, false)).toBe('CRITICAL')
  })
})

describe('getScoreFromLevel', () => {
  it('should return correct scores for each level', () => {
    expect(getScoreFromLevel('EXCELLENT')).toBe(100)
    expect(getScoreFromLevel('GOOD')).toBe(80)
    expect(getScoreFromLevel('WARNING')).toBe(60)
    expect(getScoreFromLevel('CRITICAL')).toBe(40)
  })
})

describe('getGradeFromScore', () => {
  it('should return A for scores >= 90', () => {
    expect(getGradeFromScore(100)).toBe('A')
    expect(getGradeFromScore(95)).toBe('A')
    expect(getGradeFromScore(90)).toBe('A')
  })

  it('should return B for scores 80-89', () => {
    expect(getGradeFromScore(89)).toBe('B')
    expect(getGradeFromScore(85)).toBe('B')
    expect(getGradeFromScore(80)).toBe('B')
  })

  it('should return C for scores 70-79', () => {
    expect(getGradeFromScore(79)).toBe('C')
    expect(getGradeFromScore(75)).toBe('C')
    expect(getGradeFromScore(70)).toBe('C')
  })

  it('should return D for scores 60-69', () => {
    expect(getGradeFromScore(69)).toBe('D')
    expect(getGradeFromScore(65)).toBe('D')
    expect(getGradeFromScore(60)).toBe('D')
  })

  it('should return F for scores below 60', () => {
    expect(getGradeFromScore(59)).toBe('F')
    expect(getGradeFromScore(40)).toBe('F')
    expect(getGradeFromScore(0)).toBe('F')
  })
})

// ============================================================
// Metric Analysis Tests
// ============================================================

describe('analyzeComplexity', () => {
  it('should analyze low complexity as EXCELLENT', () => {
    const result = analyzeComplexity(3)
    expect(result.level).toBe('EXCELLENT')
    expect(result.name).toBe('Cyclomatic Complexity')
    expect(result.value).toBe(3)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should provide suggestions for high complexity', () => {
    const result = analyzeComplexity(18)
    expect(result.level).toBe('CRITICAL')
    expect(result.suggestions).toBeDefined()
    expect(result.suggestions?.length).toBeGreaterThan(0)
  })
})

describe('analyzeNestingDepth', () => {
  it('should analyze shallow nesting as EXCELLENT', () => {
    const result = analyzeNestingDepth(2)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should provide suggestions for deep nesting', () => {
    const result = analyzeNestingDepth(6)
    expect(result.level).toBe('CRITICAL')
    expect(result.suggestions).toBeDefined()
    expect(result.suggestions).toContain('Use early returns to flatten nested conditions')
  })
})

describe('analyzeFunctionSize', () => {
  it('should analyze small functions as EXCELLENT', () => {
    const result = analyzeFunctionSize(15)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should analyze medium functions as GOOD', () => {
    const result = analyzeFunctionSize(40)
    expect(result.level).toBe('GOOD')
  })

  it('should flag large functions with suggestions', () => {
    const result = analyzeFunctionSize(120)
    expect(result.level).toBe('CRITICAL')
    expect(result.suggestions).toBeDefined()
  })
})

describe('analyzeFileSize', () => {
  it('should analyze small files as EXCELLENT', () => {
    const result = analyzeFileSize(100)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should flag large files with suggestions', () => {
    const result = analyzeFileSize(600)
    expect(result.level).toBe('CRITICAL')
    expect(result.suggestions).toBeDefined()
  })
})

describe('analyzeParameters', () => {
  it('should analyze few parameters as EXCELLENT', () => {
    const result = analyzeParameters(2)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should flag many parameters with suggestions', () => {
    const result = analyzeParameters(8)
    expect(result.level).toBe('CRITICAL')
    expect(result.suggestions).toContain('Group related parameters into an options object')
  })
})

describe('analyzeImports', () => {
  it('should analyze low import count as EXCELLENT', () => {
    const result = analyzeImports(5)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should flag high import count', () => {
    const result = analyzeImports(35)
    expect(result.level).toBe('CRITICAL')
  })
})

describe('analyzeExports', () => {
  it('should analyze low export count as EXCELLENT', () => {
    const result = analyzeExports(3)
    expect(result.level).toBe('EXCELLENT')
  })

  it('should flag high export count', () => {
    const result = analyzeExports(25)
    expect(result.level).toBe('CRITICAL')
  })
})

// ============================================================
// SOLID Analysis Tests
// ============================================================

describe('analyzeSRP', () => {
  const createFileMetrics = (overrides: Partial<FileMetrics> = {}): FileMetrics => ({
    filePath: 'test/file.ts',
    lineCount: 100,
    codeLineCount: 80,
    importCount: 5,
    exportCount: 3,
    functionCount: 5,
    classCount: 0,
    typeCount: 2,
    avgComplexity: 5,
    maxComplexity: 8,
    functions: [],
    issues: [],
    ...overrides,
  })

  it('should pass for files following SRP', () => {
    const metrics = createFileMetrics()
    const result = analyzeSRP(metrics)

    expect(result.principle).toBe('SRP')
    expect(result.passed).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('should detect violations for files with too many functions', () => {
    const metrics = createFileMetrics({ functionCount: 25, exportCount: 20, lineCount: 600 })
    const result = analyzeSRP(metrics)

    // With 25 functions (deduction: 75), 20 exports (deduction: 30), 600 lines (deduction: 25)
    // Score: 100 - 30 - 20 - 25 = 25, which is < 70, so passed should be false
    expect(result.passed).toBe(false)
    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations.some((v) => v.description.includes('functions'))).toBe(true)
  })

  it('should detect violations for files with too many exports', () => {
    const metrics = createFileMetrics({ exportCount: 20 })
    const result = analyzeSRP(metrics)

    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations.some((v) => v.description.includes('exports'))).toBe(true)
  })

  it('should detect violations for large files', () => {
    const metrics = createFileMetrics({ lineCount: 800 })
    const result = analyzeSRP(metrics)

    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations.some((v) => v.description.includes('lines'))).toBe(true)
  })
})

describe('analyzeDIP', () => {
  const createFileMetrics = (overrides: Partial<FileMetrics> = {}): FileMetrics => ({
    filePath: 'test/file.ts',
    lineCount: 100,
    codeLineCount: 80,
    importCount: 10,
    exportCount: 3,
    functionCount: 5,
    classCount: 0,
    typeCount: 2,
    avgComplexity: 5,
    maxComplexity: 8,
    functions: [],
    issues: [],
    ...overrides,
  })

  it('should pass for files with reasonable imports', () => {
    const metrics = createFileMetrics()
    const result = analyzeDIP(metrics)

    expect(result.principle).toBe('DIP')
    expect(result.passed).toBe(true)
  })

  it('should detect potential coupling issues with high imports', () => {
    const metrics = createFileMetrics({ importCount: 40 })
    const result = analyzeDIP(metrics)

    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations[0]?.description).toContain('coupling')
  })
})

// ============================================================
// Issue Detection Tests
// ============================================================

describe('createIssue', () => {
  it('should create an issue with all properties', () => {
    const issue = createIssue({
      severity: 'warning',
      category: 'complexity',
      code: 'TEST-001',
      message: 'Test message',
      filePath: 'test/file.ts',
      line: 10,
      column: 5,
      suggestion: 'Fix it',
      solidPrinciple: 'SRP',
    })

    expect(issue.severity).toBe('warning')
    expect(issue.category).toBe('complexity')
    expect(issue.code).toBe('TEST-001')
    expect(issue.message).toBe('Test message')
    expect(issue.filePath).toBe('test/file.ts')
    expect(issue.line).toBe(10)
    expect(issue.column).toBe(5)
    expect(issue.suggestion).toBe('Fix it')
    expect(issue.solidPrinciple).toBe('SRP')
  })

  it('should create an issue with minimal properties', () => {
    const issue = createIssue({
      severity: 'error',
      category: 'maintainability',
      code: 'TEST-002',
      message: 'Error message',
      filePath: 'test.ts',
    })

    expect(issue.severity).toBe('error')
    expect(issue.line).toBeUndefined()
    expect(issue.suggestion).toBeUndefined()
  })
})

describe('detectFunctionIssues', () => {
  const createFunctionMetrics = (overrides: Partial<FunctionMetrics> = {}): FunctionMetrics => ({
    name: 'testFunction',
    filePath: 'test/file.ts',
    startLine: 1,
    endLine: 20,
    lineCount: 20,
    cyclomaticComplexity: 5,
    cognitiveComplexity: 8,
    maxDepth: 2,
    parameterCount: 2,
    returnCount: 1,
    hasDocumentation: true,
    ...overrides,
  })

  it('should return no issues for clean functions', () => {
    const metrics = createFunctionMetrics()
    const issues = detectFunctionIssues(metrics)

    expect(issues).toHaveLength(0)
  })

  it('should detect complexity issues', () => {
    const metrics = createFunctionMetrics({ cyclomaticComplexity: 25 })
    const issues = detectFunctionIssues(metrics)

    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some((i) => i.code === 'COMPLEXITY-001')).toBe(true)
  })

  it('should detect size issues', () => {
    const metrics = createFunctionMetrics({ lineCount: 150, endLine: 150 })
    const issues = detectFunctionIssues(metrics)

    expect(issues.some((i) => i.code === 'SIZE-001')).toBe(true)
  })

  it('should detect depth issues', () => {
    const metrics = createFunctionMetrics({ maxDepth: 7 })
    const issues = detectFunctionIssues(metrics)

    expect(issues.some((i) => i.code === 'DEPTH-001')).toBe(true)
  })

  it('should detect parameter issues', () => {
    const metrics = createFunctionMetrics({ parameterCount: 8 })
    const issues = detectFunctionIssues(metrics)

    expect(issues.some((i) => i.code === 'PARAMS-001')).toBe(true)
  })

  it('should detect multiple issues in one function', () => {
    const metrics = createFunctionMetrics({
      cyclomaticComplexity: 25,
      lineCount: 150,
      endLine: 150,
      maxDepth: 7,
      parameterCount: 8,
    })
    const issues = detectFunctionIssues(metrics)

    expect(issues.length).toBeGreaterThanOrEqual(4)
  })
})

// ============================================================
// Quality Summary Tests
// ============================================================

describe('calculateQualitySummary', () => {
  const createFileMetrics = (overrides: Partial<FileMetrics> = {}): FileMetrics => ({
    filePath: 'test/file.ts',
    lineCount: 100,
    codeLineCount: 80,
    importCount: 5,
    exportCount: 3,
    functionCount: 5,
    classCount: 0,
    typeCount: 2,
    avgComplexity: 5,
    maxComplexity: 8,
    functions: [],
    issues: [],
    ...overrides,
  })

  it('should calculate summary for empty file list', () => {
    const summary = calculateQualitySummary([])

    expect(summary.totalFiles).toBe(0)
    expect(summary.totalLines).toBe(0)
    expect(summary.totalFunctions).toBe(0)
  })

  it('should calculate summary for single file', () => {
    const files = [createFileMetrics()]
    const summary = calculateQualitySummary(files)

    expect(summary.totalFiles).toBe(1)
    expect(summary.totalLines).toBe(100)
    expect(summary.totalFunctions).toBe(5)
    expect(summary.grade).toBeDefined()
    expect(summary.overallScore).toBeGreaterThan(0)
  })

  it('should aggregate metrics from multiple files', () => {
    const files = [
      createFileMetrics({ lineCount: 100, functionCount: 5 }),
      createFileMetrics({ lineCount: 200, functionCount: 10 }),
      createFileMetrics({ lineCount: 150, functionCount: 7 }),
    ]
    const summary = calculateQualitySummary(files)

    expect(summary.totalFiles).toBe(3)
    expect(summary.totalLines).toBe(450)
    expect(summary.totalFunctions).toBe(22)
  })

  it('should count issues by severity', () => {
    const files = [
      createFileMetrics({
        issues: [
          { severity: 'error', category: 'complexity', code: 'E1', message: 'Error', filePath: 'f1' },
          { severity: 'warning', category: 'complexity', code: 'W1', message: 'Warning', filePath: 'f1' },
          { severity: 'warning', category: 'complexity', code: 'W2', message: 'Warning', filePath: 'f1' },
          { severity: 'info', category: 'complexity', code: 'I1', message: 'Info', filePath: 'f1' },
        ],
      }),
    ]
    const summary = calculateQualitySummary(files)

    expect(summary.issueCount.error).toBe(1)
    expect(summary.issueCount.warning).toBe(2)
    expect(summary.issueCount.info).toBe(1)
  })

  it('should identify hotspots', () => {
    const files = [
      createFileMetrics({ filePath: 'good.ts', maxComplexity: 5, lineCount: 50 }),
      createFileMetrics({
        filePath: 'bad.ts',
        maxComplexity: 25,
        lineCount: 500,
        functionCount: 20,
        issues: [
          { severity: 'error', category: 'complexity', code: 'E1', message: 'Error', filePath: 'bad.ts' },
        ],
      }),
    ]
    const summary = calculateQualitySummary(files)

    expect(summary.hotspots.length).toBeGreaterThan(0)
    expect(summary.hotspots[0]?.filePath).toBe('bad.ts')
  })

  it('should calculate SOLID scores', () => {
    const files = [createFileMetrics()]
    const summary = calculateQualitySummary(files)

    expect(summary.solidScores).toBeDefined()
    expect(summary.solidScores.SRP).toBeGreaterThan(0)
    expect(summary.solidScores.DIP).toBeGreaterThan(0)
  })
})

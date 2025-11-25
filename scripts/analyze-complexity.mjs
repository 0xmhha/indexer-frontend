#!/usr/bin/env node
/**
 * Code Complexity Analysis Script
 *
 * Parses ESLint JSON output and generates a complexity report.
 * Identifies files and functions that need refactoring based on
 * SOLID principles and Clean Code practices.
 *
 * Usage:
 *   eslint . --format json | node scripts/analyze-complexity.mjs
 *   pnpm run quality:complexity
 */

import { readFileSync } from 'fs'

// ============================================================
// Constants
// ============================================================

const THRESHOLDS = {
  complexity: { excellent: 5, good: 10, warning: 15, critical: 20 },
  maxDepth: { excellent: 2, good: 4, warning: 5, critical: 6 },
  maxLines: { excellent: 50, good: 80, warning: 100, critical: 150 },
  maxParams: { excellent: 2, good: 4, warning: 5, critical: 7 },
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

// ============================================================
// Utility Functions
// ============================================================

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

function getLevel(value, threshold) {
  if (value <= threshold.excellent) return 'excellent'
  if (value <= threshold.good) return 'good'
  if (value <= threshold.warning) return 'warning'
  return 'critical'
}

function getLevelColor(level) {
  const colors = {
    excellent: 'green',
    good: 'cyan',
    warning: 'yellow',
    critical: 'red',
  }
  return colors[level] || 'gray'
}

function getLevelEmoji(level) {
  const emojis = {
    excellent: '✅',
    good: '✓',
    warning: '⚠️',
    critical: '❌',
  }
  return emojis[level] || '•'
}

// ============================================================
// Report Generation
// ============================================================

function analyzeEslintResults(results) {
  const report = {
    totalFiles: 0,
    totalIssues: 0,
    complexityIssues: [],
    depthIssues: [],
    lineIssues: [],
    paramIssues: [],
    otherIssues: [],
    summary: {
      excellent: 0,
      good: 0,
      warning: 0,
      critical: 0,
    },
  }

  for (const file of results) {
    if (file.messages.length === 0) continue

    report.totalFiles++

    for (const msg of file.messages) {
      report.totalIssues++

      const issue = {
        file: file.filePath.replace(process.cwd() + '/', ''),
        line: msg.line,
        column: msg.column,
        rule: msg.ruleId,
        message: msg.message,
        severity: msg.severity === 2 ? 'error' : 'warning',
      }

      // Categorize by rule
      if (msg.ruleId === 'complexity') {
        const match = msg.message.match(/complexity of (\d+)/)
        if (match) {
          issue.value = parseInt(match[1], 10)
          issue.level = getLevel(issue.value, THRESHOLDS.complexity)
          report.complexityIssues.push(issue)
          report.summary[issue.level]++
        }
      } else if (msg.ruleId === 'max-depth') {
        const match = msg.message.match(/depth of (\d+)/)
        if (match) {
          issue.value = parseInt(match[1], 10)
          issue.level = getLevel(issue.value, THRESHOLDS.maxDepth)
          report.depthIssues.push(issue)
          report.summary[issue.level]++
        }
      } else if (msg.ruleId === 'max-lines-per-function') {
        const match = msg.message.match(/(\d+) lines/)
        if (match) {
          issue.value = parseInt(match[1], 10)
          issue.level = getLevel(issue.value, THRESHOLDS.maxLines)
          report.lineIssues.push(issue)
          report.summary[issue.level]++
        }
      } else if (msg.ruleId === 'max-params') {
        const match = msg.message.match(/(\d+) params/)
        if (match) {
          issue.value = parseInt(match[1], 10)
          issue.level = getLevel(issue.value, THRESHOLDS.maxParams)
          report.paramIssues.push(issue)
          report.summary[issue.level]++
        }
      } else {
        report.otherIssues.push(issue)
      }
    }
  }

  return report
}

function printHeader(title) {
  console.log('')
  console.log(colorize('═'.repeat(60), 'cyan'))
  console.log(colorize(` ${title}`, 'bold'))
  console.log(colorize('═'.repeat(60), 'cyan'))
}

function printIssueSection(title, issues, valueLabel) {
  if (issues.length === 0) return

  console.log('')
  console.log(colorize(`▸ ${title} (${issues.length} issues)`, 'bold'))
  console.log(colorize('─'.repeat(50), 'gray'))

  // Sort by value descending (worst first)
  const sorted = [...issues].sort((a, b) => (b.value || 0) - (a.value || 0))

  for (const issue of sorted.slice(0, 10)) {
    const levelColor = getLevelColor(issue.level)
    const emoji = getLevelEmoji(issue.level)

    console.log(
      `  ${emoji} ${colorize(issue.file, 'blue')}:${issue.line}`,
    )
    console.log(
      `     ${valueLabel}: ${colorize(String(issue.value), levelColor)} ` +
      `(${colorize(issue.level.toUpperCase(), levelColor)})`
    )
  }

  if (sorted.length > 10) {
    console.log(colorize(`  ... and ${sorted.length - 10} more`, 'gray'))
  }
}

function printSummary(report) {
  printHeader('📊 Code Quality Summary')

  console.log('')
  console.log(`  Total files with issues: ${colorize(String(report.totalFiles), 'yellow')}`)
  console.log(`  Total issues found: ${colorize(String(report.totalIssues), 'yellow')}`)
  console.log('')

  console.log(colorize('  Issue Breakdown:', 'bold'))
  console.log(`    ${colorize('✅ Excellent', 'green')}: ${report.summary.excellent}`)
  console.log(`    ${colorize('✓  Good', 'cyan')}: ${report.summary.good}`)
  console.log(`    ${colorize('⚠️  Warning', 'yellow')}: ${report.summary.warning}`)
  console.log(`    ${colorize('❌ Critical', 'red')}: ${report.summary.critical}`)

  // Calculate quality score
  const totalCounted = report.summary.excellent + report.summary.good +
    report.summary.warning + report.summary.critical

  if (totalCounted > 0) {
    const score = Math.round(
      ((report.summary.excellent * 100 + report.summary.good * 80 +
        report.summary.warning * 60 + report.summary.critical * 40) / totalCounted)
    )

    console.log('')
    let scoreColor = 'green'
    let grade = 'A'
    if (score < 90) { scoreColor = 'cyan'; grade = 'B' }
    if (score < 80) { scoreColor = 'yellow'; grade = 'C' }
    if (score < 70) { scoreColor = 'red'; grade = 'D' }
    if (score < 60) { scoreColor = 'red'; grade = 'F' }

    console.log(`  Quality Score: ${colorize(`${score}/100 (Grade: ${grade})`, scoreColor)}`)
  }
}

function printRecommendations(report) {
  const recommendations = []

  if (report.complexityIssues.length > 0) {
    recommendations.push({
      category: 'Complexity',
      count: report.complexityIssues.length,
      tip: 'Extract complex conditions into helper functions',
    })
  }

  if (report.depthIssues.length > 0) {
    recommendations.push({
      category: 'Nesting Depth',
      count: report.depthIssues.length,
      tip: 'Use early returns and guard clauses',
    })
  }

  if (report.lineIssues.length > 0) {
    recommendations.push({
      category: 'Function Size',
      count: report.lineIssues.length,
      tip: 'Split large functions following Single Responsibility Principle',
    })
  }

  if (report.paramIssues.length > 0) {
    recommendations.push({
      category: 'Parameters',
      count: report.paramIssues.length,
      tip: 'Group related parameters into options objects',
    })
  }

  if (recommendations.length > 0) {
    printHeader('💡 Recommendations')
    console.log('')

    for (const rec of recommendations) {
      console.log(`  ${colorize(`▸ ${rec.category}`, 'yellow')} (${rec.count} issues)`)
      console.log(`    ${colorize('→', 'gray')} ${rec.tip}`)
      console.log('')
    }
  }
}

// ============================================================
// Main Execution
// ============================================================

async function main() {
  let input = ''

  // Read from stdin
  try {
    input = readFileSync(0, 'utf-8')
  } catch {
    console.error(colorize('Error: No input received. Run with:', 'red'))
    console.error('  eslint . --format json | node scripts/analyze-complexity.mjs')
    process.exit(1)
  }

  let results
  try {
    results = JSON.parse(input)
  } catch {
    console.error(colorize('Error: Invalid JSON input from ESLint', 'red'))
    process.exit(1)
  }

  const report = analyzeEslintResults(results)

  // Print report sections
  printHeader('🔍 Code Complexity Analysis')
  console.log('')
  console.log(colorize('  Analyzing code quality metrics...', 'gray'))

  printIssueSection('Cyclomatic Complexity', report.complexityIssues, 'Complexity')
  printIssueSection('Nesting Depth', report.depthIssues, 'Max depth')
  printIssueSection('Function Size', report.lineIssues, 'Lines')
  printIssueSection('Parameter Count', report.paramIssues, 'Params')

  printSummary(report)
  printRecommendations(report)

  console.log('')
  console.log(colorize('═'.repeat(60), 'cyan'))
  console.log('')

  // Exit with error if critical issues found
  if (report.summary.critical > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(colorize(`Error: ${error.message}`, 'red'))
  process.exit(1)
})

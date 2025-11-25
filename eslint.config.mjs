import nextConfig from 'eslint-config-next'
import tseslint from '@typescript-eslint/eslint-plugin'

const next = Array.isArray(nextConfig) ? nextConfig : nextConfig.default ?? nextConfig

/**
 * ESLint Configuration with Code Quality & Complexity Rules
 *
 * Designed for:
 * - SOLID Principles adherence
 * - Clean Code practices
 * - Extensibility and maintainability
 * - Readable, performance-conscious code
 *
 * Complexity Thresholds:
 * - Cyclomatic Complexity: max 10 (warning at 8)
 * - Cognitive Complexity: max 15
 * - Max Depth: 4 levels
 * - Max Lines per Function: 50
 * - Max Lines per File: 300
 * - Max Parameters: 4
 */
const config = [
  ...next,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // ============================================================
      // TypeScript Rules
      // ============================================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ============================================================
      // Code Complexity Rules (SOLID & Clean Code)
      // ============================================================

      // Cyclomatic Complexity: Measures decision points in code
      // Lower is better, max 10 keeps functions focused (Single Responsibility)
      complexity: ['warn', { max: 10 }],

      // Max Depth: Prevents deeply nested code blocks
      // 4 levels max for readability and maintainability
      'max-depth': ['warn', { max: 4 }],

      // Max Lines per Function: Encourages small, focused functions
      // 50 lines max supports Single Responsibility Principle
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],

      // Max Lines per File: Encourages modular file organization
      // 300 lines max promotes separation of concerns
      'max-lines': [
        'warn',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Max Parameters: Limits function parameter count
      // 4 params max, prefer objects for complex configurations
      'max-params': ['warn', { max: 4 }],

      // Max Statements per Function: Limits function complexity
      'max-statements': ['warn', { max: 15 }],

      // Max Nested Callbacks: Prevents callback hell
      'max-nested-callbacks': ['warn', { max: 3 }],

      // ============================================================
      // Clean Code Rules
      // ============================================================

      // No nested ternary operators for readability
      'no-nested-ternary': 'warn',

      // Prefer early returns for cleaner flow
      'no-else-return': ['warn', { allowElseIf: false }],

      // Consistent return statements
      'consistent-return': 'warn',

      // No magic numbers (except common ones)
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2, 10, 100, 1000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],

      // Require default case in switch statements
      'default-case': 'warn',

      // No duplicate conditions in if-else chains
      'no-dupe-else-if': 'error',

      // No assignments in conditional expressions
      'no-cond-assign': ['error', 'always'],

      // ============================================================
      // Performance & Best Practices
      // ============================================================

      // Prefer const over let
      'prefer-const': 'error',

      // No var declarations
      'no-var': 'error',

      // Prefer template literals
      'prefer-template': 'warn',

      // Prefer arrow functions for callbacks
      'prefer-arrow-callback': 'warn',

      // No console in production (warn level for development)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // Require === and !== instead of == and !=
      eqeqeq: ['error', 'always'],

      // No unused expressions
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],

      // Curly braces for all control statements
      curly: ['warn', 'all'],
    },
  },
  // ============================================================
  // Relaxed rules for test files
  // ============================================================
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'no-magic-numbers': 'off',
    },
  },
  // ============================================================
  // Relaxed rules for configuration files
  // ============================================================
  {
    files: ['*.config.{ts,js,mjs}', 'codegen.ts'],
    rules: {
      'max-lines': 'off',
      'no-magic-numbers': 'off',
    },
  },
]

export default config

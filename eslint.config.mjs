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
      'prefer-arrow-callback': ['warn', { allowNamedFunctions: true }],

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
  // Relaxed rules for React components
  // React functional components often require more lines due to
  // hooks, state management, event handlers, and JSX rendering
  // Nested ternaries are common in JSX for conditional rendering
  // ============================================================
  {
    files: [
      '**/app/**/*.tsx',
      '**/components/**/*.tsx',
    ],
    rules: {
      'max-lines-per-function': [
        'warn',
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      'max-statements': ['warn', { max: 20 }],
      // Nested ternaries are acceptable in JSX for conditional rendering
      'no-nested-ternary': 'off',
      // Higher complexity limit for components with conditional rendering
      complexity: ['warn', { max: 20 }],
    },
  },
  // ============================================================
  // Further relaxed rules for large page components & complex UI
  // ============================================================
  {
    files: [
      '**/app/**/page.tsx',
      '**/components/**/*Viewer*.tsx',
      '**/components/**/*Dashboard*.tsx',
      '**/components/**/*Detail*.tsx',
      '**/components/**/*Simulator*.tsx',
      '**/components/**/*Calculator*.tsx',
      '**/components/**/*Analyzer*.tsx',
      '**/components/**/*Table*.tsx',
      '**/components/**/*Chart*.tsx',
      '**/components/**/*Panel*.tsx',
      '**/components/**/*Reader*.tsx',
      '**/components/**/*Writer*.tsx',
      '**/components/**/*Status*.tsx',
      '**/components/**/*Card*.tsx',
      '**/components/**/*Leaderboard*.tsx',
      '**/components/**/*Form*.tsx',
      '**/components/**/*Filters*.tsx',
      '**/components/**/*Settings*.tsx',
      '**/components/**/*Info*.tsx',
      '**/components/**/*Health*.tsx',
      '**/components/**/Header.tsx',
      '**/components/**/Footer.tsx',
      '**/components/**/SearchBar.tsx',
    ],
    rules: {
      'max-lines-per-function': [
        'warn',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      'max-statements': ['warn', { max: 40 }],
      // Higher complexity for dashboards and complex UI components
      complexity: ['warn', { max: 30 }],
      // Allow larger files for complex UI components
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  // ============================================================
  // Relaxed rules for complex hooks, services, stores, and utilities
  // ============================================================
  {
    files: [
      '**/lib/hooks/*.ts',
      '**/lib/contexts/*.tsx',
      '**/lib/services/*.ts',
      '**/lib/utils/*.ts',
      '**/stores/*.ts',
    ],
    rules: {
      'max-lines-per-function': [
        'warn',
        {
          max: 175,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      'max-statements': ['warn', { max: 30 }],
      // Hooks and utilities often have legitimate complexity
      complexity: ['warn', { max: 20 }],
      // Allow larger files for hooks with multiple related functions
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // Allow higher nesting for complex data processing
      'max-depth': ['warn', { max: 6 }],
      'max-nested-callbacks': ['warn', { max: 5 }],
      // Consistent return not always needed in callbacks
      'consistent-return': 'off',
      // Allow console.log for development debugging (protected by env checks)
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    },
  },
  // ============================================================
  // Relaxed rules for validators components (complex domain logic)
  // ============================================================
  {
    files: ['**/components/validators/*.tsx'],
    rules: {
      'max-lines-per-function': [
        'warn',
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      'max-statements': ['warn', { max: 30 }],
    },
  },
  // ============================================================
  // Relaxed rules for layout components (Header, Sidebar, etc.)
  // ============================================================
  {
    files: ['**/components/layout/*.tsx'],
    rules: {
      'max-lines-per-function': [
        'warn',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      'max-statements': ['warn', { max: 50 }],
      // Header may have conditional returns in useEffect for event handling
      'consistent-return': 'off',
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
      // Test files commonly have deeply nested callbacks (describe → test → assertions)
      'max-nested-callbacks': 'off',
    },
  },
  // ============================================================
  // Relaxed rules for configuration files
  // ============================================================
  {
    files: ['*.config.{ts,js,mjs}', 'codegen.ts', '**/lib/config/**/*.ts'],
    rules: {
      'max-lines': 'off',
      'no-magic-numbers': 'off',
      // Config files may use console for startup/validation logging
      'no-console': 'off',
    },
  },
  // ============================================================
  // Relaxed rules for generated files
  // ============================================================
  {
    files: ['**/generated.ts', '**/*.generated.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // ============================================================
  // Relaxed rules for very large hook files with multiple hooks
  // ============================================================
  {
    files: [
      '**/lib/hooks/useConsensus.ts',
      '**/lib/hooks/useAddress.ts',
      '**/lib/hooks/useSystemContracts.ts',
    ],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 1500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  // ============================================================
  // Relaxed rules for query and type definition files
  // ============================================================
  {
    files: [
      '**/lib/apollo/queries.ts',
      '**/types/*.ts',
    ],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  // ============================================================
  // Relaxed rules for UI primitives
  // ============================================================
  {
    files: ['**/components/ui/*.tsx'],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // Non-null assertions sometimes needed for pagination logic
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // ============================================================
  // Relaxed rules for service and error handling files
  // ============================================================
  {
    files: ['**/lib/errors/*.ts'],
    rules: {
      'max-statements': ['warn', { max: 25 }],
    },
  },
  // ============================================================
  // Relaxed rules for API route handlers
  // Route handlers follow validate → query → transform → respond → catch pattern
  // ============================================================
  {
    files: ['**/app/api/**/*.ts'],
    rules: {
      'max-statements': ['warn', { max: 30 }],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', { max: 25 }],
    },
  },
  // ============================================================
  // Relaxed rules for complex hooks and lib files
  // ============================================================
  {
    files: [
      '**/lib/hooks/**/*.ts',
      '**/lib/api/relay.ts',
      '**/lib/api/auth.ts',
      '**/lib/api/types.ts',
    ],
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
    rules: {
      'max-statements': ['warn', { max: 35 }],
      complexity: ['warn', { max: 30 }],
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  // ============================================================
  // Relaxed rules for complex components with large JSX
  // ============================================================
  {
    files: [
      '**/components/gas/**/*.tsx',
      '**/components/validators/**/*.tsx',
      '**/components/systemContracts/**/*.tsx',
      '**/components/settings/**/*.ts',
      '**/components/settings/**/*.tsx',
      '**/components/transactions/advanced-filters/**/*.ts',
      '**/components/transactions/advanced-filters/**/*.tsx',
    ],
    rules: {
      'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', { max: 35 }],
      complexity: ['warn', { max: 20 }],
    },
  },
  // ============================================================
  // Relaxed rules for proxy middleware
  // ============================================================
  {
    files: ['proxy.ts'],
    rules: {
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', { max: 25 }],
    },
  },
]

export default config

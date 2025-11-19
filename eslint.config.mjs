import nextConfig from 'eslint-config-next'
import tseslint from '@typescript-eslint/eslint-plugin'

const next = Array.isArray(nextConfig) ? nextConfig : nextConfig.default ?? nextConfig

const config = [
  ...next,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
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
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]

export default config

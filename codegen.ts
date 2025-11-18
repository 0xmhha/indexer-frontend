import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8080/graphql',
  documents: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
  generates: {
    'lib/graphql/types.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        skipTypename: false,
        strictScalars: true,
        scalars: {
          BigInt: 'string',
          Hash: 'string',
          Address: 'string',
        },
      },
    },
  },
}

export default config

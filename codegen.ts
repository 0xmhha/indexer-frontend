import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  // Use local schema file instead of remote endpoint
  schema: '../indexer-go/api/graphql/schema.graphql',
  documents: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
  generates: {
    'lib/graphql/generated.ts': {
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
          Bytes: 'string',
        },
      },
    },
  },
}

export default config

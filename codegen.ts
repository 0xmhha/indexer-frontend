import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  // Use local schema file instead of remote endpoint
  schema: '../indexer-go/pkg/api/graphql/schema.graphql',
  documents: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
  // Skip document validation since backend serializes custom scalars as strings
  ignoreNoDocuments: true,
  generates: {
    'lib/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        skipTypename: false,
        strictScalars: true,
        // Skip document validation for custom scalar type mismatches
        skipDocumentsValidation: true,
        scalars: {
          BigInt: 'string',
          Hash: 'string',
          Address: 'string',
          Bytes: 'string',
          DateTime: 'string',
          JSON: 'string',
        },
      },
    },
  },
}

export default config

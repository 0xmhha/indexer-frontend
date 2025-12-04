import { gql } from '@apollo/client'

/**
 * GraphQL query for contract verification information
 *
 * Note: This query is prepared for backend API integration.
 * Currently using mock data until backend implements the contractVerification query.
 *
 * Backend API Requirements: See docs/backend-api-requirements.md
 */
export const GET_CONTRACT_VERIFICATION = gql`
  query GetContractVerification($address: String!) {
    contractVerification(address: $address) {
      address
      isVerified
      name
      compilerVersion
      optimizationEnabled
      optimizationRuns
      sourceCode
      abi
      constructorArguments
      verifiedAt
      licenseType
    }
  }
`

/**
 * GraphQL mutation for contract verification submission
 *
 * Note: This mutation is prepared for backend API integration.
 * The verification form will be implemented after backend API is ready.
 */
export const VERIFY_CONTRACT = gql`
  mutation VerifyContract(
    $address: String!
    $sourceCode: String!
    $compilerVersion: String!
    $optimizationEnabled: Boolean!
    $optimizationRuns: Int
    $constructorArguments: String
    $contractName: String
    $licenseType: String
  ) {
    verifyContract(
      address: $address
      sourceCode: $sourceCode
      compilerVersion: $compilerVersion
      optimizationEnabled: $optimizationEnabled
      optimizationRuns: $optimizationRuns
      constructorArguments: $constructorArguments
      contractName: $contractName
      licenseType: $licenseType
    ) {
      address
      isVerified
      verifiedAt
    }
  }
`

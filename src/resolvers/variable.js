import { parseResolveInfo } from 'graphql-parse-resolve-info'

export default {
  Query: {
    variables: async (source, args, { dataSources, headers }, info) => {
      const { concept_id: conceptId, first: pageSize } = args

      return dataSources.variableSource({
        concept_id: conceptId,
        page_size: pageSize
      }, headers, parseResolveInfo(info))
    },
    variable: async (source, args, { dataSources, headers }, info) => {
      const { concept_id: conceptId } = args

      const result = await dataSources.variableSource({
        concept_id: conceptId
      }, headers, parseResolveInfo(info))

      const [firstResult] = result

      return firstResult
    }
  }
}

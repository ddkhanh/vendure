import { GraphQLResolveInfo } from 'graphql';

/**
 * @description
 * Which of the GraphQL APIs the current request came via.
 *
 * @docsCategory request
 */
export type ApiType = 'auth';

/**
 * Inspects the GraphQL "info" resolver argument to determine which API
 * the request came through.
 */
export function getApiType(info?: GraphQLResolveInfo): ApiType {    
    return 'auth';
}

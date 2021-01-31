import { dedupExchange, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

import { updateQueryHelper } from '../utils/updateQueryHelper';
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from '../generated/graphql';

export const createUrqlClient = (ssrExhange: any) => ({
	url: 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include'  as const
	},
	exchanges: [
		dedupExchange,
		cacheExchange({
			updates: {
				Mutation: {
					logout: (_result, args, cache, info) => {
						updateQueryHelper<LogoutMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								return { me: null };
							}
						);
					},
					login: (_result, args, cache, info) => {
						// cache.updateQuery({query:MeDocument},(data:MeQuery)=>{})
						updateQueryHelper<LoginMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.login.errors) {
									return query;
								} else {
									return {
										me: result.login!.user!.username
									};
								}
							}
						);
					},
					register: (_result, args, cache, info) => {
						// cache.updateQuery({query:MeDocument},(data:MeQuery)=>{})
						updateQueryHelper<RegisterMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.register.errors) {
									return query;
								} else {
									return {
										me: result.register!.user!.username
									};
								}
							}
						);
					}
				}
			}
		}),
		ssrExhange,
		fetchExchange
	]
});

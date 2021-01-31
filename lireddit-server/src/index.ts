import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

import microConfig from './mikro-orm.config';
import { COOKIE_NAME, __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
	const orm = await MikroORM.init(microConfig);
	//await orm.em.nativeDelete(User, {});
	await orm.getMigrator().up();
	const PORT = 4000;
	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true
		})
	);

	//save session cookie
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true
			}),
			cookie: {
				maxAge: 60 * 60 * 24,
				httpOnly: true,
				sameSite: 'lax', //csrf
				secure: __prod__
			},
			secret: 'my-secret',
			saveUninitialized: false,
			resave: false
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [ HelloResolver, PostResolver, UserResolver ],
			validate: false
		}),
		context: ({ req, res }) => ({ em: orm.em, req, res, redis })
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(process.env.PORT || PORT, () => {
		console.log(`listening on port: ${PORT}`);
	});
};

main().catch((err) => {
	console.log(err);
});

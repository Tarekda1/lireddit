import { validateRegister } from './../utils/validateRegister';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from './../constants';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';

import { MyContext } from 'src/types';
import { User } from '../entities/User';
import { UserNamePasswordInput } from './UserNamePasswordInput';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
@ObjectType()
class Error {
	@Field() field: String;
	@Field() message: String;
}

@ObjectType()
class UserResponse {
	@Field(() => [ Error ], { nullable: true })
	errors?: Error[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { redis, em, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'password length must be greater than 2'
					}
				]
			};
		}
		const tokenKey = FORGOT_PASSWORD_PREFIX + token;
		const userId = await redis.get(tokenKey);

		console.log(userId);

		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'invalid token'
					}
				]
			};
		}

		const user = await em.findOne(User, { id: parseInt(userId) });
		if (!user) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'user no longer exists'
					}
				]
			};
		}

		//hash and update password to new password
		const hashed = await argon2.hash(newPassword);
		user.password = hashed;
		await em.persistAndFlush(user);

		//delete redis key to expire token
		await redis.del(tokenKey);

		//save user id to session again
		req.session.userId = user.id;

		return {
			user
		};
	}

	@Mutation(() => Boolean)
	async forgorPassword(@Arg('email') email: string, @Ctx() { em, redis }: MyContext) {
		const user = await em.findOne(User, { email });
		if (!user) {
			return true;
		}
		//send password reset link by email
		const token = v4();

		await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);

		await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);

		return true;
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		const user = await em.findOne(User, { id: req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Ctx() { em, req }: MyContext,
		@Arg('options') options: UserNamePasswordInput
	): Promise<UserResponse> {
		//validate input
		const errors = validateRegister(options);

		if (errors) {
			return { errors };
		}

		const user = await em.findOne(User, { username: options.username });

		if (user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: 'username or email already exits'
					}
				]
			};
		}

		const hashed = await argon2.hash(options.password);

		// const registeredUser = em.create(User, {
		// 	username: options.username,
		// 	password: hashed
		// });
		let registeredUser;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					password: hashed,
					email: options.email,
					created_at: new Date(),
					updated_at: new Date()
				})
				.returning('*');
			registeredUser = result[0];
			await em.persistAndFlush(registeredUser);
		} catch (error) {
			if (error.code === '23505') {
				return {
					errors: [
						{
							field: 'username',
							message: 'username already exits'
						}
					]
				};
			}
			console.log('message', error.message);
		}

		req.session!.userId = registeredUser.id;

		return {
			user: registeredUser
		};
	}

	@Mutation(() => UserResponse)
	async login(
		@Ctx() { em, req }: MyContext,
		@Arg('usernameOrEmail') usernameOrEMail: string,
		@Arg('password') password: string
	): Promise<UserResponse> {
		if (usernameOrEMail.length < 0) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: 'username length must be greater than 2'
					}
				]
			};
		}

		const user = await em.findOneOrFail(
			User,
			usernameOrEMail.includes('@')
				? { email: usernameOrEMail }
				: {
						username: usernameOrEMail.toLowerCase()
					}
		);

		const verified = await argon2.verify(user.password, password);

		if (!verified) {
			return {
				errors: [
					{
						field: 'password',
						message: 'Invalid password'
					}
				]
			};
		}

		console.log(req.session);

		req.session!.userId = user.id;

		console.log(req.session);

		return { user };
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				if (err) {
					console.log(err);
					resolve(false);
				}
				res.clearCookie(COOKIE_NAME);
				resolve(true);
			})
		);
	}
}

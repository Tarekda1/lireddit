import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';

import { MyContext } from 'src/types';
import { User } from '../entities/User';
//import { User } from "src/entities/User";

@InputType()
class UserNamePasswordInput {
	@Field() username: string;

	@Field() password: string;
}

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
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: 'username',
						message: 'username length must be greater than 2'
					}
				]
			};
		}

		if (options.password.length <= 2) {
			return {
				errors: [
					{
						field: 'password',
						message: 'password length must be greater than 2'
					}
				]
			};
		}

		const user = await em.findOne(User, { username: options.username });

		if (user) {
			return {
				errors: [
					{
						field: 'username',
						message: 'username already exits'
					}
				]
			};
		}

		const hashed = await argon2.hash(options.password);

		const registeredUser = em.create(User, {
			username: options.username,
			password: hashed
		});

		try {
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
	async login(@Ctx() { em, req }: MyContext, @Arg('options') options: UserNamePasswordInput): Promise<UserResponse> {
		if (options.username.length < 0) {
			return {
				errors: [
					{
						field: 'username',
						message: 'username length must be greater than 2'
					}
				]
			};
		}

		const user = await em.findOneOrFail(User, {
			username: options.username.toLowerCase()
		});

		const verified = await argon2.verify(user.password, options.password);

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

		req.session!.userId = user.id;

		return { user };
	}
}

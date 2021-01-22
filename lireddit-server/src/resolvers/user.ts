import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

import { MyContext } from "src/types";
import { User } from "src/entities/User";

@InputType()
class UserNamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class Error {
  @Field()
  field: String;
  @Field()
  message: String;
}

@ObjectType()
class UserResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em }: MyContext,
    @Arg("options") options: UserNamePasswordInput
  ): Promise<UserResponse> {
    if (options.username?.length <= 2) {
      return {
        errors: [
          {
            field: "usename",
            message: "username length must be greater than 2",
          },
        ],
      };
    }

    if (options.password?.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater than 2",
          },
        ],
      };
    }

    const user = await em.findOne(User, { username: options.username });

    if (user) {
      return {
        errors: [
          {
            field: "usename",
            message: "username already exits",
          },
        ],
      };
    }

    //const hashed = await argon2.hash(options.password);

    const registeredUser = em.create(User, {
      username: options.username,
      password: options.password,
    });

    await em.persistAndFlush(registeredUser);

    return {
      user: registeredUser,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em }: MyContext,
    @Arg("options") options: UserNamePasswordInput
  ): Promise<UserResponse> {
    if (options.username?.length < 0) {
      return {
        errors: [
          {
            field: "usename",
            message: "username length must be greater than 2",
          },
        ],
      };
    }

    const user = await em.findOneOrFail(User, {
      username: options.username.toLowerCase(),
    });

    const verified = argon2.verify(user?.password, options.password);

    if (!verified) {
      return {
        errors: [
          {
            field: "password",
            message: "Invalid password",
          },
        ],
      };
    }

    return { user };
  }
}

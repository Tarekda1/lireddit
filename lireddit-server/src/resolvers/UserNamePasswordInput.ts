import { Field, InputType } from 'type-graphql';

//import { User } from "src/entities/User";
@InputType()
export class UserNamePasswordInput {
	@Field() username: string;

	@Field() password: string;

	@Field() email: string;
}

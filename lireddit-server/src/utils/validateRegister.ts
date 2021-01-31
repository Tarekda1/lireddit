import { UserNamePasswordInput } from '../resolvers/UserNamePasswordInput';
export const validateRegister = (options: UserNamePasswordInput) => {
	if (!options.email.includes('@')) {
		return [
			{
				field: 'email',
				message: 'invalid email'
			}
		];
	}

	if (options.username.length <= 2) {
		return [
			{
				field: 'username',
				message: 'username length must be greater than 2'
			}
		];
	}

	if (options.username.includes('@')) {
		return [
			{
				field: 'username',
				message: 'invalid username must not contain @ symbol'
			}
		];
	}

	if (options.password.length <= 2) {
		return [
			{
				field: 'password',
				message: 'password length must be greater than 2'
			}
		];
	}

	return null;
};

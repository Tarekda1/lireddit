import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const [ { fetching: logoutFetching }, logout ] = useLogoutMutation();
	const [ { data, fetching } ] = useMeQuery({
    pause:isServer()
  });
	let body = null;
	const logoutHandler = (e) => {
    e.preventDefault();
		logout();
	};

	//data is loading
	if (fetching) {
		//user is not logged in
	} else if (!data?.me?.username) {
		body = (
			<Fragment>
				<NextLink href="/login">
					<Link>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link ml={4}>Register</Link>
				</NextLink>
			</Fragment>
		);
		//user is logged in
	} else {
		body = (
			<Fragment>
				<NextLink href="/login">
					<Link>{data!.me!.username}</Link>
				</NextLink>
				<NextLink href="/register">
					<Button variant="link" isLoading={logoutFetching} onClick={logoutHandler} ml={4}>
						Logout
					</Button>
				</NextLink>
			</Fragment>
		);
	}
	return (
		<Flex p={4} bg={'tomato'}>
			<Flex ml={'auto'}>{body}</Flex>
		</Flex>
	);
};

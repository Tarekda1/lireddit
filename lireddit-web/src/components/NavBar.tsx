import { Box, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [ { data, fetching } ] = useMeQuery();
  let body = null
  if(fetching){

  }
  else if(!data?.me){

  }
  else{
    
  }
	return (
		<Flex p={4} bg={'tomato'}>
			<Flex ml={'auto'}>
				<NextLink href="/login">
					<Link>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link ml={4}>Register</Link>
				</NextLink>
			</Flex>
		</Flex>
	);
};

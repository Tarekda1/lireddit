import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter}  from "next/router"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link"

interface LoginProps {}


const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
	const [, login ] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik	initialValues={{ usernameOrEmail: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
          const response = await login(values);
          if(response.data?.login.errors){
            const errorMap = toErrorMap(response.data?.login.errors);
            console.log(errorMap)
            setErrors(errorMap);
           }else if(response.data?.login.user){
             // worked
              router.push("/")
           }
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="usernameOrEmail" label="Username Or Email" placeholder="usernameOrEmail" />
						<Box mt={4}>
							<InputField name="password" label="Password" placeholder="password" type="password" />
						</Box>
            <Flex  justifyContent="flex-end" mt={2}>
            <NextLink href="/forgot-password">
              <Link>
               forgot password?
              </Link>
              </NextLink>
            </Flex>
						<Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
							Login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);

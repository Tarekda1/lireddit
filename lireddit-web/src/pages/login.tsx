import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter}  from "next/router"

interface LoginProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password: String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`;

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
	const [, login ] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik	initialValues={{ username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
          const response = await login({options:values});
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
						<InputField name="username" label="Username" placeholder="username" />
						<Box mt={4}>
							<InputField name="password" label="Password" placeholder="password" type="password" />
						</Box>
						<Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
							Login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Login;

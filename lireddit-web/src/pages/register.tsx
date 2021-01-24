import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter}  from "next/router"

interface registerProps {}

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

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
	const [x , register ] = useRegisterMutation();
	return (
		<Wrapper  variant="small">
			<Formik	initialValues={{ username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
          const response = await register(values);
          if(response.data?.register.errors){
            const errorMap = toErrorMap(response.data?.register.errors);
            console.log(errorMap)
            setErrors(errorMap);
           }else if(response.data?.register.user){
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
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Register;

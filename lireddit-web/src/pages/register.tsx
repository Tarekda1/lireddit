import React from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter}  from "next/router"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps {}


const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
	const [ , register ] = useRegisterMutation();
	return (
		<Wrapper  variant="small">
			<Formik	initialValues={{ email:"", username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
          const response = await register({options:values});
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
							<InputField name="email" label="email" placeholder="email" />
						</Box>
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

export default withUrqlClient(createUrqlClient, { ssr: false })(Register);

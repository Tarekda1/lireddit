import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const forgotPassword: React.FC<{}> = ({}) => {
	const router = useRouter();
	const [ complete, setcomplete ] = useState(false);
	const [ , forgotPassword ] = useForgotPasswordMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					console.log(values);
					await forgotPassword(values);
					setcomplete(true);
					router.push('/');
					// if(response.data?.forgorPassword){
					//   const errorMap = toErrorMap(response.data?.forgorPassword);
					//   console.log(errorMap)
					//   setErrors(errorMap);
					//  }else if(response.data?.login.user){
					//    // worked
					//     router.push("/")
					//  }
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box>if account an account exits, we send you an email</Box>
					) : (
						<Form>
							<Box mt={4}>
								<InputField name="email" label="Email" placeholder="email" />
							</Box>
							<Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
								Send Link
							</Button>
						</Form>
					)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(forgotPassword);

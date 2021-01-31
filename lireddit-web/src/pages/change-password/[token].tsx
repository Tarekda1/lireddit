import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from "next/link"

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [ , ChangePassword ] = useChangePasswordMutation();
  const [tokenError,setTokenError]= useState('');
  const router = useRouter();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
					const response = await ChangePassword({
						newPassword: values.newPassword,
						token
					});
					if(response.data?.changePassword.errors){
            const errorMap = toErrorMap(response.data?.changePassword.errors);
            console.log(errorMap)
            if('token' in errorMap){
                setTokenError(errorMap.token)
            }
            else{
              setErrors(errorMap);
            }
					
					 }else if(response.data?.changePassword.user){
					   // worked
					    router.push("/")
					  }
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="newPassword"
							label="New Password"
							placeholder="new password"
							type="password"
						/>
            {tokenError? <Box>
              <Box color='red'>{tokenError}</Box> 
              <NextLink href="/forgot-password">
              <Link>
                  forgot again
              </Link>
              </NextLink>
         
            </Box> : null}  
						<Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
							Reset Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string
	};
};

export default  withUrqlClient(createUrqlClient,{ssr:false})(ChangePassword);

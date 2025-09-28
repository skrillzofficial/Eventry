import * as yup from 'yup';

const schema = yup.object({
  firstName: yup.string().trim().required('First name is required'),
  email: yup.string().trim().email('Invalid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must accept the terms'),
});

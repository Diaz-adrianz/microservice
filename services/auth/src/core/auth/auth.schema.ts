import { JwtPayload } from 'jsonwebtoken';
import * as y from 'yup';

export type AccessPayload = JwtPayload & {
  sub: string;
  sid: string;
  rls: string[];
};

export type RefreshPayload = {
  sub: string;
  sid: string;
  rls: string[];
};

export type SessionCache = {
  sub: string;
  sid: string;
  rtHash: string;
  createdAt: number;
};

// sign up
export const SignUpSchema = y.object({
  name: y
    .string()
    .min(3, 'Minimum 3 characters')
    .max(16, 'Maximum 16 characters')
    .required(),
  email: y.string().email().required(),
  password: y
    .string()
    .required()
    .min(8, 'Minimum 8 characters')
    .max(12, 'Maximum 12 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one symbol'),
});

export type SignUp = y.InferType<typeof SignUpSchema>;

// sign in
export const SignInSchema = y.object({
  email: y.string().email().required(),
  password: y
    .string()
    .required()
    .min(8, 'Minimum 8 characters')
    .max(12, 'Maximum 12 characters'),
});

export type SignIn = y.InferType<typeof SignInSchema>;

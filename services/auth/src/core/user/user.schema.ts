import * as y from 'yup';

// create one
export const createUserSchema = y.object({
  name: y.string().required(),
  email: y.string().required(),
  password: y
    .string()
    .required()
    .min(8, 'Minimum 8 characters')
    .max(12, 'Maximum 12 characters'),
  roleName: y.string().required(),
});

export type CreateUser = y.InferType<typeof createUserSchema>;

// update one
export const updateUserSchema = y.object({
  // ...
});

export type UpdateUser = y.InferType<typeof updateUserSchema>;

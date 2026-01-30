import * as y from 'yup';

// create one
export const createRoleSchema = y.object({
  name: y.string().required(),
  isActive: y.bool().optional(),
});

export type CreateRole = y.InferType<typeof createRoleSchema>;

// update one
export const updateRoleSchema = y.object({
  isActive: y.bool().optional(),
});

export type UpdateRole = y.InferType<typeof updateRoleSchema>;

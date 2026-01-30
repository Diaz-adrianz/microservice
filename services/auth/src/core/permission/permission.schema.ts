import * as y from 'yup';

// upsert many
export const upsertPermissionsSchema = y.object({
  permissions: y
    .array()
    .of(
      y.object({
        service: y.string().required(),
        resource: y.string().required(),
        action: y.string().required(),
        isActive: y.bool().required(),
      })
    )
    .required(),
});

export type UpsertPermissions = y.InferType<typeof upsertPermissionsSchema>;

// update one
export const updatePermissionSchema = y.object({
  description: y.string().optional(),
  isActive: y.bool().optional(),
});

export type UpdatePermission = y.InferType<typeof updatePermissionSchema>;

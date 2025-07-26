/* eslint-disable no-useless-escape */
import { z } from 'zod';
import {
  ProjectDataBaseTypeEnum,
  ProjectTemplateEnum
} from '../../core/entities/project.entity';
import { ProjectMemberRoleEnum } from '../../core/entities/project-member.entity';

export const CreateProjectSchema = z
  .object({
    name: z
      .string({ required_error: 'Project name is required' })
      .min(1, { message: 'Project name is required' })
      .max(50, { message: 'Project name should not exceed 50 characters' }),
    description: z.string().optional(),
    databaseType: z.nativeEnum(ProjectDataBaseTypeEnum, {
      message: 'Database type is required'
    }),
    tag: z
      .array(z.string())
      .max(5, { message: 'Maximum 5 tags allowed' })
      .optional()
      .default([]),
    connectionString: z.string().optional(),
    templateType: z
      .nativeEnum(ProjectTemplateEnum, {
        message: 'Invalid template type'
      })
      .optional()
      .default(ProjectTemplateEnum.NONE)
  })
  .refine(
    (data) => {
      // Skip validation if connectionString is not provided
      if (!data.connectionString) return true;

      // Only validate MongoDB connection strings when databaseType is MongoDB
      if (data.databaseType === ProjectDataBaseTypeEnum.MONGODB) {
        try {
          // Basic pattern check
          const regex =
            /^mongodb(\+srv)?:\/\/([^:]+)(:[^@]+)?@([^\/]+)\/([^?]+)(\?.*)?$/;
          if (!regex.test(data.connectionString)) return false;

          const url = new URL(data.connectionString);

          // Protocol check
          if (url.protocol !== 'mongodb:' && url.protocol !== 'mongodb+srv:')
            return false;

          // Username check
          if (!url.username) return false;

          // Database name check
          if (url.pathname.length <= 1) return false;

          return true;
        } catch {
          return false;
        }
      }

      return true;
    },
    {
      message: 'Invalid MongoDB connection string',
      path: ['connectionString'] // This specifies which field the error belongs to
    }
  );

export const AcceptProjectInviteSchema = z.object({
  token: z
    .string({ required_error: 'Token is required' })
    .min(1, { message: 'Token is required' })
});

export const ProjectInviteSchema = z.object({
  emails: z
    .array(z.string().email({ message: '' }))
    .min(1, { message: 'At least one email is required' }),
  projectId: z
    .string({ required_error: 'Project ID is required' })
    .min(1, { message: 'Project ID is required' })
});

export const ChangeProjectMemberRoleSchema = z.object({
  id: z
    .string({ required_error: 'Member ID is required' })
    .min(1, { message: 'Member ID is required' }),
  role: z.nativeEnum(ProjectMemberRoleEnum, {
    required_error: 'Role is required'
  })
});

export const GetSelectNodeParamsSchema = z.object({
  projectId: z
    .string({ required_error: 'Project Id is required' })
    .min(1, { message: 'Project Id is required' }),
  nodeId: z
    .string({ required_error: 'Node Id is required' })
    .min(1, { message: 'Node Id is required' })
});

export const GenerateCodeParamsSchema = z.object({
  projectId: z
    .string({ required_error: 'Project id is required' })
    .min(1, { message: 'Project id is required' }),
  nodeId: z
    .string({ required_error: 'Node id is required' })
    .min(1, { message: 'Node id is required' }),
  ormType: z
    .string({ required_error: 'ORM type is required' })
    .min(1, { message: 'ORM Type is required' })
});

/* eslint-disable no-useless-escape */
import { z } from 'zod';
import { ProjectDataBaseTypeEnum } from '../../core/entities/project.entity';

export const CreateProjectSchema = z
  .object({
    name: z
      .string({ required_error: 'Project name is required' })
      .min(1, { message: 'Project name is required' })
      .max(50, { message: 'Project name should not exceed 50 characters' }),
    description: z.string().optional(),
    teamIds: z.array(z.string()).optional().default([]),
    databaseType: z.nativeEnum(ProjectDataBaseTypeEnum, {
      message: 'Database type is required'
    }),
    tag: z
      .array(z.string())
      .max(5, { message: 'Maximum 5 tags allowed' })
      .optional()
      .default([]),
    connectionString: z.string().optional()
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

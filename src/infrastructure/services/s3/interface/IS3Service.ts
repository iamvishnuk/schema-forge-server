import { PutObjectOutput } from '@aws-sdk/client-s3';

export interface PutObjectResponse {
  result: PutObjectOutput;
  filePath: string;
  contentType: string;
}

export interface IS3Service {
  createEmptyProjectDesign(projectId: string): Promise<PutObjectResponse>;
  getProjectDesign(filePath: string): Promise<Record<string, unknown>>;
  updateProjectDesign(
    diagram: Record<string, unknown>,
    filePath: string
  ): Promise<PutObjectResponse>;
}

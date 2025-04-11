import { PutObjectOutput } from '@aws-sdk/client-s3';

export interface PutObjectResponse {
  result: PutObjectOutput;
  filePath: string;
  contentType: string;
}

export interface IS3Service {
  createEmptyProjectDesign(projectId: string): Promise<PutObjectResponse>;
}

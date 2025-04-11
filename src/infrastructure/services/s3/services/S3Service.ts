import { config } from '../../../../config/env';
import { InternalServerError } from '../../../../utils/error';
import { s3Client } from '../config/s3Client';
import { IS3Service, PutObjectResponse } from '../interface/IS3Service';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Service implements IS3Service {
  async createEmptyProjectDesign(
    projectId: string
  ): Promise<PutObjectResponse> {
    const emptyDesign = JSON.stringify({ Nodes: [], Edges: [] }, null, 2);

    const fileName = `design/${projectId}/${projectId}-design.json`;

    const command = new PutObjectCommand({
      Bucket: config.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: emptyDesign,
      ContentType: 'application/json'
    });

    try {
      const result = await s3Client.send(command);

      return {
        result,
        filePath: fileName,
        contentType: 'application/json'
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerError('Failed to create empty project design');
    }
  }
}

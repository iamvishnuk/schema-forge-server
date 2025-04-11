import mongoose from 'mongoose';

export interface DesignEntity {
  _id: string | unknown;
  projectId: mongoose.Types.ObjectId;
  filePath: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}

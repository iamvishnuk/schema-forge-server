import mongoose, { Document, Schema } from 'mongoose';
import { UserEntity, UserPreferences } from '../../core/entities/user.entity';
import { compareHashValue, hashValue } from '../../utils/bcrypt';

const userPreferencesSchema = new Schema<UserPreferences>({
  enable2FA: { type: Boolean, default: false },
  emailNotification: { type: Boolean, default: true },
  twoFactorSecret: { type: String, required: false }
});

export interface UserDocument
  extends Omit<UserEntity, '_id' | 'save'>,
    Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    userPreferences: {
      type: userPreferencesSchema,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.userPreferences.twoFactorSecret;
        return ret;
      }
    }
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashValue(this.password);
  }
  next();
});

UserSchema.methods.comparePassword = async function (value: string) {
  return compareHashValue(value, this.password);
};

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

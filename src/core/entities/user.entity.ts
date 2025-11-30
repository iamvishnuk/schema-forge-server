export interface UserPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}

export interface UserEntity {
  _id: string | unknown;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  userPreferences: UserPreferences;
  updatedAt?: Date;
  createdAt?: Date;
  comparePassword(value: string): Promise<boolean>;
  save(): Promise<UserEntity>;
}

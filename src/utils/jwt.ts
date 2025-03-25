/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { UserDocument } from '../infrastructure/models/user.model';
import { SessionDocument } from '../infrastructure/models/session.model';
import { config } from '../config/env';

export type AccessTokenPayload = {
  userId: UserDocument['_id'];
  sessionId: SessionDocument['_id'];
};

export type RefreshTokenPayload = {
  sessionId: SessionDocument['_id'];
};

type SignOptsAndSecret = SignOptions & { secret: string };

const defaultSignOptions: SignOptions = {
  audience: ['user']
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT_EXPIRES_IN as any,
  secret: config.JWT_SECRET
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
  secret: config.JWT_REFRESH_SECRET
};

export const signJwtToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  option?: SignOptsAndSecret
) => {
  const { secret, ...options } = option || accessTokenSignOptions;
  return jwt.sign(payload, secret, { ...defaultSignOptions, ...options });
};

export const verifyJwtToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = config.JWT_SECRET, ...opts } = options || {};

    const payload = jwt.verify(token, secret, {
      ...defaultSignOptions,
      ...opts
    }) as TPayload;

    return { payload };
  } catch (err: any) {
    return {
      error: err.message
    };
  }
};

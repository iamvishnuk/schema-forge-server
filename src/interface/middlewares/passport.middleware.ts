import passport from 'passport';
import {
  ExtractJwt,
  StrategyOptionsWithRequest,
  Strategy as JwtStrategy
} from 'passport-jwt';
import { UnauthorizedError } from '../../utils/error';
import { config } from '../../config/env';
import { UserModel } from '../../infrastructure/models/user.model';

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new UnauthorizedError('Missing access token');
      }
      return accessToken;
    }
  ]),
  secretOrKey: config.JWT_SECRET,
  audience: ['user'],
  algorithms: ['HS256'],
  passReqToCallback: true
};

// Setup JWT Strategy
passport.use(
  new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
    try {
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return done(null, false);
      }
      req.sessionId = payload.sessionId;
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware for authentication
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Initialize passport
export default passport;

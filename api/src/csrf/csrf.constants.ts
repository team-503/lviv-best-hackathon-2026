import { doubleCsrf } from 'csrf-csrf';
import { getSessionIdentifier } from '../common/helpers/session-identifier';

export const csrfUtilities = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getSessionIdentifier,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  },
});

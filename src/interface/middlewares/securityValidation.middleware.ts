import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/appError';

const MALICIOUS_PATTERNS = [
  /(<script|<\/script|javascript:|on\w+\s*=)/i, // XSS patterns
  /(union\s+select|drop\s+table|insert\s+into|delete\s+from|alter\s+table)/i, // SQL injection
  /(exec|execute|sp_|xp_)/i, // Stored procedure calls
  /(\bor\b|\band\b).*[=<>].*['"]/i, // SQL boolean injection
  /(--|\/\*|\*\/|;|'|")/i // Common injection characters
];

function containsMaliciousContent(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return MALICIOUS_PATTERNS.some((pattern) => pattern.test(value));
}

function validateObject(obj: Record<string, unknown>): string[] {
  const violations: string[] = [];

  function traverse(current: unknown, path = ''): void {
    if (typeof current === 'string' && containsMaliciousContent(current)) {
      violations.push(
        `Potentially malicious content detected in: ${path || 'request'}`
      );
    } else if (typeof current === 'object' && current !== null) {
      Object.entries(current).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        traverse(value, newPath);
      });
    }
  }

  traverse(obj);
  return violations;
}

export const securityValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const violations: string[] = [];

  // Check request body
  if (req.body) {
    violations.push(...validateObject(req.body));
  }

  // Check query parameters
  if (req.query) {
    violations.push(...validateObject(req.query));
  }

  // Check URL parameters
  if (req.params) {
    violations.push(...validateObject(req.params));
  }

  if (violations.length > 0) {
    return next(
      new AppError('Security validation failed: ' + violations.join(', '), 400)
    );
  } else {
    next();
  }
};

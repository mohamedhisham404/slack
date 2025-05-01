import { Request } from 'express';

export function isMobile(req: Request): boolean {
  return (
    (req.headers['x-platform'] === 'mobile' ||
      req.headers['user-agent']?.includes('ReactNative')) ??
    false
  );
}

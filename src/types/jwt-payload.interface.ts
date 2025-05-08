export interface JwtPayload {
  userId: number;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

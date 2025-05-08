import { Response } from 'express';

export const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessMaxAge: number,
  refreshMaxAge: number,
) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: accessMaxAge,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: refreshMaxAge,
  });
};

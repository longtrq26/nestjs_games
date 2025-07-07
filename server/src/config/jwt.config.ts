export const jwtConfig = () => ({
  accessTokenSecret:
    process.env.JWT_ACCESS_TOKEN_SECRET || 'supersecretaccesskey',
  accessTokenExpirationTime:
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '1h',
  refreshTokenExpirationTime:
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '7d',
});

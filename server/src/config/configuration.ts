export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3001,
  jwt: {
    accessTokenSecret:
      process.env.JWT_ACCESS_TOKEN_SECRET || 'supersecretaccesskey',
    accessTokenExpirationTime:
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '1h',
    refreshTokenSecret:
      process.env.JWT_REFRESH_TOKEN_SECRET || 'supersecretrefreshkey',
    refreshTokenExpirationTime:
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '7d',
  },
});

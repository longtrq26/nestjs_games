import { jwtConfig } from './jwt.config';

export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3001,
  jwt: jwtConfig(),
});

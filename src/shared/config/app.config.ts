import { registerAs } from '@nestjs/config'

export default registerAs('app', () => {
  const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    authBearerToken: process.env.AUTH_BEARER_TOKEN || '',
  }

  return config
})

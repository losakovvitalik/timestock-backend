export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        secure: false,
      },
      settings: {
        defaultFrom: env('SMTP_USERNAME'),
        defaultReplyTo: env('SMTP_USERNAME'),
      },
    },
  },
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        // Сколько живет access токен: 1 час
        accessTokenLifespan: env.int('JWT_ACCESS_TOKEN_LIFESPAN', 3600),

        // Сколько живет refresh токен: 90 дней
        maxRefreshTokenLifespan: env.int('JWT_MAX_REFRESH_TOKEN_LIFESPAN', 7776000),

        // Время бездействия, после которого refresh token становится невалидным: 7 дней
        idleRefreshTokenLifespan: env.int('JWT_IDLE_REFRESH_TOKEN_LIFESPAN', 604800),

        httpOnly: env.bool('JWT_HTTP_ONLY', true),

        cookie: {
          name: 'strapi_up_refresh',
          sameSite: env('JWT_SAME_SITE', 'lax'),
          path: '/',
          secure: env.bool('JWT_SECURE', false), // true in production
          domain: env('JWT_COOKIE_DOMAIN', undefined),
        },
      },
    },
  },
});

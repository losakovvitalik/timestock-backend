export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        secure: false,
      },
      settings: {
        defaultFrom: env("SMTP_USERNAME"),
        defaultReplyTo: env("SMTP_USERNAME"),
      },
    },
  },
});

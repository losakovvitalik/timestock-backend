export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/send-otp',
      handler: 'auth.sendOTP',
    },
    {
      method: 'POST',
      path: '/auth/confirm-otp',
      handler: 'auth.confirmOTP',
    },
  ],
};

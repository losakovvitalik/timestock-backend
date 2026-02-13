export default {
  routes: [
    {
      method: 'GET',
      path: '/push-subscriptions/my',
      handler: 'push-subscription.findMy',
    },
  ],
};

export default {
  routes: [
    {
      method: 'POST',
      path: '/time-entries/:id/stop',
      handler: 'time-entry.stop',
    },
  ],
};

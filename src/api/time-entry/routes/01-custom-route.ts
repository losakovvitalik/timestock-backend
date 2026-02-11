export default {
  routes: [
    {
      method: 'POST',
      path: '/time-entries/:id/stop',
      handler: 'time-entry.stop',
    },
    {
      method: 'GET',
      path: '/time-entries/daily-totals',
      handler: 'time-entry.dailyTotals',
    },
  ],
};

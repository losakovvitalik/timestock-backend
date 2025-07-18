export default {
  routes: [
    {
      method: 'GET',
      path: '/daily-aggregates/by-project',
      handler: 'daily-aggregate.getByProject',
    },
  ],
};

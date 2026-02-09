export default {
  routes: [
    {
      method: 'PATCH',
      path: '/tasks/:id/archive',
      handler: 'task.archive',
    },
  ],
};

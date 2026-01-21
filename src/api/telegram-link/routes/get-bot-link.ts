export default {
  routes: [
    {
      method: 'GET',
      path: '/telegram-links/generate-link',
      handler: 'telegram-link.generateLink',
    },
    {
      method: 'GET',
      path: '/telegram-links/status',
      handler: 'telegram-link.getStatus',
    },
    {
      method: 'DELETE',
      path: '/telegram-links/unlink',
      handler: 'telegram-link.unlink',
    },
    {
      method: 'PATCH',
      path: '/telegram-links/notifications',
      handler: 'telegram-link.toggleNotifications',
    },
  ],
};

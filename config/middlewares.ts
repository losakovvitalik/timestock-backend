export default [
  // debug middleware выводит в консоль все поступающие запросы и краткую информацию о них
  // 'global::debug',
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

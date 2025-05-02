/**
 * time-entry service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::time-entry.time-entry",
  ({ strapi }) => ({
    async exampleService(...args) {
      let response = { okay: true };

      if (response.okay === false) {
        return { response, error: true };
      }

      return response;
    },
  })
);

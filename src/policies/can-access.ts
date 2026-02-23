/**
 * Policy: фильтрует результаты по связи с текущим пользователем.
 * Добавляет фильтр к запросу, чтобы пользователь видел только свои записи.
 *
 * config.relation - имя связи для фильтрации (по умолчанию 'members')
 */
interface CanAccessConfig {
  relation: string;
}

export default (policyContext, config: CanAccessConfig) => {
  const userId = policyContext.state?.user?.id;

  if (!userId) {
    return false;
  }

  policyContext.request.query = {
    ...policyContext.request.query,
    filters: {
      ...policyContext.request.query?.filters,
      [config.relation || 'members']: { id: userId },
    },
  };

  return true;
};

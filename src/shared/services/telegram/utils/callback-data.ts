export const CallbackAction = {
  STOP_TIMER: 'stop_timer',
  START_TIMER: 'start_timer',
  START_TIMER_WITH_PROJECT: 'start_timer_project',
  SET_DESCRIPTION: 'set_description',
  SET_PROJECT: 'set_project',
  SELECT_PROJECT: 'select_project',
  CANCEL_PROJECT: 'cancel_project',
  SNOOZE_REMINDER: 'snooze_reminder',
} as const;

export type CallbackActionType = (typeof CallbackAction)[keyof typeof CallbackAction];

type CallbackParams = {
  [CallbackAction.STOP_TIMER]: [documentId: string];
  [CallbackAction.START_TIMER]: [];
  [CallbackAction.START_TIMER_WITH_PROJECT]: [projectDocumentId: string];
  [CallbackAction.SET_DESCRIPTION]: [documentId: string];
  [CallbackAction.SET_PROJECT]: [documentId: string];
  [CallbackAction.SELECT_PROJECT]: [entryDocumentId: string, projectDocumentId: string];
  [CallbackAction.CANCEL_PROJECT]: [documentId: string];
  [CallbackAction.SNOOZE_REMINDER]: [reminderDocumentId: string, minutes: string];
};

export function parseCallback<K extends CallbackActionType>(
  data: string,
  action: K
): CallbackParams[K] | null {
  if (data === action) {
    return [] as CallbackParams[K];
  }

  const prefix = `${action}:`;
  if (!data.startsWith(prefix)) {
    return null;
  }

  return data.slice(prefix.length).split(':') as CallbackParams[K];
}

export function createCallback<K extends CallbackActionType>(
  action: K,
  ...params: CallbackParams[K]
): string {
  if (params.length === 0) {
    return action;
  }
  return `${action}:${params.join(':')}`;
}

export function callbackRegex(action: CallbackActionType): RegExp {
  return new RegExp(`^${action}:`);
}

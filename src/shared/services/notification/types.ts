export const NotificationType = {
  GENERIC: 'generic',
  PROJECT_REMINDER: 'project_reminder',
  LONG_TIMER: 'long_timer',
} as const;

type BaseMessage = {
  title: string;
  text?: string;
};

type GenericNotification = BaseMessage & {
  type?: typeof NotificationType.GENERIC;
};

type ProjectReminderNotification = BaseMessage & {
  type: typeof NotificationType.PROJECT_REMINDER;
  context: {
    projectDocumentId: string;
    reminderDocumentId: string;
  };
};

type LongTimerNotification = BaseMessage & {
  type: typeof NotificationType.LONG_TIMER;
};

export type NotificationMessage =
  | GenericNotification
  | ProjectReminderNotification
  | LongTimerNotification;

import { Data } from '@strapi/strapi';

export type TimeEntry = Data.ContentType<'api::time-entry.time-entry'>;

export const TimerError = {
  NOT_FOUND: 'not_found',
  FORBIDDEN: 'forbidden',
  ALREADY_STOPPED: 'already_stopped',
  ALREADY_RUNNING: 'already_running',
} as const;

export type TimerErrorType = (typeof TimerError)[keyof typeof TimerError];

export type StopTimerResult =
  | {
      success: true;
      entry: TimeEntry;
      duration: number;
      startTime: Date;
      endTime: Date;
    }
  | {
      success: false;
      reason: typeof TimerError.NOT_FOUND | typeof TimerError.ALREADY_STOPPED | typeof TimerError.FORBIDDEN;
    };

export type StartTimerResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: typeof TimerError.ALREADY_RUNNING;
      activeEntry: TimeEntry;
    };

export type GetActiveTimerResult = TimeEntry | null;

export type SetProjectResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: typeof TimerError.NOT_FOUND | typeof TimerError.ALREADY_STOPPED;
    };

export type SetDescriptionResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: typeof TimerError.NOT_FOUND | typeof TimerError.ALREADY_STOPPED;
    };

export type UpdateEntryResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: typeof TimerError.NOT_FOUND | typeof TimerError.ALREADY_STOPPED;
    };

export type UpdateEntryData = Partial<{
  project: string | null;
  description: string;
}>;

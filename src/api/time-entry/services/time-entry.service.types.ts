import { Data } from '@strapi/strapi';

export type TimeEntry = Data.ContentType<'api::time-entry.time-entry'>;

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
      reason: 'not_found' | 'already_stopped';
    };

export type StartTimerResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: 'already_running';
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
      reason: 'not_found' | 'already_stopped';
    };

export type SetDescriptionResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: 'not_found' | 'already_stopped';
    };

export type UpdateEntryResult =
  | {
      success: true;
      entry: TimeEntry;
    }
  | {
      success: false;
      reason: 'not_found' | 'already_stopped';
    };

export type UpdateEntryData = Partial<{
  project: string | null;
  description: string;
}>;

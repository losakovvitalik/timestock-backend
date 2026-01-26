import type { Context, SessionFlavor } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';

// Требуется для @grammyjs/conversations, данные добавляются по мере необходимости
export interface SessionData {}

type BaseContext = Context & SessionFlavor<SessionData>;
export type BotContext = BaseContext & ConversationFlavor<BaseContext>;

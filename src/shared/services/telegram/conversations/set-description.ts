import type { Conversation } from '@grammyjs/conversations';
import type { BotContext } from '../types';
import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { formatTimerMessage } from '../utils/format-timer';
import { timerKeyboard } from '../keyboards/timer';

export async function setDescriptionConversation(
  conversation: Conversation<BotContext>,
  ctx: BotContext,
  documentId: string
) {
  // Проверяем что таймер существует и активен
  const activeEntry = await conversation.external(() =>
    TimeEntryService.findOne(documentId)
  );

  if (!activeEntry || activeEntry.end_time) {
    await ctx.reply('Таймер уже остановлен.');
    return;
  }

  await ctx.reply('Введите описание для таймера:');

  const response = await conversation.waitFor('message:text');
  const description = response.message.text;

  const result = await conversation.external(() =>
    TimeEntryService.setDescription(documentId, description)
  );

  if (result.success === false) {
    const message =
      result.reason === 'not_found' ? 'Таймер не найден.' : 'Таймер уже остановлен.';
    await ctx.reply(message);
    return;
  }

  const { entry } = result;
  const keyboard = timerKeyboard(documentId, {
    hasDescription: true,
    hasProject: !!entry.project,
  });

  await ctx.reply(`✅ Описание добавлено\n\n${formatTimerMessage(entry)}`, {
    reply_markup: keyboard,
  });
}

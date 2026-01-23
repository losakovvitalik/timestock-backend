import { InlineKeyboard } from 'grammy';
import { CallbackAction, createCallback } from '../utils/callback-data';

interface TimerKeyboardOptions {
  hasDescription?: boolean;
  hasProject?: boolean;
}

export function timerKeyboard(documentId: string, options: TimerKeyboardOptions = {}) {
  const { hasDescription = false, hasProject = false } = options;

  const descriptionText = hasDescription ? '📝 Изменить описание' : '📝 Добавить описание';
  const projectText = hasProject ? '📁 Изменить проект' : '📁 Указать проект';

  return new InlineKeyboard()
    .text(descriptionText, createCallback(CallbackAction.SET_DESCRIPTION, documentId))
    .text(projectText, createCallback(CallbackAction.SET_PROJECT, documentId))
    .row()
    .text('⏹ Остановить', createCallback(CallbackAction.STOP_TIMER, documentId));
}

export function startTimerKeyboard() {
  return new InlineKeyboard().text('▶️ Запустить таймер', CallbackAction.START_TIMER);
}

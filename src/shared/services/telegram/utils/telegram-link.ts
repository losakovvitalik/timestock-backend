export interface TelegramUser {
  id: number;
  documentId: string;
  email: string;
}

export async function getTelegramLinkByChatId(chatId: string) {
  return strapi.documents('api::telegram-link.telegram-link').findFirst({
    filters: { chat_id: String(chatId) },
  });
}

export async function getUserByChatId(chatId: string): Promise<TelegramUser | null> {
  const link = await strapi.documents('api::telegram-link.telegram-link').findFirst({
    filters: { chat_id: String(chatId) },
    populate: ['user'],
  });

  return (link?.user as TelegramUser) ?? null;
}

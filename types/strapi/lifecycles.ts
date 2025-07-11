export interface AfterCreateEvent<Entity extends Record<string, any> = Record<string, any>> {
  result: {
    id: number;
    documentId: string;
  } & Entity;
}

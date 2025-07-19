export interface AfterCreateEvent<Entity extends Record<string, any> = Record<string, any>> {
  result: {
    id: number;
    documentId: string;
  } & Entity;
}

export interface AfterUpdateEvent<
  Entity extends Record<string, any> = Record<string, any>,
  ParamsData = any,
> {
  params: {
    where: { id: number };
    data: ParamsData;
  };
  result: {
    id: number;
    documentId: string;
  } & Entity;
}

export interface BeforeUpdateEvent<Entity extends Record<string, any> = Record<string, any>> {
  params: {
    where: { id: number };
    data: Entity;
  };
}

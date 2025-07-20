// * create
export interface AfterCreateEvent<Entity extends Record<string, any> = Record<string, any>> {
  result: {
    id: number;
    documentId: string;
  } & Entity;
}

// * update
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

// * delete
export interface BeforeDeleteEvent {
  params: {
    where: { id: number };
  };
}

export interface AfterDeleteEvent<Entity extends Record<string, any> = Record<string, any>> {
  params: {
    where: { id: number };
  };
  result: {
    id: number;
    documentId: string;
  } & Entity;
}

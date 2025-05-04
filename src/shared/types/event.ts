export interface BeforeCreateEvent<T = any> {
  params: {
    data: T;
  };
}

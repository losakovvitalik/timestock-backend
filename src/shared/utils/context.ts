import jwt from 'jsonwebtoken';

export default class Context {
  private ctx: any;

  constructor(ctx: any) {
    this.ctx = ctx;
  }

  public getUserId(): number {
    return this.ctx?.state?.user?.id;
  }

  public getBody<T = any>(key?: string) {
    return (key ? this.ctx.request.body[key] : this.ctx.request.body) as T;
  }

  public getParams<T = { id: string }>() {
    return this.ctx?.params as T;
  }

  public getRequest() {
    return this.ctx.request;
  }

  public isAdmin(): boolean {
    const { secret } = strapi.config.get('admin.auth', {}) as any;
    try {
      const result = jwt.verify(this.ctx.request.header.authorization.split(' ')[1], secret);
      return true;
    } catch (error) {
      return false;
    }
  }

  public addFilter(filter: object) {
    this.ctx.request.query = {
      ...this.ctx.request.query,
      filters: {
        ...this.ctx.request.query?.filters,
        ...filter,
      },
    };

    return this;
  }

  public addPopulate(populate: object) {
    this.ctx.request.query = {
      ...this.ctx.request.query,
      populate: {
        ...this.ctx.request.query?.populate,
        ...populate,
      },
    };

    return this;
  }

  public addSort(sort: string) {
    this.ctx.request.query.sort = sort;
  }

  public getCtx() {
    return this.ctx;
  }

  public getQueryParams<T = any>(name?: string): T | undefined {
    return name ? this.ctx.request.query[name] : this.ctx.request.query;
  }

  public getPopulate<T>() {
    return this.ctx.request.query.populate as T;
  }

  public getPagination() {
    return this.getQueryParams().pagination;
  }

  public getFilters<T = any>(): T | undefined {
    return this.getQueryParams().filters;
  }

  public getSort(): string | undefined {
    return this.getQueryParams().sort;
  }
}

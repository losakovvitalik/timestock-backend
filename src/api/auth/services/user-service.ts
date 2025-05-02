import { Data } from "@strapi/strapi";

export type UserType = Data.ContentType<"plugin::users-permissions.user">;

export class UserService {
  public static readonly UID = "plugin::users-permissions.user";

  static findByEmail(email: string): Promise<UserType | null> {
    return strapi.documents(this.UID).findFirst({
      filters: {
        email,
      },
    });
  }
}

import { Signal } from "@angular/core";
import { CurrentUser } from "../model/current-user.model";

export interface ICurrentUserRepository {
  exists(registration: string): Promise<boolean>;
  get(registration: string): Signal<CurrentUser>;
  create(currentUser: CurrentUser): Promise<boolean>;
  update(currentUser: CurrentUser): Promise<boolean>;
}

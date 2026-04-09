import { Signal } from "@angular/core";
import { CurrentUser, PersonMatch } from "../model/current-user.model";
import { IInitializable } from "./initializable.interface";

export interface ICurrentUserRepository extends IInitializable {
  exists(registration: string): Promise<boolean>;
  get(): Signal<CurrentUser>;
  findByRegistration(registration: string): Promise<PersonMatch>;
  create(currentUser: CurrentUser): Promise<boolean>;
  update(currentUser: CurrentUser): Promise<boolean>;
}

import { Injectable, Signal, signal } from "@angular/core";
import { HttpResponse, HttpStatusCode } from "@angular/common/http";
import { delay, from, lastValueFrom, map, switchMap } from "rxjs";
import { createIndexedDbServices, HttpMockEntity, HttpMockService } from "@pcurich/client-storage-indexeddb";
import { ICurrentUserRepository } from "../interfaces/current-user.repository.interface";
import { CurrentUser } from "../model/current-user.model";
import { SERVICE_CODES } from "../constants/general.constants";

import { handleResponse } from "../util/handle-response.util";

@Injectable({
  providedIn: 'root'
})
export class CurrentUserIndexeddbRepository implements ICurrentUserRepository {
  private httpMockService!: HttpMockService;
  private currentUser = signal<CurrentUser | undefined>(undefined);

  toPromise(httpEntity: HttpMockEntity[], httpMethod: string): Promise<CurrentUser> {
    const body: CurrentUser = JSON.parse(httpEntity[0].responseBody);
    const method: string = httpEntity[0].method;
    let response =  new HttpResponse<CurrentUser>({status: Number(HttpStatusCode.NoContent)});
    if (method === httpMethod) {
      response = new HttpResponse<CurrentUser>({
        status: Number(httpEntity[0].httpCodeResponseValue),
        statusText: 'OK',
        url: httpEntity[0].url,
        body
      });
    }
    return lastValueFrom(handleResponse<CurrentUser>(response, httpEntity[0].url, {} as CurrentUser).pipe(
      delay(Number(httpEntity[0].delayMs))
    ));

  }

  exists(registration: string): Promise<boolean> {
    const SERVICE_CODE = SERVICE_CODES.SC_GET_CURRENT_USER;
    return lastValueFrom(from(createIndexedDbServices()).pipe(
      switchMap(services => services["httpMockService"].findByServiceCode(SERVICE_CODE) as Promise<HttpMockEntity>),
      switchMap((entity: HttpMockEntity) => this.toPromise([entity], 'GET')),
      map((user: CurrentUser) => !!user),
    ));
  }

  get(registration: string): Signal<CurrentUser> {
    // return this.currentUser.asReadonly();
throw new Error("Method not implemented.");
  }

  create(currentUser: CurrentUser): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  update(currentUser: CurrentUser): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

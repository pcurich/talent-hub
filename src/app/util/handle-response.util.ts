import { HttpErrorResponse, HttpResponse, HttpStatusCode } from "@angular/common/http";
import { Observable, throwError } from "rxjs";

export const handleResponse = <T>(response: HttpResponse<T>, url: string, defaultValue?: T): Observable<T> => {

  if(response.status ===  HttpStatusCode.NoContent){
    return throwError(() => new HttpErrorResponse({
      status:Number(HttpStatusCode.NoContent),
      statusText: 'No Content',
      url,
      error: 'No content available'
    }));
  }

  if (response.status >= HttpStatusCode.BadRequest && response.status < HttpStatusCode.InternalServerError) {
    return throwError(() => new HttpErrorResponse({
      status: Number(response.status),
      statusText: response.statusText,
      url,
      error: 'Client error occurred'
    }));
  }

  if (response.status >= HttpStatusCode.InternalServerError) {
    return throwError(() => new HttpErrorResponse({
      status: Number(response.status),
      statusText: response.statusText,
      url,
      error: 'Server error occurred'
    }));
   }

  // if (response.status >= 200 && response.status < 300) {
  //   return new Observable<T>(subscriber => {
  //     subscriber.next(response.body ?? defaultValue as T);
  //     subscriber.complete();
  //   });
  // }

  return new Observable<T>(subscriber => {
    subscriber.next(response.body ?? defaultValue as T);
    subscriber.complete();
   });
}

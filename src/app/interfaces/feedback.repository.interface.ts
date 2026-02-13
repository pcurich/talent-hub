import { Signal } from "@angular/core";
import { FeedbackEntity } from "@pcurich/client-storage-indexeddb";

export interface IFeedbackRepository {
  exists(): Promise<boolean>;
  get(): Signal<FeedbackEntity[]>;

  create(feedBack: FeedbackEntity): Promise<boolean>;
  update(feedBack: FeedbackEntity): Promise<boolean>;
  // delete(id: number): Promise<boolean>;

  // searchEntities(searchTerm: string): FeedbackEntity[];
  // downloadAllFeedbacks(): void;
}

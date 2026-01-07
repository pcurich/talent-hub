import { Signal } from "@angular/core";
import { FeedbackEntity } from "@pcurich/client-storage-indexeddb";

export interface IFeedbackRepository {
  getEntities(): Signal<FeedbackEntity[]>;
  getAll(): FeedbackEntity[];
  getById(id: number): FeedbackEntity | undefined;
  getSelectedEntity(): Signal<FeedbackEntity | undefined>;
  setSelectedEntity(entity: FeedbackEntity | undefined): void;

  create(entity: FeedbackEntity): FeedbackEntity;
  update(entity: FeedbackEntity): void;
  delete(id: number): void;

  searchEntities(searchTerm: string): FeedbackEntity[];
  downloadAllFeedbacks(): void;
}

import { Signal } from "@angular/core";
import { FeedbackEntity } from "../model/feedback-entity.model";
import { IInitializable } from "./initializable.interface";

export interface IFeedbackRepository extends IInitializable {
  exists(): Promise<boolean>;
  get(): Signal<FeedbackEntity[]>;

  create(feedBack: FeedbackEntity): Promise<boolean>;
  update(feedBack: FeedbackEntity): Promise<boolean>;
  // delete(id: number): Promise<boolean>;

  // searchEntities(searchTerm: string): FeedbackEntity[];
  // downloadAllFeedbacks(): void;
}

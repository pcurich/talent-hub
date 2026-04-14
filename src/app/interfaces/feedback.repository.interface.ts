import { Signal } from "@angular/core";
import { FeedbackEntity, TeamMemberProfile } from "../model/feedback-entity.model";
import { IInitializable } from "./initializable.interface";

export interface IFeedbackRepository extends IInitializable {
  exists(): Promise<boolean>;
  get(): Signal<FeedbackEntity[]>;

  create(feedBack: FeedbackEntity): Promise<boolean>;
  update(feedBack: FeedbackEntity): Promise<boolean>;
  findByRegistration(registration: string): Promise<TeamMemberProfile | null>;

}

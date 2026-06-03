import { Injectable, inject, computed } from '@angular/core';
import { SystemConfigIndexeddbRepository } from '../repository/system-config.indexeddb.repository';
import { SYSTEM_CONFIG_KEYS } from '../constants/general.constants';
import {
  ActionPlanStatus,
  ActionResponsible,
  ConfigFieldValue,
  FeedbackProvider,
  FeedbackType,
  GeneralRating,
  PerformanceWhat,
  Seniority,
} from '../model/feedback-entity.model';

/**
 * Utilidad inyectable que centraliza la obtención de opciones para los dropdowns
 * de FeedbackEntity desde SystemConfigIndexeddbRepository.
 * Cada opción es un ConfigFieldValue con groupKey y fieldKey incluidos.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackOptionsUtil {
  private readonly systemConfig = inject(SystemConfigIndexeddbRepository);

  private getOptions<T extends ConfigFieldValue>(groupKey: string, fieldKey: string): T[] {
    return (this.systemConfig.getField(groupKey, fieldKey)?.options ?? [])
      .map(o => ({ ...o, groupKey, fieldKey }) as T);
  }

  private readonly _seniorityOptions = computed<Seniority[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_SENIORITY_FIELD_KEY
    )
  );
  get seniorityOptions(): Seniority[] { return this._seniorityOptions(); }

  private readonly _feedbackProviderOptions = computed<FeedbackProvider[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_PROVIDER_FIELD_KEY
    )
  );
  get feedbackProviderOptions(): FeedbackProvider[] { return this._feedbackProviderOptions(); }

  private readonly _generalRatingOptions = computed<GeneralRating[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_GENERAL_RATING_FIELD_KEY
    )
  );
  get generalRatingOptions(): GeneralRating[] { return this._generalRatingOptions(); }

  private readonly _performanceLevelOptions = computed<PerformanceWhat[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY
    )
  );
  get performanceLevelOptions(): PerformanceWhat[] { return this._performanceLevelOptions(); }

  private readonly _feedbackTypeOptions = computed<FeedbackType[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_TYPE_FIELD_KEY
    )
  );
  get feedbackTypeOptions(): FeedbackType[] { return this._feedbackTypeOptions(); }

  private readonly _actionResponsibleOptions = computed<ActionResponsible[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_RESPONSIBLE_FIELD_KEY
    )
  );
  get actionResponsibleOptions(): ActionResponsible[] { return this._actionResponsibleOptions(); }

  private readonly _actionStatusOptions = computed<ActionPlanStatus[]>(() =>
    this.getOptions(
      SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_STATUS_FIELD_KEY
    )
  );
  get actionStatusOptions(): ActionPlanStatus[] { return this._actionStatusOptions(); }
}

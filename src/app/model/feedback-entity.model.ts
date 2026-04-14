import { BaseEntity } from "@pcurich/client-storage-indexeddb";
import {
  FieldOption,
  getDefaultFieldOption,
  PERFORMANCE_LEVEL_OPTIONS,
  FEEDBACK_PROVIDER_OPTIONS,
  FEEDBACK_GENERAL_RATING_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  TEAM_MEMBERS_SENIORITY_OPTIONS,
  BLANK
} from "./system-config-entity.model";
import { Squad, TeamMember } from "./current-user.model";

/**
 * TeamMember enriquecido con sus feedbacks asociados.
 * Usar en lugar de PersonMatch cuando el objetivo es acceder
 * directamente a los feedbacks desde el contexto del colaborador.
 */
export interface TeamMemberProfile extends TeamMember {
  squad: Squad;
  feedbacks: FeedbackEntity[];
}

export type ActionPlanStatus = FieldOption;
export type PerformanceWhat = FieldOption;
export type PerformanceHow = FieldOption;
export type PerformanceAchievements = FieldOption;
export type ActionResponsible = FieldOption;
export type FeedbackType = FieldOption;
export type Seniority = FieldOption;
export type FeedbackProvider = FieldOption;
export type GeneralRating = FieldOption;

export interface Performance {
  what: PerformanceWhat; // ¿Cumple con la entrega del backlog?
  how: PerformanceHow; // ¿Vive los principios Samay?
  achievements: PerformanceAchievements; // Logros y resultados
  details: string;
}

/**
 * Detalles del feedback estructurado (SBI - Situation, Behavior, Impact)
 */
export interface FeedbackDetails {
  situation: string;
  behavior: string;
  impact: string;
}

/**
 * Plan de acción asociado al feedback
 */
export interface ActionPlan {
  actionable: string;
  responsible: ActionResponsible;
  commitmentDate: Date | string;
  status: ActionPlanStatus;
  details: string;
}

/**
 * Entidad para gestionar evaluaciones y feedback de team members
 */
export class FeedbackEntity extends BaseEntity {
  number: number;
  squad: Squad;
  teamMember: TeamMember;

  seniority: Seniority;
  poclacDate: Date;
  feedbackProvider: FeedbackProvider;

  // Calificación general
  generalRating: GeneralRating;

  // Desempeño
  performance: Performance;

  // Feedback
  feedbackType: FeedbackType;
  feedbackDetails: FeedbackDetails;

  // Expectativas
  userExpectations: string;

  // Plan de acción
  actionPlan: ActionPlan[];

  /**
   * Crea una nueva instancia a partir de un objeto de inicialización parcial.
   */
  constructor(init: Partial<FeedbackEntity> = {}) {
    super((init as any).id ?? (init as any)._id ?? undefined);

    this.number = init.number ?? 0;
    this.teamMember = init.teamMember ?? ({} as TeamMember);
    this.seniority = init.seniority ?? getDefaultFieldOption('team_members_seniority') ?? TEAM_MEMBERS_SENIORITY_OPTIONS.find(o => o.value === BLANK)!;
    this.squad = init.squad ?? ({} as Squad);
    this.poclacDate = init.poclacDate ?? new Date();
    this.feedbackProvider = init.feedbackProvider ?? getDefaultFieldOption('feedback_provider') ?? FEEDBACK_PROVIDER_OPTIONS.find(o => o.value === BLANK)!;

    this.generalRating = init.generalRating ?? getDefaultFieldOption('feedback_general_rating') ?? FEEDBACK_GENERAL_RATING_OPTIONS.find(o => o.value === BLANK)!;

    const defaultPerformance = getDefaultFieldOption('feedback_performance_level') ?? PERFORMANCE_LEVEL_OPTIONS.find(o => o.value === BLANK)!;
    this.performance = init.performance ?? {
      what: defaultPerformance,
      how: defaultPerformance,
      achievements: defaultPerformance,
      details: ''
    };

    this.feedbackType = init.feedbackType ?? getDefaultFieldOption('feedback_default_type') ?? FEEDBACK_TYPE_OPTIONS.find(o => o.value === BLANK)!;
    this.feedbackDetails = init.feedbackDetails ?? {
      situation: '',
      behavior: '',
      impact: '',
    };

    this.userExpectations = init.userExpectations ?? '';
    this.actionPlan = init.actionPlan ?? [];
  }

}

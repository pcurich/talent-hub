import { BaseEntity } from "@pcurich/client-storage-indexeddb";
import { FieldOption } from "./system-config-entity.model";
import { Squad, TeamMember } from "./current-user.model";

/**
 * Estados posibles del accionable
 */
export type ActionableStatus = 'Pendiente' | 'En Progreso' | 'Completado' | 'Cancelado' | string;

/**
 * Responsable del plan de acción
 */
export type ActionResponsible = 'CL' | 'FP' | 'PO' | 'AC' | 'OTHER' | string;


export interface Performance {
  whatKey: FieldOption; // ¿Cumple con la entrega del backlog?
  how: FieldOption; // ¿Vive los principios Samay?
  achievements: FieldOption; // Logros y resultados
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
    status: ActionableStatus;
    details: string;
}

/**
 * Entidad para gestionar evaluaciones y feedback de team members
 */
export class FeedbackEntity extends BaseEntity {
    number: number;
    registration: string;
    teamMember: TeamMember;
    seniority: FieldOption;
    squad: Squad;
    poclacDate: Date | string;
    feedbackProvider: FieldOption;

    // Calificación general
    generalRating: FieldOption;

    // Desempeño
    performance:Performance;

    // Feedback
    feedbackType: FieldOption;
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
        this.registration = init.registration ?? '';
        this.teamMember = init.teamMember ?? ({} as TeamMember);
        this.seniority = init.seniority ?? { value: '0', label: '---------------', description: 'No se ha especificado un nivel de seniority', color: '#ffffff', order: 6 };
        this.squad = init.squad ?? ({} as Squad);
        this.poclacDate = init.poclacDate ?? new Date();
        this.feedbackProvider = init.feedbackProvider ?? { value: '0', label: '---------------', description: 'No se ha especificado un proveedor de feedback', color: '#ffffff', order: 6 };

        this.generalRating = init.generalRating ?? { value: 'blank', label: '---------------', description: 'No se ha especificado una calificación general', color: '#ffffff', order: 4 };

        this.performance = init.performance ?? {
          whatKey: { value: '0', label: '---------------', description: 'No se ha especificado un nivel de desempeño', color: '#ffffff', order: 6 },
          how: { value: '0', label: '---------------', description: 'No se ha especificado un nivel de desempeño', color: '#ffffff', order: 6 },
          achievements: { value: '0', label: '---------------', description: 'No se ha especificado un nivel de desempeño', color: '#ffffff', order: 6 },
          details: ''
        };

        this.feedbackType = init.feedbackType ?? { value: 'blank', label: '----------------', description: 'Seleccione un tipo de feedback', color: '#ffffff', order: 1 };
        this.feedbackDetails = init.feedbackDetails ?? {
            situation: '',
            behavior: '',
            impact: '',
        };

        this.userExpectations = init.userExpectations ?? '';
        this.actionPlan = init.actionPlan ?? [];
    }

}

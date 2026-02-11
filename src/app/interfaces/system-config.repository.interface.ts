import { Signal } from "@angular/core";
import { SystemConfig, ConfigValue } from "../model/system-config.model";
import { IInitializable } from "./initializable.interface";

/**
 * Interface para el repositorio de configuración del sistema.
 * Define las operaciones CRUD y consultas para SystemConfig.
 */
export interface ISystemConfigRepository extends IInitializable {
  /**
   * Verifica si existe una configuración guardada.
   */
  exists(): Promise<boolean>;

  /**
   * Obtiene el signal con la configuración actual del sistema.
   */
  get(): Signal<SystemConfig>;

  /**
   * Crea una nueva configuración del sistema.
   * @param config - Configuración a crear
   */
  create(config: SystemConfig): Promise<boolean>;

  /**
   * Actualiza la configuración del sistema existente.
   * @param config - Configuración con los nuevos valores
   */
  update(config: SystemConfig): Promise<boolean>;

  /**
   * Obtiene el valor de un campo específico.
   * @param fieldKey - Key del campo a buscar
   */
  getFieldValue(fieldKey: string): ConfigValue | undefined;

  /**
   * Actualiza el valor de un campo específico.
   * @param fieldKey - Key del campo a actualizar
   * @param value - Nuevo valor
   */
  updateFieldValue(fieldKey: string, value: string | number | boolean | string[] | null): Promise<boolean>;

  /**
   * Resetea la configuración a valores por defecto.
   */
  resetToDefaults(): Promise<boolean>;
}

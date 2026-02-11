/**
 * Interfaz base para repositorios que requieren inicialización.
 * Implementa el principio de Interface Segregation (ISP).
 *
 * Cada repositorio que implemente esta interfaz debe:
 * 1. Conectarse a su fuente de datos (ej: IndexedDB)
 * 2. Cargar datos iniciales en sus signals internos
 */
export interface IInitializable {
  /**
   * Inicializa el repositorio.
   * Este método debe ser idempotente (puede llamarse múltiples veces sin efectos secundarios).
   * @param registration Identificador del usuario para configurar la BD (opcional)
   * @returns Promise que se resuelve cuando la inicialización está completa
   */
  initService(registration?: string): Promise<void>;
}

import { Signal, signal, WritableSignal } from "@angular/core";
import { createIndexedDbServices, HttpMockEntity, HttpMockService } from "@pcurich/client-storage-indexeddb";
import { IInitializable } from "../interfaces/initializable.interface";
import { getIndexedDbConfigWithRegistration } from "../util/indexeddb-config.util";

/**
 * Clase base abstracta para repositorios IndexedDB.
 * Implementa el patrón Template Method para la inicialización.
 *
 * @typeParam T - Tipo de la entidad que maneja el repositorio
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la conexión y operaciones base de IndexedDB
 * - Open/Closed: Extensible via herencia, cerrado para modificación
 * - Liskov Substitution: Todas las subclases son intercambiables
 * - Dependency Inversion: Depende de abstracciones (IInitializable)
 */
export abstract class BaseIndexeddbRepository<T> implements IInitializable {
  protected httpMockService: HttpMockService | null = null;
  protected entity: WritableSignal<T>;
  protected isInitialized = false;

  /**
   * Código del servicio para identificar las entidades en IndexedDB.
   * Cada repositorio debe definir su propio código.
   */
  protected abstract readonly SERVICE_CODE: string;

  /**
   * Valor por defecto cuando no hay datos.
   * Cada repositorio define qué retornar cuando está vacío.
   */
  protected abstract readonly DEFAULT_VALUE: T;

  constructor() {
    this.entity = signal(this.getDefaultValue());
  }

  /**
   * Retorna el valor por defecto. Se llama en el constructor.
   * Workaround porque las propiedades abstractas no están disponibles en el constructor.
   */
  protected abstract getDefaultValue(): T;

  /**
   * Inicializa el repositorio: conecta a la BD y carga los datos.
   * Implementa IInitializable.
   */
  async initService(registration: string = ''): Promise<void> {
    await this.ensureDatabase(registration);
    await this.refreshEntities();
  }

  /**
   * Asegura que la base de datos exista y que httpMockService esté configurado.
   * Si la BD no existe, la crea. Si ya existe, solo abre la conexión.
   * Este método es idempotente y puede usarse en todos los métodos transaccionales.
   */
  protected async ensureDatabase(registration: string = ''): Promise<void> {
    if (this.isInitialized && this.httpMockService) {
      return;
    }

    const cfg = getIndexedDbConfigWithRegistration(registration);
    const dataTableName = cfg.stores[0].name;
    const keyPath = cfg.stores[0].keyPath;

    const services = await createIndexedDbServices(cfg);

    if ((services as any).httpMockService) {
      this.httpMockService = (services as any).httpMockService;
    } else {
      this.httpMockService = new HttpMockService(services['dbContext'], dataTableName, keyPath);
    }

    this.isInitialized = true;
    console.log(`[${this.constructor.name}] Database asegurada correctamente`);
  }

  /**
   * Carga los datos desde IndexedDB y actualiza el signal interno.
   * Implementación por defecto que puede ser sobrescrita.
   */
  protected async refreshEntities(): Promise<void> {
    try {
      const httpMocks = await this.httpMockService?.findByServiceCode(this.SERVICE_CODE);
      if (httpMocks && httpMocks.length > 0) {
        const entity: T = JSON.parse(httpMocks[0].responseBody);
        this.entity.set(entity);
      } else {
        this.entity.set(this.DEFAULT_VALUE);
      }
      console.log(`[${this.constructor.name}] ${httpMocks?.length || 0} entidad(es) cargada(s) desde IndexedDB`);
    } catch (error) {
      console.error(`[${this.constructor.name}] Error al refrescar entidades:`, error);
      this.entity.set(this.DEFAULT_VALUE);
    }
  }

  /**
   * Retorna el signal de solo lectura con la entidad actual.
   */
  get(): Signal<T> {
    return this.entity.asReadonly();
  }

  /**
   * Convierte una entidad HTTP a Signal.
   * Útil para operaciones que necesitan retornar un signal desde datos crudos.
   */
  protected toSignal(httpEntity: HttpMockEntity[], httpMethod: string): Signal<T> {
    const body: T = JSON.parse(httpEntity[0].responseBody);
    const method: string = httpEntity[0].method;

    if (method === httpMethod) {
      return signal(body).asReadonly();
    }

    return signal(this.DEFAULT_VALUE).asReadonly();
  }
}

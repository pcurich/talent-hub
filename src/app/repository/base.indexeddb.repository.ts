import { Signal, signal, WritableSignal } from "@angular/core";
import { createIndexedDbServices, databaseExists, deleteDatabase, HttpMockEntity, HttpMockService } from "@pcurich/client-storage-indexeddb";
import { IInitializable } from "../interfaces/initializable.interface";
import { getIndexedDbConfigWithRegistration } from "../util/indexeddb-config.util";
import { STORAGE_KEYS } from "../constants/general.constants";

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
  /**
   * Singleton: Instancia compartida del servicio IndexedDB.
   * Se crea una sola vez y se comparte entre todos los repositorios.
   */
  private static sharedHttpMockService: HttpMockService | null = null;

  /**
   * Promesa de inicialización para evitar race conditions.
   * Garantiza que createIndexedDbServices se ejecute solo una vez.
   */
  private static initializationPromise: Promise<void> | null = null;

  /**
   * Indica si la base de datos global ya fue inicializada.
   */
  private static globalInitialized = false;

  /**
   * Registration con el que se inicializó la conexión compartida.
   */
  private static currentRegistration = localStorage.getItem(STORAGE_KEYS.CURRENT_REGISTRATION) ?? '';

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
   *
   * IMPORTANTE: createIndexedDbServices se ejecuta UNA SOLA VEZ en todo el ciclo de vida
   * del sistema, compartiendo la conexión entre todos los repositorios.
   */
  protected async ensureDatabase(registration: string = ''): Promise<void> {
    // Si el registration cambió, forzar re-inicialización
    if (registration && BaseIndexeddbRepository.globalInitialized &&
      BaseIndexeddbRepository.currentRegistration !== registration) {
      console.log(`[${this.constructor.name}] Registration cambió de '${BaseIndexeddbRepository.currentRegistration}' a '${registration}', re-inicializando...`);
      BaseIndexeddbRepository.globalInitialized = false;
      BaseIndexeddbRepository.sharedHttpMockService = null;
      this.httpMockService = null;
      this.isInitialized = false;
    }

    // Si esta instancia ya está inicializada, no hacer nada
    if (this.isInitialized && this.httpMockService) {
      return;
    }

    // Si ya existe una inicialización global en progreso, esperar a que termine
    if (BaseIndexeddbRepository.initializationPromise) {
      await BaseIndexeddbRepository.initializationPromise;
      this.httpMockService = BaseIndexeddbRepository.sharedHttpMockService;
      this.isInitialized = true;
      console.log(`[${this.constructor.name}] Usando conexión compartida existente`);
      return;
    }

    // Si ya está inicializado globalmente, usar la instancia compartida
    if (BaseIndexeddbRepository.globalInitialized && BaseIndexeddbRepository.sharedHttpMockService) {
      this.httpMockService = BaseIndexeddbRepository.sharedHttpMockService;
      this.isInitialized = true;
      console.log(`[${this.constructor.name}] Usando conexión compartida existente`);
      return;
    }

    // Primera inicialización: crear la promesa para evitar race conditions
    BaseIndexeddbRepository.initializationPromise = this.initializeSharedDatabase(registration);

    try {
      await BaseIndexeddbRepository.initializationPromise;
      this.httpMockService = BaseIndexeddbRepository.sharedHttpMockService;
      this.isInitialized = true;
      console.log(`[${this.constructor.name}] Database inicializada (primera vez)`);
    } finally {
      // Limpiar la promesa después de completar
      BaseIndexeddbRepository.initializationPromise = null;
    }
  }

  /**
   * Inicializa la base de datos compartida. Solo se ejecuta una vez.
   */
  private async initializeSharedDatabase(registration: string): Promise<void> {
    const cfg = getIndexedDbConfigWithRegistration(registration);
    const dataTableName = cfg.stores[0].name;
    const keyPath = cfg.stores[0].keyPath;

    // Si la BD existe pero el object store no (corrupta), eliminarla para recrearla limpia
    const dbExists = await this.rawDatabaseNameExists(cfg.dbName);
    if (dbExists) {
      const storeOk = await databaseExists(cfg);
      if (!storeOk) {
        console.warn(`[BaseIndexeddbRepository] BD '${cfg.dbName}' existe pero sin store '${dataTableName}', eliminando para recrear...`);
        await deleteDatabase(cfg);
      }
    }

    const services = await createIndexedDbServices(cfg);
    console.log('[BaseIndexeddbRepository] createIndexedDbServices ejecutado (única vez)');

    if ((services as any).httpMockService) {
      BaseIndexeddbRepository.sharedHttpMockService = (services as any).httpMockService;
    } else {
      BaseIndexeddbRepository.sharedHttpMockService = new HttpMockService(services['dbContext'], dataTableName, keyPath);
    }

    BaseIndexeddbRepository.globalInitialized = true;
    BaseIndexeddbRepository.currentRegistration = registration;
  }

  /**
   * Verifica si existe una base de datos con el nombre dado (sin validar stores).
   */
  private async rawDatabaseNameExists(dbName: string): Promise<boolean> {
    try {
      const databases = await indexedDB.databases();
      return databases.some(db => db.name === dbName);
    } catch {
      return false;
    }
  }

  /**
   * Carga los datos desde IndexedDB y actualiza el signal interno.
   * Implementación por defecto que puede ser sobrescrita.
   */
  protected async refreshEntities(): Promise<void> {
    try {
      const httpMocks = await this.httpMockService?.findByServiceCode(this.SERVICE_CODE);
      if (httpMocks && httpMocks.length > 0) {
        if (Array.isArray(this.DEFAULT_VALUE)) {
          const entities = httpMocks.map(mock => JSON.parse(mock.responseBody));
          this.entity.set(entities as T);
        } else {
          const entity: T = JSON.parse(httpMocks[0].responseBody);
          this.entity.set(entity);
        }
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

  /**
   * Verifica si existe al menos una entidad con el SERVICE_CODE actual.
   */
  async exists(): Promise<boolean> {
    try {
      if (!this.httpMockService) {
        return false;
      }

      const entities = await this.httpMockService.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        return false;
      }

      const configSignal = this.toSignal(entities, 'GET');
      return !!(configSignal() as any)?.id;
    } catch (error) {
      console.error(`[${this.constructor.name}] Error en exists():`, error);
      return false;
    }
  }
}

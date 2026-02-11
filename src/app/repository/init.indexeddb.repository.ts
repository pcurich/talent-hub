import { Injectable } from '@angular/core';
import { IInitAppRepository } from '../interfaces/init.repository.interface';
import { createIndexedDbServices, databaseExists, HttpMockService } from '@pcurich/client-storage-indexeddb';
import { HTTP_MOCK_DB_CONFIG } from '@pcurich/client-storage-indexeddb';
import { getIndexedDbConfigWithRegistration } from '../util/indexeddb-config.util';

@Injectable({
  providedIn: 'root'
})
export class InitAppIndexeddbRepository implements IInitAppRepository {
  cfg = HTTP_MOCK_DB_CONFIG
  private httpService!: HttpMockService;

  async initializeDatabase(registration: string): Promise<void> {
    this.cfg = getIndexedDbConfigWithRegistration(registration);
    debugger;
    const isInit = await this.isInitialized();

    if (!isInit) {
      try {
        await this.initService();
      } catch (err) {
        console.error('Error initializing IndexedDB:', err);
        throw err;
      }
    }
  }

  async initService(): Promise<void> {
    const cfg = this.cfg;
    const dataTableName = cfg.stores[0].name;
    const keyPath = cfg.stores[0].keyPath;
    const { dbContext } = await createIndexedDbServices(cfg);
    this.httpService = new HttpMockService(dbContext, dataTableName, keyPath);
    console.log('HttpMockService inicializado correctamente');
    return Promise.resolve();
  }

  isInitialized(): Promise<boolean> {
    return databaseExists(this.cfg);
  }
}

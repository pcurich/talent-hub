import { Injectable } from '@angular/core';
import { databaseExists } from '@pcurich/client-storage-indexeddb';

import { IInitAppRepository } from '../interfaces/init.repository.interface';
import { getIndexedDbConfigWithRegistration } from '../util/indexeddb-config.util';

@Injectable({
  providedIn: 'root'
})
export class InitAppIndexeddbRepository implements IInitAppRepository {

  cfg: any;

  async initializeDatabase(registration: string): Promise<void> {
    this.cfg = getIndexedDbConfigWithRegistration(registration);
    // La creación y conexión a la BD se delega a BaseIndexeddbRepository.ensureDatabase()
    // que es llamado por cada repositorio antes de cualquier operación.
  }

  isInitialized(): Promise<boolean> {
    return databaseExists(this.cfg);
  }
}

export interface IInitAppRepository {
  isInitialized(): Promise<boolean>;
  initializeDatabase(registration: string): Promise<void>;
}

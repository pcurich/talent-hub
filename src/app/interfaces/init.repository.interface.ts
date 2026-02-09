export interface IInitAppRepository {
  initService(): Promise<void>;
  isInitialized(): Promise<boolean>;
  initializeDatabase(registration: string): Promise<void>;
}

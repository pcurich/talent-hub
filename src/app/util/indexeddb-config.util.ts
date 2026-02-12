import { HTTP_MOCK_DB_CONFIG } from "@pcurich/client-storage-indexeddb";

export const getIndexedDbConfigWithRegistration = (registration: string) => {
  const config = JSON.parse(JSON.stringify(HTTP_MOCK_DB_CONFIG));
  config.stores[0].name = config.stores[0].name + '-' + registration;
  return config;
}

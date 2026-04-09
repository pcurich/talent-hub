import { BaseEntity } from "@pcurich/client-storage-indexeddb";

export type PersonRole = 'cl' | 'po' | 'user' | 'teamMember' | 'directManager' | 'tm' | null;

export interface PersonMatch {
  person: Person | null;
  role: PersonRole;
  squadName?: string;
}

export interface Person {
  name: string;
  registration: string;
  email: string;
}

export interface TeamMember extends Person {
  companyKey?: string;
  companyValue?: string;
}

export interface ProductOwner extends Person {}

export interface Squad {
  name: string;
  productOwner: ProductOwner;
  teamMembers: TeamMember[];
}

export interface CurrentUser extends BaseEntity {
  user: Person;
  directManager: Person;
  squads: Squad[];
}

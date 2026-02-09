export interface Person {
  name: string;
  registration: string;
  email: string;
}

export interface TeamMember extends Person {}

export interface ProductOwner extends Person {}

export interface Squad {
  name: string;
  productOwner: ProductOwner;
  teamMembers: TeamMember[];
}

export interface CurrentUser {
  user: Person;
  directManager: Person;
  squads: Squad[];
}

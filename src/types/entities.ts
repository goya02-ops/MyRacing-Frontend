export class Circuit {
  id?: number;
  denomination: string = '';
  abbreviation: string = '';
  description: string = '';
}

export class Category {
  id?: number;
  denomination: string = '';
  abbreviation: string = '';
  description: string = '';
}

export type UserType = 'admin' | 'common' | 'premium';

export class User {
  id?: number;
  userName: string = '';
  realName: string = '';
  email: string = '';
  password?: string = '';
  type: UserType = 'common';
}

export class Simulator {
  id?: number;
  name: string = '';
  status: string = '';
  categories?: CategoryVersion;
  circuits?: CircuitVersion;
}

export class CategoryVersion {
  id?: number;
  status: string = '';
  category?: Category;
  simulator?: Simulator;
}

export class Membership {
  id?: number;
  dateFrom!: Date;
  price!: number;
}

export class CircuitVersion {
  id?: number;
  status: string = '';
  simulator!: Simulator;
  circuit!: Circuit;
}

export class Combination {
  id?: number;
  dateFrom: string = '';
  dateTo: string = '';
  lapsNumber: number = 0;
  obligatoryStopsQuantity: number = 0;
  userType: string = '';
  raceIntervalMinutes: number = 30;
  categoryVersion?: CategoryVersion;
  circuitVersion?: CircuitVersion;
  races?: Race[];
}

export class RaceUser {
  id?: number;
  registrationDateTime!: Date;
  startPosition?: number;
  finishPosition?: number;
  race!: Race;
  user!: User;
}

export class Race {
  id?: number;
  raceDateTime: string = '';
  registrationDeadline: string = '';
  raceUsers!: RaceUser[];
}

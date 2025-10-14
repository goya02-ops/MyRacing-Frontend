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

export class User {
  id?: number;
  userName: string = '';
  realName: string = '';
  email: string = '';
  password: string = '';
  type: string = '';
}
export class Simulator {
  id?: number;
  name: string = '';
  status: string = '';
}

export class CategoryVersion {
  id?: number;
  status: string = '';
  category?: number | Category;
  simulator?: number | Simulator;
}

export class Membership {
  id?: number;
  dateFrom!: Date;
  price!: number;
}

export class CircuitVersion {
  id?: number;
  status: string = '';
  simulator!: Simulator | number;
  circuit!: Circuit | number;
}

export class Combination {
  id?: number;
  dateFrom: string = '';
  dateTo: string = '';
  lapsNumber: number = 0;
  obligatoryStopsQuantity: number = 0;
  userType: string = '';
  raceIntervalMinutes: number = 30;
  categoryVersion?: CategoryVersion | number;
  circuitVersion?: CircuitVersion | number;
  races?: Race;
}

export class Race {
  id?: number;
  raceDateTime: string = '';
  registrationDeadline: string = '';
}

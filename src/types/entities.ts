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

export class Simulator {
  id?: number;
  name: string = '';
  status: string = '';
}

export class CircuitVersion {
  id?: number;
  status: string = '';
  simulator!: Simulator | number;
  circuit!: Circuit | number;
}

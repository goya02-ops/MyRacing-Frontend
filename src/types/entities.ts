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

export class Membership{
  id?: number;
  denomination: string = '';
  price: number = 0;
}

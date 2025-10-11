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


export class CategoryVersion {
  id?: number;
  status: string = '';
  category?: number | { id: number; denomination: string; abbreviation: string }; // Puede ser ID o objeto
  simulator?: number | { id: number; name: string }; // Puede ser ID o objeto
}
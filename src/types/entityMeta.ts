<<<<<<< HEAD
import { Circuit, Category, User } from './entities';
=======
import {
  Circuit,
  Category,
  Simulator,
  Membership,
  CircuitVersion,
  CategoryVersion,
} from './entities';
>>>>>>> develop

export type Constructor<T> = new (...args: any[]) => T;

export interface EntityMetadata {
  endpoint: string;
}

export const entityMetaByClass = new Map<Constructor<unknown>, EntityMetadata>([
  [Circuit, { endpoint: '/circuits' }],
  [Category, { endpoint: '/categories' }],
<<<<<<< HEAD
  [User, { endpoint: '/users' }],
]);
=======
  [Simulator, { endpoint: '/simulators' }],
  [CategoryVersion, { endpoint: '/categories-version' }], // Nuevo endpoint
  [Membership, { endpoint: '/memberships' }],
  [CircuitVersion, { endpoint: '/circuits-version' }],
]);
>>>>>>> develop

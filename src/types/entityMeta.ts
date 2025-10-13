import {
  Circuit,
  Category,
  Simulator,
  Membership,
  CircuitVersion,
  CategoryVersion,
  User,
} from './entities';

export type Constructor<T> = new (...args: any[]) => T;

export interface EntityMetadata {
  endpoint: string;
}

export const entityMetaByClass = new Map<Constructor<unknown>, EntityMetadata>([
  [Circuit, { endpoint: '/circuits' }],
  [Category, { endpoint: '/categories' }],
  [User, { endpoint: '/users' }],
  [Simulator, { endpoint: '/simulators' }],
  [CategoryVersion, { endpoint: '/categories-version' }], // Nuevo endpoint
  [Membership, { endpoint: '/membership' }],
  [CircuitVersion, { endpoint: '/circuits-version' }],
]);

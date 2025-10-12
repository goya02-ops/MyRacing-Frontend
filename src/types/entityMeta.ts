import {
  Circuit,
  Category,
  Simulator,
  Membership,
  CircuitVersion,
} from './entities';

export type Constructor<T> = new (...args: any[]) => T;

export interface EntityMetadata {
  endpoint: string;
}

export const entityMetaByClass = new Map<Constructor<unknown>, EntityMetadata>([
  [Circuit, { endpoint: '/circuits' }],
  [Category, { endpoint: '/categories' }],
  [Simulator, { endpoint: '/simulators' }],
  [Membership, { endpoint: '/memberships' }],
  [CircuitVersion, { endpoint: '/circuits-version' }],
]);

import { Circuit, Category, Simulator } from './entities';

export type Constructor<T> = new (...args: any[]) => T;

export interface EntityMetadata {
  endpoint: string;
}

export const entityMetaByClass = new Map<Constructor<unknown>, EntityMetadata>([
  [Circuit, { endpoint: '/circuits' }],
  [Category, { endpoint: '/categories' }],
  [Simulator, { endpoint: '/simulators' }],
]);

import {
  Circuit,
  Category,
  Simulator,
  Membership,
  CircuitVersion,
  CategoryVersion,
  Combination,  // ← AGREGAR ESTE IMPORT
  Race,         // ← Y ESTE TAMBIÉN
} from './entities';

export type Constructor<T> = new (...args: any[]) => T;

export interface EntityMetadata {
  endpoint: string;
}

export const entityMetaByClass = new Map<Constructor<unknown>, EntityMetadata>([
  [Circuit, { endpoint: '/circuits' }],
  [Category, { endpoint: '/categories' }],
  [Simulator, { endpoint: '/simulators' }],
  [CategoryVersion, { endpoint: '/categories-version' }],
  [Membership, { endpoint: '/membership' }],
  [CircuitVersion, { endpoint: '/circuits-version' }],
  [Combination, { endpoint: '/combinations' }],  
  [Race, { endpoint: '/races' }],               
]);
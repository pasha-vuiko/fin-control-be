export function plainObjectsToEntities<T, C extends EntityClass<T>>(
  EntityConstructor: C,
  data: any[],
): T[] {
  return data.map(item => new EntityConstructor(item));
}

type EntityClass<T> = new (data: any) => T;

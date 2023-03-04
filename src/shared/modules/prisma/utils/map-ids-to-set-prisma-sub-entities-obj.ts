export const mapIdsToSetPrismaSubEntitiesObj = <T>(
  ids?: T[],
): ISetPrismaSubEntities<T> => {
  if (!ids) {
    return {
      set: [],
    };
  }

  return {
    set: ids.map(id => ({ id })),
  };
};

interface ISetPrismaSubEntities<T> {
  set: ISetById<T>[];
}

interface ISetById<T> {
  id: T;
}

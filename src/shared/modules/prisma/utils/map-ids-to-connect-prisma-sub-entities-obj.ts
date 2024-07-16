export const mapIdsToConnectPrismaSubEntitiesObj = <T>(ids?: T[]): IConnect<T> => {
  if (!ids) {
    return {
      connect: [],
    };
  }

  return {
    connect: ids.map(id => ({ id })),
  };
};

interface IConnect<T> {
  connect: IConnectById<T>[];
}

interface IConnectById<T> {
  id: T;
}

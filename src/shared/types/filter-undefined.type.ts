export type FilterUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: NonUndefined<T[K]>;
};

type NonUndefined<T> = T extends undefined ? never : T;

export type MethodDecoratorFactoryType = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor;

/**
 * Describes data of package.json
 */
export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  private: boolean;
  scripts: Record<string, string>;
  author: string;
  engines: IEngines;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  jest: IJest;
}

export interface IEngines {
  node: string;
}

export interface IJest {
  moduleFileExtensions: string[];
  rootDir: string;
  testRegex: string;
  transform: Record<string, string>;
  collectCoverageFrom: string[];
  coverageDirectory: string;
  testEnvironment: string;
  moduleNameMapper: Record<string, string>;
}

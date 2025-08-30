/**
 * Describes data of package.json
 */
export interface PackageJson {
  name: string;
  version: string;
  description: string;
  private: boolean;
  scripts: Record<string, string>;
  author: string;
  engines: Engines;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  jest: Jest;
}

export interface Engines {
  node: string;
}

export interface Jest {
  moduleFileExtensions: string[];
  rootDir: string;
  testRegex: string;
  transform: Record<string, string>;
  collectCoverageFrom: string[];
  coverageDirectory: string;
  testEnvironment: string;
  moduleNameMapper: Record<string, string>;
}

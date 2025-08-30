import { readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';

import { PackageJson } from '@shared/interfaces/package-json.interface';

const packageJsonPath = findPackageJSON('..', __filename);
// eslint-disable-next-line security/detect-non-literal-fs-filename
const packageJsonContentStr = readFileSync(packageJsonPath!, 'utf-8');

// Content of package.json
export const packageJsonInfo: PackageJson = JSON.parse(packageJsonContentStr);

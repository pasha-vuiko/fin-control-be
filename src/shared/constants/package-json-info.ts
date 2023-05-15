import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { IPackageJson } from '@shared/interfaces/package-json.interface';

const packageJsonPath = resolve(__dirname, '..', '..', '..', 'package.json');
const packageJsonContentStr = readFileSync(packageJsonPath, 'utf-8');

// Content of package.json
export const packageJsonInfo: IPackageJson = JSON.parse(packageJsonContentStr);

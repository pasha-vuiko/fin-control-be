import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

export function checkEnvVarsSet(exampleEnvFilePath: string): boolean {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const exampleEnvFileContent = readFileSync(exampleEnvFilePath, 'utf8');
  const parsedEnvFileContent = dotenv.parse(exampleEnvFileContent);

  const missingEnvVars = Object.keys(parsedEnvFileContent).filter(
    // eslint-disable-next-line security/detect-object-injection
    envVarName => process.env[envVarName] === undefined,
  );

  if (missingEnvVars.length) {
    throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  }

  return true;
}

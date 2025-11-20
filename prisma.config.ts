import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'prisma/config';

const dotEnvFilePath = path.resolve(__dirname, '.env');

if (fs.existsSync(dotEnvFilePath)) {
  process.loadEnvFile(dotEnvFilePath);
}

const schemaPath = path.resolve(__dirname, 'prisma', 'schema.prisma');
const migrationsPath = path.resolve(__dirname, 'prisma', 'schema.prisma');

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  schema: schemaPath,
  migrations: {
    path: migrationsPath,
  },
});

import { CacheIndexesEnum } from '@shared/modules/redis/enums/cache-indexes.enum';
import { ICreateIndexOptions } from '@shared/modules/redis/interfaces/create-index-options.interface';
import {
  CreateSchemaTagField,
  CreateSchemaTextField,
  ICreateSearchIndexSchema,
  SchemaFieldTypesEnum,
} from '@shared/modules/redis/interfaces/create-search-index-schema.interface';

/**
 * @description creates redis-cli arguments for creating of RediSearch index.
 * Copies the functionality of client.ft.create() from https://github.com/redis/node-redis/tree/d65a641b2db96c6d63a2a51c43e823aba8256e28/packages/search
 * @param index
 * @param schema
 * @param options
 */
// eslint-disable-next-line max-lines-per-function
export const transformCreateSearchIndexArgs = (
  index: CacheIndexesEnum,
  schema: ICreateSearchIndexSchema,
  options?: ICreateIndexOptions,
): string[] => {
  const args = ['FT.CREATE', index];

  if (options?.ON) {
    args.push('ON', options.ON);
  }

  pushOptionalVerdictArgument(args, 'PREFIX', options?.PREFIX);

  if (options?.FILTER) {
    args.push('FILTER', options.FILTER);
  }

  if (options?.LANGUAGE) {
    args.push('LANGUAGE', options.LANGUAGE);
  }

  if (options?.LANGUAGE_FIELD) {
    args.push('LANGUAGE_FIELD', options.LANGUAGE_FIELD);
  }

  if (options?.SCORE) {
    args.push('SCORE', options.SCORE.toString());
  }

  if (options?.SCORE_FIELD) {
    args.push('SCORE_FIELD', options.SCORE_FIELD);
  }

  if (options?.MAXTEXTFIELDS) {
    args.push('MAXTEXTFIELDS');
  }

  if (options?.TEMPORARY) {
    args.push('TEMPORARY', options.TEMPORARY.toString());
  }

  if (options?.NOOFFSETS) {
    args.push('NOOFFSETS');
  }

  if (options?.NOHL) {
    args.push('NOHL');
  }

  if (options?.NOFIELDS) {
    args.push('NOFIELDS');
  }

  if (options?.NOFREQS) {
    args.push('NOFREQS');
  }

  if (options?.SKIPINITIALSCAN) {
    args.push('SKIPINITIALSCAN');
  }

  pushOptionalVerdictArgument(args, 'STOPWORDS', options?.STOPWORDS);
  args.push('SCHEMA');
  pushSchema(args, schema);

  return args;
};

function pushOptionalVerdictArgument(
  args: RedisCommandArguments,
  name: RedisCommandArgument,
  value: undefined | RedisCommandArgument | Array<RedisCommandArgument>,
): RedisCommandArguments {
  if (value === undefined) return args;

  args.push(name);

  return pushVerdictArgument(args, value);
}

function pushVerdictArgument(
  args: RedisCommandArguments,
  value: RedisCommandArgument | Array<RedisCommandArgument>,
): RedisCommandArguments {
  if (Array.isArray(value)) {
    args.push(value.length.toString(), ...value);
  } else {
    args.push('1', value);
  }

  return args;
}

function pushSchema(args: RedisCommandArguments, schema: ICreateSearchIndexSchema): void {
  const schemaEntries = Object.entries(schema);

  for (const [field, fieldOptions] of schemaEntries) {
    args.push(field);

    if (typeof fieldOptions === 'string') {
      args.push(fieldOptions);
      continue;
    }

    if (fieldOptions.AS) {
      args.push('AS', fieldOptions.AS);
    }

    args.push(fieldOptions.type);

    switch (fieldOptions.type) {
      case SchemaFieldTypesEnum.TEXT:
        pushTextFieldSchema(args, fieldOptions);
        break;
      case SchemaFieldTypesEnum.TAG:
        pushTagFieldSchema(args, fieldOptions);
        break;
    }

    if (fieldOptions.SORTABLE) {
      args.push('SORTABLE');

      if (fieldOptions.SORTABLE === 'UNF') {
        args.push('UNF');
      }
    }

    if (fieldOptions.NOINDEX) {
      args.push('NOINDEX');
    }
  }
}

function pushTextFieldSchema(
  args: RedisCommandArguments,
  fieldOptions: CreateSchemaTextField,
): void {
  // @ts-expect-error typescript bug
  if (fieldOptions.NOSTEM) {
    args.push('NOSTEM');
  }

  // @ts-expect-error typescript bug
  if (fieldOptions.WEIGHT) {
    // @ts-expect-error typescript bug
    args.push('WEIGHT', fieldOptions.WEIGHT.toString());
  }

  // @ts-expect-error typescript bug
  if (fieldOptions.PHONETIC) {
    // @ts-expect-error typescript bug
    args.push('PHONETIC', fieldOptions.PHONETIC);
  }
}

function pushTagFieldSchema(
  args: RedisCommandArguments,
  fieldOptions: CreateSchemaTagField,
): void {
  // @ts-expect-error typescript bug
  if (fieldOptions.SEPARATOR) {
    // @ts-expect-error typescript bug
    args.push('SEPARATOR', fieldOptions.SEPARATOR);
  }

  // @ts-expect-error typescript bug
  if (fieldOptions.CASESENSITIVE) {
    args.push('CASESENSITIVE');
  }
}

export type RedisCommandArgument = string | Buffer;

export type RedisCommandArguments = Array<RedisCommandArgument> & { preserve?: unknown };

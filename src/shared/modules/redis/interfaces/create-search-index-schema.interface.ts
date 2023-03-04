export interface ICreateSearchIndexSchema {
  [field: string]: SchemaFieldOptsType;
}

export type SchemaFieldOptsType =
  | CreateSchemaTextField
  | CreateSchemaNumericField
  | CreateSchemaGeoField
  | CreateSchemaTagField;

export enum SchemaFieldTypesEnum {
  TEXT = 'TEXT',
  NUMERIC = 'NUMERIC',
  GEO = 'GEO',
  TAG = 'TAG',
}

export enum SchemaTextFieldPhoneticsEnum {
  DM_EN = 'dm:en',
  DM_FR = 'dm:fr',
  FM_PT = 'dm:pt',
  DM_ES = 'dm:es',
}

export type CreateSchemaTextField = CreateSchemaField<
  SchemaFieldTypesEnum.TEXT,
  {
    NOSTEM?: true;
    WEIGHT?: number;
    PHONETIC?: SchemaTextFieldPhoneticsEnum;
  }
>;
export type CreateSchemaNumericField = CreateSchemaField<SchemaFieldTypesEnum.NUMERIC>;
export type CreateSchemaGeoField = CreateSchemaField<SchemaFieldTypesEnum.GEO>;
export type CreateSchemaTagField = CreateSchemaField<
  SchemaFieldTypesEnum.TAG,
  {
    SEPARATOR?: string;
    CASESENSITIVE?: true;
  }
>;

export type CreateSchemaField<
  T extends SchemaFieldTypesEnum,
  E = Record<string, never>,
> =
  | T
  | ({
      type: T;
      AS?: string;
      SORTABLE?: true | 'UNF';
      NOINDEX?: true;
    } & E);

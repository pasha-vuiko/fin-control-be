import { SQL, sql } from 'drizzle-orm';

export function dateToSqlTimestamp(date: Date): SQL<unknown> {
  return sql`${date}::timestamp`;
}

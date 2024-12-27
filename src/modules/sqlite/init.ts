import { sqliteExec } from "./index";

export async function createSqliteTable(tableName: string, dataRows: string[]) {
  try {
    await sqliteExec(
      `CREATE TABLE IF NOT EXISTS ${tableName} (${dataRows.join(",\n")})`
    );
  } catch (err) {
    throw err;
  }
}

createSqliteTable("event_bans", [
  "userId TEXT NOT NULL",
  "reason TEXT NOT NULL",
  "endsAt BIGINT NOT NULL",
  "bannedBy TEXT NOT NULL",
]);

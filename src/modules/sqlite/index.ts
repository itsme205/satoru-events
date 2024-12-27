import path from "path";
import sqlite3 from "sqlite3";
import fs from "fs";

export function openDatabase() {
  const dbPath = path.join(
    process.cwd(),
    process.env.MODE === "dev" ? "/tmp/dev.database.db" : "/tmp/database.db"
  );
  console.log(`Opening database by path: ${dbPath}`);
  if (!fs.existsSync(path.join(process.cwd(), "/tmp/"))) {
    fs.mkdirSync(path.join(process.cwd(), "/tmp/"), { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "");
  }
  return new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
}
export function sqliteExec(query: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const db = openDatabase();
    db.exec(query, (err: Error | null) => {
      if (err) return reject(err);

      resolve(true);
    });
  });
}
export function sqliteGet<T>(query: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const db = openDatabase();
    db.get(query, (err: Error | null, res: T) => {
      if (err) return reject(err);

      resolve(res);
    });
  });
}
export function sqliteAll<T>(query: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const db = openDatabase();
    db.all(query, (err: Error | null, res: T) => {
      if (err) return reject(err);

      resolve(res);
    });
  });
}

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDb = async (dbFile: string) => {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  return db;
};

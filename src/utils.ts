import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

export const readFileToJSON = async <T>(path: string): Promise<T> => {
  return JSON.parse(await readFile(path, { encoding: "utf-8" }));
};

export const writeJSONToFile = async (path: string, obj: any) => {
  await writeFile(path, JSON.stringify(obj));
};

export function safeMkdir(filePath: string) {
  if (existsSync(filePath)) {
    return;
  }
  mkdirSync(filePath, { recursive: true });
}

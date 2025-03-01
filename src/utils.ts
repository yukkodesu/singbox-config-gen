import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";


export const readFileToJSON = async<T>(path: string): Promise<T> => {
    return JSON.parse(await readFile(path, { encoding: 'utf-8' }));
}

export const writeJSONToFile = async (path: string, obj: any) => {
    await writeFile(path, JSON.stringify(obj));
}

export function safeMkdir(filePath: string) {
    const dirname = path.dirname(filePath);
    if (existsSync(dirname)) {
      return;
    }
    mkdirSync(dirname, { recursive: true });
  }
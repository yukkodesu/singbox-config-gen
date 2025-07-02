import { existsSync, mkdirSync } from "node:fs";
import { readFileSync, writeFileSync } from "node:fs";

export const readFileToJSON = (path) => {
  return JSON.parse(readFileSync(path, { encoding: "utf-8" }));
};

export const writeJSONToFile = (path, obj) => {
  writeFileSync(path, JSON.stringify(obj));
};

export function safeMkdir(filePath) {
  if (existsSync(filePath)) {
    return;
  }
  mkdirSync(filePath, { recursive: true });
}

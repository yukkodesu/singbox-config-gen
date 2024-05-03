import { readFile, writeFile } from "fs/promises";


export const readFileToJSON = async<T>(path: string): Promise<T> => {
    return JSON.parse(await readFile(path, { encoding: 'utf-8' }));
}

export const writeJSONToFile = async (path: string, obj: any) => {
    await writeFile(path, JSON.stringify(obj));
}
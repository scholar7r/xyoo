import { readFileSync } from "node:fs";

export const packageReader = {
  readVersion: (): string => {
    const packageJson = readPackageJson();
    return packageJson.version;
  },
};

const readPackageJson = () => {
  return JSON.parse(readFileSync("package.json", "utf-8"));
};

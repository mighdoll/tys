import { promises as fs } from "fs";
import ts from "typescript";

export async function findImports(path: string): Promise<Set<string>> {
  const src = await fs.readFile(path, { encoding: "utf8" });
  
  const srcFile = ts.createSourceFile(path, src, ts.ScriptTarget.ESNext);
  return collectImports(srcFile);
}

export function collectImports(src: ts.SourceFile) {
  const imports = new Set<string>();

  recurseCollect(src);

  function recurseCollect(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      imports.add((node.moduleSpecifier as ts.StringLiteral).text);
    }
    node.forEachChild(recurseCollect);
  }

  return imports;
}

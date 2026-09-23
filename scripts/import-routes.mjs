import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const csvPath = resolve(process.argv[2] ?? "data/verified-routes.csv");
const outputPath = resolve("data/verified-routes.json");
const source = await readFile(csvPath, "utf8");
const [headerLine, ...lines] = source.trim().split(/\r?\n/);
const headers = headerLine.split(",");
const numeric = new Set(["fastKm", "fastMinutes", "freeKm", "freeMinutes", "tollRub", "accuracyPercent"]);
const rows = lines.filter(Boolean).map((line, index) => {
  const values = line.split(",");
  if (values.length !== headers.length) throw new Error(`Строка ${index + 2}: неверное количество столбцов`);
  return Object.fromEntries(headers.map((header, column) => [header, numeric.has(header) ? Number(values[column]) : values[column]]));
});
await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Импортировано маршрутов: ${rows.length}`);

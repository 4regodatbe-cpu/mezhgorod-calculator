export type RouteCorridor = {
  id: string;
  name: string;
  special: boolean;
  specialRateEnabled: boolean;
};

const CORRIDORS: RouteCorridor[] = [
  {
    id: "m4-south",
    name: "М4 южное направление",
    special: true,
    specialRateEnabled: true,
  },
  {
    id: "crimea-bridge",
    name: "Крымский коридор",
    special: true,
    specialRateEnabled: true,
  },
];

export function resolveCorridor(from: string, to: string): RouteCorridor | null {
  const text = `${from} ${to}`.toLowerCase();

  if (/(крым|ялта|севастополь|симферополь|керч)/.test(text)) {
    return CORRIDORS.find((item) => item.id === "crimea-bridge") ?? null;
  }

  if (/(москва|краснодар|ростов|воронеж|сочи|туапсе)/.test(text)) {
    return CORRIDORS.find((item) => item.id === "m4-south") ?? null;
  }

  return null;
}

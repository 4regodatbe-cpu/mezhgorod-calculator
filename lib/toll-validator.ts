import type { Coordinate } from "@/lib/tolls";

export type TollValidation = {
  status: "toll" | "free" | "unknown";
  source: "Valhalla map matching";
  tollEdgeCount: number;
  checkedEdgeCount: number;
  wayIds: string[];
  roadNames: string[];
  message: string;
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
};

const MAX_TRACE_POINTS = 1200;

function sampleRoute(route: Coordinate[]) {
  if (route.length <= MAX_TRACE_POINTS) return route;
  const step = (route.length - 1) / (MAX_TRACE_POINTS - 1);
  const sampled: Coordinate[] = [];
  for (let index = 0; index < MAX_TRACE_POINTS; index += 1) {
    sampled.push(route[Math.min(route.length - 1, Math.round(index * step))]);
  }
  sampled[sampled.length - 1] = route[route.length - 1];
  return sampled;
}

function unknown(message: string): TollValidation {
  return {
    status: "unknown",
    source: "Valhalla map matching",
    tollEdgeCount: 0,
    checkedEdgeCount: 0,
    wayIds: [],
    roadNames: [],
    message,
  };
}

export async function validateTollEdges(route: Coordinate[]): Promise<TollValidation> {
  if (route.length < 3) return unknown("Недостаточно геометрии для проверки платных дорог");

  const shape = sampleRoute(route).map(([lon, lat]) => ({ lat, lon }));
  try {
    const response = await fetch("https://valhalla1.openstreetmap.de/trace_attributes", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MezhgorodCalc/2.0",
      },
      body: JSON.stringify({
        shape,
        costing: "auto",
        shape_match: "walk_or_snap",
        trace_options: {
          search_radius: 60,
          gps_accuracy: 10,
          breakage_distance: 5000,
          interpolation_distance: 250,
        },
        filters: {
          action: "include",
          attributes: ["edge.toll", "edge.way_id", "edge.names", "edge.length"],
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) return unknown(`Map matching недоступен (${response.status})`);
    const data = (await response.json()) as { edges?: TraceEdge[] };
    const edges = data.edges ?? [];
    if (edges.length === 0) return unknown("Map matching не вернул дорожные рёбра");

    const tollEdges = edges.filter((edge) => edge.toll === true);
    const wayIds = [...new Set(tollEdges.map((edge) => edge.way_id).filter((value): value is string | number => value !== undefined).map(String))];
    const roadNames = [...new Set(tollEdges.flatMap((edge) => edge.names ?? []).filter(Boolean))].slice(0, 12);

    if (tollEdges.length > 0) {
      return {
        status: "toll",
        source: "Valhalla map matching",
        tollEdgeCount: tollEdges.length,
        checkedEdgeCount: edges.length,
        wayIds,
        roadNames,
        message: `Подтверждены платные дорожные рёбра: ${tollEdges.length}`,
      };
    }

    return {
      status: "free",
      source: "Valhalla map matching",
      tollEdgeCount: 0,
      checkedEdgeCount: edges.length,
      wayIds: [],
      roadNames: [],
      message: "Платные дорожные рёбра не обнаружены",
    };
  } catch {
    return unknown("Не удалось выполнить независимую проверку платных дорог");
  }
}

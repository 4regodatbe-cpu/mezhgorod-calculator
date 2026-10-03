import type { Coordinate } from "@/lib/tolls";

const REQUEST_TIMEOUT_MS = 4_500;
const RETRY_DELAY_MS = 300;

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: {
    type?: string;
    node_id?: string | number;
  };
};

type LocalTraceResult =
  | { ok: true; edges: TraceEdge[] }
  | { ok: false; message: string };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryableStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export async function localTrace(window: Coordinate[], deadlineAt: number): Promise<LocalTraceResult> {
  if (window.length < 2) return { ok: false, message: "Недостаточно точек в локальном окне" };
  const shape = window.map(([lon, lat]) => ({ lat, lon }));
  let lastMessage = "Локальный map matching не выполнен";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs < 800) return { ok: false, message: "Исчерпан общий бюджет локальной проверки" };
    const timeoutMs = Math.max(700, Math.min(REQUEST_TIMEOUT_MS, remainingMs - 100));

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
            search_radius: 45,
            gps_accuracy: 8,
            breakage_distance: 1500,
            interpolation_distance: 50,
          },
          filters: {
            action: "include",
            attributes: [
              "edge.toll",
              "edge.way_id",
              "edge.names",
              "edge.begin_shape_index",
              "edge.end_shape_index",
              "edge.end_osm_node_id",
              "node.type",
            ],
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) {
        const data = (await response.json()) as { edges?: TraceEdge[] };
        const edges = data.edges ?? [];
        return edges.length > 0
          ? { ok: true, edges }
          : { ok: false, message: "Valhalla не вернула дорожные рёбра локального окна" };
      }

      const details = await response.text().catch(() => "");
      lastMessage = `HTTP ${response.status}${details ? ` — ${details.slice(0, 100)}` : ""}`;
      if (!retryableStatus(response.status)) return { ok: false, message: lastMessage };
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "неизвестная ошибка map matching";
    }

    if (attempt < 2) {
      const remainingAfterAttempt = deadlineAt - Date.now();
      if (remainingAfterAttempt <= RETRY_DELAY_MS + 800) break;
      await delay(RETRY_DELAY_MS);
    }
  }

  return { ok: false, message: lastMessage };
}

export type PlazaNodeVerification = "exact_name" | "operator_local" | "spatial_local";

export type M4PlazaAnchor = {
  lat: number;
  lon: number;
};

export type M4PlazaNodeGroup = {
  km: number;
  model: "open" | "mixed_entry_exit";
  nodeIds: string[];
  anchors: M4PlazaAnchor[];
  verification: PlazaNodeVerification;
  source: string;
  notes?: string;
};

// OSM toll-booth nodes collected on 2026-09-29 and matched to the official
// M-4 plaza kilometre list. Named matches are strongest. operator_local and
// spatial_local entries are deliberately marked weaker so the pricing engine
// can downgrade confidence instead of pretending all evidence is equivalent.
//
// anchors are compact centroids of the actual OSM toll-booth lane-node clusters
// from the saved inventory artifacts. They are used only to select a very small
// local route window for exact map matching; proximity to an anchor is never by
// itself accepted as proof that the vehicle crossed the plaza.
//
// Inventory evidence:
// - broad run 36578045258 / artifact 11039640524
// - targeted missing-PVP run 36580563274 / artifact 11039003614
// Official road/plaza evidence: Avtodor tariff and PVP documentation.
export const M4_PLAZA_NODES: readonly M4PlazaNodeGroup[] = [
  { km: 62, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["1755090321", "4598844673"], anchors: [{ lat: 55.2371124, lon: 37.8690811 }] },
  {
    km: 71,
    model: "open",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: [
      "285903913", "3036681110", "3036681112", "5051960274", "5051960276", "5051960280",
      "5051960284", "5051960288", "5051960290", "5051960294", "5051960295", "5051960296",
      "5051960316", "5052113768", "5052113770", "5052113773", "5052113775", "5052113777",
      "5052113783", "5052113786", "5052113789", "5052113792", "5052113796", "5052113798",
      "5052113800", "5052114048", "5052114054",
    ],
    anchors: [{ lat: 55.168275, lon: 37.9192476 }],
  },
  { km: 133, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4341143825", "4341143826"], anchors: [{ lat: 54.6943347, lon: 38.1612887 }] },
  {
    km: 228,
    model: "open",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: [
      "3598939354", "3598939357", "3598939358", "3598939361", "5061776819", "5061777323",
      "5061777327", "5061777330", "5061777334", "5061777337", "5061777340", "5061777348",
      "5061777353", "5061777358", "5061777363", "5061777367", "5061777372", "5061777377",
    ],
    anchors: [{ lat: 53.8781858, lon: 38.0485069 }],
  },
  { km: 322, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["2431427636", "2486362587"], anchors: [{ lat: 53.0883649, lon: 38.1696209 }] },
  { km: 339, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["3598837929", "3598837930"], anchors: [{ lat: 52.9310917, lon: 38.2146556 }] },
  { km: 355, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["3974833666"], anchors: [{ lat: 52.7980213, lon: 38.3147948 }], notes: "Alternative plaza in the same 322–401 km official corridor as PVP 339; do not blindly charge both." },

  {
    km: 416,
    model: "mixed_entry_exit",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: ["1051218389", "1051218390", "2401530844", "2401530849", "3717382716", "3717382717", "3717382718", "3717382719", "3717382720", "3717382721", "3717382722", "3717382723"],
    anchors: [{ lat: 52.4301461, lon: 38.8246217 }],
  },
  {
    km: 460,
    model: "mixed_entry_exit",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: ["75724804", "1051205779", "1131284396", "1419001745", "3598837549"],
    anchors: [
      { lat: 52.1256165, lon: 39.1951885 },
      { lat: 52.5455982, lon: 38.719846 },
    ],
    notes: "OSM contains two separate geographic clusters carrying the 460-km name. Keep both as independent local candidates; never average them into one synthetic location and treat only as mixed-zone evidence until entry/exit semantics are resolved.",
  },

  {
    km: 515,
    model: "open",
    verification: "operator_local",
    source: "Valhalla traversal + OSM named/operator nodes + Avtodor",
    nodeIds: ["3257030196", "3200592308"],
    anchors: [{ lat: 51.6630021, lon: 39.3022825 }],
    notes: "Both travel directions confirmed by live Valhalla traversal. Node 3257030196 is explicitly named 'ПВП 515 км'; node 3200592308 is the opposite-direction Autodor toll-booth in the same physical plaza cluster. Replaces the earlier false candidate 1866127574.",
  },
  {
    km: 545,
    model: "open",
    verification: "exact_name",
    source: "OSM name/operator + Avtodor",
    nodeIds: ["365274796", "3504914294", "3842564088", "5818209495", "6594393968", "9620416636"],
    anchors: [{ lat: 51.4714111, lon: 39.5541326 }],
    notes: "One physical plaza serves two official tariff rows (517–544 and 545–589); crossing the plaza alone is not enough to decide whether one or both rows apply.",
  },
  { km: 620, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4315323077", "9620404676"], anchors: [{ lat: 50.8669886, lon: 39.9759746 }] },
  { km: 636, model: "mixed_entry_exit", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["7678126300", "7678126301"], anchors: [{ lat: 50.7508082, lon: 40.0473803 }] },
  { km: 672, model: "mixed_entry_exit", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4095706656", "8322153699"], anchors: [{ lat: 50.4514765, lon: 40.1671116 }] },
  {
    km: 803,
    model: "open",
    verification: "spatial_local",
    source: "targeted OSM local query + official Avtodor 741–803/PVP 803 evidence",
    nodeIds: ["75715767", "11838757138"],
    anchors: [{ lat: 49.3731618, lon: 40.6005796 }],
    notes: "Unnamed paired toll-booth nodes found in a narrow PVP-803 target box; retain reduced confidence until an explicit name/operator tag or route-event match confirms them.",
  },
  {
    km: 911,
    model: "open",
    verification: "spatial_local",
    source: "targeted OSM local query + official Avtodor PVP 911 evidence",
    nodeIds: ["11838466120", "11838466121"],
    anchors: [{ lat: 48.4813922, lon: 40.3408998 }],
    notes: "Unnamed paired toll-booth nodes in the narrow official 911-km target zone.",
  },
  {
    km: 1046,
    model: "open",
    verification: "operator_local",
    source: "targeted OSM operator-labelled local query + official Avtodor PVP 1046 evidence",
    nodeIds: ["11295106601", "11295106602"],
    anchors: [{ lat: 47.345636, lon: 39.9501803 }],
    notes: "Nodes are labelled Autodor-Platnye Dorogi but not with the kilometre number; official documentation independently confirms PVP 1046 in this corridor.",
  },
  { km: 1093, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["5325424715", "5325424716"], anchors: [{ lat: 47.0131923, lon: 39.7339706 }] },
  { km: 1184, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["6594273708", "9620386263"], anchors: [{ lat: 46.2304494, lon: 39.831531 }] },
  { km: 1223, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["9772717210", "9772717211"], anchors: [{ lat: 45.9156659, lon: 39.710038 }] },
] as const;

export const M4_NODE_TO_PLAZA = new Map<string, M4PlazaNodeGroup>(
  M4_PLAZA_NODES.flatMap((plaza) => plaza.nodeIds.map((nodeId) => [nodeId, plaza] as const)),
);

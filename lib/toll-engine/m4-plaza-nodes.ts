export type PlazaNodeVerification = "exact_name" | "operator_local" | "spatial_local";

export type M4PlazaNodeGroup = {
  km: number;
  model: "open" | "mixed_entry_exit";
  nodeIds: string[];
  verification: PlazaNodeVerification;
  source: string;
  notes?: string;
};

// OSM toll-booth nodes collected on 2026-09-29 and matched to the official
// M-4 plaza kilometre list. Named matches are strongest. operator_local and
// spatial_local entries are deliberately marked weaker so the pricing engine
// can downgrade confidence instead of pretending all evidence is equivalent.
//
// Inventory evidence:
// - broad run 36578045258 / artifact 11039640524
// - targeted missing-PVP run 36580563274 / artifact 11039003614
// Official road/plaza evidence: Avtodor tariff and PVP documentation.
export const M4_PLAZA_NODES: readonly M4PlazaNodeGroup[] = [
  { km: 62, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["1755090321", "4598844673"] },
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
  },
  { km: 133, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4341143825", "4341143826"] },
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
  },
  { km: 322, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["2431427636", "2486362587"] },
  { km: 339, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["3598837929", "3598837930"] },
  { km: 355, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["3974833666"], notes: "Alternative plaza in the same 322–401 km official corridor as PVP 339; do not blindly charge both." },

  {
    km: 416,
    model: "mixed_entry_exit",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: ["1051218389", "1051218390", "2401530844", "2401530849", "3717382716", "3717382717", "3717382718", "3717382719", "3717382720", "3717382721", "3717382722", "3717382723"],
  },
  {
    km: 460,
    model: "mixed_entry_exit",
    verification: "exact_name",
    source: "OSM name + Avtodor",
    nodeIds: ["75724804", "1051205779", "1131284396", "1419001745", "3598837549"],
    notes: "OSM contains more than one geographic cluster carrying the 460-km name. Treat only as mixed-zone evidence until entry/exit semantics are resolved.",
  },

  {
    km: 515,
    model: "open",
    verification: "spatial_local",
    source: "targeted OSM local query + official Avtodor 515-km location",
    nodeIds: ["1866127574"],
    notes: "The other local barrier node was explicitly a paid beach entrance and was excluded. This remaining unnamed road toll-booth stays lower-confidence until independently named/matched.",
  },
  {
    km: 545,
    model: "open",
    verification: "exact_name",
    source: "OSM name/operator + Avtodor",
    nodeIds: ["365274796", "3504914294", "3842564088", "5818209495", "6594393968", "9620416636"],
    notes: "One physical plaza serves two official tariff rows (517–544 and 545–589); crossing the plaza alone is not enough to decide whether one or both rows apply.",
  },
  { km: 620, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4315323077", "9620404676"] },
  { km: 636, model: "mixed_entry_exit", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["7678126300", "7678126301"] },
  { km: 672, model: "mixed_entry_exit", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["4095706656", "8322153699"] },
  {
    km: 803,
    model: "open",
    verification: "spatial_local",
    source: "targeted OSM local query + official Avtodor 741–803/PVP 803 evidence",
    nodeIds: ["75715767", "11838757138"],
    notes: "Unnamed paired toll-booth nodes found in a narrow PVP-803 target box; retain reduced confidence until an explicit name/operator tag or route-event match confirms them.",
  },
  {
    km: 911,
    model: "open",
    verification: "spatial_local",
    source: "targeted OSM local query + official Avtodor PVP 911 evidence",
    nodeIds: ["11838466120", "11838466121"],
    notes: "Unnamed paired toll-booth nodes in the narrow official 911-km target zone.",
  },
  {
    km: 1046,
    model: "open",
    verification: "operator_local",
    source: "targeted OSM operator-labelled local query + official Avtodor PVP 1046 evidence",
    nodeIds: ["11295106601", "11295106602"],
    notes: "Nodes are labelled Autodor-Platnye Dorogi but not with the kilometre number; official documentation independently confirms PVP 1046 in this corridor.",
  },
  { km: 1093, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["5325424715", "5325424716"] },
  { km: 1184, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["6594273708", "9620386263"] },
  { km: 1223, model: "open", verification: "exact_name", source: "OSM name + Avtodor", nodeIds: ["9772717210", "9772717211"] },
] as const;

export const M4_NODE_TO_PLAZA = new Map<string, M4PlazaNodeGroup>(
  M4_PLAZA_NODES.flatMap((plaza) => plaza.nodeIds.map((nodeId) => [nodeId, plaza] as const)),
);

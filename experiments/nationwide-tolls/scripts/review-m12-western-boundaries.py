"""Check only the new fixed primary batch; no routing, quotes or network."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

CHECKS = Path("experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries")
RAW = Path("experiments/nationwide-tolls/source-snapshots/m12/2026-10-18-western-boundaries")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write(name, value):
    target = CHECKS / name
    temporary = target.with_suffix(target.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(target)


plan = json.loads((CHECKS / "inputs.json").read_text())
for filename, expected in plan["sourceHashes"].items():
    assert digest(Path(filename).read_bytes()) == expected, filename
records = [json.loads(p.read_text()) for p in RAW.glob("*.metadata.json")
           if json.loads(p.read_text()).get("url") in plan["primaryUrls"]]
assert len(records) == 9
assert {r["url"] for r in records} == set(plan["primaryUrls"])
nodes, ways, hashes = {}, {}, []
for record in records:
    assert record["status"] == 200 and not record.get("error"), record["url"]
    content = (RAW / record["bodyFile"]).read_bytes()
    assert digest(content) == record["sha256"], record["bodyFile"]
    hashes.append({"path": str(RAW / record["bodyFile"]), "sha256": record["sha256"]})
    for obj in ET.fromstring(content):
        if obj.tag not in ("node", "way"):
            continue
        tags = {t.attrib["k"]: t.attrib["v"] for t in obj.findall("tag")}
        if obj.tag == "node":
            nodes[obj.attrib["id"]] = {"coordinate": [float(obj.attrib["lon"]), float(obj.attrib["lat"])], "tags": tags}
        else:
            ways[obj.attrib["id"]] = {"tags": tags, "nodes": [n.attrib["ref"] for n in obj.findall("nd")]}

scope = Path("experiments/nationwide-tolls/checks/2026-10-17-selected-osrm-m12-ckad-scope/cases")
saved = [json.loads((scope / f"{case}.json").read_text()) for case in plan["caseIds"]]
gantries = []
for expected in saved[0]["m12ProviderEvidence"]["westernGantryCandidates"]:
    node = nodes[expected["nodeId"]]
    assert node["tags"].get("highway") == "toll_gantry"
    assert max(abs(a - b) for a, b in zip(node["coordinate"], expected["coordinate"])) < 1e-7
    identifiers = {k: v for k, v in node["tags"].items() if k in ("ref", "name", "operator", "distance", "kilometre", "milestone")}
    gantries.append({"nodeId": expected["nodeId"], **node, "operatorIdentityFields": identifiers,
                    "physicalLocationVerified": True, "operatorMarkerBindingProven": False})
assert len(gantries) == 3

targets = [
    (plan["caseIds"][0], ["1550135076", "1550561305", "1206479738"], ["14102954884", "10090995838"], "22Н-0239", "arzamas_p158", 2952),
    (plan["caseIds"][1], ["972809728", "972809720", "292501171"], ["10026978937", "14216395535"], "М-7", "vladimir", 1239),
]
cases = []
for case_id, chain, junctions, road_ref, candidate, rub in targets:
    assert ways[chain[0]]["tags"]["ref"] == "М-12"
    assert ways[chain[0]]["tags"]["toll"] == "yes"
    assert ways[chain[2]]["tags"]["ref"] == road_ref
    for first, second, junction in zip(chain, chain[1:], junctions):
        assert set(ways[first]["nodes"]) & set(ways[second]["nodes"]) == {junction}
    # Trace transitions were already audited; only tie these exact primary
    # links to their previously saved event identities, not re-price the trip.
    source = next(c for c in saved if c["caseId"] == case_id)
    event = source["traceTransitions"][-1]["edges"]
    assert all(w in [e["wayId"] for e in event] for w in chain)
    result = {"caseId": case_id, "causeReviewStatus": "blocked_by_missing_reliable_data",
              "primaryExitWayIds": chain, "sharedJunctionNodeIds": junctions,
              "physicalExitChainVerified": True, "exitRoadRef": road_ref,
              "candidateOperatorPoint": candidate, "unappliedCandidateRub": rub,
              "operatorPointBindingProven": False, "existingSubtotalRub": 5475,
              "fullTripRub": None, "newPricedComponents": 0, "confirmedFullTripFares": 0,
              "missing": "Official coordinate/object-to-operator charged-boundary crosswalk; gantry identity tags absent; exit relation to tariff point not established"}
    write(f"{case_id}.json", result)
    cases.append(result)
    write("progress.json", {"status": "IN_PROGRESS", "checkedCases": len(cases), "plannedCases": 2})

write("physical-proof.json", {"status": "PASS_PHYSICAL_ONLY", "gantries": gantries,
                             "cases": cases, "rawHashes": hashes,
                             "warning": "OSM topology and matching coordinates do not establish operator tariff identities."})
write("progress.json", {"status": "DONE_REVIEW_BLOCKED_PRICING", "checkedCases": 2,
                        "plannedCases": 2, "rawHashesChecked": 9, "frozenSourcesChecked": 8,
                        "newPricedComponents": 0, "confirmedFullTripFares": 0})
print(json.dumps({"physicalNodes": 3, "exitChains": 2, "rawHashes": 9, "frozenSources": 8,
                  "operatorBindingsProven": 0, "newPricedComponents": 0, "status": "BLOCKED_OPERATOR_BINDING"}))

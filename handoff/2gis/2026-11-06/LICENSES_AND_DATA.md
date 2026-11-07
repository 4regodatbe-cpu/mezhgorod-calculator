# Source licensing and publication scope

- OpenStreetMap-derived geometry is redistributed with attribution to OpenStreetMap contributors under ODbL 1.0. The M-12 XML copies retain coordinates, object IDs/versions, tags and source/license metadata; contributor identity/history attributes (`user`, `uid`, `changeset`, `timestamp`) are removed. Exact original response SHA-256 values and source URLs remain in the evidence metadata for provenance.
- Official operator/ministry tariff orders and published plans are included with source URLs, effective dates, and hashes for reference and audit.
- No 2GIS raw request/response payload or API credential is included.
- The historical OSRM raw route capture is referenced by repository-relative path and SHA in `m4-pvp545/geometry/route-history-review.json`, but not copied into this handoff directory. It already exists at the same path in the designated base commit; the handoff commit does not add or redistribute another copy of it.
- The exact Stage 9 archive is included. Its internal manifest/checksums are retained.

# Experiment7 — selected paths, registration rules and evidence levels

27.10.2026; parentc0c65eb59ac3a71fa6aa828617edace5c663c66e/treee85aeb3a338ddcc6a484e1a03214e9f31cf6b037 read back. CI40505260145SUCCESS. No app integration or new routing.

## Two actual selected directions, not a reversed graph

Base `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/`:

| Capture | Existing selected trace | New bounded directional observation |
| --- | --- | --- |
|single-m12-moscow-to-arzamas/2026-10-16T01-59-35-968Z-capture.json.gz;SHA2565f4671a2236dcd45e4c49a8f6c9ca260e8f9aefaa92c9c33901c2f6535348aec |OSRM, complete |calls[5].text.edges[77:80]: M12way1550135076→node14102954884→ramp1550561305→node10090995838→22Н-0239way1206479738. Actual exit, notР-158. |
|single-m12-arzamas-to-moscow/2026-10-16T01-57-41-594Z-capture.json.gz;SHA25662f6c8398474b2df246790418b453bdad386b2758daed86605c80f55bdc5ebe2 |OSRM, complete |calls[3].text.edges[127:134]:22Н-0239ways1102734144/1102734141/1102734142→22Н-0226ways1102734143/256897416→node14102954887→ramp1550561306→node14102954886→M12way1550135078. Actual entry uses a different branch. |

These are real saved trace extracts, not two new route replays or raw OSM downloads. Forward branch already known; reciprocal branch is newly documented here. No explicitР-158named edge found in these two selected trace edge lists; absence of a name alone would not prove absence of every physical road. The positive observed chains above establish what these routes actually use. The supplied second chain remainsМ-7; none may be relabelled442Р-158.

A targeted search of saved Arzamas JSON report names yielded no explicitР-158label; this is not a claim all stored/provider-alternative geometry was exhausted. No selected442exit witness is presently established in this bounded review.

## Three western frames: physical identity reused

Retained physical-proof.json:10782165529 at38.7402523,55.8259863;11214930528 at39.2843314,55.9090383;11157985901 at40.084432,56.0659396. All have highway=toll_gantry, no operator identity fields. No frame was identified anew or assigned the nearest tariff kilometre. New operator identities0/3.

## New official free-flow source leads

[Operator rules page](https://avtodor-tr.ru/company/docs/proezd/) is readable through indexed official text; direct open403. It describes plate-based postpayment, automated transponder registration and sensors on frames. It does not publish an exact OSM-to-tariff endpoint registry. The payment account/phone flow was not used; no personal data submitted.

Two official Appendix3 URLs newly discovered in indexed text:

- https://avtodor-tr.ru/upload/iblock/89f/269hzj8rmnm31p5zsj5vhtwqde4kzun2.pdf
- https://avtodor-tr.ru/upload/iblock/c75/ujbkoc1opcarbyhrab4ekj5hhskj1kdv.pdf

Indexed §2.1 describes passage registration at charging boundaries and construction of a journey from first to last recorded boundary when multiple are crossed. This supports investigating a **registration sequence**, not assuming one named tariff endpoint equals one separate frame or summing arbitrary frame prices. Neither identity nor absence of one-to-one correspondence for these particular three frames is thereby proved. Both originals returned403; no original page/approval-date/hash/latest-edition verification claimed. Treat indexed content as a primary-domain lead, not an admitted current monetary rule.

Need a dated accessible original/free-flow billing schema or owner reply identifying registered boundary IDs and their relation to published tariff origin/destination, including what is billed when a route leaves via22Н-0239/enters via22Н-0226 before/after a frame. A technical service road, public exit and matrix endpoint cannot be merged.

## Matrix302: only matching conditions, no PDF re-audit

Saved metadata: order30202.10.2026/effective08.10.2026, CategoryI, plate postpayment/listed issuers; endpoints includeАрзамас(Р158), not a separate22Н-0239code. Dates15/17October are after effective date, but that single condition does not prove the selected endpoint, full charged scope or no later applicable revision.1239/2952remain unapplied. An operator instruction about first/last registrations cannot itself tell which pair the three anonymous frames generate.

| Object / claim | A physical | B tariff label | C physical↔tariff | D full price |
| --- | --- | --- | --- | --- |
|Three western frames |Existing YES |Not linked |NO |NO |
|22Н-0239forward /22Н-0226reverse approaches |Observed directed paths |No separate published point established |NO |NO |
|442Р-158interchange |Officially listed; selected exact exit not proved here |Арзамас(Р158) exists |NO |NO |
|SuppliedМ-7chain |Existing YES |Владимир candidate |NO |NO |

New result: reciprocal physical approach documented and an incorrect second-chain premise rejected. NewC/D0, no functionalB07blocker closed. No real priced-positive test can be admitted; no synthetic replacement created. Focused actual-capture regression verifies the two directed chains and does not alter calculator assertions.

Next independentB05: original545products exist; seek a new directed lane/product primary source, not old failed URLs. No mass road/capture audit.

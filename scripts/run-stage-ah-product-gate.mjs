import fs from 'node:fs';
import {assessTariffProducts} from '../experiments/tariff-gate-proposal/product-gate.mjs';
import {evaluateTariffFreshness} from './check-tariff-freshness.mjs';

const asOf = process.env.TARIFF_AS_OF ?? '2026-11-07';
const registryPath = 'lib/toll-engine/tariff-registry.ts';
const evidencePath = process.env.TARIFF_PRODUCT_EVIDENCE ?? 'experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json';
const report = evaluateTariffFreshness(fs.readFileSync(registryPath, 'utf8'), asOf);
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const result = assessTariffProducts(report, evidence);
console.log(JSON.stringify({asOf, registryPath, evidencePath, ...result}, null, 2));
process.exitCode = result.exitCode;

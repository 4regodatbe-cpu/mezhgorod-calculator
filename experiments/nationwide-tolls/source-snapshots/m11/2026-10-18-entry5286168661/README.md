# Фактический въезд М11 в направлении Москвы

Три primary OSM ответа, пять направленных ways,61 ordered points совпали с собственным capture. Комплекс рядом назван «Лихославль —214км»; p214 пока candidate. Runtime и тарифы не включены.

Подробности: [checkpoint](../../../../../docs/checkpoints/2026-10-18-m11-entry5286168661-source-DONE.md), binding-proof.json, directed-entry.json. Команды из корня repo: `python experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-entry5286168661/build-proof.py`, затем `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-entry5286168661/verify-capture.mjs`. Они воспроизводят физическую проверку; operatorPointReview — отдельная запись чтения retained current control.

OSM © OpenStreetMap contributors, ODbL. Денежных данных из OSM не берём.

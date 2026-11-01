# UI-13 — контраст двойных результатов, LOCAL

01.11.2026 МСК. Base `02b0892efa4187ff371f8e98f4ddfe835d78d27c`. Для V1 fastest-only карточки передан `emphasizeDual`: раскрытый тариф имеет усиленную обводку, ring и отдельный фон, остальные — более контрастную рамку. Состояние раскрытия уже различается ChevronUp/Down и aria-expanded; hit area остаётся 48px. V2 fallback style без изменений. Result-render7/7, TS/scoped lint/diff PASS. Реальный light/dark/mobile визуальный тест NOT_RUN; full hosted gate открыт. Только local commit/bundle.

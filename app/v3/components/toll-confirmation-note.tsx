type Props = { tolls: { amount: number | null; priceConfirmation?: string; displayLabel?: string | null } };

export function TollConfirmationNote({ tolls }: Props) {
  if (tolls.amount === null || tolls.priceConfirmation !== "unconfirmed") return null;
  return <p role="note" className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-brand-text">
    Стоимость не подтверждена
  </p>;
}

/** Offline trade-off experiment. Not a safety assessment or runtime selector. */
export function compareCorridors(candidates, specialTimeWeight = 2) {
  if (!Number.isFinite(specialTimeWeight) || specialTimeWeight < 1) throw new Error('Invalid weight');
  const valid = candidates.filter(c => c.verified === true &&
    [c.seconds, c.specialSeconds, c.meters].every(Number.isFinite) &&
    c.seconds > 0 && c.specialSeconds >= 0 && c.specialSeconds <= c.seconds && c.meters > 0);
  // Comparing a verified path to a failed/missing candidate would hide uncertainty.
  if (valid.length < 2 || valid.length !== candidates.length) return {status:'insufficient-evidence', selected:null};
  // T = ordinary + special, so ordinary + weight*special = T+(weight-1)*special.
  const ranked = valid.map(c => ({...c, score:c.seconds + (specialTimeWeight-1) * c.specialSeconds}))
    .sort((a,b) => a.score-b.score || a.seconds-b.seconds || a.meters-b.meters || String(a.id).localeCompare(String(b.id)));
  const fastest = [...valid].sort((a,b)=>a.seconds-b.seconds || a.meters-b.meters)[0];
  const selected=ranked[0];
  return {status:'experimental-recommendation', selected:selected.id, specialTimeWeight,
    extraSeconds:selected.seconds-fastest.seconds, extraMeters:selected.meters-fastest.meters,
    avoidedSpecialSeconds:fastest.specialSeconds-selected.specialSeconds, ranked};
}

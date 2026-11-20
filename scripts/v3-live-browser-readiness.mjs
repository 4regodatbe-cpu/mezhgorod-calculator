/**
 * Confirms that the existing V3 React handlers are active by observing the
 * standard → dual → standard rendered-state transitions. A visible button by
 * itself is not treated as proof of hydration/readiness.
 */
export async function confirmV3ClientReady(page, {attempts = 3, transitionTimeoutMs = 750} = {}) {
  const startedAt = Date.now();
  const standardButton = page.getByRole('button', {name:'Обычный расчёт'});
  const dualButton = page.getByRole('button', {name:'Двойная тарификация'});
  const standardState = page.getByText('Тарифы', {exact:true});
  const dualState = page.getByText('Обычные тарифы', {exact:true});
  await standardState.waitFor({state:'visible',timeout:10000});

  let dualProbeAttempts = 0;
  let dualConfirmed = false;
  for (let attempt = 0; attempt < attempts; attempt++) {
    dualProbeAttempts++;
    await dualButton.click();
    try {
      await dualState.waitFor({state:'visible',timeout:transitionTimeoutMs});
      await page.getByText('Особые тарифные зоны',{exact:true}).waitFor({state:'visible',timeout:transitionTimeoutMs});
      dualConfirmed = true;
      break;
    } catch (error) {
      if (attempt === attempts - 1) throw new Error(`React dual-mode readiness probe did not render dual state after ${attempts} bounded click attempt(s): ${error.message}`);
    }
  }
  if (!dualConfirmed) throw new Error('React dual-mode readiness probe was not confirmed');

  await standardButton.click();
  await standardState.waitFor({state:'visible',timeout:transitionTimeoutMs});
  return {
    status:'READY',
    probe:'standard-to-dual-to-standard React-rendered state transition',
    dualProbeAttempts,
    standardRestored:true,
    elapsedMs:Date.now()-startedAt,
  };
}

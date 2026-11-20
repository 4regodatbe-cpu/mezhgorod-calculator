import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {confirmV3ClientReady} from './v3-live-browser-readiness.mjs';

const playwrightPath = process.env.PLAYWRIGHT_MODULE;
assert.ok(playwrightPath,'PLAYWRIGHT_MODULE is required for the delayed-hydration fixture test');
const {chromium} = await import(pathToFileURL(playwrightPath).href);

const delayedHydrationFixture = `<!doctype html><html><body>
<button type="button" id="standard">Обычный расчёт</button>
<button type="button" id="dual">Двойная тарификация</button>
<p id="mode">Тарифы</p><section id="special" hidden><span>Особые тарифные зоны</span></section>
<label><input placeholder="Откуда" aria-label="Откуда"><div role="status"></div></label>
<script>
window.__fixture={hydrated:false,mode:'standard',inputState:'',requestQuery:null,hydrate:null};
window.__fixture.hydrate=()=>{
  const input=document.querySelector('input[placeholder="Откуда"]');
  const mode=document.querySelector('#mode');
  const special=document.querySelector('#special');
  const render=()=>{mode.textContent=window.__fixture.mode==='standard'?'Тарифы':'Обычные тарифы';special.hidden=window.__fixture.mode!=='dual';};
  input.value=window.__fixture.inputState;
  document.querySelector('#dual').addEventListener('click',()=>{window.__fixture.mode='dual';render();});
  document.querySelector('#standard').addEventListener('click',()=>{window.__fixture.mode='standard';render();});
  let timer;
  input.addEventListener('input',()=>{
    window.__fixture.inputState=input.value;
    clearTimeout(timer);
    timer=setTimeout(()=>{window.__fixture.requestQuery=window.__fixture.inputState;},350);
  });
  window.__fixture.hydrated=true;
  render();
};
</script></body></html>`;

test('delayed client hydration overwrites early fill; rendered-state readiness preserves later input',async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page=await browser.newPage();
    await page.setContent(delayedHydrationFixture);
    const input=page.locator('input[placeholder="Откуда"]');
    await input.fill('Ялта');
    assert.equal(await input.inputValue(),'Ялта','early DOM fill should be visible before simulated hydration');
    await page.evaluate(()=>setTimeout(()=>window.__fixture.hydrate(),100));
    await page.waitForFunction(()=>window.__fixture.hydrated===true);
    assert.equal(await input.inputValue(),'','simulated controlled-state hydration should restore its empty initial value');

    await page.setContent(delayedHydrationFixture);
    await page.evaluate(()=>setTimeout(()=>window.__fixture.hydrate(),500));
    const readiness=await confirmV3ClientReady(page);
    assert.equal(readiness.status,'READY');
    assert.equal(readiness.standardRestored,true);
    assert.equal(await page.locator('#mode').innerText(),'Тарифы');
    await input.fill('Ялта');
    await page.waitForTimeout(400);
    assert.equal(await input.inputValue(),'Ялта');
    assert.equal(await page.evaluate(()=>window.__fixture.requestQuery),'Ялта');
  } finally {
    await browser.close();
  }
});

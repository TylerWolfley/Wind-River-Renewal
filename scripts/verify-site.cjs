// Run after inventory + build against scripts/preview.mjs --test.
// All external requests are intercepted; Formspree never receives a test lead.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.TEST_URL || 'http://127.0.0.1:43828';
const output = process.env.TEST_OUTPUT || path.resolve('../../outputs');
const results = { passes: [], failures: [], pages: [], externalRequestsBlocked: 0 };
const check = (name, value) => { results[value ? 'passes' : 'failures'].push(name); if (!value) console.log('FAIL', name); };

(async () => {
 const { pages, legacyRedirects } = await import('../src/content/generated-pages.js');
 const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
 const context = await browser.newContext();
 let responseMode = 'error', posts = [];
 await context.route('**/*', async route => {
  const req = route.request(), url = new URL(req.url());
  if (url.hostname === 'formspree.io') {
   posts.push(req.postData());
   if (responseMode === 'network') return route.abort('failed');
   if (responseMode === 'timeout') return;
   if (responseMode === 'slow') { await new Promise(r => setTimeout(r, 500)); }
   return route.fulfill({ status: responseMode === 'error' ? 422 : 200, contentType:'application/json', body: responseMode === 'invalid' ? 'not json' : JSON.stringify({ok:responseMode === 'success' || responseMode === 'slow'}) });
  }
  if (url.origin === base) return route.continue();
  results.externalRequestsBlocked++; return route.abort();
 });
 const page = await context.newPage();
 page.on('pageerror', e => results.failures.push('Browser exception: ' + e.message));
 const internal = new Set(), anchors = [];
 for (const width of [1440,375,390]) {
  await page.setViewportSize({width,height:width===1440?1000:844});
  for (const entry of pages.filter(p => !p.redirectTo)) {
   const response = await page.goto(base+entry.publicPath, {waitUntil:'networkidle'});
   check(`${width} ${entry.publicPath} HTTP`,response.status()===200);
   const audit = await page.evaluate(() => {
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{return JSON.parse(s.textContent)}catch{return null}});
    return {overflow:document.documentElement.scrollWidth>innerWidth, title:document.title, canonical:document.querySelector('link[rel=canonical]')?.href, h1:document.querySelectorAll('h1').length, schemaValid:schemas.every(Boolean), links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')), required:document.querySelectorAll('form [required]').length, hiddenVisible:[...document.querySelectorAll('input[type=hidden],input[name=_gotcha]')].some(el=>el.getBoundingClientRect().height>0), schemaCount:schemas.length};
   });
   check(`${width} ${entry.publicPath} no overflow`,!audit.overflow);
   check(`${width} ${entry.publicPath} metadata/schema/H1`,!!audit.title&&audit.canonical===entry.canonical&&audit.schemaValid&&audit.h1===1);
   check(`${width} ${entry.publicPath} hidden controls hidden`,!audit.hiddenVisible);
   if (entry.bodyHtml.includes('<form')) check(`${width} ${entry.publicPath} 4 required fields`,audit.required===4);
   if (width===1440) {
    results.pages.push({route:entry.publicPath,title:audit.title,canonical:audit.canonical,schemas:audit.schemaCount});
    for (const href of audit.links) {
     const url = new URL(href,base+entry.publicPath);
     if (url.origin===base) {internal.add(url.pathname); if(url.hash) anchors.push({path:url.pathname,hash:decodeURIComponent(url.hash.slice(1))});}
     if (url.protocol==='tel:'||url.protocol==='sms:') check(`${entry.publicPath} correct ${url.protocol}`,url.pathname.replace(/\D/g,'')==='13073494694');
    }
   }
   // Force lazy image resources to load without changing their source.
   await page.evaluate(()=>document.querySelectorAll('img').forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete),{},{timeout:15000});
   const broken = await page.evaluate(()=>[...document.images].filter(img=>!img.naturalWidth).map(img=>img.src));
   check(`${width} ${entry.publicPath} images`,broken.length===0);
   if (width<960 && await page.locator('.nav-toggle').count()) {
    for(let i=0;i<3;i++) {await page.locator('.nav-toggle').click(); check(`${width} ${entry.publicPath} menu opens ${i}`,await page.locator('.nav-toggle').getAttribute('aria-expanded')==='true'); await page.keyboard.press('Escape');}
    check(`${width} ${entry.publicPath} escape focus`,await page.locator('.nav-toggle').evaluate(el=>el===document.activeElement));
   }
  }
 }
 for(const url of internal) { const response=await context.request.get(base+url); check('Internal target '+url,response.status()===200); }
 for(const [from,to] of Object.entries(legacyRedirects)) {
  await page.goto(base+from+'?utm_source=redirect-test#main');
  await page.waitForURL(base+to+'?utm_source=redirect-test#main');
  check('Legacy redirect '+from,page.url()===base+to+'?utm_source=redirect-test#main');
 }
 for(const {path:route,hash} of anchors) {
  await page.goto(base+route); check('Anchor '+route+'#'+hash,await page.locator(`[id="${hash}"]`).count()>0);
 }
 const sitemap=await (await context.request.get(base+'/sitemap.xml')).text();
 check('Sitemap contains all intended routes',pages.filter(p=>p.includeInSitemap).every(p=>sitemap.includes(p.publicPath==='/'?'https://windriverrenewal.com':p.canonical)));
 check('Sitemap excludes thanks and alias',!sitemap.includes('/thanks/')&&!sitemap.includes('/locations/casper/'));
 check('Robots references sitemap',(await (await context.request.get(base+'/robots.txt')).text()).includes('https://windriverrenewal.com/sitemap.xml'));

 for(const width of [1440,375,390]) {
  await page.setViewportSize({width,height:width===1440?1000:844});
  for(const route of ['/quote/','/junk-removal-riverton/','/junk-removal-lander/','/junk-removal-casper/','/junk-removal-dubois-wy/']) {
   await page.goto(base+route+'?utm_source=safe-test',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>window.wrrInitialized);
   await page.evaluate(()=>{window.testEvents=[];window.gtag=(...args)=>window.testEvents.push(args)});
   const submit = page.locator('.quote-form button[type=submit]'); const count=posts.length;
   await submit.click(); check(`${width} ${route} empty blocked`,posts.length===count);
   await page.locator('#q-name').fill('Local test only'); await page.locator('#q-contact').fill('bad'); await page.locator('#q-location').fill('Riverton'); await page.locator('#q-description').fill('Test property cleanout. Do not send.');
   await submit.click(); check(`${width} ${route} invalid contact blocked`,posts.length===count);
   await page.locator('#q-contact').fill(width===375?'307-555-0100':'preview@example.invalid');
   await page.locator('.quote-details summary').focus(); await page.keyboard.press('Enter');
   check(`${width} ${route} optional keyboard toggle`,await page.locator('.quote-details').getAttribute('open')!==null);
   await page.locator('#q-access').fill('One flight of stairs'); await page.locator('.quote-details summary').click();
   responseMode='error'; await submit.click(); await page.waitForFunction(()=>document.querySelector('.form-status').classList.contains('error'));
   check(`${width} ${route} failure retains input and re-enables`,await submit.isEnabled()&&await page.locator('#q-name').inputValue()==='Local test only');
   check(`${width} ${route} no false lead`,await page.evaluate(()=>window.testEvents.filter(e=>e[1]==='generate_lead').length)===0);
   responseMode='slow'; const before=posts.length; await submit.click(); await page.locator('.quote-form').evaluate(el=>{el.requestSubmit();el.requestSubmit()});
   await page.waitForFunction(()=>document.querySelector('.form-status').textContent.startsWith('Your request was sent.'));
   check(`${width} ${route} confirmed success and duplicate prevention`,posts.length===before+1&&await submit.isDisabled());
   check(`${width} ${route} one lead after success`,await page.evaluate(()=>window.testEvents.filter(e=>e[1]==='generate_lead').length)===1);
   check(`${width} ${route} UTM and optional notes submitted`,posts.at(-1).includes('safe-test')&&posts.at(-1).includes('One flight of stairs'));
  }
 }
 for(const mode of ['network','invalid','false','timeout']) {
  await page.goto(base+'/quote/',{waitUntil:'networkidle'});
  await page.locator('#q-name').fill('Local test'); await page.locator('#q-contact').fill('preview@example.invalid'); await page.locator('#q-location').fill('Riverton'); await page.locator('#q-description').fill('Test only');
  responseMode=mode; await page.locator('.quote-form button').click();
  await page.waitForFunction(()=>document.querySelector('.form-status').classList.contains('error'),{},{timeout:35000});
  check(mode+' response does not fake success',await page.locator('.quote-form button').isEnabled());
 }
 await page.goto(base+'/quote/',{waitUntil:'networkidle'});
 check('Photos offered by text, not unsupported upload',await page.locator('#q-photos').count()===0 && await page.locator('a[href="sms:+13073494694"]').count()>0);
 await page.goto(base+'/gallery/',{waitUntil:'networkidle'});
 check('Gallery has no carousel',await page.locator('[aria-roledescription="carousel"]').count()===0);
 check('Gallery preserves eleven job photos',await page.locator('.photo-grid figure').count()===11);
 check('All gallery photos visible without a disclosure',await page.locator('.photo-grid figure:visible').count()===11 && await page.locator('.more-photos').count()===0);
 check('Garage gallery location neutral',!(await page.locator('.photo-grid figure').first().innerText()).match(/Riverton|Natrona|Casper/));
 await page.goto(base+'/?utm_source=property-review',{waitUntil:'networkidle'});
 await page.getByRole('link',{name:'Request a property cleanout',exact:true}).click();
 await page.waitForURL(base+'/quote/?utm_source=property-review#property-job');
 check('Property lead path preserves UTM and reaches the simple form',await page.locator('#property-job .quote-form').count()===1 && await page.locator('.quote-form [required]').count()===4);
 check('Property guidance leaves service selection optional',await page.locator('#q-service').getAttribute('required')===null && await page.locator('#q-service').inputValue()==='');
 for(const width of [1440,375,390]) {
  await page.setViewportSize({width,height:width===1440?1000:844});
  for(const route of ['/','/quote/','/services/','/gallery/','/junk-removal-casper/']) {
   await page.goto(base+route,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.querySelectorAll('img').forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>[...document.images].every(img=>img.complete));
   const name=route==='/'?'home':route.split('/')[1];
   await page.screenshot({path:path.join(output,`${name}-${width===1440?'desktop':'mobile-'+width}.png`),fullPage:true});
   if(route==='/') await page.screenshot({path:path.join(output,`home-${width}-viewport.png`)});
  }
 }
 results.mockSubmissions=posts.length;
 fs.writeFileSync(path.join(output,'verification-results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({passes:results.passes.length,failures:results.failures,blockedExternalRequests:results.externalRequestsBlocked,mockSubmissions:posts.length},null,2));
 await browser.close();
 process.exitCode=results.failures.length?1:0;
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(output,'verification-results.json'),JSON.stringify({...results,fatal:error.message},null,2));process.exit(1)});

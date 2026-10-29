// Run with playwright + esbuild available on NODE_PATH (no application dependency required).
// Exercises the actual IdentifyApp, upload card, crop modal, guide and zoom slider in Chromium.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require('playwright');
const esbuild = require('esbuild');
const { compile } = require('@tailwindcss/node');
const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'coinzy-crop-'));
const stub = `import React from 'react';
export const useRouter = () => ({push() {}});
export const IdentifyAnalysing = () => null, IdentifyFailure = () => null, IdentifyMatchList = () => null,
IdentifySideRail = () => null, IdentifyToast = () => null, IdentifyDebugBar = () => null,
IdentifyCameraBlockedModal = () => null, IdentifyCameraModal = () => null, IdentifyQrModal = () => null;
export const IdentifyFlipCoinModal = ({open}) => open ? React.createElement('p', null, 'Flip coin reminder') : null;
export const identifyCoinsV2 = async () => { throw Error('Unexpected API request'); }, loadIdentifyDebugSample = () => {},
identifyErrorMessage = () => '', isInlineIdentifyFailure = () => false, notifyFreeScanUsageUpdated = () => {},
recordFreeScanUsed = () => {}, saveIdentifySession = () => {};
export default React.forwardRef(function Image({unoptimized, fill, ...props}, ref) { return React.createElement('img', {...props, ref}); });`;

(async () => {
  let browser;
  let server;
  try {
    await esbuild.build({
      stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {IdentifyApp} from './components/identify/IdentifyApp'; createRoot(document.getElementById('root')).render(<IdentifyApp />);`, resolveDir: root, loader: 'tsx' },
      bundle: true, outfile: path.join(temporary, 'app.js'), jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [{ name: 'isolate-crop-flow', setup(build) {
        build.onResolve({ filter: /^(next\/(image|navigation)|@\/lib\/identify\/|@\/components\/identify\/Identify(Analysing|Failure|MatchList|SideRail|Toast|DebugBar|Modals)$)/ }, args => ({path: args.path, namespace: 'stub'}));
        build.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: stub, loader: 'jsx', resolveDir: root}));
      }}],
    });
    const sources = ['IdentifyApp.tsx', 'IdentifyUploadCard.tsx', 'IdentifyCropModal.tsx', 'IdentifyCameraGuide.tsx', 'IdentifyZoomSlider.tsx'].map(f => fs.readFileSync(path.join(root, 'components/identify', f), 'utf8')).join('\n');
    const css = await compile(fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8'), {base: path.join(root, 'app'), onDependency() {}});
    fs.writeFileSync(path.join(temporary, 'app.css'), css.build(sources.split(/[\s"'`{}]+/)));
    server = http.createServer((req, res) => {
      const file = req.url === '/app.js' || req.url === '/app.css' ? path.join(temporary, req.url.slice(1)) : req.url.startsWith('/assets/') && !req.url.includes('..') ? path.join(root, 'public', req.url) : null;
      if (file && fs.existsSync(file)) { res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'image/svg+xml'); res.end(fs.readFileSync(file)); }
      else { res.setHeader('Content-Type', 'text/html'); res.end('<link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script>'); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({headless: true});
    const page = await browser.newPage({viewport: {width: 1100, height: 900}});
    const errors = [];
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => {errors.push(e.message); console.error('Browser error:', e.message);});
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const png = await page.evaluate(() => { const c=document.createElement('canvas'); c.width=600; c.height=400; const x=c.getContext('2d'); ['red','green','blue'].forEach((color,i)=>{x.fillStyle=color;x.fillRect(i*200,0,200,400);}); return c.toDataURL().split(',')[1]; });
    const file = {name: 'coin.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64')};
    await page.locator('input[type=file]').first().setInputFiles(file);
    const modal = page.getByRole('dialog', {name:'Crop your coin photo'});
    await modal.waitFor({state:'visible'});
    assert.equal(await page.getByAltText('Obverse', {exact:true}).count(), 0, 'Original file must not enter the slot before crop confirmation');
    const confirm = page.getByRole('button', {name:'Use photo',exact:true});
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(b=>b.textContent==='Use photo').disabled);
    const region = page.getByRole('group', {name:/Crop position/}); const box=await region.boundingBox();
    const initialPhoto=await page.getByAltText('Coin photo to crop').boundingBox();
    assert.ok(Math.max(initialPhoto.width,initialPhoto.height)<=box.width*240/540+1, 'Default zoom must fit the complete image within the guide bounds');
    await page.getByRole('slider',{name:'Zoom'}).press('End');
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down(); await page.mouse.move(box.x+box.width-5,box.y+box.height/2,{steps:10}); await page.mouse.up();
    await confirm.click();
    await page.getByAltText('Obverse', {exact:true}).waitFor();
    const cropped = await page.getByAltText('Obverse', {exact:true}).evaluate(async image => { await image.decode(); const c=document.createElement('canvas'); c.width=c.height=1; c.getContext('2d').drawImage(image,512,512,1,1,0,0,1,1); return {width:image.naturalWidth,height:image.naturalHeight,pixel:[...c.getContext('2d').getImageData(0,0,1,1).data]}; });
    assert.equal(cropped.width,1024); assert.equal(cropped.height,1024); assert.ok(cropped.pixel[0]>200 && cropped.pixel[1]<30, 'Dragging must change the exported crop to the red area');
    assert.equal(await page.getByRole('button',{name:'Find my coin'}).isDisabled(),true);
    await page.locator('input[type=file]').last().setInputFiles(file);
    await modal.waitFor({state:'visible'}); await page.getByRole('button',{name:'Cancel',exact:true}).click();
    assert.equal(await page.getByAltText('Reverse',{exact:true}).count(),0,'Cancel must leave reverse empty');
    await page.locator('input[type=file]').last().setInputFiles(file); await modal.waitFor({state:'visible'});
    await page.getByRole('slider',{name:'Zoom'}).press('End'); assert.equal(await page.getByText('5x',{exact:true}).count(),1);
    await confirm.click(); await page.getByAltText('Reverse',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Find my coin'}).isDisabled(),false);
    await page.reload(); await page.locator('input[type=file]').first().setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('not an image')});
    await page.getByRole('alert').waitFor(); assert.equal(await confirm.isDisabled(),true);
    await page.keyboard.press('Escape'); await modal.waitFor({state:'hidden'});
    await page.setViewportSize({width:390,height:844}); await page.locator('input[type=file]').first().setInputFiles(file); await modal.waitFor({state:'visible'});
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(b=>b.textContent==='Use photo').disabled);
    const mobile=await modal.boundingBox(); assert.ok(mobile.x>=0 && mobile.x+mobile.width<=390,'Crop dialog must fit mobile width');
    await page.screenshot({path:path.join(temporary,'crop-mobile.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: default image fits guide, gallery crop opens, defers slot update, exports dragged 1024px JPEG, cancel preserves slots, zoom works, two-photo gating, corrupt-image error, Escape, and mobile dialog fit.');
    console.log('Screenshot: '+path.join(temporary,'crop-mobile.png'));
  } finally {
    if(browser) await browser.close(); if(server) await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});

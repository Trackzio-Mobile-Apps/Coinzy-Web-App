const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObj = {};
const code = ts.transpileModule(fs.readFileSync('lib/experts/photoSlots.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { exports: exportsObj });
const { replacePhotoSlot, photoSlotValues } = exportsObj;
let slots = replacePhotoSlot([null, null], 1, 'optional');
assert.equal(slots[0], null, 'optional image must not satisfy required slot');
slots = replacePhotoSlot(slots, 0, 'required');
assert.equal(JSON.stringify(photoSlotValues(slots)), JSON.stringify(['required', 'optional']), 'required and optional images both reach uploader');
slots = replacePhotoSlot(slots, 0, null);
assert.equal(slots[0], null, 'removing required image leaves it empty');
assert.equal(slots[1], 'optional', 'removing required image preserves optional image in its slot');
slots = replacePhotoSlot(slots, 1, 'replacement');
assert.equal(slots[0], null);
assert.equal(slots[1], 'replacement');
// Guard the card-to-handler wiring that decides which slot receives the crop.
const component = ts.createSourceFile('ExpertUploadFlow.tsx', fs.readFileSync('components/experts/ExpertUploadFlow.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const sides = new Set();
function visit(node) {
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(component) === 'PhotoSideCard') {
    const prop = node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText(component) === 'onAdd');
    const callback = prop?.initializer?.expression;
    assert.ok(callback && ts.isArrowFunction(callback), 'photo card must pass an upload callback');
    assert.equal(callback.parameters.length, 2, 'photo card must forward the selected slot');
    assert.ok(ts.isCallExpression(callback.body) && callback.body.expression.getText(component) === 'addFiles');
    const args = callback.body.arguments;
    assert.equal(args.length, 3, 'upload must receive the side, files and slot');
    assert.equal(args[1].getText(component), callback.parameters[0].name.getText(component));
    assert.equal(args[2].getText(component), callback.parameters[1].name.getText(component));
    sides.add(args[0].text);
  }
  ts.forEachChild(node, visit);
}
visit(component);
assert.deepEqual([...sides].sort(), ['edge', 'obverse', 'reverse']);
console.log('PASS: independent required and optional expert photo slots and card wiring.');

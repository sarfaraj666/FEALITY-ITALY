const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const rows = [], props = new Map([['BOOK_ID', 'test-book']]), cache = new Map();
let sent = 0, failEmail = false, failSave = false;
const sheet = {
  getRange(row, col) {
    if (row === 'A:A') return { createTextFinder: id => ({ matchEntireCell: () => ({ findNext: () => {
      const index = rows.findIndex(r => r[0] === id);
      return index < 0 ? null : { getRow: () => index + 2 };
    } }) }) };
    return { getValue: () => rows[row - 2][col - 1], setValue: value => { rows[row - 2][col - 1] = value; } };
  },
  appendRow(row) { if (failSave) throw Error('offline'); rows.push(row); },
  getLastRow: () => rows.length + 1
};
const ctx = {
  SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush() {} },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.get(k), setProperty: (k, v) => props.set(k, v) }) },
  CacheService: { getScriptCache: () => ({ get: k => cache.get(k), put: (k, v) => cache.set(k, v) }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
  Utilities: { DigestAlgorithm: {SHA_256: 'sha256'}, computeDigest: (_, value) => crypto.createHash('sha256').update(value).digest(), base64Encode: bytes => Buffer.from(bytes).toString('base64'), formatDate: () => 'test-day' },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
  MailApp: { sendEmail(message) { if (failEmail) throw Error('quota'); assert.equal(message.to, 'sksarfarajali824@gmail.com'); sent++; } }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8') + '\n' + fs.readFileSync(__dirname + '/Catalogue.gs', 'utf8'), ctx);
const lead = { requestId: crypto.randomUUID(), name: '=1+1', phone: '+919876543210', email: '', city: 'Test City', collection: 'Kitchen', designId: '07', message: 'Test only', budget: '', page: 'contact.html', consent: true, website: '' };
const post = value => ctx.doPost({ postData: { contents: JSON.stringify(value) } });
assert.equal(post(lead).saved, true);
assert.equal(rows.length, 1); assert.equal(sent, 1);
assert.equal(rows[0][2], "'=1+1"); assert.equal(rows[0][8], 'CURVIERA');
assert.equal(post(lead).id, rows[0][0]); assert.equal(rows.length, 1); assert.equal(sent, 1);
assert.equal(post({...lead, message:'Changed under same ID'}).saved, false);
for (const bad of [{consent:false},{website:'bot'},{designId:'missing'},{phone:'1'},{email:'invalid'},{collection:'Fake'}]) assert.equal(post({...lead,...bad}).saved,false);
failEmail = true;
assert.equal(post({...lead,requestId:crypto.randomUUID()}).saved,true);
assert.equal(rows[1][16], 'Unconfirmed — review manually');
assert.equal(rows[1][17], 'API setup required');
failSave = true;
assert.equal(post({...lead,requestId:crypto.randomUUID()}).saved,false);
assert.equal(sent,1);
console.log('PASS: storage before email, canonical product, validation, idempotency/conflict, formula safety, email failure preserves record, failed save never sends email.');

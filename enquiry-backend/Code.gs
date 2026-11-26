// Bound to the private FEALITY ITALY Customer Enquiries spreadsheet.
const RECIPIENT = 'fealityitaly@gmail.com';
const HEADERS = ['Enquiry ID', 'Received at (India)', 'Name', 'Phone', 'Email', 'City / Region', 'Collection', 'Design ID', 'Design', 'Product details', 'Product image', 'Message', 'Budget', 'Source page', 'Consent', 'Follow-up status', 'Email notification', 'WhatsApp notification', 'Payload fingerprint'];
const EMAIL_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
  'aero', 'coop', 'museum', 'travel', 'jobs', 'mobi', 'asia', 'cat', 'tel', 'post',
  'app', 'dev', 'tech', 'online', 'site', 'store', 'design', 'studio', 'agency',
  'space', 'shop', 'website', 'live', 'world', 'solutions', 'company', 'business',
  'group', 'services', 'digital', 'global', 'in', 'co.in', 'org.in', 'net.in',
  'firm.in', 'gen.in', 'ind.in', 'ac.in', 'edu.in', 'gov.in', 'co.uk', 'org.uk',
  'net.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.za', 'co.sg'
]);

function isValidEmail_(email) {
  if (!email) return true;
  const parts = email.trim().split('@');
  if (parts.length !== 2 || !/^[a-z0-9._%+-]+$/i.test(parts[0])) return false;
  const domain = parts[1].toLowerCase();
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) return false;
  const labels = domain.split('.');
  const suffix2 = labels.slice(-2).join('.');
  const tld = labels[labels.length - 1];
  return EMAIL_TLDS.has(suffix2) || EMAIL_TLDS.has(tld) || /^[a-z]{2}$/.test(tld);
}

function setupEnquiries() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  book.rename('FEALITY ITALY — Customer Enquiries');
  book.setSpreadsheetTimeZone('Asia/Kolkata');
  const sheet = book.getSheetByName('Enquiries') || book.insertSheet('Enquiries');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  if (sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|') !== HEADERS.join('|')) throw new Error('Unexpected sheet columns. No data changed.');
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#252525').setFontColor('#ffffff').setWrap(true);
  sheet.setRowHeight(1, 48);
  sheet.setColumnWidths(1, HEADERS.length, 160);
  sheet.setColumnWidth(1, 310); sheet.setColumnWidth(10, 300); sheet.setColumnWidth(12, 300);
  sheet.getRange('B2:B').setNumberFormat('dd MMM yyyy HH:mm:ss');
  sheet.getRange('D2:D').setNumberFormat('@');
  if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  sheet.hideColumns(19);
  PropertiesService.getScriptProperties().setProperty('BOOK_ID', book.getId());
}

function normalise_(input) {
  const text = (key, max, required) => {
    if (typeof input[key] !== 'string' || input[key].length > max || (required && !input[key].trim())) throw new Error('Invalid ' + key);
    return input[key].trim();
  };
  const lead = {
    requestId: text('requestId', 36, true), name: text('name', 100, true), phone: text('phone', 25, true),
    email: text('email', 160, false), city: text('city', 100, true), collection: text('collection', 40, true),
    designId: text('designId', 80, false), message: text('message', 2000, false), budget: text('budget', 100, false), page: text('page', 80, true)
  };
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(lead.requestId) || input.consent !== true || input.website !== '') throw new Error('Invalid enquiry');
  if (!/^[+\d ()-]{7,25}$/.test(lead.phone) || lead.phone.replace(/\D/g, '').length < 7 || lead.phone.replace(/\D/g, '').length > 15) throw new Error('Invalid phone');
  if (!isValidEmail_(lead.email)) throw new Error('Invalid email');
  if (!['Kitchen','Wardrobes','Vanity','Balcony','General enquiry','Studio partnership'].includes(lead.collection)) throw new Error('Invalid collection');
  if (!/^[a-z0-9-]+\.html$/.test(lead.page)) throw new Error('Invalid page');
  const design = (CATALOGUE[lead.collection] || []).find(item => item.id === lead.designId);
  if (lead.designId && !design) throw new Error('Unknown product');
  lead.design = design || { name: '', description: '', source: '' };
  return lead;
}

function safeCell_(value) {
  // Sheet cells must never execute customer input as formulas.
  const s = String(value);
  return /^[=+\-@\t\r\n]/.test(s) ? "'" + s : s;
}
function reply_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return reply_({ service: 'FEALITY ITALY enquiries', ready: !!PropertiesService.getScriptProperties().getProperty('BOOK_ID') }); }
function doPost(e) {
  let lead;
  try {
    if (!e || !e.postData || e.postData.contents.length > 10000) throw new Error('Invalid body');
    lead = normalise_(JSON.parse(e.postData.contents));
  } catch (_) { return reply_({ saved: false, error: 'Please check the enquiry details.' }); }
  const id = 'FE-' + lead.requestId;
  const fingerprint = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(lead)));
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return reply_({ saved: false, error: 'Busy. Please retry.' });
  let sheet, row;
  try {
    const props = PropertiesService.getScriptProperties();
    sheet = SpreadsheetApp.openById(props.getProperty('BOOK_ID')).getSheetByName('Enquiries');
    const found = sheet.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (found) {
      if (sheet.getRange(found.getRow(), 19).getValue() !== fingerprint) return reply_({ saved: false, error: 'Request conflict.' });
      return reply_({ saved: true, id });
    }
    // Public form: bound volume protects email quotas. No customer data in cache.
    const cache = CacheService.getScriptCache(), key = 'minute-' + Math.floor(Date.now() / 60000);
    const count = Number(cache.get(key) || 0);
    if (count >= 10) return reply_({ saved: false, error: 'Please retry shortly.' });
    cache.put(key, String(count + 1), 120);
    const dailyKey = 'day-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
    const dailyCount = Number(props.getProperty(dailyKey) || 0);
    if (dailyCount >= 100) return reply_({ saved: false, error: 'Please contact us directly.' });
    props.setProperty(dailyKey, String(dailyCount + 1));
    const values = [id, new Date(), lead.name, lead.phone, lead.email, lead.city, lead.collection, lead.designId, lead.design.name, lead.design.description,
      lead.design.source ? 'https://sarfaraj666.github.io/FEALITY-ITALY/' + lead.design.source : '', lead.message, lead.budget, lead.page, 'Yes', 'New', 'Pending', 'API setup required', fingerprint];
    sheet.appendRow(values.map(v => v instanceof Date ? v : safeCell_(v)));
    row = sheet.getLastRow();
    SpreadsheetApp.flush();
  } catch (_) { return reply_({ saved: false, error: 'Unable to confirm storage. Please retry.' }); }
  finally { lock.releaseLock(); }
  // Store first: notification failure never loses the enquiry.
  try {
    sheet.getRange(row, 17).setValue('Sending');
    MailApp.sendEmail({ to: RECIPIENT, subject: 'FEALITY ITALY enquiry — ' + lead.collection,
      body: ['Reference: ' + id, 'Name: ' + lead.name, 'Phone: ' + lead.phone, 'Email: ' + lead.email, 'City: ' + lead.city, 'Collection: ' + lead.collection,
        'Design: ' + lead.design.name, lead.design.description, 'Message: ' + lead.message, 'Budget: ' + lead.budget,
        'All enquiries: https://docs.google.com/spreadsheets/d/' + PropertiesService.getScriptProperties().getProperty('BOOK_ID') + '/edit'].join('\n'),
      ...(lead.email ? {replyTo: lead.email} : {}) });
    sheet.getRange(row, 17).setValue('Sent');
  } catch (_) { sheet.getRange(row, 17).setValue('Unconfirmed — review manually'); }
  return reply_({ saved: true, id });
}

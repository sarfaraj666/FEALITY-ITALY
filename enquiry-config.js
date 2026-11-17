// Public configuration for FEALITY ITALY client-side forms.
(() => {
  'use strict';
  const GOOGLE_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwzZiAxlETON2wRUjxlLG5T2yx7WQxqRSnMyaeb-mzX8hjXJnPqqA4x8HYruBlLSmey/exec';
  const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1M3_LMnj0-3dtxyK9hlHR8n2yyp3U4vtr3IkZjEhxU4c/edit';

  const cfg = Object.freeze({
    endpoint: GOOGLE_SCRIPT_ENDPOINT,
    fallbackEndpoint: '/api/enquiry',
    email: 'sksarfarajali824@gmail.com',
    phone: '9522251777',
    whatsapp: '919832722644',
    sheetUrl: SPREADSHEET_URL
  });

  if (typeof window !== 'undefined') window.FealityEnquiryConfig = cfg;
  if (typeof module !== 'undefined' && module.exports) module.exports = cfg;
})();

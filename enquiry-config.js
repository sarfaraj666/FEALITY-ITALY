// Public configuration for FEALITY ITALY client-side forms.
(() => {
  'use strict';
  window.FealityEnquiryConfig = {
    endpoint: '/api/enquiry',
    email: 'info@fealityitaly.com',
    whatsapp: '919832722644'
  };

  // Safely retrieve runtime public contact configurations from the server
  if (typeof fetch === 'function') {
    fetch('/api/config')
      .then(res => (res.ok ? res.json() : null))
      .then(cfg => {
        if (cfg && typeof cfg === 'object') {
          if (cfg.whatsapp) window.FealityEnquiryConfig.whatsapp = cfg.whatsapp;
          if (cfg.email) window.FealityEnquiryConfig.email = cfg.email;
          if (cfg.phone) window.FealityEnquiryConfig.phone = cfg.phone;
        }
      })
      .catch(() => {});
  }
})();

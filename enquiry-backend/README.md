# FEALITY ITALY central enquiry setup

All enquiries belong in one private Google spreadsheet. Email is a notification, not the database.

- Sheet: https://docs.google.com/spreadsheets/d/1M3_LMnj0-3dtxyK9hlHR8n2yyp3U4vtr3IkZjEhxU4c/edit
- Bound script: https://script.google.com/u/0/home/projects/15K2XpoQ1_BIzLSeNISFiCrZo7zEOXt12ZNFbqV5__GeoyW9g-FOMWWbE/edit
- Email notifications: sksarfarajali824@gmail.com
- Requested WhatsApp recipient: 919522251777. Automatic notifications are NOT configured; a WhatsApp Business API provider and approved notification template are still needed.

## Current state

The owner completed authorization and setup, and supplied a deployed `/exec` URL. That URL is now configured in `enquiry-config.js`. The live receiver returned `ready: true` and acknowledged a clearly labelled connection-test enquiry with reference `FE-7877ab74-94ef-44e0-975c-4ed1bfda0cbb`. Repeating the same request returned the same reference. The owner still needs to verify the email inbox and the matching Sheet row; the save response does not prove email delivery. Browser end-to-end testing remains pending. No website deployment or Git push was performed.

## Finish connection

1. In the bound project, use the combined contents of `Code.gs` and `Catalogue.gs` (already saved in its Code.gs). Run `setupEnquiries`. The account owner must review and complete Google authorization for spreadsheet access and sending email.
2. Check that the `Enquiries` tab has the expected columns. Keep the spreadsheet private; customers do not need access to it.
3. Deploy the script as a Web app, executing as the owner, accessible to Anyone. This publishes a write-only receiver, not the spreadsheet. Review and approve that exposure before deployment.
4. Put its `/exec` URL in `enquiry-config.js` as `endpoint`. No access tokens belong in frontend files.
5. Submit one explicitly labelled test enquiry from localhost. Confirm the success reference matches the saved Sheet record and check notification email. Retry the same request ID: only one row and one email should exist. Verify from the eventual hosted website too before declaring delivery active.

The receiver validates product IDs against the catalogue, neutralises spreadsheet formulas, checks consent/honeypot, limits request volume, and uses a lock and request IDs to prevent duplicate saves. Saved records survive email failure. Column Q records email state; column R records the pending WhatsApp integration. Rows remain in received order; use filter views for alternate sorting.

Run `node enquiry-backend/test.cjs` for isolated backend tests. These tests do not contact Google or send emails.

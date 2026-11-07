# FEALITY ITALY — private enquiry test

This is a loopback-only integration. It does not provision a Google account, create a public form, send email or publish the website. The supplied Gmail address identifies the intended owner; only that person can sign in and authorize the script.

## 1. Try the website without Google
Use Node 22+ from the project root, in PowerShell:
```powershell
$env:LEAD_MODE='mock'
node lead-test/server.cjs
```
Open http://127.0.0.1:8184/kitchen.html (or wardrobes.html / vanity.html). Open a gallery photo → Enquire Now. Enter dummy details only. The collection and design follow the selected photo. A successful mock receipt begins with TEST-; no Sheet is contacted and restarting clears mock receipts. To simulate failure restart with LEAD_MOCK_FAIL=1. Reset that variable afterward. Run the automated offline checks with `node lead-test/test.cjs`.

## 2. Owner configuration
1. Sign in to the intended Google account yourself. Create a **private** spreadsheet named **FEALITY ITALY — Customer Enquiries**. Set General access to **Restricted**, review individual collaborators, and never use Publish to web. Do not share the spreadsheet with website visitors.
2. Open Extensions → Apps Script from that workbook. Paste Code.gs into the bound project. In Project Settings enable display of the manifest, then use the supplied appsscript.json. It enables the advanced Google Sheets v4 service. If using a standard Cloud project, also enable the Google Sheets API in that project.
3. Generate a random signing key on your machine and put the same value in the Apps Script project’s Script Properties as SIGNING_KEY and the local server environment variable LEAD_SIGNING_KEY. A PowerShell example to generate it privately in the current process:
   ```powershell
   $env:LEAD_SIGNING_KEY = node -p "require('node:crypto').randomBytes(32).toString('hex')"
   $env:LEAD_SIGNING_KEY | Set-Clipboard
   ```
   Paste it into Script Properties, then clear the clipboard. Do not paste the key in chat, HTML or a repository. Restrict script editor access. Keep the key stable through retries; changing it changes the derived receipt IDs.
4. Run **setupLeads** once from the editor and authorize it. The script creates or checks the **Leads** tab, freezes the header and formats Phone Number as text. It refuses to overwrite incompatible existing headers. It records the workbook ID in Script Properties. No Drive, Gmail, contacts, or mail-sending permission is requested. The Sheets read/write scope is broader than one file because the deployed script opens the workbook by ID and uses the advanced Sheets API; the code targets only the configured workbook.
5. Deploy the script yourself as a **Web app**, Execute as **Me**, access **Anyone** (anonymous invocation). This makes the script callable, not the Sheet readable. There is no doGet or lead-list endpoint. Every write requires a valid timestamped HMAC from the local backend. If your organization disallows anonymous web apps, stop here; do not change workbook sharing. An OAuth-authenticated alternative would be needed. Save the versioned deployment URL ending in /exec, not the editor or /dev URL.

## 3. Local end-to-end test after authorization
Stop mock mode. In the shell holding the secret:
```powershell
$env:LEAD_MODE='sheets'
$env:LEAD_SCRIPT_URL=Read-Host 'Authorized Apps Script /exec URL'
node lead-test/server.cjs
```
Keep the default port 8184 for the browser test. Use e.g. Kitchen → ONYX, Test Customer, +00012345678, dummy@example.invalid, Test City, and a clearly marked dummy message. Confirm consent. Check one new row, not just a success message. Verify the FE- receipt matches the row, date/time in Asia/Kolkata, phone including + and leading zeros, Kitchen, ONYX, message and New. Replaying the same request key must return the same receipt without adding another row. On an uncertain outcome retry the unchanged form before closing it. A newly opened form is a new enquiry.
- Columns A–K: Enquiry ID, Date, Time, Customer Name, Phone Number, Email, City, Collection, Design Name, Message, Lead Status.
- File → Download → Microsoft Excel (.xlsx). Open the export locally and confirm the phone remains text and the original values match. The download is a separate private copy under your control.
- Open the spreadsheet link in a signed-out private window: it must deny access. An unsigned POST to the script must not append a row. Do not share the spreadsheet contents to prove this.
- Stop the server and remove the dummy row after you finish verification if desired.

## Security boundary and limits
The browser posts only to the same-origin Node server; the server validates required values, consent, honeypot and catalog ID and supplies the canonical design name. Consent is required per submission; the requested eleven columns do not store a separate consent receipt. The server checks Origin and Host, caps body size and allows 12 attempts/minute globally for this single-user local test. It does not trust forwarded IP headers. Mock mode is explicit. The real backend signs timestamp + payload, follows only Google's expected content redirect, and acknowledges success only after a saved receipt. Apps Script verifies signatures and freshness, serializes duplicate checks/writes, and uses RAW string values so formula-looking input is literal text. Leads and keys are not logged by this app.

A public script can still receive junk traffic and consume Google quotas. This local gateway is not a public hosting solution. A future public rollout needs a private backend secret store, TLS, persistent distributed rate limits and abuse monitoring, and an approved privacy/retention policy. GitHub Pages alone cannot run the gateway. No such rollout is part of this test.

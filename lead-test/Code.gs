const HEADERS=['Enquiry ID','Date','Time','Customer Name','Phone Number','Email','City','Collection','Design Name','Message','Lead Status'];
function setupLeads(){
  const book=SpreadsheetApp.getActiveSpreadsheet();
  if(!book || book.getName()!=='FEALITY ITALY — Customer Enquiries')throw Error('Check spreadsheet name');
  const tab=book.getSheetByName('Leads')||book.insertSheet('Leads');
  if(!tab.getLastRow())tab.getRange(1,1,1,11).setValues([HEADERS]);
  if(JSON.stringify(tab.getRange(1,1,1,11).getValues()[0])!==JSON.stringify(HEADERS))throw Error('Check Leads headers');
  tab.getRange('E:E').setNumberFormat('@');tab.setFrozenRows(1);
  PropertiesService.getScriptProperties().setProperty('BOOK_ID',book.getId());
}
function doPost(e){
  const json=v=>ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);
  try{
    const p=PropertiesService.getScriptProperties(), secret=p.getProperty('SIGNING_KEY'), book=p.getProperty('BOOK_ID');
    if(!book||!secret||secret.length!==64||e.postData.length>16000)throw Error();
    const {payload,sig}=JSON.parse(e.postData.contents);
    const mac=s=>Utilities.computeHmacSha256Signature(s,secret,Utilities.Charset.UTF_8).map(v=>('0'+(v&255).toString(16)).slice(-2)).join('');
    const expected=mac(payload);
    if(typeof sig!=='string'||sig.length!==expected.length)throw Error();
    let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^sig.charCodeAt(i);if(diff)throw Error();
    const {at,lead:d}=JSON.parse(payload);
    if(!Number.isSafeInteger(at)||Math.abs(Date.now()-at)>90000||d.consent!==true)throw Error();
    const id='FE-'+mac('id:'+d.key).slice(0,32);
    const lock=LockService.getScriptLock();lock.waitLock(8000);
    try{
      const tab=SpreadsheetApp.openById(book).getSheetByName('Leads');
      if(!tab||JSON.stringify(tab.getRange(1,1,1,11).getValues()[0])!==JSON.stringify(HEADERS))throw Error();
      if(!tab.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext()){
        const now=new Date(),fmt=s=>Utilities.formatDate(now,'Asia/Kolkata',s);
        const values=[[id,fmt('yyyy-MM-dd'),fmt('HH:mm:ss'),d.name,d.phone,d.email,d.city,d.collection,d.design,d.message,'New']];
        // RAW stores every submitted string literally, including +phones and =formulas.
        const write=Sheets.Spreadsheets.Values.append({values},book,'Leads!A:K',{valueInputOption:'RAW',insertDataOption:'INSERT_ROWS'});
        if(!write.updates||write.updates.updatedRows!==1)throw Error();
      }
      return json({saved:true,id});
    }finally{lock.releaseLock()}
  }catch{return json({saved:false})}
}

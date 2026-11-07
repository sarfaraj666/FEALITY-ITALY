(async()=>{
  // This adapter is enabled only on the local integration server.
  if(location.hostname!=='127.0.0.1'||location.port!=='8184')return;
  let config;try{const r=await fetch('/api/enquiries');if(!r.ok)return;config=await r.json()}catch{return}
  if(config.enabled!==true)return;
  const [collection,hook]=[['Kitchen','FealityKitchenGallery'],['Wardrobes','FealityWardrobeGallery'],['Vanity','FealityVanityGallery']].find(([,key])=>window[key])||[];
  if(!hook)return;
  const dialog=document.createElement('dialog');dialog.className='lead-dialog';dialog.setAttribute('aria-labelledby','lead-heading');
  dialog.innerHTML=`<form>
    <header><button type="button" data-close aria-label="Close enquiry">&times;</button>
    <h2 id="lead-heading">Let's Design Your Space</h2><p>Share your requirements with us.</p></header>
    <div class="lead-fields">
      <label>Full Name *<input name="name" autocomplete="name" required maxlength="100"></label>
      <label>Email Address (optional)<input name="email" type="email" autocomplete="email" maxlength="254"></label>
      <label>Phone Number *<input name="phone" type="tel" autocomplete="tel" required maxlength="24"></label>
      <label>City *<input name="city" autocomplete="address-level2" required maxlength="100"></label>
      <label>Interested In<select name="collection" required><option>Kitchen</option><option>Wardrobes</option><option value="Vanity">Bathroom Vanity</option></select></label>
      <label>Design Name<select name="designId" required></select></label>
      <label class="lead-wide">Customer Message (optional)<textarea name="message" rows="2" maxlength="1200"></textarea></label>
    </div>
    <label hidden>Website<input name="website" tabindex="-1" autocomplete="off"></label>
    <label class="lead-consent"><input type="checkbox" name="consent" required> I agree that FEALITY ITALY may store my details and contact me about this enquiry.</label>
    <p data-test></p><button type="submit">Submit Enquiry</button><p role="status" aria-live="polite"></p></form>`;
  document.body.append(dialog);
  const form=dialog.querySelector('form'),submit=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');
  let key,busy=false,done=false,returnTo,lastPayload;
  function populate(selected=''){
    const choices=config.designs[form.elements.collection.value];
    form.elements.designId.replaceChildren(new Option('Select a design',''),...choices.map(({title,id})=>new Option(title,id)));
    form.elements.designId.value=selected;
  }
  form.elements.collection.onchange=()=>populate();
  const viewport=window.visualViewport;
  function fit(){if(dialog.open && viewport){dialog.style.setProperty('--lead-height',viewport.height+'px');dialog.style.setProperty('--lead-top',viewport.offsetTop+'px');if(dialog.contains(document.activeElement))document.activeElement.scrollIntoView({block:'nearest'});}}
  viewport?.addEventListener('resize',fit);
  window[hook].setEnquiryHandler(item=>{
    returnTo=document.activeElement;key=crypto.randomUUID();lastPayload=null;done=false;form.reset();submit.disabled=false;status.textContent='';
    form.elements.collection.value=collection; populate(item.id);
    form.querySelector('[data-test]').textContent=config.mock?'Local test only. Use dummy details; nothing is sent to Google.':'';
    dialog.showModal();fit();dialog.scrollTop=0;form.querySelector("[data-close]").focus({preventScroll:true});
  });
  form.querySelector('[data-close]').onclick=()=>{if(!busy)dialog.close()};
  dialog.oncancel=e=>{if(busy)e.preventDefault()};
  dialog.onclose=()=>returnTo?.focus({preventScroll:true});
  form.onsubmit=async e=>{
    e.preventDefault();if(busy||done||!form.reportValidity())return;
    const d=Object.fromEntries(new FormData(form));d.consent=form.elements.consent.checked;
    const body=JSON.stringify(d);if(lastPayload!==null&&lastPayload!==body)key=crypto.randomUUID();lastPayload=body;
    busy=true;submit.disabled=true;status.textContent='Saving…';
    try{const r=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,key}),signal:AbortSignal.timeout(35000)});
      const a=await r.json();if(!r.ok||typeof a.id!=='string'||a.mock!==config.mock)throw Error(a.error||'Save could not be confirmed. Please retry.');
      done=true;status.textContent=(a.mock?'Dummy enquiry saved locally: ':'Enquiry saved: ')+a.id;
    }catch(err){status.textContent=err.message?.startsWith('Check ')||err.message?.startsWith('Too many')?err.message:'Save could not be confirmed. Please retry.'}
    finally{busy=false;submit.disabled=done}
  };
})();

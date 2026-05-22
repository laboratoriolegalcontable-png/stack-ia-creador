/*! Estudio Oro — Legal Layer
 *  Cookie consent + form consent + footer legal bar + professional disclaimers.
 *  Vanilla JS, scoped CSS, safe to inject on any page.
 *  v1 — 2026-05-21
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'estudio_oro_consent_v1';
  var LEGAL_DIR = (function () {
    try {
      var p = window.location.pathname;
      if (p.indexOf('/legal/') >= 0) return '';
      return '../legal/';
    } catch (e) { return '../legal/'; }
  })();

  var css = '' +
    '.eo-legal-vars{--eo-ink:#0E1A2B;--eo-paper:#FBF8F2;--eo-cream:#F4EFE7;--eo-gold:#B8924D;--eo-gold-deep:#8E6B2E;--eo-soft:#3B4A60;--eo-rule:#D9CFB8}' +
    '#eo-cookie-banner,#eo-cookie-modal,#eo-cookie-fab,#eo-legal-bar,.eo-legal-consent,.eo-pro-note{font-family:Inter,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;color:#0E1A2B;box-sizing:border-box}' +
    '#eo-cookie-backdrop{position:fixed;inset:0;background:rgba(14,26,43,.45);z-index:99998;opacity:0;transition:opacity .25s;pointer-events:none}' +
    '#eo-cookie-backdrop.on{opacity:1;pointer-events:auto}' +
    '#eo-cookie-banner{position:fixed;left:0;right:0;bottom:0;background:#FBF8F2;border-top:1px solid #D9CFB8;padding:20px 28px;z-index:99999;transform:translateY(110%);transition:transform .35s cubic-bezier(.2,.7,.2,1);box-shadow:0 -8px 28px rgba(14,26,43,.12)}' +
    '#eo-cookie-banner.show{transform:translateY(0)}' +
    '#eo-cookie-banner .eo-wrap{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:24px;flex-wrap:wrap}' +
    '#eo-cookie-banner h4{font-family:"Playfair Display",Georgia,serif;font-weight:400;margin:0 0 4px;font-size:17px;color:#0E1A2B}' +
    '#eo-cookie-banner p{margin:0;color:#3B4A60;font-size:13px;max-width:640px}' +
    '#eo-cookie-banner .eo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}' +
    '.eo-btn{font-family:inherit;font-size:13px;padding:9px 16px;border:1px solid #D9CFB8;background:#fff;color:#0E1A2B;cursor:pointer;border-radius:2px;letter-spacing:.02em;transition:all .15s}' +
    '.eo-btn:hover{border-color:#8E6B2E;color:#8E6B2E}' +
    '.eo-btn.primary{background:#0E1A2B;color:#FBF8F2;border-color:#0E1A2B}' +
    '.eo-btn.primary:hover{background:#8E6B2E;border-color:#8E6B2E;color:#fff}' +
    '#eo-cookie-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);background:#FBF8F2;border:1px solid #D9CFB8;border-radius:3px;padding:32px;width:min(520px,92vw);max-height:90vh;overflow:auto;z-index:100000;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;box-shadow:0 20px 60px rgba(14,26,43,.25)}' +
    '#eo-cookie-modal.on{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}' +
    '#eo-cookie-modal h3{font-family:"Playfair Display",Georgia,serif;font-weight:400;margin:0 0 18px;font-size:24px;color:#0E1A2B}' +
    '#eo-cookie-modal .eo-row{display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid #D9CFB8;gap:18px}' +
    '#eo-cookie-modal .eo-row:last-of-type{border-bottom:none}' +
    '#eo-cookie-modal .eo-row .eo-label{font-weight:600;font-size:14px;color:#0E1A2B;display:block;margin-bottom:2px}' +
    '#eo-cookie-modal .eo-row .eo-desc{font-size:12px;color:#3B4A60}' +
    '.eo-switch{position:relative;display:inline-block;width:38px;height:22px;flex-shrink:0;margin-top:4px}' +
    '.eo-switch input{opacity:0;width:0;height:0}' +
    '.eo-slider{position:absolute;cursor:pointer;inset:0;background:#D9CFB8;transition:.2s;border-radius:22px}' +
    '.eo-slider:before{position:absolute;content:"";height:16px;width:16px;left:3px;top:3px;background:#fff;transition:.2s;border-radius:50%}' +
    '.eo-switch input:checked + .eo-slider{background:#B8924D}' +
    '.eo-switch input:checked + .eo-slider:before{transform:translateX(16px)}' +
    '.eo-switch input:disabled + .eo-slider{opacity:.6;cursor:not-allowed}' +
    '#eo-cookie-modal .eo-foot{margin-top:22px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}' +
    '#eo-cookie-fab{position:fixed;bottom:16px;left:16px;width:42px;height:42px;border-radius:50%;background:#FBF8F2;border:1px solid #D9CFB8;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:99997;box-shadow:0 4px 14px rgba(14,26,43,.12);transition:all .2s;font-size:18px}' +
    '#eo-cookie-fab:hover{border-color:#8E6B2E;transform:translateY(-1px)}' +
    '#eo-cookie-fab.on{display:flex}' +
    '#eo-legal-bar{font-size:12px;color:#6b7180;text-align:center;padding:18px 16px;line-height:2;border-top:1px solid rgba(217,207,184,.5);margin-top:24px}' +
    '#eo-legal-bar a{color:inherit;text-decoration:none;margin:0 2px}' +
    '#eo-legal-bar a:hover{color:#8E6B2E;text-decoration:underline}' +
    '#eo-legal-bar .sep{opacity:.5;margin:0 6px}' +
    '.eo-legal-consent{display:flex;align-items:flex-start;gap:10px;padding:12px 0;margin:14px 0;font-size:12.5px;color:inherit;line-height:1.5}' +
    '.eo-legal-consent input[type="checkbox"]{margin-top:3px;flex-shrink:0;accent-color:#B8924D}' +
    '.eo-legal-consent a{color:#8E6B2E;text-decoration:underline}' +
    '.eo-pro-note{display:block;margin-top:10px;padding:8px 12px;font-size:11.5px;color:#6b7180;border-left:2px solid rgba(184,146,77,.5);background:rgba(251,248,242,.4);line-height:1.5;font-style:italic}' +
    '@media (max-width:640px){#eo-cookie-banner{padding:18px 18px}#eo-cookie-banner .eo-actions{margin-left:0;width:100%}#eo-cookie-banner .eo-actions .eo-btn{flex:1 1 auto}}';

  function injectStyle(){var s=document.createElement('style');s.id='eo-legal-style';s.textContent=css;document.head.appendChild(s);}
  function ensureMeta(){var head=document.head;if(!head.querySelector('meta[name="robots"]')){var m=document.createElement('meta');m.name='robots';m.content='index, follow';head.appendChild(m);}if(!head.querySelector('meta[http-equiv="X-Frame-Options"]')){var x=document.createElement('meta');x.setAttribute('http-equiv','X-Frame-Options');x.content='SAMEORIGIN';head.appendChild(x);}}
  function getConsent(){try{var raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null;}catch(e){return null;}}
  function saveConsent(c){c.timestamp=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}catch(e){}}

  function buildBanner(){
    var bd=document.createElement('div');bd.id='eo-cookie-backdrop';
    var b=document.createElement('div');b.id='eo-cookie-banner';b.className='eo-legal-vars';
    b.innerHTML='<div class="eo-wrap"><div><h4>Privacidad y cookies</h4><p>Utilizamos cookies técnicas necesarias para el funcionamiento del sitio. Con su consentimiento, también utilizamos cookies de preferencias, analíticas y de marketing. Consulte la <a style="color:#8E6B2E" href="'+LEGAL_DIR+'cookies.html">Política de Cookies</a>.</p></div><div class="eo-actions"><button class="eo-btn" data-eo="customize">Personalizar</button><button class="eo-btn" data-eo="necessary">Sólo necesarias</button><button class="eo-btn primary" data-eo="all">Aceptar todas</button></div></div>';
    document.body.appendChild(bd);document.body.appendChild(b);
    var m=document.createElement('div');m.id='eo-cookie-modal';m.className='eo-legal-vars';
    m.innerHTML='<h3>Preferencias de cookies</h3><div class="eo-row"><div><span class="eo-label">Técnicas (necesarias)</span><span class="eo-desc">Imprescindibles para el funcionamiento del sitio.</span></div><label class="eo-switch"><input type="checkbox" checked disabled><span class="eo-slider"></span></label></div><div class="eo-row"><div><span class="eo-label">Preferencias</span><span class="eo-desc">Recordar opciones del usuario como sede o idioma.</span></div><label class="eo-switch"><input type="checkbox" data-eo-pref="preferences"><span class="eo-slider"></span></label></div><div class="eo-row"><div><span class="eo-label">Analíticas</span><span class="eo-desc">Medir el uso del sitio (Google Analytics).</span></div><label class="eo-switch"><input type="checkbox" data-eo-pref="analytics"><span class="eo-slider"></span></label></div><div class="eo-row"><div><span class="eo-label">Marketing</span><span class="eo-desc">Contenidos personalizados (Meta Pixel).</span></div><label class="eo-switch"><input type="checkbox" data-eo-pref="marketing"><span class="eo-slider"></span></label></div><div class="eo-foot"><button class="eo-btn" data-eo="modal-close">Cancelar</button><button class="eo-btn primary" data-eo="modal-save">Guardar preferencias</button></div>';
    document.body.appendChild(m);
    var fab=document.createElement('button');fab.id='eo-cookie-fab';fab.title='Preferencias de cookies';fab.setAttribute('aria-label','Preferencias de cookies');fab.textContent='\u{1F36A}';document.body.appendChild(fab);
    var openModal=function(){var c=getConsent()||{};m.querySelector('[data-eo-pref="preferences"]').checked=!!c.preferences;m.querySelector('[data-eo-pref="analytics"]').checked=!!c.analytics;m.querySelector('[data-eo-pref="marketing"]').checked=!!c.marketing;bd.classList.add('on');m.classList.add('on');b.classList.remove('show');};
    var closeModal=function(){m.classList.remove('on');bd.classList.remove('on');if(!getConsent())b.classList.add('show');};
    var finish=function(){b.classList.remove('show');bd.classList.remove('on');m.classList.remove('on');fab.classList.add('on');};
    b.addEventListener('click',function(e){var t=e.target.getAttribute('data-eo');if(!t)return;if(t==='all'){saveConsent({necessary:true,preferences:true,analytics:true,marketing:true});finish();}else if(t==='necessary'){saveConsent({necessary:true,preferences:false,analytics:false,marketing:false});finish();}else if(t==='customize'){openModal();}});
    m.addEventListener('click',function(e){var t=e.target.getAttribute('data-eo');if(!t)return;if(t==='modal-close')closeModal();if(t==='modal-save'){saveConsent({necessary:true,preferences:m.querySelector('[data-eo-pref="preferences"]').checked,analytics:m.querySelector('[data-eo-pref="analytics"]').checked,marketing:m.querySelector('[data-eo-pref="marketing"]').checked});finish();}});
    fab.addEventListener('click',openModal);bd.addEventListener('click',closeModal);
    if(!getConsent()){setTimeout(function(){b.classList.add('show');},400);}else{fab.classList.add('on');}
  }

  function injectFormConsent(){
    var forms=document.querySelectorAll('form');
    forms.forEach(function(f){if(f.querySelector('.eo-legal-consent'))return;if(f.closest('#eo-cookie-modal'))return;var lbl=document.createElement('label');lbl.className='eo-legal-consent';lbl.innerHTML='<input type="checkbox" required><span>He leído y acepto la <a href="'+LEGAL_DIR+'privacidad.html">Política de Privacidad</a> y los <a href="'+LEGAL_DIR+'terminos.html">Términos</a>. Comprendo que la consulta no constituye asesoramiento legal personalizado.</span>';var submit=f.querySelector('button[type="submit"], input[type="submit"], button:not([type])');if(submit&&submit.parentNode===f)f.insertBefore(lbl,submit);else if(submit)submit.parentNode.insertBefore(lbl,submit);else f.appendChild(lbl);});
  }

  function injectFooterBar(){
    if(document.getElementById('eo-legal-bar'))return;
    var bar=document.createElement('div');bar.id='eo-legal-bar';
    bar.innerHTML='<a href="'+LEGAL_DIR+'aviso-legal.html">Aviso Legal</a><span class="sep">·</span><a href="'+LEGAL_DIR+'privacidad.html">Privacidad</a><span class="sep">·</span><a href="'+LEGAL_DIR+'terminos.html">Términos</a><span class="sep">·</span><a href="'+LEGAL_DIR+'cookies.html">Cookies</a><span class="sep">·</span><a href="'+LEGAL_DIR+'arrepentimiento.html">Arrepentimiento (Ley 24.240)</a><span class="sep">·</span><a href="mailto:dpo@estudiooro.com?subject=Ejercicio%20de%20derechos%20ARCO">Ejercer derechos ARCO</a><span class="sep">·</span><a href="https://www.argentina.gob.ar/produccion/consumidor" target="_blank" rel="noopener">Defensa del Consumidor</a><span class="sep">·</span><a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener">AAIP</a><span class="sep">·</span><a href="https://www.aepd.es" target="_blank" rel="noopener">AEPD</a><span class="sep">·</span><a href="https://www.gub.uy/unidad-reguladora-control-datos-personales" target="_blank" rel="noopener">URCDP</a>';
    var footer=document.querySelector('footer');if(footer)footer.appendChild(bar);else document.body.appendChild(bar);
  }

  function boot(){try{ensureMeta();}catch(e){}try{injectStyle();}catch(e){}try{buildBanner();}catch(e){}try{injectFormConsent();}catch(e){}try{injectFooterBar();}catch(e){}}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
})();

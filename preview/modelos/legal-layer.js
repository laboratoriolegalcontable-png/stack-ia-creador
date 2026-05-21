/*! Estudio Oro — Legal Layer v1 — 2026-05-21 */
(function(){
'use strict';
var STORAGE_KEY='estudio_oro_consent_v1';
var LEGAL_DIR=(function(){try{var p=window.location.pathname;if(p.indexOf('/legal/')>=0)return '';return 'legal/';}catch(e){return 'legal/';}})();
var css='.eo-legal-vars{--eo-ink:#0E1A2B;--eo-paper:#FBF8F2;--eo-cream:#F4EFE7;--eo-gold:#B8924D;--eo-gold-deep:#8E6B2E;--eo-soft:#3B4A60;--eo-rule:#D9CFB8}'+'#eo-cookie-banner,#eo-cookie-modal,#eo-cookie-fab,#eo-legal-bar,.eo-legal-consent{font-family:Inter,system-ui,sans-serif;font-size:14px;color:#0E1A2B;box-sizing:border-box}'+'#eo-cookie-banner{position:fixed;left:0;right:0;bottom:0;background:#FBF8F2;border-top:1px solid #D9CFB8;padding:20px 28px;z-index:99999;transform:translateY(110%);transition:transform .35s;box-shadow:0 -8px 28px rgba(14,26,43,.12)}'+'#eo-cookie-banner.show{transform:translateY(0)}'+'#eo-cookie-banner .eo-wrap{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:24px;flex-wrap:wrap}'+'#eo-cookie-banner h4{font-weight:400;margin:0 0 4px;font-size:17px}'+'#eo-cookie-banner p{margin:0;color:#3B4A60;font-size:13px;max-width:640px}'+'#eo-cookie-banner .eo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}'+'.eo-btn{font-size:13px;padding:9px 16px;border:1px solid #D9CFB8;background:#fff;color:#0E1A2B;cursor:pointer;border-radius:2px}'+'.eo-btn:hover{border-color:#8E6B2E;color:#8E6B2E}'+'.eo-btn.primary{background:#0E1A2B;color:#FBF8F2;border-color:#0E1A2B}'+'.eo-btn.primary:hover{background:#8E6B2E;border-color:#8E6B2E;color:#fff}'+'#eo-cookie-fab{position:fixed;bottom:16px;left:16px;width:42px;height:42px;border-radius:50%;background:#FBF8F2;border:1px solid #D9CFB8;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:99997;font-size:18px}'+'#eo-cookie-fab.on{display:flex}'+'#eo-legal-bar{font-size:12px;color:#6b7180;text-align:center;padding:18px 16px;line-height:2;border-top:1px solid rgba(217,207,184,.5);margin-top:24px}'+'#eo-legal-bar a{color:inherit;text-decoration:none;margin:0 2px}'+'#eo-legal-bar a:hover{color:#8E6B2E;text-decoration:underline}'+'#eo-legal-bar .sep{opacity:.5;margin:0 6px}'+'.eo-legal-consent{display:flex;align-items:flex-start;gap:10px;padding:12px 0;margin:14px 0;font-size:12.5px}'+'.eo-legal-consent input[type="checkbox"]{margin-top:3px;accent-color:#B8924D}'+'.eo-legal-consent a{color:#8E6B2E;text-decoration:underline}';
function injectStyle(){var s=document.createElement('style');s.id='eo-legal-style';s.textContent=css;document.head.appendChild(s);}
function getConsent(){try{var raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null;}catch(e){return null;}}
function saveConsent(c){c.timestamp=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}catch(e){}}
function buildBanner(){
var b=document.createElement('div');b.id='eo-cookie-banner';b.className='eo-legal-vars';
b.innerHTML='<div class="eo-wrap"><div><h4>Privacidad y cookies</h4><p>Cookies técnicas necesarias. Con su consentimiento, analíticas y marketing. <a style="color:#8E6B2E" href="'+LEGAL_DIR+'cookies.html">Política de Cookies</a>.</p></div><div class="eo-actions"><button class="eo-btn" data-eo="necessary">Sólo necesarias</button><button class="eo-btn primary" data-eo="all">Aceptar todas</button></div></div>';
document.body.appendChild(b);
var fab=document.createElement('button');fab.id='eo-cookie-fab';fab.title='Cookies';fab.textContent='\u{1F36A}';document.body.appendChild(fab);
var finish=function(){b.classList.remove('show');fab.classList.add('on');};
b.addEventListener('click',function(e){var t=e.target.getAttribute('data-eo');if(!t)return;if(t==='all'){saveConsent({necessary:true,preferences:true,analytics:true,marketing:true});finish();}else if(t==='necessary'){saveConsent({necessary:true,preferences:false,analytics:false,marketing:false});finish();}});
if(!getConsent()){setTimeout(function(){b.classList.add('show');},400);}else{fab.classList.add('on');}
}
function injectFooterBar(){
if(document.getElementById('eo-legal-bar'))return;
var bar=document.createElement('div');bar.id='eo-legal-bar';
bar.innerHTML='<a href="'+LEGAL_DIR+'aviso-legal.html">Aviso Legal</a><span class="sep">·</span><a href="'+LEGAL_DIR+'privacidad.html">Privacidad</a><span class="sep">·</span><a href="'+LEGAL_DIR+'terminos.html">Términos</a><span class="sep">·</span><a href="'+LEGAL_DIR+'cookies.html">Cookies</a><span class="sep">·</span><a href="'+LEGAL_DIR+'arrepentimiento.html">Arrepentimiento</a>';
var footer=document.querySelector('footer');if(footer)footer.appendChild(bar);else document.body.appendChild(bar);
}
function boot(){try{injectStyle();}catch(e){}try{buildBanner();}catch(e){}try{injectFooterBar();}catch(e){}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
})();

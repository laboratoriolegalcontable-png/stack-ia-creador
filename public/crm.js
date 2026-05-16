const STATUSES=[{id:'nuevo',label:'Nuevo',cls:'col-nuevo'},{id:'contactado',label:'Contactado',cls:'col-contactado'},{id:'calificado',label:'Calificado',cls:'col-calificado'},{id:'propuesta',label:'Propuesta',cls:'col-propuesta'},{id:'ganado',label:'Ganado',cls:'col-ganado'},{id:'perdido',label:'Perdido',cls:'col-perdido'}];
const BIZ={abogacia:'Abogacía',inmobiliaria:'Inmobiliaria',ia:'Estudio Oro IA'};
const SRC={whatsapp:'WhatsApp','meta-ads':'Meta Ads',web:'Web',instagram:'Instagram',referido:'Referido'};
const DEMO=[{id:'l1',name:'María González',phone:'+54 11 4500-1234',email:'maria@gmail.com',biz:'abogacia',source:'whatsapp',status:'nuevo',company:'Caso sucesorio',notes:'Heredera en disputa familiar. Consulta urgente.',date:'2026-05-14'},{id:'l2',name:'Carlos Rodríguez',phone:'+54 11 3300-5678',email:'carlos@empresa.com',biz:'inmobiliaria',source:'meta-ads',status:'calificado',company:'Corp. Azul SA',notes:'Busca local comercial en Palermo. Budget $200k USD.',date:'2026-05-12'},{id:'l3',name:'Laura Martínez',phone:'+54 11 5500-9012',email:'laura@startup.io',biz:'ia',source:'instagram',status:'contactado',company:'LauraDesigns',notes:'Quiere automatizar su agencia con IA. 3 clientes activos.',date:'2026-05-13'},{id:'l4',name:'Juan Pérez',phone:'+54 11 2200-3456',email:'juan@outlook.com',biz:'abogacia',source:'referido',status:'propuesta',company:'Accidente laboral',notes:'Referido por María G. Propuesta de honorarios enviada.',date:'2026-05-10'},{id:'l5',name:'Ana García',phone:'+54 11 1100-7890',email:'ana@correo.com',biz:'inmobiliaria',source:'web',status:'ganado',company:'Depto. 3 amb. Recoleta',notes:'Compra cerrada. Escritura en proceso.',date:'2026-05-08'},{id:'l6',name:'Rodrigo Silva',phone:'+54 11 6600-2345',email:'rsilva@empresa.ar',biz:'abogacia',source:'meta-ads',status:'perdido',company:'Divorcio conflictivo',notes:'Eligió otro estudio por precio.',date:'2026-05-05'},{id:'l7',name:'Valeria Torres',phone:'+54 11 7700-6789',email:'val@freelance.com',biz:'ia',source:'whatsapp',status:'nuevo',company:'Agencia de contenido',notes:'5 reels/semana. Quiere stack IA completo.',date:'2026-05-15'},{id:'l8',name:'Martín López',phone:'+54 11 8800-0123',email:'martin@gmail.com',biz:'inmobiliaria',source:'referido',status:'contactado',company:'Casa unifamiliar GBA',notes:'Zona norte. Referido por Ana G.',date:'2026-05-14'}];

function loadLeads(){const r=localStorage.getItem('crm:leads');if(!r){saveLeads(DEMO);return DEMO;}return JSON.parse(r);}
function saveLeads(l){localStorage.setItem('crm:leads',JSON.stringify(l));}
function uid(){return 'l'+Date.now()+Math.random().toString(36).slice(2,5);}
function today(){return new Date().toISOString().slice(0,10);}
function fmtDate(d){if(!d)return'';const[y,m,day]=d.split('-');return day+'/'+m+'/'+y.slice(2);}

function renderStats(leads){
  const t=leads.length,g=leads.filter(function(l){return l.status==='ganado';}).length;
  const a=leads.filter(function(l){return l.status!=='ganado'&&l.status!=='perdido';}).length;
  const conv=t?Math.round(g/t*100):0;
  const biz={abogacia:leads.filter(function(l){return l.biz==='abogacia';}).length,inmobiliaria:leads.filter(function(l){return l.biz==='inmobiliaria';}).length,ia:leads.filter(function(l){return l.biz==='ia';}).length};
  document.getElementById('statsBar').innerHTML=
    '<div class="stat-pill"><div class="num">'+t+'</div><div class="lbl">Total leads</div></div>'+
    '<div class="stat-pill"><div class="num">'+a+'</div><div class="lbl">Activos</div></div>'+
    '<div class="stat-pill"><div class="num">'+conv+'%</div><div class="lbl">Conversión</div></div>'+
    '<div class="stat-pill"><div class="num" style="color:#6366f1">'+biz.abogacia+'</div><div class="lbl">Abogacía</div></div>'+
    '<div class="stat-pill"><div class="num" style="color:#16a34a">'+biz.inmobiliaria+'</div><div class="lbl">Inmob.</div></div>'+
    '<div class="stat-pill"><div class="num" style="color:#f59e0b">'+biz.ia+'</div><div class="lbl">IA</div></div>';
}

function renderBoard(leads){
  const q=(document.getElementById('leadSearch').value||'').toLowerCase();
  const bf=document.getElementById('bizFilter').value;
  const sf=document.getElementById('srcFilter').value;
  const filtered=leads.filter(function(l){
    if(q&&l.name.toLowerCase().indexOf(q)===-1&&(l.company||'').toLowerCase().indexOf(q)===-1)return false;
    if(bf&&l.biz!==bf)return false;
    if(sf&&l.source!==sf)return false;
    return true;
  });
  document.getElementById('kanbanBoard').innerHTML=STATUSES.map(function(s){
    const cols=filtered.filter(function(l){return l.status===s.id;});
    return '<div class="kanban-col '+s.cls+'">'+
      '<div class="col-header"><span class="col-title">'+s.label+'</span><span class="col-badge">'+cols.length+'</span></div>'+
      (cols.length===0?'<div class="col-empty">Sin leads</div>':cols.map(function(l){
        return '<div class="lead-card" data-lid="'+l.id+'">'+
          '<div class="lead-name">'+l.name+'</div>'+
          '<div class="lead-biz"><span class="biz-dot '+l.biz+'"></span>'+(BIZ[l.biz]||l.biz)+(l.company?' · '+l.company:'')+'</div>'+
          '<div class="lead-foot"><span class="lead-source">'+(SRC[l.source]||l.source)+'</span><span class="lead-date">'+fmtDate(l.date)+'</span></div>'+
          '</div>';
      }).join(''))+
      '</div>';
  }).join('');
  document.querySelectorAll('.lead-card').forEach(function(card){
    card.addEventListener('click',function(){openLead(card.dataset.lid);});
  });
}

function render(){const l=loadLeads();renderStats(l);renderBoard(l);}

function openModal(lead){
  var l=lead||null;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalTitle').textContent=l?'Editar Lead':'Nuevo Lead';
  document.getElementById('deleteBtn').style.display=l?'':'none';
  document.getElementById('leadId').value=l?l.id:'';
  document.getElementById('fName').value=l?l.name:'';
  document.getElementById('fPhone').value=l?l.phone:'';
  document.getElementById('fEmail').value=l?l.email:'';
  document.getElementById('fBiz').value=l?l.biz:'';
  document.getElementById('fSource').value=l?(l.source||'whatsapp'):'whatsapp';
  document.getElementById('fStatus').value=l?(l.status||'nuevo'):'nuevo';
  document.getElementById('fCompany').value=l?l.company:'';
  document.getElementById('fNotes').value=l?l.notes:'';
}
function closeModal(){document.getElementById('modalOverlay').classList.add('hidden');}

function openLead(id){
  var leads=loadLeads();
  var lead=null;
  for(var i=0;i<leads.length;i++){if(leads[i].id===id){lead=leads[i];break;}}
  if(lead)openModal(lead);
}

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('addLeadBtn').addEventListener('click',function(){openModal(null);});
  document.getElementById('cancelBtn').addEventListener('click',closeModal);
  document.getElementById('modalOverlay').addEventListener('click',function(e){
    if(e.target===document.getElementById('modalOverlay'))closeModal();
  });
  document.getElementById('deleteBtn').addEventListener('click',function(){
    var id=document.getElementById('leadId').value;
    if(!id||!confirm('¿Eliminar este lead?'))return;
    saveLeads(loadLeads().filter(function(l){return l.id!==id;}));
    closeModal();render();
  });
  document.getElementById('leadForm').addEventListener('submit',function(e){
    e.preventDefault();
    var id=document.getElementById('leadId').value;
    var leads=loadLeads();
    var existing=null;
    for(var i=0;i<leads.length;i++){if(leads[i].id===id){existing=leads[i];break;}}
    var data={id:id||uid(),name:document.getElementById('fName').value.trim(),phone:document.getElementById('fPhone').value.trim(),email:document.getElementById('fEmail').value.trim(),biz:document.getElementById('fBiz').value,source:document.getElementById('fSource').value,status:document.getElementById('fStatus').value,company:document.getElementById('fCompany').value.trim(),notes:document.getElementById('fNotes').value.trim(),date:id?(existing?existing.date:today()):today(),updatedAt:today()};
    if(id){var idx=-1;for(var j=0;j<leads.length;j++){if(leads[j].id===id){idx=j;break;}}if(idx!==-1)leads[idx]=data;}else leads.push(data);
    saveLeads(leads);closeModal();render();
  });
  ['leadSearch','bizFilter','srcFilter'].forEach(function(id){
    document.getElementById(id).addEventListener('input',render);
  });
  if(window.matchMedia('(prefers-color-scheme:dark)').matches){
    document.querySelectorAll('.crm-toolbar select,.crm-toolbar input').forEach(function(el){
      el.style.background='#111';el.style.color='#f5f5f5';
    });
  }
  render();
});

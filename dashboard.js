var SL={nuevo:'Nuevo',contactado:'Contactado',calificado:'Calificado',propuesta:'Propuesta',ganado:'Ganado',perdido:'Perdido'};
var BL={abogacia:'Abogacía',inmobiliaria:'Inmobiliaria',ia:'Estudio Oro IA'};
var BC={abogacia:'#6366f1',inmobiliaria:'#16a34a',ia:'#f59e0b'};
var SC={nuevo:'#6366f1',contactado:'#0ea5e9',calificado:'#f59e0b',propuesta:'#8b5cf6',ganado:'#16a34a',perdido:'#ef4444'};

function loadLeads(){var r=localStorage.getItem('crm:leads');return r?JSON.parse(r):[];}
function initials(n){return n.split(' ').slice(0,2).map(function(x){return x[0];}).join('').toUpperCase();}
function fmtDate(d){if(!d)return'';var parts=d.split('-');return parts[2]+'/'+parts[1]+'/'+parts[0].slice(2);}

function renderDate(){
  var d=new Date();
  document.getElementById('dashDate').textContent=d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

function renderKPIs(leads){
  var total=leads.length;
  var ganados=leads.filter(function(l){return l.status==='ganado';}).length;
  var activos=leads.filter(function(l){return l.status!=='ganado'&&l.status!=='perdido';}).length;
  var conv=total?(ganados/total*100).toFixed(0):0;
  var tod=new Date().toISOString().slice(0,10);
  var hoy=leads.filter(function(l){return l.date===tod;}).length;
  var w=new Date();w.setDate(w.getDate()-7);
  var semana=leads.filter(function(l){return new Date(l.date)>=w;}).length;
  document.getElementById('kpiGrid').innerHTML=
    '<div class="kpi-card" style="border-color:#6366f1"><div class="kpi-num" style="color:#6366f1">'+total+'</div><div class="kpi-lbl">Leads totales</div><div class="kpi-sub up">↑ '+semana+' esta semana</div></div>'+
    '<div class="kpi-card"><div class="kpi-num">'+activos+'</div><div class="kpi-lbl">Activos</div><div class="kpi-sub neutral">En proceso</div></div>'+
    '<div class="kpi-card" style="border-color:#16a34a"><div class="kpi-num" style="color:#16a34a">'+conv+'%</div><div class="kpi-lbl">Conversión</div><div class="kpi-sub '+(conv>=20?'up':'neutral')+'">'+(ganados)+' cerrados</div></div>'+
    '<div class="kpi-card" style="border-color:#f59e0b"><div class="kpi-num" style="color:#f59e0b">'+hoy+'</div><div class="kpi-lbl">Nuevos hoy</div><div class="kpi-sub neutral">Del día</div></div>';
}

function renderFunnel(leads){
  var ss=['nuevo','contactado','calificado','propuesta','ganado'];
  var counts=ss.map(function(s){return leads.filter(function(l){return l.status===s;}).length;});
  var mx=Math.max.apply(null,counts.concat([1]));
  document.getElementById('funnelViz').innerHTML=ss.map(function(s,i){
    var c=counts[i],pct=Math.max(8,Math.round(c/mx*100));
    return '<div class="f-row"><div class="f-lbl">'+SL[s]+'</div><div class="f-track"><div class="f-bar" style="width:'+pct+'%;background:'+SC[s]+'">'+( c>0?c:'' )+'</div></div><div class="f-count">'+c+'</div></div>';
  }).join('');
}

function renderRecent(leads){
  var sorted=leads.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');}).slice(0,6);
  if(!sorted.length){
    document.getElementById('recentLeads').innerHTML='<div class="empty">Sin leads aún. <a href="/crm.html">Agregar el primero →</a></div>';
    return;
  }
  document.getElementById('recentLeads').innerHTML=sorted.map(function(l){
    return '<a href="/crm.html" style="text-decoration:none;color:inherit">'+
      '<div class="lead-row">'+
      '<div class="avatar" style="background:'+(BC[l.biz]||'#6366f1')+'">'+ initials(l.name) +'</div>'+
      '<div class="lead-info"><div class="n">'+l.name+'</div><div class="m">'+(BL[l.biz]||l.biz)+' · '+fmtDate(l.date)+'</div></div>'+
      '<span class="chip chip-'+l.status+'">'+SL[l.status]+'</span>'+
      '</div></a>';
  }).join('');
}

function renderBiz(leads){
  var total=leads.length||1;
  var counts={abogacia:0,inmobiliaria:0,ia:0};
  leads.forEach(function(l){if(counts[l.biz]!==undefined)counts[l.biz]++;});
  document.getElementById('bizBars').innerHTML=Object.keys(counts).map(function(b){
    var c=counts[b],pct=Math.round(c/total*100);
    return '<div class="biz-row"><div class="biz-hdr"><span>'+BL[b]+'</span><span style="font-weight:700">'+c+' <span style="font-weight:400;color:var(--muted)">('+pct+'%)</span></span></div><div class="biz-track"><div class="biz-fill" style="width:'+pct+'%;background:'+BC[b]+'"></div></div></div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded',function(){
  var l=loadLeads();
  renderDate();renderKPIs(l);renderFunnel(l);renderRecent(l);renderBiz(l);
});

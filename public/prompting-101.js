document.addEventListener('DOMContentLoaded',function(){

// Tabs
document.querySelectorAll('.p101-tab').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.p101-tab').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.p101-section').forEach(function(s){s.classList.remove('active');});
    btn.classList.add('active');
    document.getElementById('sec-'+btn.dataset.sec).classList.add('active');
  });
});

function makeCopyBtn(text){
  var btn=document.createElement('button');
  btn.className='copy-btn';btn.textContent='Copiar';
  btn.addEventListener('click',function(){
    navigator.clipboard.writeText(text).then(function(){
      btn.textContent='Copiado ✓';btn.classList.add('copied');
      setTimeout(function(){btn.textContent='Copiar';btn.classList.remove('copied');},2200);
    });
  });
  return btn;
}

var PILLARS=[
  {num:1,color:'#6366f1',title:'Task description / role',when:'system',sub:'Siempre, al inicio del system prompt',body:'Le dices a Claude qué papel toma y para qué está aquí. Sin esto, el modelo adivina el dominio entero.',example:'Eres un asistente AI de un ajustador humano de seguros. Revisás partes de accidente de auto en sueco y determinás responsabilidad.'},
  {num:2,color:'#0ea5e9',title:'Tone context',when:'system',sub:'Cuando el output no tolera invenciones',body:'Cómo debe sonar Claude. Confiado, conciso, sin adivinar.',example:'Mantenete factual y confiado. Si no podés determinar algo con certeza, decílo en lugar de adivinar.'},
  {num:3,color:'#f59e0b',title:'Background data, documents & images',when:'system',sub:'Si tu app llama más de una vez con el mismo contexto',body:'La parte que NO cambia entre llamadas. Glosario, estructura del input, imágenes de referencia. Ideal para prompt caching.',example:'El formulario sueco tiene 17 filas numeradas y dos columnas. Los humanos lo llenan a mano con X, círculos o tachones.'},
  {num:4,color:'#8b5cf6',title:'Detailed task description & rules',when:'system',sub:'Cuando hay varios artefactos o decisiones intermedias',body:'Paso a paso de cómo razonar. El ORDEN importa: qué leer primero, qué cruzar, cuándo emitir veredicto.',example:'1) Lee el formulario fila por fila. 2) Cruzá con el sketch. 3) Solo si hay consistencia, emití veredicto.'},
  {num:5,color:'#ec4899',title:'Examples (few-shot)',when:'system',sub:'Cuando el formato importa más que la instrucción',body:'Casos difíciles ya resueltos por humanos. En producción pueden ser decenas de ejemplos etiquetados.',example:'<example>\n  <input>Veh A: fila 1,4. Veh B: fila 12.</input>\n  <output><final_verdict>Vehículo B responsable.</final_verdict></output>\n</example>'},
  {num:6,color:'#64748b',title:'Conversation history',when:'system',sub:'Apps user-facing con sesión larga. No en batch jobs.',body:'Solo si hay historia que cargue contexto real. No abuses si los turnos previos no aportan.',example:'<conversation_history>\n  El usuario confirmó que el vehículo A es del cliente.\n</conversation_history>'},
  {num:7,color:'#6366f1',title:'Immediate task description',when:'user',sub:'Siempre, al inicio o fin del user message',body:'El recordatorio del aquí-y-ahora. Reduce la deriva en prompts largos.',example:'Para este parte específico: leé el formulario, después el sketch, y emití el veredicto.'},
  {num:8,color:'#14b8a6',title:'Thinking step-by-step',when:'user',sub:'Tareas multi-paso. NUNCA en thinking-native.',body:'Chain of thought explícito. Te da traza para diagnosticar errores.',example:'Antes del veredicto, escribí tu razonamiento dentro de <thinking></thinking>.'},
  {num:9,color:'#f97316',title:'Output formatting',when:'user',sub:'Siempre que el output entre a otro sistema',body:'Cómo querés el resultado. Si lo dejás libre, Claude elige y rara vez coincide con tu parser.',example:'Envuelvé tu veredicto final dentro de <final_verdict>...</final_verdict>.'},
  {num:10,color:'#a855f7',title:'Prefilled response',when:'user',sub:'JSON estricto, XML sin preamble o cuando el modelo se sale de personaje',body:'Empezar a hablar por Claude. La forma más barata de garantizar el formato correcto.',example:'Pre-llená el assistant message con "{" para JSON, o con "<final_verdict>" para XML directo.'},
];

var pillarGrid=document.getElementById('pillarGrid');
if(pillarGrid){
  pillarGrid.innerHTML=PILLARS.map(function(p){
    var badge=p.when==='system'
      ?'<span class="system-badge">SYSTEM</span>'
      :'<span class="user-badge">USER</span>';
    var ex=p.example.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return '<div class="pillar">'+
      '<div class="pillar-head">'+
      '<div class="pillar-num" style="background:'+p.color+'">'+p.num+'</div>'+
      '<div><div class="pillar-title">'+p.title+badge+'</div><div class="pillar-sub">'+p.sub+'</div></div>'+
      '<span class="pillar-arrow">›</span></div>'+
      '<div class="pillar-body"><p>'+p.body+'</p>'+
      '<div class="when">⏱ Cuándo: '+p.sub+'</div>'+
      '<pre><code>'+ex+'</code></pre>'+
      '</div></div>';
  }).join('');
  document.querySelectorAll('.pillar-head').forEach(function(h){
    h.addEventListener('click',function(){h.closest('.pillar').classList.toggle('open');});
  });
  document.querySelectorAll('.pillar-body pre').forEach(function(pre,i){
    pre.appendChild(makeCopyBtn(PILLARS[i].example));
  });
  document.querySelector('.pillar-head').click();
}

var VERSIONS=[
  {cls:'v1',label:'v1',title:'Prompt vago',pillars:'(ninguno)',what:'Solo una línea sin contexto.',error:'Claude confunde el caso con un accidente de esquí en una calle sueca. Adivina el dominio entero.',fix:null},
  {cls:'v2',label:'v2',title:'+ Role + Tone context',pillars:'Pilares 1, 2',what:'Se añade el rol y el tono (no adivines si no estás seguro).',error:'Aún no sabe qué significa cada fila. Responde inseguro y sin veredicto.',fix:'Identifica el choque vehicular correctamente. Ya no inventa el dominio.'},
  {cls:'v3',label:'v3',title:'+ Background en system prompt',pillars:'Pilar 3',what:'La estructura del formulario sueco se mete en el system prompt.',error:'El output es libre y narrativo. No es parseable.',fix:'Lee el formulario con confianza. El system prompt estático se cachea.'},
  {cls:'v4',label:'v4',title:'+ Rules + Immediate task + Thinking',pillars:'Pilares 4, 7, 8',what:'Reglas paso a paso: leer formulario, cruzar con sketch, veredicto solo si hay consistencia.',error:'Sigue narrando demasiado. Útil para humanos, no para parsers.',fix:'Razonamiento ordenado. La calidad sube en casos difíciles.'},
  {cls:'v5',label:'v5',title:'+ Output formatting + Prefill',pillars:'Pilares 9, 10',what:'Veredicto en XML. Prefill del assistant con <final_verdict>.',error:null,fix:'Output listo para parser. Toda la preámbula se ignora desde la app.'},
];

var versionsGrid=document.getElementById('versionsGrid');
if(versionsGrid){
  versionsGrid.innerHTML=VERSIONS.map(function(v){
    return '<div class="version '+v.cls+'">'+
      '<div class="version-head">'+
      '<span class="v-badge">'+v.label+'</span>'+
      '<h3>'+v.title+'</h3>'+
      '<span class="pillars-added">'+v.pillars+'</span>'+
      '<span class="version-arrow">›</span></div>'+
      '<div class="version-body"><p class="what">'+v.what+'</p>'+
      (v.error?'<div class="error"><strong>❌ Error que seguía:</strong> '+v.error+'</div>':'')+
      (v.fix?'<div class="fix"><strong>✅ Lo que mejoró:</strong> '+v.fix+'</div>':'')+
      '</div></div>';
  }).join('');
  document.querySelectorAll('.version-head').forEach(function(h){
    h.addEventListener('click',function(){h.closest('.version').classList.toggle('open');});
  });
  document.querySelector('.version').classList.add('open');
}

var ANTI=[
  {cat:'TAREA',cls:'cat-tarea',items:['Verbo vago: "ayudáme", "mejorá"','Dos tareas en un prompt','Sin criterios de éxito: "hacelo mejor"','Agente con permisos abiertos','Descripción emocional: "está totalmente roto"','Build-it-all: "haceme la app entera"','Referencia implícita: "agrega lo otro que comentamos"']},
  {cat:'OUTPUT',cls:'cat-output',items:['Sin output format','Sin target tool','Sin constraints de longitud','Pedir disclaimer en cada respuesta','Formato contradictorio','Output imposible']},
  {cat:'CONTEXTO',cls:'cat-ctx',items:['Contexto sin demarcar','No anclar el dominio','Historia implícita','Contexto contradictorio','Sobre-contextualización']},
  {cat:'TOKENS',cls:'cat-tokens',items:['Padding promocional','Adverbios decorativos','Sinónimos repetidos','Hedging innecesario','Reverse psychology','Meta-instrucción vaga','Longitud sin propósito']},
  {cat:'TOOL',cls:'cat-tool',items:['CoT en thinking-native','Mixture of Experts simulado','Tree of Thought single-prompt','Few-shot con ejemplos incorrectos','Role sin anclaje']},
  {cat:'AGENTE',cls:'cat-agent',items:['Stop conditions ausentes','File scope abierto','Permisos implícitos','Sin checkpoints','Objetivo ambiguo']},
];

var antiList=document.getElementById('antiList');
if(antiList){
  antiList.innerHTML=ANTI.map(function(g){
    return g.items.map(function(item){
      return '<div class="anti-item"><span class="anti-cat '+g.cls+'">'+g.cat+'</span><span>'+item+'</span></div>';
    }).join('');
  }).join('');
}

var TPL1='<role>\n[Pilar 1] Sos un [rol específico] que [misión clara].\n</role>\n\n<tone>\n[Pilar 2] Mantenete [factual/cálido/técnico]. Si [incertidumbre], [acción explícita].\n</tone>\n\n<background>\n[Pilar 3] Contexto estático:\n- Estructura del input.\n- Glosario del dominio.\n- Reglas de negocio fijas.\n</background>\n\n<examples>\n[Pilar 5]\n<example><input>...</input><output>...</output></example>\n</examples>\n\n<rules>\n[Pilar 4]\n1) [Primer paso]\n2) [Segundo paso]\n3) [Veredicto]\n</rules>\n\n<output_format>\n[Pilar 9] Resultado en [<tag> o JSON].\n[Pilar 8] Razoná en <thinking></thinking>.\n</output_format>\n\n<task>\n[Pilar 7] Para este input, ejecutá las <rules>.\n</task>\n\n<!-- Pilar 10: prefill del assistant con "{" o "<tu-tag>" -->';

var TPL2='Auditá este prompt contra los 10 pilares de Prompting 101 de Anthropic:\n\n1) Task description / role\n2) Tone context\n3) Background data\n4) Detailed task & rules\n5) Examples (few-shot)\n6) Conversation history\n7) Immediate task\n8) Thinking step-by-step\n9) Output formatting\n10) Prefilled response\n\nPROMPT ACTUAL:\n"""\n[pegá tu prompt aquí]\n"""\n\nCASO DE USO: [1-2 líneas]\n\nENTREGAME:\n1. Tabla: ✅ presente / ⚠️ débil / ❌ ausente + evidencia.\n2. Los 3 pilares con mayor impacto.\n3. Versión afilada lista para copiar.\n4. Una línea de estrategia.';

var TPL3='Aplicá el flujo V1 → V5 de Prompting 101 a MI caso:\n\nMI TAREA:\n"""\n[describí qué querés que Claude haga]\n"""\n\nV1 — una línea vaga (modo error).\nV2 — V1 + role + tone context.\nV3 — V2 + background en system prompt.\nV4 — V3 + rules + immediate task + thinking.\nV5 — V4 + output format + prefill.\n\nPara cada versión: pilar agregado + prompt completo + qué error corrige.\nCerrá con: versión recomendada para producción y por qué.';

var TPL4='Refactorizame este prompt a estructura system + user:\n\nPROMPT ACTUAL:\n"""\n[pegálo entero aquí]\n"""\n\nENTREGAME:\n1) SYSTEM PROMPT (pilares 1-6 en XML).\n2) USER MESSAGE TEMPLATE con {{placeholders}}.\n3) Qué cachear y ahorro aproximado.\n4) Prefill sugerido para el assistant.';

var TEMPLATES=[
  {title:'1. System prompt de los 10 pilares',desc:'Esqueleto completo con cada pilar marcado. Llená los placeholders y tenés una v3-v4 lista de salida.',usage:'<strong>Cómo usar:</strong> Llená pilar 1 (role) y pilar 3 (background) primero. Los demás son opcionales.',code:TPL1},
  {title:'2. Auditá tu prompt actual',desc:'Pegá tu prompt. Claude lo califica pilar por pilar y entrega la versión afilada.',usage:'<strong>Cómo usar:</strong> Reemplazá los placeholders y pegálo directo en Claude.',code:TPL2},
  {title:'3. Flujo v1 → v5 para tu caso',desc:'Las 5 versiones del demo del seguro sueco aplicadas a TU tarea.',usage:'<strong>Cómo usar:</strong> Describí tu tarea en 2-3 líneas. No necesitás nada escrito aún.',code:TPL3},
  {title:'4. Refactor: mensaje único → system + user',desc:'Parte un prompt monolítico en system prompt cacheable + user message.',usage:'<strong>Cómo usar:</strong> Pegá tu prompt actual completo.',code:TPL4},
];

var templateCards=document.getElementById('templateCards');
if(templateCards){
  templateCards.innerHTML=TEMPLATES.map(function(t){
    var esc=t.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return '<div class="tpl-card">'+
      '<div class="tpl-head"><h3>'+t.title+'</h3><p>'+t.desc+'</p></div>'+
      '<div class="tpl-body"><pre><code>'+esc+'</code></pre></div>'+
      '<div class="tpl-usage">'+t.usage+'</div>'+
      '</div>';
  }).join('');
  document.querySelectorAll('.tpl-body pre').forEach(function(pre,i){
    pre.appendChild(makeCopyBtn(TEMPLATES[i].code));
  });
}

});

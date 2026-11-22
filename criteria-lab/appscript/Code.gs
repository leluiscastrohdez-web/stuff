/** CRITERIA Lab v0.3 — Google Apps Script bound to the private CRITERIA Lab workbook.
 * Never store API keys in code or client HTML. No external database/hosting needed.
 * See README for deploying as a private web app (Only myself).
 */
const LAB = {
  version: '0.3.0', model: 'gemini-3.5-flash-lite', maxAgents: 12, maxRounds: 3,
  scenarios: {
    oferta: {title: 'Oferta comercial completa: claridad y entregables', type:'oferta', a: "CRITERIA — Consultoría empresarial para micro y pequeñas empresas. Antes de cambiar tu empresa, descubre qué vale la pena cambiar. Analizamos contigo decisiones de ventas, costos, procesos y tecnología. Contrastamos la información disponible, comparamos alternativas y definimos el siguiente paso más razonable para tu situación. No empezamos recomendándote una solución. Si necesitas entender por dónde empezar, podemos proponer una Exploración Empresarial S00; si tienes una decisión específica, consultoría especializada S01-B; cuando varias áreas se afectan, diagnóstico integral S01-A. También ofrecemos implementación S02 y talleres S03 según el caso. Primera conversación de 15–20 minutos sin costo, sin diagnóstico. Cada proyecto se cotiza según alcance y entregables acordados.", b: "CRITERIA — Consultoría empresarial para micro y pequeñas empresas. ¿Debes decidir sobre un precio, un proceso, una inversión o tecnología? Antes de recomendar cambios, revisamos contigo la decisión pendiente, los datos disponibles y las alternativas. Te mostramos qué sabemos, qué falta comprobar y un siguiente paso razonable. Si el problema aún es difuso, una Exploración Empresarial S00 puede entregar una ficha breve de hallazgos e incertidumbres; si tienes una decisión específica, la consultoría S01-B puede comparar opciones y riesgos; cuando varias áreas se afectan mutuamente, S01-A puede priorizar acciones con un diagnóstico integral. Implementación S02 y talleres S03 son opciones cuando se justifican. Primero hablamos 15–20 minutos sin costo para conocer tu situación; no es diagnóstico ni obliga a pagar S00. Los honorarios, tiempos y entregables se pactan antes. Si basta orientación puntual o derivación, no recomendamos contratar más servicios."},
    mensaje: {title: 'Propuesta de valor', type:'marca', a: 'Dale rumbo a tu negocio.', b: 'Antes de cambiar tu empresa, descubre qué vale la pena cambiar.'},
    s00: {title: 'Exploración Empresarial S00', type:'servicio', a: 'Una primera conversación comercial de 15–20 minutos sin costo para conocer la situación; NO es un diagnóstico.', b: 'Exploración Empresarial S00: intervención opcional, de alcance limitado y cotizada previamente, con ficha de hallazgos e incertidumbres. No obliga a contratar consultoría posterior.'},
    taller: {title: 'Taller empresarial de IA', type:'capacitacion', a: 'Charla genérica de herramientas de IA para equipos, sin adaptación operativa.', b: 'Taller empresarial de IA: fundamentos, seguridad de datos, buenas prácticas, criterios compartidos y ejercicios contextualizados; honorarios y alcance se acuerdan por propuesta.'},
    metodo: {title:'Selección responsable de alcance', type:'metodologia', a:'A toda empresa con problemas se le recomienda un diagnóstico integral.', b:'Se recomienda la intervención mínima profesionalmente suficiente: orientación puntual, preparación de datos, S01-B, S01-A, derivación o atención prioritaria según evidencia y riesgos.'}
  },
  agents: [
    ['M01','Comercio','Micro','Propietaria cautelosa','Costo y caja',0.9,0.65],
    ['M02','Servicios','Micro','Emprendedor digital','Rapidez y autonomía',0.48,0.83],
    ['M03','Manufactura','Pequeña','Directora de operaciones','Resultados medibles',0.68,0.59],
    ['M04','Restaurante','Micro','Dueño escéptico','Ventas inmediatas',0.85,0.32],
    ['M05','Comercio','Pequeña','Gerente comercial','Diferenciación y crecimiento',0.45,0.7],
    ['M06','Servicios profesionales','Pequeña','Directora administrativa','Privacidad y cumplimiento',0.72,0.35],
    ['M07','Tecnología','Micro','Fundador tecnológico','Autogestión y herramientas',0.4,0.95],
    ['M08','Logística','Pequeña','Jefe de operaciones','Aplicación práctica',0.64,0.55],
    ['M09','Salud no clínica','Micro','Administradora','Confianza y límites',0.75,0.46],
    ['M10','Comercio','Micro','Empresa familiar','Tiempo y claridad',0.8,0.5],
    ['M11','Manufactura','Pequeña','Directora general','Evidencia y delegación',0.6,0.57],
    ['M12','Servicios','Micro','Consultor independiente','Valor incremental',0.7,0.81]
  ]
};

function doGet() {
  const page = HtmlService.createTemplateFromFile('Index');
  page.labVersion = LAB.version;
  return page.evaluate().setTitle('CRITERIA Lab — simulación empresarial').addMetaTag('viewport','width=device-width, initial-scale=1');
}
function include(file) { return HtmlService.createHtmlOutputFromFile(file).getContent(); }
function getBootstrap() {
  return {version:LAB.version, scenarios:LAB.scenarios,
    agents:LAB.agents.map(a=>({id:a[0],sector:a[1],size:a[2],role:a[3],priority:a[4]})),
    aiReady:!!PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY')};
}
function runSimulation(input) {
  input=input||{};
  const id=String(input.scenario||'mensaje');
  if (!Object.prototype.hasOwnProperty.call(LAB.scenarios,id)) throw new Error('Escenario no permitido.');
  const mode=String(input.mode||'demo');
  if (!['demo','gemini'].includes(mode)) throw new Error('Modo no válido.');
  const rounds=Math.max(1, Math.min(LAB.maxRounds, Number(input.rounds)||2));
  const n=Math.max(4, Math.min(LAB.maxAgents, Number(input.agents)||8));
  const seed=String(input.seed||'20261121').replace(/[^a-zA-Z0-9-]/g,'').slice(0,30)||'20261121';
  const target=LAB.agents.slice(0,n).map(a=>({id:a[0],sector:a[1],size:a[2],role:a[3],priority:a[4],priceConcern:a[5],digital:a[6]}));
  let result;
  if(mode==='demo') result=runDemo_(LAB.scenarios[id],target,rounds,seed);
  else result=runGemini_(LAB.scenarios[id],target,rounds,seed);
  result.runId=Utilities.getUuid();
  result.scenarioId=id;result.scenarioTitle=LAB.scenarios[id].title;result.seed=seed;
  result.mode=mode;result.version=LAB.version;result.createdAt=new Date().toISOString();
  result.warning='RESULTADOS SINTÉTICOS. No son preferencias observadas ni estimaciones de demanda.';
  const saved=saveResult_(result);
  result.saved=saved;
  return result;
}
function runDemo_(scenario,agents,rounds,seed) {
  function randomFor(key){let h=2166136261;const s=seed+'|'+key;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%10000)/10000;}
  const variants=[];
  ['a','b'].forEach((variant,vi)=>{
    let memory={};const responses=[];
    for(let round=1;round<=rounds;round++){
      agents.forEach((a,i)=>{
        const last=memory[a.id]||0;
        const val=randomFor(a.id+'|'+variant+'|'+round);
        let base=2.35 + (variant==='b'?0.55:0) + (a.digital-0.5)*0.4 - a.priceConcern*(scenario.type==='servicio'||scenario.type==='capacitacion'?0.55:0);
        if(scenario.type==='metodologia' && variant==='a') base-=0.8;
        if(round>1) base+=(last-3)*0.13;
        base+=(val-0.5)*1.3;
        const score=Math.max(1,Math.min(5,Math.round(base)));
        const decision=score>=4?'Consideraría conversar':score<=2?'No avanzaría':'Necesito aclaraciones';
        const concern=a.priority.toLowerCase();
        const reason=score>=4 ? `El planteamiento parece relevante para ${concern}, pero pediría evidencia y alcance.` : `No queda resuelto cómo atendería ${concern}; la percepción es hipotética.`;
        responses.push({round,variant,agentId:a.id,sector:a.sector,size:a.size,role:a.role,score,decision,reason,question:`¿Qué recibiría concretamente y cuáles son los límites?`,basis:'Reglas sintéticas, no IA'});
        memory[a.id]=score;
      });
    }
    variants.push({key:variant,label:variant==='a'?'Alternativa A':'Alternativa B',message:scenario[variant],responses});
  });
  return {variants,agentCount:agents.length,rounds,engine:'reglas transparentes'};
}
function runGemini_(scenario,agents,rounds,seed) {
  const key=PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if(!key) throw new Error('Aún no está configurada GEMINI_API_KEY en Propiedades de secuencia de comandos.');
  const variants=[];
  ['a','b'].forEach(variant=>{
    const memory=[];const responses=[];
    for(let round=1;round<=rounds;round++){
      const instruction='Simulación de investigación exploratoria, NO predicción. '+
       'Actúa como un grupo diverso de micro y pequeños empresarios ficticios de México. '+
       'No todos deben estar de acuerdo; incluye dudas, rechazos y explicaciones independientes. '+
       'No inventes evidencia real ni porcentajes de mercado. Responde SOLO JSON: '+
       '{"responses":[{"agentId":"M01","score":3,"decision":"Necesito aclaraciones","reason":"...","question":"..."}]}. '+
       'Cada agente debe aparecer una sola vez, puntuar 1-5 y usar decision exactamente entre: '+
       '"Consideraría conversar", "Necesito aclaraciones", "No avanzaría". Max 25 palabras en reason y question.';
      const prompt=JSON.stringify({objetivo:scenario.title,alternativa:variant,texto:scenario[variant],round,rounds,seed,
        personas:agents.map(a=>({id:a.id,sector:a.sector,tamaño:a.size,rol:a.role,prioridad:a.priority,conservador:a.priceConcern,digital:a.digital})),
        memoria_colectiva:memory.slice(-Math.min(memory.length,agents.length*2)),
        aviso:'No se debe interpretar como disposición real de pago ni validación estadística.'});
      const payload={system_instruction:{parts:[{text:instruction}]},contents:[{role:'user',parts:[{text:prompt}]}],
        generationConfig:{responseMimeType:'application/json',temperature:0.7,maxOutputTokens:3000}};
      const url='https://generativelanguage.googleapis.com/v1beta/models/'+LAB.model+':generateContent';
      const response=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',
        headers:{'x-goog-api-key':key},payload:JSON.stringify(payload),muteHttpExceptions:true});
      const status=response.getResponseCode();
      if(status<200||status>=300) {
        const body=response.getContentText().slice(0,600);
        let message='';
        try {const details=JSON.parse(body);message=String((details.error||{}).message||'').slice(0,300);}catch(e){message='No se pudo interpretar la respuesta de error.';}
        throw new Error('Gemini devolvió HTTP '+status+'. '+message+' No se guardaron resultados parciales.');
      }
      const data=JSON.parse(response.getContentText());
      const raw=((data.candidates||[])[0]||{}).content;
      const answer=(raw&&raw.parts||[]).map(x=>x.text||'').join('');
      let parsed;
      try {parsed=JSON.parse(answer);}catch(e){throw new Error('Gemini no entregó JSON válido. Vuelve a intentar con menos agentes.');}
      if(!parsed.responses||!Array.isArray(parsed.responses)) throw new Error('Gemini entregó una estructura incompleta.');
      const byId={};parsed.responses.forEach(r=>{if(r.agentId)byId[r.agentId]=r;});
      agents.forEach(a=>{
        const item=byId[a.id];if(!item)throw new Error('Respuesta incompleta de Gemini para '+a.id+'.');
        const score=Math.max(1,Math.min(5,Math.round(Number(item.score)||3)));
        const d=['Consideraría conversar','Necesito aclaraciones','No avanzaría'].includes(item.decision)?item.decision:'Necesito aclaraciones';
        const row={round,variant,agentId:a.id,sector:a.sector,size:a.size,role:a.role,score,
          decision:d,reason:String(item.reason||'Sin justificación').slice(0,350),
          question:String(item.question||'').slice(0,250),basis:'Generación con IA; no validación real'};
        responses.push(row);memory.push({agente:a.id,postura:row.decision,razon:row.reason});
      });
    }
    variants.push({key:variant,label:variant==='a'?'Alternativa A':'Alternativa B',message:scenario[variant],responses});
  });
  return {variants,agentCount:agents.length,rounds,engine:'Gemini '+LAB.model};
}
function cleanCell_(s){const v=String(s===undefined||s===null?'':s).slice(0,3000);return /^[=+@\-]/.test(v)?"'"+v:v;}
function saveResult_(result){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss) throw new Error('Abre Apps Script desde Extensiones > Apps Script de la hoja CRITERIA Lab.');
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const runs=ss.getSheetByName('Corridas');const answers=ss.getSheetByName('Respuestas');
    if(!runs||!answers)throw new Error('Faltan pestañas Corridas o Respuestas en la hoja vinculada.');
    const means=result.variants.map(v=>{
      const last=v.responses.filter(r=>r.round===result.rounds);return Math.round(last.reduce((s,r)=>s+r.score,0)/Math.max(1,last.length)*100)/100;
    });
    runs.appendRow([result.runId,result.createdAt,result.scenarioId,result.mode,result.seed,result.agentCount,result.rounds,means[0],means[1],result.version,'SINTÉTICO; no validación de mercado']);
    const values=[];result.variants.forEach(v=>v.responses.forEach(r=>{
      values.push([result.runId,result.createdAt,result.scenarioId,v.key,r.round,r.agentId,r.sector,r.size,r.role,r.score,cleanCell_(r.decision),cleanCell_(r.reason),cleanCell_(r.question),cleanCell_(r.basis)]);
    }));
    if(values.length)answers.getRange(answers.getLastRow()+1,1,values.length,values[0].length).setValues(values);
    return true;
  }finally{lock.releaseLock();}
}
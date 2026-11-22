/* CRITERIA Lab | CEV-01 v1.0 — no external dependencies.
   This audit is methodological preflight, not an implementation of the full JSON Schema 2020-12 standard. */
function auditCEV01(c){
  const errors=[],gaps=[],warnings=[];
  const required=["standard_version","case_id","name","domain","object","decision","target","hypotheses","factors","metrics","sources","design","governance"];
  const blank=v=>v===null||v===undefined||typeof v==="string"&&!v.trim();
  const array=x=>Array.isArray(x)?x:[];
  if(!c||typeof c!=="object"||Array.isArray(c)) return {schema_compatible:false,stage:"estructura_invalida",errors:["Se requiere un objeto JSON"],gaps,warnings,can_simulate:false,can_start_field_test:false};
  required.forEach(k=>{if(!(k in c))errors.push("Falta el bloque: "+k)});
  if(c.standard_version!=="1.0")errors.push("Versión desconocida del estándar");
  if(!/^CEV-[A-Za-z0-9-]{3,48}$/.test(String(c.case_id||"")))errors.push("case_id debe iniciar CEV-");
  if(blank(c.name)||blank(c.domain))errors.push("Faltan nombre o dominio");
  for(const [section,fields] of Object.entries({object:["type","description","maturity"],decision:["question","owner_role","options"],target:["unit","population","context"],design:["goal","method","assignment","replicates","sample_size_planned"],governance:["risk","personal_data","authorized","budget_limit","stop_conditions"]})){
    const x=c[section];
    if(!x||typeof x!=="object"||Array.isArray(x)){errors.push("Bloque no válido: "+section);continue;}
    fields.forEach(f=>{if(!(f in x)||blank(x[f]))errors.push("Falta "+section+"."+f)});
  }
  const H=array(c.hypotheses),F=array(c.factors),M=array(c.metrics),S=array(c.sources);
  if(!H.length)gaps.push("Registrar al menos una hipótesis falsable");
  if(!M.length)gaps.push("Definir una variable de respuesta medible");
  if(!S.length)gaps.push("Describir el origen de la evidencia, aunque esté pendiente");
  if(!array(c.decision?.options).length)gaps.push("Registrar opciones de decisión");
  H.forEach((h,i)=>{if(blank(h.claim)||blank(h.falsification))gaps.push("La hipótesis "+(i+1)+" necesita afirmación y refutación posible")});
  F.forEach((f,i)=>{if(!Array.isArray(f.levels))errors.push("Los niveles del factor "+(i+1)+" deben ser una lista")});
  const idSet=new Set();for(const source of S){if(blank(source.id))errors.push("Fuente sin id");if(idSet.has(source.id))errors.push("ID de fuente repetido: "+source.id);idSet.add(source.id)}
  M.forEach(m=>{if(blank(m.measurement)||blank(m.unit))gaps.push("Métrica "+(m.id||"?")+" sin operación de medición y unidad");if(!m.source_id)gaps.push("Métrica "+(m.id||"?")+" sin fuente vinculada");else if(!idSet.has(m.source_id))errors.push("La fuente "+m.source_id+" de la métrica "+m.id+" no existe en sources")});
  const method=c.design?.method||"por_definir";
  if(["doe_factorial","ab_aleatorizado"].includes(method)){
    if(!F.length)gaps.push("DOE/A-B necesita factores definidos");
    F.forEach(f=>{if(f.controllable&&array(f.levels).length<2)gaps.push("Factor controlable "+f.id+" necesita dos niveles o más")});
    if(!F.some(f=>f.controllable))gaps.push("DOE/A-B requiere un factor manipulable");
    if(c.design?.assignment==="por_definir")gaps.push("Falta especificar la asignación de tratamientos");
  }
  if(method==="ab_aleatorizado"&&!["aleatorizada","bloqueada"].includes(c.design?.assignment))gaps.push("A/B aleatorizado necesita mecanismo de asignación compatible");
  if(method==="por_definir")gaps.push("Elegir estrategia de prueba y justificarla");
  if(!(Number.isInteger(c.design?.sample_size_planned)&&c.design.sample_size_planned>0))gaps.push("Falta estimación de tamaño de muestra o unidades de prueba");
  if(!(Number.isInteger(c.design?.replicates)&&c.design.replicates>0))gaps.push("Faltan replicaciones planificadas");
  if(blank(c.design?.analysis_plan))gaps.push("Describir cómo se analizarán los resultados");
  if(c.governance?.authorized!==true)gaps.push("Autorizar el protocolo antes de ejecutarlo");
  if(!array(c.governance?.stop_conditions).length)gaps.push("Especificar una regla para detener el estudio");
  if(c.governance?.risk==="alto"||c.governance?.risk==="por_evaluar"||c.governance?.restricted_topic)warnings.push("Revisión humana de riesgos obligatoria antes de ejecutar");
  if(c.governance?.personal_data)warnings.push("Requiere base de tratamiento y protección de datos, consentimiento y minimización");
  const availableReal=S.some(x=>x.status==="disponible"&&x.synthetic===false&&x.usage_rights==="permitido");
  const availableSynthetic=S.some(x=>x.status==="disponible"&&x.synthetic===true);
  if(!availableReal)warnings.push("No se registró evidencia real disponible con derechos de uso confirmados");
  if(availableSynthetic)warnings.push("La evidencia sintética solo sirve para análisis del modelo, no validación externa");
  if(S.some(x=>x.usage_rights==="restringido"||x.usage_rights==="por_confirmar"))warnings.push("Hay fuentes con derechos de uso pendientes o restringidos");
  if(M.some(x=>x.measurement_quality==="no_evaluada"))warnings.push("Falta verificar la calidad del sistema de medición");
  const valid=errors.length===0;
  const sensitive=!!(c.governance?.personal_data||c.governance?.restricted_topic||["alto","por_evaluar"].includes(c.governance?.risk));
  const canSimulate=valid&&H.length>0&&M.length>0&&c.governance?.authorized===true&&!sensitive;
  const canStartFieldTest=valid&&gaps.length===0&&availableReal&&!sensitive&&["doe_factorial","ab_aleatorizado","cuasiexperimental","observacional","benchmark","prueba_tecnica","otro"].includes(method);
  let stage="ficha_incompleta";
  if(!valid)stage="estructura_invalida";
  else if(canStartFieldTest)stage="candidato_a_revision_humana_para_campo";
  else if(canSimulate)stage="exploracion_sintetica_autorizable";
  else if(!gaps.length)stage="requiere_revision_humana";
  return {schema_compatible:valid,stage,errors,gaps,warnings,can_simulate:canSimulate,can_start_field_test:canStartFieldTest,claim_validated:false,notes:"Inspección metodológica parcial, no reemplaza validador completo JSON Schema ni auditoría de evidencia."};
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports={auditCEV01};
  if (typeof require !== 'undefined' && require.main===module) {
    const fs=require('fs');
    const file=process.argv[2];
    if(!file){console.error('Uso: node validate-cev.js archivo.json');process.exit(2);}
    const input=JSON.parse(fs.readFileSync(file,'utf8'));
    const report=auditCEV01(input);
    console.log(JSON.stringify(report,null,2));
    process.exit(report.schema_compatible?0:1);
  }
}

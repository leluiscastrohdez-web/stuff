# CEV-01 — Estándar de entrada y evaluación de CRITERIA Lab (v1.0)

**Objeto:** recibir casos de cualquier sector sin confundir simulación con validación empírica. Esta especificación es una propuesta técnica; todavía no está integrada en la interfaz de Apps Script.

## Flujo lógico
1. **Admisión** — definir el objeto, contexto, decisión, hipótesis, unidad experimental y riesgos.
2. **Auditoría** — identificar fuentes reales o sintéticas, procedencia, calidad, vigencia, permisos, datos faltantes y posibles sesgos.
3. **Selección de método** — DOE para comparar factores; Monte Carlo para propagar incertidumbre cuantificada; ABM para interacciones; métodos observacionales, pruebas técnicas o revisión especializada cuando corresponda.
4. **Pre-registro** — fijar factores, niveles, respuesta, medida, replicaciones, regla de parada, recursos y análisis antes de observar resultados.
5. **Ejecución** — primero simulación si ayuda a depurar el diseño; después evidencia real autorizada cuando la pregunta exija validez externa.
6. **Dictamen** — resultados, incertidumbre, explicaciones alternativas, limitaciones y recomendación con revisión humana.

## Ficha común
- **Identificación**: `standard_version`, `case_id`, `name`, `domain`.
- **Objeto**: `object` (tipo, descripción, madurez).
- **Decisión**: `decision` (pregunta, alternativas y rol decisor).
- **Universo**: `target` (unidad, población y contexto).
- **Hipótesis**: `hypotheses` (afirmación y criterio de refutación).
- **Factores**: `factors` (controlabilidad, niveles, unidades y límites seguros).
- **Respuestas**: `metrics` (método de medida, fuente, umbral y calidad).
- **Evidencia**: `sources` (origen, permisos, vigencia, calidad y marca `synthetic`).
- **Diseño**: `design` (método, asignación, replicaciones, muestra y confusores).
- **Gobernanza**: `governance` (autorización, riesgos, privacidad y condiciones de parada).
- **Extensiones**: `extensions`, `unknowns`.

## Criterios por método

| Método | Se debe proporcionar | Se puede concluir |
|---|---|---|
| DOE | Factores manipulables, niveles, asignación, réplicas, mediciones, supuestos | Efectos/interacciones si el diseño y los datos lo respaldan |
| Monte Carlo | Fórmula/modelo, distribuciones justificadas, dependencias, iteraciones, calibración | Distribución de resultados **condicionada al modelo** |
| ABM | Agentes, reglas/políticas de decisión, topología, memoria, contexto, pasos, calibración | Comportamientos emergentes del **modelo**, no predicciones validadas |
| A/B real | Tratamientos, aleatorización, objetivo medible, muestra, seguimiento | Efectos con incertidumbre, según población y supuestos |
| Prueba técnica | Requisito, procedimiento, instrumento, tolerancia | Conformidad respecto al requisito probado |
| Observacional | Datos, temporalidad, confundidores, comparabilidad | Asociaciones o efectos condicionados al método |

**Advertencia:** rondas de agentes no equivalen a réplicas Monte Carlo. La aleatoriedad de un LLM no demuestra que sus respuestas sigan la distribución del mercado. Los `scores` creados por la IA no pueden usarse como probabilidades de compra.

## Puertas de control
- **E0 Captura:** campos mínimos y unidades de análisis.
- **E1 Observabilidad:** métrica y evidencia trazable.
- **E2 Diseño:** método adecuado, riesgos de confusión, muestra y regla de decisión.
- **E3 Autorización:** consentimiento, tratamiento de datos, revisión de seguridad.
- **E4 Ejecución:** registrar semillas, versiones, prompts, temperatura, entradas, excepciones y resultados.
- **E5 Revisión:** diferenciar observación real, simulación, hipótesis, inferencia y decisión.

Un caso incompleto debe quedar en espera; **ningún resultado se etiqueta automáticamente «validado»**.

## Artefactos en el repositorio
- `cev-01.schema.json`: estructura formal JSON Schema 2020-12.
- `validate-cev.js`: inspección preliminar de requisitos metodológicos, **no un validador completo del esquema ni de la evidencia**.
- `examples/comercial.json`: ejemplo de oferta comercial CRITERIA (prueba real pendiente).
- `examples/operaciones.json`: proceso operativo hipotético.

Estos documentos no constituyen un producto clínico, legal, financiero o de cumplimiento certificado. Las decisiones de alto riesgo requieren revisión especializada y datos autorizados.

# CRITERIA Lab v0.2 — simulación empresarial sin pagos recurrentes

**Estado al 21-11-2026:** MVP reproducible probado localmente. La simulación con Gemini solo puede activarse después de que el titular despliegue y autorice la aplicación en su cuenta Google. No hay una instalación de MiroFish ni resultados de clientes reales.

## Arquitectura

- **GitHub:** control de versiones de `appscript/Code.gs` y `appscript/Index.html`. Nunca almacenar claves de API ni hojas privadas en el repositorio.
- **Google Sheets / Drive:** base con cinco pestañas (`Guía`, `Agentes`, `Escenarios`, `Corridas`, `Respuestas`), creada en la cuenta empresarial. Los dos últimos son registros de ejecuciones; los demás son referencias legibles.
- **Google Apps Script:** aloja una aplicación web **privada**. Sirve la interfaz y conecta el motor con la hoja, sin CORS ni servidor de pago.
- **Gemini API (opcional):** `gemini-3.5-flash-lite` con acceso gratuito sujeto a cuota. La clave se guarda en Propiedades de secuencia de comandos (no en el navegador ni en Github).
- **Modo demostración:** motor determinista, sin API, disponible tanto en la interfaz local como dentro de Apps Script. Sus respuestas dependen de reglas programadas.

## Abrir ahora (sin configurar nada)

Descarga `CRITERIA_Lab_demo_offline.html` y ábrelo en un navegador de escritorio. Selecciona un escenario, agentes, rondas y semilla. Ejecuta y exporta un CSV. En este modo **no se guarda en Drive** ni se genera texto con IA.

## Activar en Google Drive (una vez)

1. Abre el libro **CRITERIA Lab | Base de simulaciones**, ubicado en la carpeta `CRITERIA - Consultoría y operación / CRITERIA Lab - Simulacion multiagente` de la cuenta de CRITERIA. La hoja debe tener las pestañas `Corridas` y `Respuestas` con los encabezados exactos del libro.
2. Menú **Extensiones → Apps Script**. Se crea un proyecto **vinculado a la hoja**.
3. Reemplaza el contenido de `Code.gs` con `appscript/Code.gs` de este paquete.
4. Pulsa **+ → HTML**, nombra el archivo `Index` y copia `appscript/Index.html`. No incluyas claves aquí.
5. Guarda y ejecuta la función `getBootstrap` desde el editor una vez para que Google solicite autorización. Comprueba que el proyecto esté vinculado al libro correcto.
6. En **Implementar → Nueva implementación → Aplicación web**, selecciona **Ejecutar como: Yo** y **Quién tiene acceso: Solo yo**. No lo publiques para 'Cualquiera'. Copia la URL `/exec` y abre la aplicación con la misma cuenta de CRITERIA.
7. Prueba `Motor: Reglas`. Debe registrar una nueva fila en `Corridas` y varias en `Respuestas`.

> El proyecto de Apps Script no puede desplegarse ni autorizarse únicamente añadiendo archivos a GitHub/Drive. Los pasos 2–6 requieren una autorización interactiva del propietario de la cuenta de Google.

## Activar Gemini sin pagar

1. En [Google AI Studio](https://aistudio.google.com/apikey) crea una clave asociada a un proyecto **sin vincular facturación** y comprueba que el modelo `gemini-3.5-flash-lite` tenga cuota gratuita en tu región/proyecto.
2. En Apps Script, **Configuración del proyecto → Propiedades de secuencia de comandos → Agregar propiedad**: nombre `GEMINI_API_KEY`, valor de tu clave. Guarda.
3. Vuelve a desplegar una **nueva versión** de la aplicación si modificaste código. Selecciona `Motor: Gemini` y comienza con 4 agentes y 1 ronda.
4. Si Gemini responde 429/403, **no** pases a una modalidad de pago: comprueba cuotas/modelo y usa el modo Reglas.

**Privacidad:** el nivel gratuito de Gemini puede usar contenido de las solicitudes para mejorar productos. No cargar información no pública de clientes, datos personales, nóminas, registros fiscales, expedientes empresariales u otros materiales confidenciales.

## Experimentos incluidos

- **Marca:** `Dale rumbo a tu negocio` versus `Antes de cambiar tu empresa, descubre qué vale la pena cambiar`.
- **S00:** conversación gratuita versus exploración remunerada; honorarios de S00 se definen en propuesta privada.
- **S03:** charla genérica versus taller aplicado de IA; los honorarios del taller se determinan según alcance.
- **Metodología:** diagnóstico integral automático versus alcance mínimo profesionalmente suficiente.

**Límite metodológico:** no simula el mercado de manera predictiva; la cifra de agentes que 'consideraría conversar' no es tasa de conversión. Los puntajes del modo Reglas reflejan sesgos explícitos en código; el modo Gemini refleja sesgos del modelo y de los prompts. Para validar, contrastar con entrevistas y solicitudes reales, dejando rastros de versión y supuestos.

## Estructura de datos y controles

En `Corridas` se registra: ID, fecha, escenario, motor, semilla, número de agentes, rondas, promedios finales A/B, versión y limitación.

En `Respuestas` se registra: ID, fecha, escenario, alternativa, ronda, ID de agente, sector, tamaño, rol, puntaje, decisión, razón, pregunta, base. Los resultados se escriben a la hoja privada al terminar la ejecución (no se muestran como 'guardados' antes).

Controles actuales: lista cerrada de escenarios, 4–12 agentes, 1–3 rondas, clave solo del lado servidor, sin endpoints externos de datos, serialización de resultados con protección básica contra inyección de fórmulas, LockService para escribir a la hoja.

Limitaciones conocidas: no existe autenticación de terceros porque el despliegue está restringido a **Solo yo**; memoria resumida solamente dentro de cada ejecución; la lista de agentes está en código y su copia en la hoja es documental; ausencia de pruebas con empresarios reales; no se garantiza que las cuotas gratuitas sigan vigentes. Scripts vinculados a una hoja deben compartirse solo con personas confiables porque editores con acceso al script podrían ver la clave almacenada.

## Cómo se comprobó el MVP

Se probaron localmente las cuatro simulaciones del modo Reglas con 12 agentes y 3 rondas: reproducibilidad del mismo conjunto de respuestas bajo la misma semilla, puntajes en rango 1–5, 36 respuestas por alternativa y sintaxis válida del código del servidor. **No se probó una ejecución autenticada de Apps Script ni una respuesta real de la API de Gemini**.

Fuentes técnicas:
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/services/quotas
- https://ai.google.dev/gemini-api/docs/pricing
- https://developers.google.com/apps-script/guides/properties

## Corrección de HTTP 404 en proyectos nuevos (noviembre de 2026)

El prototipo v0.2 original configuraba `gemini-2.5-flash-lite`, pero Google restringió la generación con modelos Gemini 2.5 a proyectos con uso histórico. En la versión v0.2.1 se cambió a `gemini-3.5-flash-lite`. Si ya copiaste Code.gs a Apps Script, cambia solo el ID del modelo, guarda y **Implementar → Administrar implementaciones → Editar → Versión: Nueva versión → Implementar**. Las implementaciones previas no recogen cambios hasta seleccionar una nueva versión. La clave API existente no necesita regenerarse.

Si hay error, el código nuevo muestra el mensaje técnico de Google, sin registrar la clave.


## v0.3 | Experimento «Oferta comercial completa (A/B)» (noviembre 2026)

Este experimento **no** compara únicamente eslóganes. Compara la descripción base de la oferta comercial con una versión que explicita quién recibe el servicio, entregables posibles, C01 (primera conversación de 15–20 minutos sin costo y sin diagnóstico), S00 (exploración opcional y cotizada), S01-B y S01-A, y límites profesionales. No publica tarifas internas.

**Materiales de trabajo en la cuenta privada de CRITERIA:**
- Base y pestañas `Oferta_AB`, `Validación real` y `Rúbrica real`: https://docs.google.com/spreadsheets/d/1Al_FUmjm_Iyg7zjxp6_PcZUUS-z-1OpiZTKuDO_wGRg/edit
- Guion y protocolo de ocho entrevistas reales: https://docs.google.com/document/d/1HaqFh3IYQwTy-0C4SvvxtX3kNeqz1j_KUUghH772QXI/edit

**Para actualizar una instalación existente de Apps Script**
1. En el editor de Google Apps Script vinculado a la hoja, reemplaza el contenido de `Code.gs` con `criteria-lab/appscript/Code.gs` y el de `Index.html` con `criteria-lab/appscript/Index.html`. No toques la propiedad privada `GEMINI_API_KEY`.
2. Guarda. Ve a `Implementar > Administrar implementaciones > lápiz (Editar) > Versión: Nueva versión > Implementar`.
3. Actualiza la URL de la aplicación y verifica que diga `Versión 0.3`. Selecciona `Oferta comercial completa (A/B)`, motor `Reglas`, cuatro agentes, una ronda; comprueba guardado en Sheets. Luego prueba Gemini con cuatro agentes y una ronda. No habilites planes de pago.
4. Repite simulaciones de forma acotada y **no tomes puntajes como intención real de compra**. La «semilla» no garantiza reproducción determinista de respuestas de Gemini.
5. Antes de concluir, recoge ocho entrevistas voluntarias reales. La hoja usa E01–E08, con orden de exposición equilibrado: cuatro A→B y cuatro B→A. No incluyas identidades, teléfonos o datos comerciales sensibles.

**Advertencia metodológica:** la versión B es más extensa; el experimento mezcla redacción, detalle y longitud. Además, un mismo LLM representa múltiples personajes, que no son muestras independientes.

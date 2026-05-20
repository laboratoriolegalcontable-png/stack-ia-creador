// Behavior Contract System for Narakia Bots
// A contract is a { validate_input, validate_output, invariants } triple
// Each bot has named capabilities. Each capability has:
//   validate_input(input)  -> string[]  (empty = valid)
//   validate_output(output) -> string[] (empty = valid)
//   invariants              -> string[] (plain-text rules always enforced)

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function isISODateString(val) {
  if (typeof val !== 'string') return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && val.includes('T');
}

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isPositiveNumber(val) {
  return typeof val === 'number' && isFinite(val) && val > 0;
}

function isUUID(val) {
  return typeof val === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

// ---------------------------------------------------------------------------
// CONTRACTS
// ---------------------------------------------------------------------------

export const CONTRACTS = {

  // =========================================================================
  // LUCRECIA — Legal assistant: meetings, client intake, minutes
  // =========================================================================
  lucrecia: {

    schedule_meeting: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') {
          return ['Input must be an object'];
        }
        // participants: array, min 2 elements, each a non-empty string
        if (!Array.isArray(input.participants)) {
          errors.push('participants must be an array');
        } else if (input.participants.length < 2) {
          errors.push('participants must have at least 2 members');
        } else if (!input.participants.every(p => isNonEmptyString(p))) {
          errors.push('every participant must be a non-empty string (name or email)');
        }
        // datetime: ISO 8601
        if (!isISODateString(input.datetime)) {
          errors.push('datetime must be a valid ISO 8601 string (e.g. 2025-06-10T15:00:00-03:00)');
        } else {
          const dt = new Date(input.datetime);
          if (dt < new Date()) {
            errors.push('datetime must be in the future');
          }
        }
        // platform
        const VALID_PLATFORMS = ['zoom', 'meet', 'teams', 'whatsapp'];
        if (!VALID_PLATFORMS.includes(input.platform)) {
          errors.push(`platform must be one of: ${VALID_PLATFORMS.join(', ')}`);
        }
        // optional: duration_minutes
        if (input.duration_minutes !== undefined) {
          if (!isPositiveNumber(input.duration_minutes) || input.duration_minutes > 480) {
            errors.push('duration_minutes must be a positive number not exceeding 480');
          }
        }
        // optional: agenda
        if (input.agenda !== undefined && !isNonEmptyString(input.agenda)) {
          errors.push('agenda must be a non-empty string when provided');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') {
          return ['Output must be an object'];
        }
        if (output.confirmation_sent !== true) {
          errors.push('confirmation_sent must be boolean true');
        }
        if (!isNonEmptyString(output.event_id)) {
          errors.push('event_id must be a non-empty string');
        }
        if (!Array.isArray(output.participants_notified) || output.participants_notified.length === 0) {
          errors.push('participants_notified must be a non-empty array');
        }
        if (!isNonEmptyString(output.meeting_link) && output.platform !== 'whatsapp') {
          errors.push('meeting_link must be present for zoom/meet/teams platforms');
        }
        if (!isISODateString(output.confirmed_datetime)) {
          errors.push('confirmed_datetime must be a valid ISO 8601 string');
        }
        return errors;
      },

      invariants: [
        'Siempre incluir disclaimer de disponibilidad horaria',
        'Nunca confirmar reunión sin verificar disponibilidad de todos los participantes',
        'Siempre notificar a todos los participantes con al menos 24h de anticipación',
        'Registrar toda reunión en el sistema de eventos del bot',
        'No programar reuniones fuera del horario laboral (08:00–20:00 ART) sin consentimiento explícito'
      ]
    },

    client_intake: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.nombre_completo)) {
          errors.push('nombre_completo es requerido y debe ser un string no vacío');
        }
        // CUIL or DNI
        if (!isNonEmptyString(input.cuil) && !isNonEmptyString(input.dni)) {
          errors.push('Se requiere cuil o dni del cliente');
        }
        if (input.cuil) {
          const kernel = new DeterministicKernel();
          const cuilResult = kernel.validateCUIL(input.cuil);
          if (!cuilResult.valid) {
            errors.push(`CUIL inválido: ${input.cuil}`);
          }
        }
        // email
        if (!isNonEmptyString(input.email) || !input.email.includes('@')) {
          errors.push('email debe ser una dirección válida');
        }
        // tipo_consulta
        const TIPOS_CONSULTA = ['civil', 'laboral', 'societario', 'consumidor', 'penal', 'contencioso_administrativo', 'otro'];
        if (!TIPOS_CONSULTA.includes(input.tipo_consulta)) {
          errors.push(`tipo_consulta debe ser uno de: ${TIPOS_CONSULTA.join(', ')}`);
        }
        // descripcion_breve
        if (!isNonEmptyString(input.descripcion_breve) || input.descripcion_breve.length < 20) {
          errors.push('descripcion_breve debe tener al menos 20 caracteres');
        }
        // urgencia
        const URGENCIAS = ['urgente', 'normal', 'puede_esperar'];
        if (input.urgencia && !URGENCIAS.includes(input.urgencia)) {
          errors.push(`urgencia debe ser uno de: ${URGENCIAS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!isNonEmptyString(output.expediente_id)) {
          errors.push('expediente_id debe ser un string no vacío');
        }
        if (!isNonEmptyString(output.abogado_asignado)) {
          errors.push('abogado_asignado debe ser un string no vacío');
        }
        if (!isISODateString(output.proxima_accion_fecha)) {
          errors.push('proxima_accion_fecha debe ser una fecha ISO válida');
        }
        if (!isNonEmptyString(output.resumen_caso)) {
          errors.push('resumen_caso debe ser un string no vacío');
        }
        if (typeof output.conflicto_intereses_verificado !== 'boolean') {
          errors.push('conflicto_intereses_verificado debe ser boolean');
        }
        return errors;
      },

      invariants: [
        'Verificar conflicto de intereses ANTES de aceptar el caso',
        'Nunca prometer resultado favorable en la consulta inicial',
        'Guardar consentimiento informado sobre confidencialidad antes de proceder',
        'Asignar número de expediente único e inmutable',
        'Notificar al abogado supervisor en casos urgentes dentro de 1 hora'
      ]
    },

    generate_minutes: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.reunion_id)) {
          errors.push('reunion_id es requerido');
        }
        if (!Array.isArray(input.asistentes) || input.asistentes.length === 0) {
          errors.push('asistentes debe ser un array no vacío');
        }
        if (!isISODateString(input.fecha_inicio)) {
          errors.push('fecha_inicio debe ser una fecha ISO válida');
        }
        if (!isISODateString(input.fecha_fin)) {
          errors.push('fecha_fin debe ser una fecha ISO válida');
        }
        if (input.fecha_inicio && input.fecha_fin) {
          const start = new Date(input.fecha_inicio);
          const end = new Date(input.fecha_fin);
          if (end <= start) {
            errors.push('fecha_fin debe ser posterior a fecha_inicio');
          }
        }
        if (!Array.isArray(input.temas_tratados) || input.temas_tratados.length === 0) {
          errors.push('temas_tratados debe ser un array no vacío');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!isNonEmptyString(output.acta_id)) {
          errors.push('acta_id es requerido');
        }
        if (!isNonEmptyString(output.contenido_acta)) {
          errors.push('contenido_acta debe ser un string no vacío');
        }
        if (!Array.isArray(output.compromisos_asumidos)) {
          errors.push('compromisos_asumidos debe ser un array');
        }
        if (typeof output.firmada !== 'boolean') {
          errors.push('firmada debe ser boolean');
        }
        if (!isNonEmptyString(output.formato)) {
          errors.push('formato es requerido (pdf|docx|markdown)');
        }
        return errors;
      },

      invariants: [
        'Las actas son documentos oficiales: nunca alterar contenido post-firma',
        'Incluir todos los compromisos asumidos con responsable y fecha límite',
        'El acta debe estar disponible dentro de las 24h de finalizada la reunión',
        'Enviar copia a todos los asistentes automáticamente'
      ]
    }
  },

  // =========================================================================
  // ORACULO — Orchestrator: coordinates agents, sends alerts, searches the web
  // =========================================================================
  oraculo: {

    orchestrate_agents: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.objetivo)) {
          errors.push('objetivo debe ser un string no vacío que describa la tarea maestra');
        }
        const VALID_AGENTS = ['lucrecia', 'valentina', 'megan', 'oraculo'];
        if (!Array.isArray(input.agentes_requeridos) || input.agentes_requeridos.length === 0) {
          errors.push('agentes_requeridos debe ser un array no vacío');
        } else {
          const invalid = input.agentes_requeridos.filter(a => !VALID_AGENTS.includes(a));
          if (invalid.length > 0) {
            errors.push(`Agentes inválidos: ${invalid.join(', ')}. Válidos: ${VALID_AGENTS.join(', ')}`);
          }
        }
        if (input.timeout_ms !== undefined) {
          if (!isPositiveNumber(input.timeout_ms) || input.timeout_ms > 300000) {
            errors.push('timeout_ms debe ser un número positivo no mayor a 300000 (5 minutos)');
          }
        }
        if (input.prioridad !== undefined) {
          const PRIORIDADES = ['alta', 'media', 'baja'];
          if (!PRIORIDADES.includes(input.prioridad)) {
            errors.push(`prioridad debe ser una de: ${PRIORIDADES.join(', ')}`);
          }
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!isNonEmptyString(output.orchestration_id)) {
          errors.push('orchestration_id es requerido');
        }
        if (!['completed', 'partial', 'failed'].includes(output.status)) {
          errors.push('status debe ser completed, partial o failed');
        }
        if (!Array.isArray(output.agent_results)) {
          errors.push('agent_results debe ser un array');
        }
        if (typeof output.total_duration_ms !== 'number') {
          errors.push('total_duration_ms debe ser un número');
        }
        if (!isNonEmptyString(output.summary)) {
          errors.push('summary es requerido');
        }
        return errors;
      },

      invariants: [
        'Nunca delegar decisiones que involucren dinero real a agentes sin supervisión humana',
        'Registrar todas las orquestaciones en el event store para auditoría',
        'Si un agente falla 3 veces consecutivas, escalar a supervisión humana',
        'Respetar el timeout_ms: interrumpir y reportar estado parcial si se supera',
        'Nunca orquestar el agente oraculo recursivamente sin flag explícito allow_recursion'
      ]
    },

    send_alert: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        const CHANNELS = ['whatsapp', 'email', 'slack', 'telegram'];
        if (!CHANNELS.includes(input.channel)) {
          errors.push(`channel debe ser uno de: ${CHANNELS.join(', ')}`);
        }
        if (!isNonEmptyString(input.recipient)) {
          errors.push('recipient es requerido (número, email o username)');
        }
        if (!isNonEmptyString(input.message)) {
          errors.push('message es requerido');
        }
        if (input.message && input.message.length > 4096) {
          errors.push('message no puede superar 4096 caracteres');
        }
        const SEVERITIES = ['info', 'warning', 'critical'];
        if (!SEVERITIES.includes(input.severity)) {
          errors.push(`severity debe ser uno de: ${SEVERITIES.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (output.delivered !== true) {
          errors.push('delivered debe ser true');
        }
        if (!isNonEmptyString(output.message_id)) {
          errors.push('message_id es requerido');
        }
        if (!isISODateString(output.sent_at)) {
          errors.push('sent_at debe ser una fecha ISO válida');
        }
        return errors;
      },

      invariants: [
        'Alertas CRITICAL deben entregarse por al menos 2 canales simultáneamente',
        'Registrar todos los envíos en el event store con mensaje y destinatario',
        'Nunca incluir datos sensibles (contraseñas, tokens, CUIL) en alertas',
        'Reintentar entrega hasta 3 veces con backoff exponencial antes de declarar fallo'
      ]
    },

    web_search: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.query)) {
          errors.push('query es requerido');
        }
        if (input.query && input.query.length > 500) {
          errors.push('query no puede superar 500 caracteres');
        }
        if (input.max_results !== undefined) {
          if (!Number.isInteger(input.max_results) || input.max_results < 1 || input.max_results > 50) {
            errors.push('max_results debe ser un entero entre 1 y 50');
          }
        }
        const VALID_LANGS = ['es', 'en', 'pt', 'fr', 'de'];
        if (input.language && !VALID_LANGS.includes(input.language)) {
          errors.push(`language debe ser uno de: ${VALID_LANGS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!Array.isArray(output.results)) {
          errors.push('results debe ser un array');
        } else {
          output.results.forEach((r, i) => {
            if (!isNonEmptyString(r.title)) errors.push(`results[${i}].title es requerido`);
            if (!isNonEmptyString(r.url)) errors.push(`results[${i}].url es requerido`);
            if (!isNonEmptyString(r.snippet)) errors.push(`results[${i}].snippet es requerido`);
          });
        }
        if (!isNonEmptyString(output.search_id)) {
          errors.push('search_id es requerido');
        }
        return errors;
      },

      invariants: [
        'Nunca presentar resultados de búsqueda como hechos verificados sin citación de fuente',
        'Indicar siempre la fecha de la búsqueda para contextualizar la vigencia de la información',
        'No almacenar consultas de búsqueda que contengan datos personales identificables',
        'Filtrar resultados de sitios con historia de desinformación conocida'
      ]
    }
  },

  // =========================================================================
  // VALENTINA — Consumer protection: intake, qualification, COPREC filing
  // =========================================================================
  valentina: {

    intake_claim: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.nombre_reclamante)) {
          errors.push('nombre_reclamante es requerido');
        }
        const kernel = new DeterministicKernel();
        if (!isNonEmptyString(input.cuil_reclamante)) {
          errors.push('cuil_reclamante es requerido');
        } else {
          const cuilResult = kernel.validateCUIL(input.cuil_reclamante);
          if (!cuilResult.valid) {
            errors.push(`CUIL inválido: ${input.cuil_reclamante}`);
          }
        }
        if (!isNonEmptyString(input.empresa_reclamada)) {
          errors.push('empresa_reclamada es requerida');
        }
        if (!isNonEmptyString(input.descripcion_hecho)) {
          errors.push('descripcion_hecho es requerido');
        }
        if (!isISODateString(input.fecha_hecho)) {
          errors.push('fecha_hecho debe ser una fecha ISO válida');
        }
        if (input.monto_reclamado !== undefined) {
          if (!isPositiveNumber(input.monto_reclamado)) {
            errors.push('monto_reclamado debe ser un número positivo');
          }
        }
        const MONEDAS = ['ARS', 'USD', 'EUR'];
        if (input.moneda && !MONEDAS.includes(input.moneda)) {
          errors.push(`moneda debe ser una de: ${MONEDAS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!isNonEmptyString(output.reclamo_id)) {
          errors.push('reclamo_id es requerido');
        }
        if (!isNonEmptyString(output.categoria)) {
          errors.push('categoria es requerida');
        }
        if (!['alta', 'media', 'baja'].includes(output.prioridad)) {
          errors.push('prioridad debe ser alta, media o baja');
        }
        if (typeof output.prescripto !== 'boolean') {
          errors.push('prescripto debe ser boolean');
        }
        if (!isNonEmptyString(output.organismo_competente)) {
          errors.push('organismo_competente es requerido');
        }
        return errors;
      },

      invariants: [
        'Verificar prescripción SIEMPRE antes de aceptar el reclamo (Ley 24.240 art. 50: 3 años)',
        'Informar al reclamante del estado dentro de las 48h de recibido el reclamo',
        'Nunca comprometer resultado del reclamo en la etapa de intake',
        'Clasificar el reclamo usando el kernel determinista, no inferencia del LLM'
      ]
    },

    qualify_claim: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.reclamo_id)) {
          errors.push('reclamo_id es requerido');
        }
        if (!isNonEmptyString(input.categoria)) {
          errors.push('categoria es requerida');
        }
        if (typeof input.monto_reclamado !== 'number' || input.monto_reclamado <= 0) {
          errors.push('monto_reclamado debe ser un número positivo');
        }
        if (!isISODateString(input.fecha_hecho)) {
          errors.push('fecha_hecho debe ser una fecha ISO válida');
        }
        if (!isNonEmptyString(input.documentacion_adjunta_url) && !Array.isArray(input.docs_adjuntos)) {
          errors.push('Se requiere documentacion_adjunta_url o docs_adjuntos (array)');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!['procede', 'no_procede', 'requiere_documentacion'].includes(output.calificacion)) {
          errors.push('calificacion debe ser procede, no_procede o requiere_documentacion');
        }
        if (!isNonEmptyString(output.fundamento_legal)) {
          errors.push('fundamento_legal es requerido');
        }
        if (typeof output.viable_coprec !== 'boolean') {
          errors.push('viable_coprec debe ser boolean');
        }
        if (!Array.isArray(output.pasos_sugeridos)) {
          errors.push('pasos_sugeridos debe ser un array');
        }
        return errors;
      },

      invariants: [
        'El fundamento legal debe citar artículos específicos de la Ley 24.240 o normas concordantes',
        'La calificación no_procede requiere fundamento_legal de mínimo 100 caracteres',
        'viable_coprec=true solo si monto_reclamado es determinable y existe proveedor registrado',
        'Registrar calificación en el event store para auditoría posterior'
      ]
    },

    file_coprec: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.reclamo_id)) {
          errors.push('reclamo_id es requerido');
        }
        if (!isNonEmptyString(input.nombre_reclamante)) {
          errors.push('nombre_reclamante es requerido');
        }
        const kernel = new DeterministicKernel();
        if (input.cuil_reclamante) {
          const cuilResult = kernel.validateCUIL(input.cuil_reclamante);
          if (!cuilResult.valid) {
            errors.push(`CUIL inválido: ${input.cuil_reclamante}`);
          }
        } else {
          errors.push('cuil_reclamante es requerido para radicar ante COPREC');
        }
        if (!isNonEmptyString(input.cuit_empresa)) {
          errors.push('cuit_empresa es requerido');
        }
        if (!isPositiveNumber(input.monto_reclamado)) {
          errors.push('monto_reclamado debe ser un número positivo');
        }
        if (!isNonEmptyString(input.relato_hechos) || input.relato_hechos.length < 50) {
          errors.push('relato_hechos debe tener al menos 50 caracteres');
        }
        if (!Array.isArray(input.documentos) || input.documentos.length === 0) {
          errors.push('documentos debe ser un array no vacío con las pruebas adjuntas');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!isNonEmptyString(output.numero_expediente_coprec)) {
          errors.push('numero_expediente_coprec es requerido');
        }
        if (!isISODateString(output.fecha_presentacion)) {
          errors.push('fecha_presentacion debe ser una fecha ISO válida');
        }
        if (!isNonEmptyString(output.url_constancia)) {
          errors.push('url_constancia del comprobante de presentación es requerida');
        }
        if (!isISODateString(output.vencimiento_respuesta_empresa)) {
          errors.push('vencimiento_respuesta_empresa debe ser una fecha ISO válida');
        }
        return errors;
      },

      invariants: [
        'Verificar que el reclamo esté calificado como procede ANTES de radicar en COPREC',
        'El plazo de respuesta de la empresa es 30 días corridos (Res. SC 47/2021)',
        'Guardar número de expediente COPREC de forma inmutable una vez asignado',
        'Notificar al reclamante con constancia de presentación dentro de 24h',
        'No radicar un mismo reclamo_id más de una vez (idempotencia)'
      ]
    }
  },

  // =========================================================================
  // MEGAN — Financial assistant: investment analysis, market comparison, modeling
  // =========================================================================
  megan: {

    analyze_investment: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isPositiveNumber(input.precio_compra)) {
          errors.push('precio_compra debe ser un número positivo');
        }
        if (!isPositiveNumber(input.precio_estimado_venta)) {
          errors.push('precio_estimado_venta debe ser un número positivo');
        }
        if (!isPositiveNumber(input.anios_tenencia)) {
          errors.push('anios_tenencia debe ser un número positivo');
        }
        if (input.gastos_operativos_anuales !== undefined && typeof input.gastos_operativos_anuales !== 'number') {
          errors.push('gastos_operativos_anuales debe ser un número');
        }
        const MONEDAS = ['ARS', 'USD', 'EUR'];
        if (!MONEDAS.includes(input.moneda)) {
          errors.push(`moneda debe ser una de: ${MONEDAS.join(', ')}`);
        }
        if (input.ingreso_alquiler_mensual !== undefined && typeof input.ingreso_alquiler_mensual !== 'number') {
          errors.push('ingreso_alquiler_mensual debe ser un número');
        }
        const TIPOS = ['inmueble', 'bono', 'accion', 'fci', 'cripto', 'otro'];
        if (!TIPOS.includes(input.tipo_activo)) {
          errors.push(`tipo_activo debe ser uno de: ${TIPOS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (typeof output.roi !== 'number') errors.push('roi debe ser un número');
        if (typeof output.tir !== 'number') errors.push('tir debe ser un número');
        if (typeof output.cap_rate !== 'number') errors.push('cap_rate debe ser un número');
        if (!isNonEmptyString(output.recomendacion)) {
          errors.push('recomendacion es requerida');
        }
        if (!Array.isArray(output.riesgos_identificados)) {
          errors.push('riesgos_identificados debe ser un array');
        }
        if (!isNonEmptyString(output.disclaimer_financiero)) {
          errors.push('disclaimer_financiero es requerido');
        }
        return errors;
      },

      invariants: [
        'Incluir SIEMPRE disclaimer: "Este análisis no constituye asesoramiento financiero profesional"',
        'ROI y TIR deben calcularse con el kernel determinista, nunca con estimaciones del LLM',
        'Indicar explícitamente la moneda de todos los valores presentados',
        'Señalar riesgos de inflación en ARS para inversiones denominadas en pesos',
        'No comparar activos de diferente naturaleza sin aclarar las diferencias de riesgo'
      ]
    },

    compare_markets: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!Array.isArray(input.mercados) || input.mercados.length < 2) {
          errors.push('mercados debe ser un array con al menos 2 elementos');
        }
        if (!isNonEmptyString(input.criterio_comparacion)) {
          errors.push('criterio_comparacion es requerido (e.g. rendimiento, liquidez, riesgo)');
        }
        if (!isNonEmptyString(input.horizonte_temporal)) {
          errors.push('horizonte_temporal es requerido (e.g. 1Y, 3Y, 5Y)');
        }
        const MONEDAS = ['ARS', 'USD', 'EUR'];
        if (!MONEDAS.includes(input.moneda_base)) {
          errors.push(`moneda_base debe ser una de: ${MONEDAS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (!Array.isArray(output.resultados_por_mercado) || output.resultados_por_mercado.length === 0) {
          errors.push('resultados_por_mercado debe ser un array no vacío');
        }
        if (!isNonEmptyString(output.mercado_ganador)) {
          errors.push('mercado_ganador es requerido según el criterio evaluado');
        }
        if (!isNonEmptyString(output.metodologia)) {
          errors.push('metodologia de comparación debe estar documentada');
        }
        if (!isNonEmptyString(output.disclaimer)) {
          errors.push('disclaimer es requerido');
        }
        return errors;
      },

      invariants: [
        'Las fuentes de datos deben ser citadas con fecha de extracción',
        'Advertir explícitamente que rendimientos pasados no garantizan resultados futuros',
        'Incluir siempre el impacto inflacionario para comparaciones en ARS',
        'No declarar un mercado "ganador" sin especificar el criterio y horizonte evaluado'
      ]
    },

    financial_model: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.nombre_proyecto)) {
          errors.push('nombre_proyecto es requerido');
        }
        if (!Array.isArray(input.flujos_caja) || input.flujos_caja.length === 0) {
          errors.push('flujos_caja debe ser un array no vacío de números');
        } else if (!input.flujos_caja.every(f => typeof f === 'number')) {
          errors.push('todos los elementos de flujos_caja deben ser números');
        }
        if (typeof input.tasa_descuento !== 'number' || input.tasa_descuento <= 0 || input.tasa_descuento >= 1) {
          errors.push('tasa_descuento debe ser un número entre 0 y 1 (exclusivo)');
        }
        if (!isNonEmptyString(input.moneda)) {
          errors.push('moneda es requerida');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];

        if (typeof output.van !== 'number') errors.push('van (VAN) debe ser un número');
        if (typeof output.tir !== 'number') errors.push('tir (TIR) debe ser un número');
        if (typeof output.payback_anios !== 'number') {
          errors.push('payback_anios debe ser un número');
        }
        if (!isNonEmptyString(output.interpretacion)) {
          errors.push('interpretacion es requerida');
        }
        if (!isNonEmptyString(output.disclaimer)) {
          errors.push('disclaimer es requerido');
        }
        return errors;
      },

      invariants: [
        'VAN y TIR calculados con fórmulas exactas, nunca aproximados por LLM',
        'La tasa de descuento debe estar documentada y justificada en la salida',
        'Siempre presentar escenario optimista, base y pesimista para proyecciones',
        'Incluir disclaimer sobre incertidumbre de proyecciones futuras'
      ]
    }
  }
};

// ---------------------------------------------------------------------------
// CONTRACT VALIDATOR
// ---------------------------------------------------------------------------

export class ContractValidator {
  constructor(botId) {
    if (!CONTRACTS[botId]) {
      throw new Error(`Bot '${botId}' no existe. Válidos: ${Object.keys(CONTRACTS).join(', ')}`);
    }
    this.botId = botId;
    this.contract = CONTRACTS[botId];
    this._storageKey = `contract_violations_${botId}`;
  }

  /**
   * Validates input against the named capability.
   * @param {string} capability
   * @param {*} input
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateInput(capability, input) {
    const cap = this._getCapability(capability);
    const errors = cap.validate_input(input);
    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates output against the named capability.
   * @param {string} capability
   * @param {*} output
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateOutput(capability, output) {
    const cap = this._getCapability(capability);
    const errors = cap.validate_output(output);
    return { valid: errors.length === 0, errors };
  }

  /**
   * Returns the invariant list for a capability.
   * @param {string} capability
   * @returns {string[]}
   */
  getInvariants(capability) {
    const cap = this._getCapability(capability);
    return cap.invariants.slice();
  }

  /**
   * Logs a contract violation to localStorage (browser) or a module-level store (Node).
   * @param {string} capability
   * @param {'input'|'output'|'invariant'} type
   * @param {string[]} errors
   */
  logViolation(capability, type, errors) {
    const record = {
      botId: this.botId,
      capability,
      type,
      errors,
      timestamp: new Date().toISOString()
    };

    if (typeof localStorage !== 'undefined') {
      // Browser context
      const existing = JSON.parse(localStorage.getItem(this._storageKey) || '[]');
      existing.push(record);
      // Keep last 1000 entries to avoid unbounded growth
      const trimmed = existing.slice(-1000);
      localStorage.setItem(this._storageKey, JSON.stringify(trimmed));
    } else {
      // Node.js / SSR context — use module-level fallback
      if (!ContractValidator._nodeStore) ContractValidator._nodeStore = {};
      if (!ContractValidator._nodeStore[this._storageKey]) {
        ContractValidator._nodeStore[this._storageKey] = [];
      }
      ContractValidator._nodeStore[this._storageKey].push(record);
      // Keep last 1000
      const store = ContractValidator._nodeStore[this._storageKey];
      if (store.length > 1000) {
        ContractValidator._nodeStore[this._storageKey] = store.slice(-1000);
      }
    }
  }

  /**
   * Retrieves recent violation history.
   * @param {number} limit
   * @returns {object[]}
   */
  getViolationHistory(limit = 100) {
    if (typeof localStorage !== 'undefined') {
      const all = JSON.parse(localStorage.getItem(this._storageKey) || '[]');
      return all.slice(-limit);
    } else {
      if (!ContractValidator._nodeStore) return [];
      const all = ContractValidator._nodeStore[this._storageKey] || [];
      return all.slice(-limit);
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  _getCapability(capability) {
    if (!this.contract[capability]) {
      throw new Error(
        `Capability '${capability}' no existe para bot '${this.botId}'. ` +
        `Disponibles: ${Object.keys(this.contract).join(', ')}`
      );
    }
    return this.contract[capability];
  }
}

// Module-level storage for Node.js environments
ContractValidator._nodeStore = {};

// ---------------------------------------------------------------------------
// DETERMINISTIC KERNEL
// Pure logic — no LLM, no randomness, no external calls.
// ---------------------------------------------------------------------------

export class DeterministicKernel {

  // ---------------------------------------------------------------------------
  // calculatePrescriptionDeadline
  // Argentine law — CCCN (Código Civil y Comercial de la Nación)
  // ---------------------------------------------------------------------------

  /**
   * Calculates the statute of limitations deadline for a legal claim.
   *
   * Rules implemented (CCCN):
   *  - Art. 2560: regla general   → 5 años
   *  - Art. 2561: daños en salud  → 3 años
   *  - Art. 2561: responsab. civil extracontractual general → 3 años
   *  - Art. 2562: vicios redhibitorios → 1 año
   *  - Art. 2562: cobro de alquileres, salarios → 2 años
   *  - Art. 2562: incapaz sin tutor → 2 años
   *  - Art. 2563: nulidad relativa → 2 años
   *  - Ley 24.240 art. 50: defensa del consumidor → 3 años
   *
   * @param {string|Date} fechaHecho  - Date of the triggering event
   * @param {string} tipoAccion       - Action type key (see PRESCRIPTION_RULES below)
   * @param {string} [jurisdiccion]   - 'nacional' (default) | province codes (future)
   * @returns {{ deadline: Date, baseRule: string, articles: string[], plazoAnios: number }}
   */
  calculatePrescriptionDeadline(fechaHecho, tipoAccion, jurisdiccion = 'nacional') {
    const PRESCRIPTION_RULES = {
      // Key: tipoAccion → { plazoAnios, baseRule, articles }
      general: {
        plazoAnios: 5,
        baseRule: 'Prescripción general',
        articles: ['CCCN art. 2560']
      },
      daños_salud: {
        plazoAnios: 3,
        baseRule: 'Daño derivado de accidente o enfermedad profesional',
        articles: ['CCCN art. 2561 párr. 2']
      },
      responsabilidad_civil: {
        plazoAnios: 3,
        baseRule: 'Responsabilidad civil extracontractual',
        articles: ['CCCN art. 2561']
      },
      defensa_consumidor: {
        plazoAnios: 3,
        baseRule: 'Acción del consumidor por Ley de Defensa del Consumidor',
        articles: ['Ley 24.240 art. 50', 'CCCN art. 2561']
      },
      vicio_redhibitorio: {
        plazoAnios: 1,
        baseRule: 'Acción por vicios ocultos (redhibitorios)',
        articles: ['CCCN art. 2562 inc. a']
      },
      cobro_alquileres: {
        plazoAnios: 2,
        baseRule: 'Cobro de alquileres, arrendamientos y rentas periódicas',
        articles: ['CCCN art. 2562 inc. c']
      },
      cobro_honorarios: {
        plazoAnios: 2,
        baseRule: 'Cobro de honorarios y salarios',
        articles: ['CCCN art. 2562 inc. d']
      },
      cobro_expensas: {
        plazoAnios: 2,
        baseRule: 'Cobro de expensas de propiedad horizontal',
        articles: ['CCCN art. 2562 inc. e']
      },
      nulidad_relativa: {
        plazoAnios: 2,
        baseRule: 'Nulidad relativa de actos jurídicos',
        articles: ['CCCN art. 2563']
      },
      nulidad_vicios_consentimiento: {
        plazoAnios: 2,
        baseRule: 'Nulidad por error, dolo o violencia (vicios del consentimiento)',
        articles: ['CCCN art. 2563 inc. a']
      },
      impugnacion_acto_societario: {
        plazoAnios: 3,
        baseRule: 'Impugnación de actos asamblearios de sociedades anónimas (LGS)',
        articles: ['Ley 19.550 art. 251']
      },
      laboral_despido: {
        plazoAnios: 2,
        baseRule: 'Acción por despido y créditos laborales (LCT)',
        articles: ['Ley 20.744 art. 256']
      },
      cobro_seguros: {
        plazoAnios: 3,
        baseRule: 'Acción por cobro de seguro de daños',
        articles: ['Ley 17.418 art. 58']
      },
      daños_transporte: {
        plazoAnios: 1,
        baseRule: 'Responsabilidad del transportista por daños al pasajero',
        articles: ['CCCN art. 1289', 'CCCN art. 2562 inc. a (vía analógica)']
      }
    };

    const rule = PRESCRIPTION_RULES[tipoAccion] || PRESCRIPTION_RULES['general'];
    const startDate = fechaHecho instanceof Date ? fechaHecho : new Date(fechaHecho);

    if (isNaN(startDate.getTime())) {
      throw new Error(`fechaHecho inválida: ${fechaHecho}`);
    }

    // Deadline = startDate + plazoAnios years (same day/month, next year)
    const deadline = new Date(startDate);
    deadline.setFullYear(deadline.getFullYear() + rule.plazoAnios);

    return {
      deadline,
      baseRule: rule.baseRule,
      articles: rule.articles,
      plazoAnios: rule.plazoAnios
    };
  }

  // ---------------------------------------------------------------------------
  // validateCUIL
  // CUIL/CUIT Argentine identifier — format: XX-XXXXXXXX-X
  // Verifier digit algorithm (same as CDV):
  //   weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  //   sum = sum(digit[i] * weight[i]) for i in 0..9
  //   remainder = sum mod 11
  //   verifier = (11 - remainder) mod 11
  //   if verifier == 10 → invalid
  //   if verifier == 11 → verifier = 0
  // ---------------------------------------------------------------------------

  /**
   * @param {string} cuil - CUIL/CUIT string, may contain dashes
   * @returns {{ valid: boolean, type: 'persona_fisica'|'persona_juridica'|'extranjero'|'otro' }}
   */
  validateCUIL(cuil) {
    if (typeof cuil !== 'string') return { valid: false, type: null };

    // Strip dashes and spaces
    const digits = cuil.replace(/[-\s]/g, '');

    // Must be exactly 11 digits
    if (!/^\d{11}$/.test(digits)) return { valid: false, type: null };

    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i], 10) * weights[i];
    }

    const remainder = sum % 11;
    let verifier = (11 - remainder) % 11;

    // 10 is invalid
    if (verifier === 10) return { valid: false, type: null };

    const lastDigit = parseInt(digits[10], 10);
    if (verifier !== lastDigit) return { valid: false, type: null };

    // Type classification by prefix (first 2 digits)
    const prefix = parseInt(digits.substring(0, 2), 10);
    let type;
    if (prefix === 20 || prefix === 23 || prefix === 24 || prefix === 27) {
      type = 'persona_fisica';
    } else if (prefix === 30 || prefix === 33 || prefix === 34) {
      type = 'persona_juridica';
    } else if (prefix === 25 || prefix === 26) {
      type = 'extranjero';
    } else {
      type = 'otro';
    }

    return { valid: true, type };
  }

  // ---------------------------------------------------------------------------
  // calculateInvestmentROI
  // Pure arithmetic — no LLM
  // ---------------------------------------------------------------------------

  /**
   * Calculates investment return metrics.
   *
   * @param {number} precioCompra              - Purchase price
   * @param {number} precioVenta               - Expected sale price
   * @param {number} anios                     - Holding period in years
   * @param {number} [gastosOperativos=0]      - Annual operating expenses
   * @param {string} [moneda='USD']            - Currency label (informational)
   * @param {number} [ingresoAlquilerMensual=0] - Monthly rental income
   * @returns {{ roi: number, tir: number, capRate: number, vanSimple: number, paybackAnios: number }}
   */
  calculateInvestmentROI(
    precioCompra,
    precioVenta,
    anios,
    gastosOperativos = 0,
    moneda = 'USD',
    ingresoAlquilerMensual = 0
  ) {
    if (precioCompra <= 0) throw new Error('precioCompra debe ser positivo');
    if (anios <= 0) throw new Error('anios debe ser positivo');

    const ingresoAnual = ingresoAlquilerMensual * 12;
    const gananciaCapital = precioVenta - precioCompra;
    const gastosTotal = gastosOperativos * anios;

    // ROI = (ganancia neta total) / inversión inicial × 100
    const gananciaNeta = gananciaCapital + ingresoAnual * anios - gastosTotal;
    const roi = (gananciaNeta / precioCompra) * 100;

    // Cap Rate = Ingreso Operativo Neto anual / Precio de compra × 100
    const noi = ingresoAnual - gastosOperativos;
    const capRate = precioCompra > 0 ? (noi / precioCompra) * 100 : 0;

    // TIR — Internal Rate of Return via Newton-Raphson over annual cash flows
    // Cash flows: [-precioCompra, CF1, CF2, ..., CFn-1, CFn + precioVenta]
    const cashFlows = [];
    cashFlows.push(-precioCompra);
    for (let t = 1; t <= anios; t++) {
      const cf = ingresoAnual - gastosOperativos;
      cashFlows.push(t === anios ? cf + precioVenta : cf);
    }
    const tir = this._calculateIRR(cashFlows);

    // VAN simple at a common discount rate (10% — used only for informational purposes)
    const discountRate = 0.10;
    let vanSimple = cashFlows[0]; // initial investment (negative)
    for (let t = 1; t < cashFlows.length; t++) {
      vanSimple += cashFlows[t] / Math.pow(1 + discountRate, t);
    }

    // Payback period (undiscounted)
    let cumulative = -precioCompra;
    let paybackAnios = anios; // worst case
    for (let t = 1; t < cashFlows.length; t++) {
      cumulative += cashFlows[t];
      if (cumulative >= 0) {
        paybackAnios = t;
        break;
      }
    }

    return {
      roi: Math.round(roi * 100) / 100,
      tir: Math.round(tir * 10000) / 100, // as percentage, 2 decimals
      capRate: Math.round(capRate * 100) / 100,
      vanSimple: Math.round(vanSimple * 100) / 100,
      paybackAnios,
      moneda
    };
  }

  /**
   * Internal Rate of Return via Newton-Raphson iteration.
   * @param {number[]} cashFlows - Array starting with negative initial investment
   * @returns {number} IRR as decimal (e.g. 0.12 for 12%)
   */
  _calculateIRR(cashFlows) {
    const MAX_ITER = 1000;
    const TOLERANCE = 1e-7;
    let rate = 0.1; // initial guess 10%

    for (let iter = 0; iter < MAX_ITER; iter++) {
      let npv = 0;
      let dnpv = 0; // derivative
      for (let t = 0; t < cashFlows.length; t++) {
        const denom = Math.pow(1 + rate, t);
        npv += cashFlows[t] / denom;
        if (t > 0) {
          dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
        }
      }
      if (Math.abs(dnpv) < 1e-12) break; // avoid division by zero
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < TOLERANCE) {
        return newRate;
      }
      rate = newRate;
    }
    return rate;
  }

  // ---------------------------------------------------------------------------
  // classifyReclamo
  // Based on Argentine consumer protection law (Ley 24.240 and concordantes)
  // ---------------------------------------------------------------------------

  /**
   * Classifies a consumer complaint and determines competent authority.
   *
   * @param {string} descripcion     - Brief description of the claim
   * @param {number} montoAfectado   - Amount affected in ARS (0 if non-monetary)
   * @returns {{
   *   categoria: string,
   *   organismoCompetente: string,
   *   plazoMaximo: number,
   *   prioridad: 'alta'|'media'|'baja',
   *   fundamento: string,
   *   articulos: string[]
   * }}
   */
  classifyReclamo(descripcion, montoAfectado) {
    if (typeof descripcion !== 'string') {
      throw new Error('descripcion debe ser un string');
    }
    if (typeof montoAfectado !== 'number' || montoAfectado < 0) {
      throw new Error('montoAfectado debe ser un número no negativo');
    }

    const desc = descripcion.toLowerCase();

    // -------------------------------------------------------------------------
    // Classification rules — order matters (most specific first)
    // -------------------------------------------------------------------------

    // 1. Financial products / banking / insurance
    if (
      /banco|tarjeta|crédito|débito|fintech|préstamo|cbu|alias|billetera virtual|mp|mercado pago|uala|naranja/i.test(desc)
    ) {
      const prioridad = montoAfectado >= 100000 ? 'alta' : montoAfectado >= 10000 ? 'media' : 'baja';
      return {
        categoria: 'servicios_financieros',
        organismoCompetente: 'Banco Central de la República Argentina (BCRA) / COPREC',
        plazoMaximo: 30,
        prioridad,
        fundamento: 'Reclamo por servicio financiero regulado por BCRA',
        articulos: ['Ley 24.240 art. 25', 'Comunicación BCRA A 5460', 'Res. SC 47/2021']
      };
    }

    // 2. Telecommunications
    if (/telefon|internet|tv|cable|fibra|fibertel|personal|claro|movistar|telecentro|directv/i.test(desc)) {
      return {
        categoria: 'telecomunicaciones',
        organismoCompetente: 'ENACOM (Ente Nacional de Comunicaciones) / COPREC',
        plazoMaximo: 30,
        prioridad: montoAfectado >= 50000 ? 'alta' : 'media',
        fundamento: 'Servicio de telecomunicaciones regulado por ENACOM',
        articulos: ['Ley 24.240 art. 25', 'Ley 27.078 art. 72', 'Res. SC 47/2021']
      };
    }

    // 3. Utilities (electricity, gas, water)
    if (/luz|electricidad|edesur|edenor|gas|metrogas|camuzzi|agua|aysa|aguas|corte de servicio/i.test(desc)) {
      return {
        categoria: 'servicios_publicos',
        organismoCompetente: 'ENRE / ENARGAS / ENTE regulador provincial / COPREC',
        plazoMaximo: 30,
        prioridad: 'alta',
        fundamento: 'Servicio público domiciliario regulado',
        articulos: ['Ley 24.240 art. 25', 'Ley 24.065 (electricidad)', 'Ley 24.076 (gas)']
      };
    }

    // 4. E-commerce / online purchases
    if (/mercado libre|tienda online|ecommerce|e-commerce|compra online|envío|delivery|producto defectuoso|garantía/i.test(desc)) {
      const prioridad = montoAfectado >= 200000 ? 'alta' : montoAfectado >= 30000 ? 'media' : 'baja';
      return {
        categoria: 'comercio_electronico',
        organismoCompetente: 'Dirección Nacional de Defensa del Consumidor / COPREC',
        plazoMaximo: 30,
        prioridad,
        fundamento: 'Compra por comercio electrónico, derecho de arrepentimiento art. 34 LDC',
        articulos: ['Ley 24.240 art. 34', 'Ley 24.240 art. 11', 'Res. 139/2020 SCI']
      };
    }

    // 5. Health / medical / prepaid health
    if (/obra social|medicina prepaga|salud|osde|swiss|galeno|hospital|clínica|ambulancia|emergencia médica/i.test(desc)) {
      return {
        categoria: 'salud',
        organismoCompetente: 'Superintendencia de Servicios de Salud / COPREC',
        plazoMaximo: 15, // health claims get shorter deadline (urgent)
        prioridad: 'alta',
        fundamento: 'Prestación de salud — aplicación directa Ley 26.682 y Ley 24.240',
        articulos: ['Ley 26.682 art. 7', 'Ley 24.240 art. 3', 'Res. SSS 1/2019']
      };
    }

    // 6. Airlines / tourism
    if (/aerolínea|vuelo|aerolineas|latam|flybondi|jet smart|turismo|agencia de viaje|hotel|reserva/i.test(desc)) {
      return {
        categoria: 'turismo_transporte_aereo',
        organismoCompetente: 'ANAC / Defensa del Consumidor / COPREC',
        plazoMaximo: 30,
        prioridad: montoAfectado >= 100000 ? 'alta' : 'media',
        fundamento: 'Transporte aéreo / turismo — Código Aeronáutico y Ley 24.240',
        articulos: ['Cód. Aeronáutico art. 139', 'Ley 24.240 art. 19', 'Res. ANAC 1532/2015']
      };
    }

    // 7. Real estate / construction
    if (/inmobili|alquiler|locación|expensas|construcción|desarrollador|fideicomiso inmobiliario/i.test(desc)) {
      return {
        categoria: 'inmobiliario',
        organismoCompetente: 'Defensa del Consumidor provincial / Justicia Civil',
        plazoMaximo: 30,
        prioridad: montoAfectado >= 500000 ? 'alta' : 'media',
        fundamento: 'Relación de consumo inmobiliario — Ley 24.240 y CCCN',
        articulos: ['Ley 24.240 art. 1', 'CCCN art. 1092', 'Ley 27.551 (alquileres)']
      };
    }

    // 8. Default / general consumer claim
    const prioridad = montoAfectado >= 500000 ? 'alta' : montoAfectado >= 50000 ? 'media' : 'baja';
    return {
      categoria: 'consumidor_general',
      organismoCompetente: 'Dirección Nacional de Defensa del Consumidor / COPREC',
      plazoMaximo: 30,
      prioridad,
      fundamento: 'Relación de consumo general amparada por Ley 24.240',
      articulos: ['Ley 24.240 art. 1', 'Ley 24.240 art. 10 bis', 'Res. SC 47/2021']
    };
  }
}

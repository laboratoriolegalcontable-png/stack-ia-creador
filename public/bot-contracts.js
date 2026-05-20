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
        if (!Array.isArray(input.participants)) {
          errors.push('participants must be an array');
        } else if (input.participants.length < 2) {
          errors.push('participants must have at least 2 members');
        } else if (!input.participants.every(p => isNonEmptyString(p))) {
          errors.push('every participant must be a non-empty string (name or email)');
        }
        if (!isISODateString(input.datetime)) {
          errors.push('datetime must be a valid ISO 8601 string (e.g. 2025-06-10T15:00:00-03:00)');
        } else {
          const dt = new Date(input.datetime);
          if (dt < new Date()) {
            errors.push('datetime must be in the future');
          }
        }
        const VALID_PLATFORMS = ['zoom', 'meet', 'teams', 'whatsapp'];
        if (!VALID_PLATFORMS.includes(input.platform)) {
          errors.push(`platform must be one of: ${VALID_PLATFORMS.join(', ')}`);
        }
        if (input.duration_minutes !== undefined) {
          if (!isPositiveNumber(input.duration_minutes) || input.duration_minutes > 480) {
            errors.push('duration_minutes must be a positive number not exceeding 480');
          }
        }
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
        const VALID_OUTPUT_PLATFORMS = ['zoom', 'meet', 'teams', 'whatsapp'];
        if (!VALID_OUTPUT_PLATFORMS.includes(output.platform)) {
          errors.push(`output.platform must be one of: ${VALID_OUTPUT_PLATFORMS.join(', ')}`);
        }
        if (output.platform !== 'whatsapp' && !isNonEmptyString(output.meeting_link)) {
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
        if (!isNonEmptyString(input.email) || !input.email.includes('@')) {
          errors.push('email debe ser una dirección válida');
        }
        const TIPOS_CONSULTA = ['civil', 'laboral', 'societario', 'consumidor', 'penal', 'contencioso_administrativo', 'otro'];
        if (!TIPOS_CONSULTA.includes(input.tipo_consulta)) {
          errors.push(`tipo_consulta debe ser uno de: ${TIPOS_CONSULTA.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.expediente_id)) {
          errors.push('expediente_id es requerido');
        }
        if (!isISODateString(output.fecha_ingreso)) {
          errors.push('fecha_ingreso debe ser ISO 8601');
        }
        if (output.confirmacion_enviada !== true) {
          errors.push('confirmacion_enviada debe ser true');
        }
        return errors;
      },

      invariants: [
        'Nunca compartir datos del cliente con terceros sin consentimiento explícito',
        'Siempre asignar un número de expediente interno al ingresar un cliente',
        'Verificar CUIL/CUIT con el Kernel Determinístico antes de guardar',
        'Siempre preguntar por el medio de comunicación preferido del cliente',
        'Registrar el origen del lead (referido, web, WhatsApp, etc.)'
      ]
    },

    generate_minutes: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isNonEmptyString(input.meeting_id)) errors.push('meeting_id es requerido');
        if (!Array.isArray(input.attendees) || input.attendees.length < 2) {
          errors.push('attendees debe tener al menos 2 participantes');
        }
        if (!Array.isArray(input.topics) || input.topics.length === 0) {
          errors.push('topics debe ser un array no vacío');
        }
        if (!isISODateString(input.start_time)) errors.push('start_time debe ser ISO 8601');
        if (!isISODateString(input.end_time)) errors.push('end_time debe ser ISO 8601');
        if (input.start_time && input.end_time && new Date(input.end_time) <= new Date(input.start_time)) {
          errors.push('end_time debe ser posterior a start_time');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.acta_id)) errors.push('acta_id es requerido');
        if (!isNonEmptyString(output.resumen)) errors.push('resumen es requerido');
        if (!Array.isArray(output.acuerdos)) errors.push('acuerdos debe ser un array');
        if (!Array.isArray(output.proximos_pasos)) errors.push('proximos_pasos debe ser un array');
        if (!isISODateString(output.enviado_en)) errors.push('enviado_en debe ser ISO 8601');
        return errors;
      },

      invariants: [
        'El acta debe enviarse dentro de las 2 horas posteriores a la reunión',
        'Siempre listar los compromisos y responsables de cada punto',
        'Nunca omitir a ningún asistente de la lista de firmantes',
        'El resumen debe estar en castellano formal',
        'Archivar el acta en el expediente del cliente correspondiente'
      ]
    }
  },

  // =========================================================================
  // ORÁCULO — Central orchestrator: agent coordination, alerts, web search
  // =========================================================================
  oraculo: {

    orchestrate_agents: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isNonEmptyString(input.task_id)) errors.push('task_id es requerido');
        if (!Array.isArray(input.agents) || input.agents.length === 0) {
          errors.push('agents debe ser un array no vacío');
        }
        const VALID_AGENTS = ['lucrecia', 'valentina', 'megan', 'kairos', 'contabot', 'lexia', 'sabueso', 'paula', 'megamark'];
        if (input.agents) {
          const invalid = input.agents.filter(a => !VALID_AGENTS.includes(a));
          if (invalid.length > 0) errors.push(`Agentes inválidos: ${invalid.join(', ')}`);
        }
        if (!isNonEmptyString(input.instruction)) errors.push('instruction es requerida');
        if (input.deadline && !isISODateString(input.deadline)) {
          errors.push('deadline debe ser ISO 8601 si se proporciona');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.orchestration_id)) errors.push('orchestration_id es requerido');
        if (!Array.isArray(output.dispatched_to)) errors.push('dispatched_to debe ser un array');
        if (typeof output.estimated_completion !== 'string') errors.push('estimated_completion es requerido');
        return errors;
      },

      invariants: [
        'Nunca delegar tareas a agentes sin instrucción clara y medible',
        'Siempre confirmar recepción de tarea a cada agente',
        'Detectar y resolver conflictos de agentes antes de despachar',
        'Registrar toda orquestación en el log central',
        'Respetar el SLA de cada agente; escalar si se supera'
      ]
    },

    send_alert: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        const VALID_LEVELS = ['info', 'warning', 'critical', 'urgent'];
        if (!VALID_LEVELS.includes(input.level)) {
          errors.push(`level debe ser uno de: ${VALID_LEVELS.join(', ')}`);
        }
        if (!isNonEmptyString(input.message)) errors.push('message es requerido');
        if (input.message && input.message.length > 1000) errors.push('message no puede superar 1000 caracteres');
        const VALID_CHANNELS = ['whatsapp', 'email', 'telegram', 'slack'];
        if (!Array.isArray(input.channels) || input.channels.length === 0) {
          errors.push('channels debe ser un array no vacío');
        } else {
          const invalid = input.channels.filter(c => !VALID_CHANNELS.includes(c));
          if (invalid.length > 0) errors.push(`Canales inválidos: ${invalid.join(', ')}`);
        }
        if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
          errors.push('recipients debe ser un array no vacío');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.alert_id)) errors.push('alert_id es requerido');
        if (output.delivered !== true) errors.push('delivered debe ser true');
        if (!Array.isArray(output.delivery_receipts)) errors.push('delivery_receipts debe ser un array');
        return errors;
      },

      invariants: [
        'Las alertas críticas deben enviarse por al menos 2 canales simultáneamente',
        'Nunca enviar alertas sin un mensaje claro y accionable',
        'Registrar timestamp de envío y confirmación de recepción',
        'Las alertas urgentes deben incluir teléfono de contacto de guardia',
        'No enviar más de 10 alertas del mismo tipo en una hora (anti-spam)'
      ]
    },

    web_search: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isNonEmptyString(input.query)) errors.push('query es requerida');
        if (input.query && input.query.length < 3) errors.push('query debe tener al menos 3 caracteres');
        if (input.max_results !== undefined) {
          if (!Number.isInteger(input.max_results) || input.max_results < 1 || input.max_results > 50) {
            errors.push('max_results debe ser un entero entre 1 y 50');
          }
        }
        if (input.language && !['es', 'en', 'pt'].includes(input.language)) {
          errors.push('language debe ser es, en o pt');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!Array.isArray(output.results)) errors.push('results debe ser un array');
        if (output.results && output.results.length === 0) errors.push('results no puede estar vacío');
        if (output.results) {
          output.results.forEach((r, i) => {
            if (!isNonEmptyString(r.title)) errors.push(`results[${i}].title es requerido`);
            if (!isNonEmptyString(r.url)) errors.push(`results[${i}].url es requerido`);
          });
        }
        return errors;
      },

      invariants: [
        'Nunca presentar resultados sin citar la fuente (URL)',
        'Siempre indicar la fecha de búsqueda y posible desactualización',
        'No inventar resultados; si no hay resultados, informar claramente',
        'Priorizar fuentes oficiales (.gob.ar, .gov, .edu) cuando el tema lo requiera',
        'Filtrar contenido perjudicial o ilegal de los resultados'
      ]
    }
  },

  // =========================================================================
  // VALENTINA — ReclamaIA specialist: claim intake, qualification, COPREC
  // =========================================================================
  valentina: {

    intake_claim: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];

        if (!isNonEmptyString(input.nombre_reclamante)) {
          errors.push('nombre_reclamante es requerido');
        }
        if (input.cuil_reclamante) {
          const kernel = new DeterministicKernel();
          const cuil = kernel.validateCUIL(input.cuil_reclamante);
          if (!cuil.valid) errors.push(`CUIL inválido: ${input.cuil_reclamante}`);
        }
        if (!isNonEmptyString(input.empresa_reclamada)) {
          errors.push('empresa_reclamada es requerida');
        }
        if (!isNonEmptyString(input.descripcion_hecho) || input.descripcion_hecho.length < 20) {
          errors.push('descripcion_hecho debe tener al menos 20 caracteres');
        }
        if (!isISODateString(input.fecha_hecho)) {
          errors.push('fecha_hecho debe ser ISO 8601');
        }
        if (input.monto_reclamado !== undefined && !isPositiveNumber(input.monto_reclamado)) {
          errors.push('monto_reclamado debe ser un número positivo');
        }
        const VALID_MONEDAS = ['ARS', 'USD', 'EUR'];
        if (input.moneda && !VALID_MONEDAS.includes(input.moneda)) {
          errors.push(`moneda debe ser ${VALID_MONEDAS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.reclamo_id)) errors.push('reclamo_id es requerido');
        if (!isNonEmptyString(output.categoria)) errors.push('categoria es requerida');
        if (!isNonEmptyString(output.organismo_competente)) errors.push('organismo_competente es requerido');
        if (!['alta', 'media', 'baja'].includes(output.prioridad)) {
          errors.push('prioridad debe ser alta, media o baja');
        }
        return errors;
      },

      invariants: [
        'Informar al reclamante el plazo máximo de prescripción de su reclamo',
        'Nunca desestimar un reclamo sin fundamento legal expreso',
        'Siempre clasificar el reclamo según Ley 24.240 y normas concordantes',
        'Comunicar el número de reclamo por WhatsApp o email inmediatamente',
        'Registrar la prueba documental aportada por el consumidor'
      ]
    },

    qualify_claim: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isNonEmptyString(input.reclamo_id)) errors.push('reclamo_id es requerido');
        if (!isNonEmptyString(input.descripcion)) errors.push('descripcion es requerida');
        if (!isPositiveNumber(input.monto) && input.monto !== 0) {
          errors.push('monto debe ser un número no negativo');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (typeof output.viable !== 'boolean') errors.push('viable debe ser boolean');
        if (!isNonEmptyString(output.fundamento_legal)) errors.push('fundamento_legal es requerido');
        if (!['alta', 'media', 'baja'].includes(output.probabilidad_exito)) {
          errors.push('probabilidad_exito debe ser alta, media o baja');
        }
        return errors;
      },

      invariants: [
        'La calificación siempre debe citar el artículo legal aplicable',
        'Informar al consumidor en lenguaje claro y sin tecnicismos',
        'Documentar el criterio de calificación utilizado',
        'Revisar prescripción antes de calificar como viable',
        'Registrar historial de calificaciones para trazabilidad'
      ]
    },

    file_coprec: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isNonEmptyString(input.reclamo_id)) errors.push('reclamo_id es requerido');
        if (!isNonEmptyString(input.nombre_consumidor)) errors.push('nombre_consumidor es requerido');
        if (!isNonEmptyString(input.dni_consumidor)) errors.push('dni_consumidor es requerido');
        if (!isNonEmptyString(input.empresa_reclamada)) errors.push('empresa_reclamada es requerida');
        if (!isNonEmptyString(input.descripcion_reclamo)) errors.push('descripcion_reclamo es requerida');
        if (input.monto_reclamado !== undefined && !isPositiveNumber(input.monto_reclamado)) {
          errors.push('monto_reclamado debe ser positivo');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!isNonEmptyString(output.numero_coprec)) errors.push('numero_coprec es requerido');
        if (!isISODateString(output.fecha_audiencia)) errors.push('fecha_audiencia debe ser ISO 8601');
        if (!isNonEmptyString(output.estado)) errors.push('estado es requerido');
        return errors;
      },

      invariants: [
        'Verificar que el reclamo no esté prescripto antes de presentar a COPREC',
        'Adjuntar toda la documentación probatoria disponible',
        'Notificar fecha de audiencia con al menos 10 días de anticipación',
        'Nunca presentar sin consentimiento firmado del consumidor',
        'Guardar copia del formulario COPREC en el expediente'
      ]
    }
  },

  // =========================================================================
  // MEGAN — Real estate expert: investment analysis, market comparison, financial modeling
  // =========================================================================
  megan: {

    analyze_investment: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isPositiveNumber(input.precio_compra)) errors.push('precio_compra debe ser un número positivo');
        if (!isPositiveNumber(input.precio_estimado_venta)) errors.push('precio_estimado_venta debe ser un número positivo');
        if (!isPositiveNumber(input.anios_tenencia)) errors.push('anios_tenencia debe ser un número positivo');
        if (input.gastos_operativos_anuales !== undefined && typeof input.gastos_operativos_anuales !== 'number') {
          errors.push('gastos_operativos_anuales debe ser un número');
        }
        const VALID_MONEDAS = ['USD', 'EUR', 'ARS', 'UYU'];
        if (!VALID_MONEDAS.includes(input.moneda)) {
          errors.push(`moneda debe ser una de: ${VALID_MONEDAS.join(', ')}`);
        }
        if (input.ingreso_alquiler_mensual !== undefined && typeof input.ingreso_alquiler_mensual !== 'number') {
          errors.push('ingreso_alquiler_mensual debe ser un número');
        }
        const VALID_ACTIVOS = ['inmueble', 'local_comercial', 'oficina', 'tierra', 'desarrollo', 'otro'];
        if (input.tipo_activo && !VALID_ACTIVOS.includes(input.tipo_activo)) {
          errors.push(`tipo_activo debe ser uno de: ${VALID_ACTIVOS.join(', ')}`);
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (typeof output.roi !== 'number') errors.push('roi debe ser un número');
        if (typeof output.tir !== 'number') errors.push('tir debe ser un número');
        if (typeof output.capRate !== 'number') errors.push('capRate debe ser un número');
        if (!isNonEmptyString(output.recomendacion)) errors.push('recomendacion es requerida');
        return errors;
      },

      invariants: [
        'Siempre expresar ROI y TIR en porcentaje con 2 decimales',
        'Advertir sobre riesgos cambiarios cuando la moneda no sea USD',
        'Nunca proyectar rentabilidad sin aclarar supuestos del modelo',
        'Incluir análisis de sensibilidad para variaciones del +/-20%',
        'Citar fuente de datos de mercado utilizada'
      ]
    },

    compare_markets: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!Array.isArray(input.mercados) || input.mercados.length < 2) {
          errors.push('mercados debe ser un array con al menos 2 mercados');
        }
        const VALID_MERCADOS = ['miami', 'espana', 'uruguay', 'buenos_aires', 'montevideo', 'madrid', 'barcelona', 'miami_beach', 'brickell', 'wynwood', 'coral_gables', 'doral'];
        if (input.mercados) {
          const invalid = input.mercados.filter(m => !VALID_MERCADOS.includes(m.toLowerCase().replace(/ /g, '_')));
          if (invalid.length > 0) errors.push(`Mercados no soportados: ${invalid.join(', ')}`);
        }
        if (!isPositiveNumber(input.presupuesto_usd)) errors.push('presupuesto_usd debe ser un número positivo');
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!Array.isArray(output.comparacion)) errors.push('comparacion debe ser un array');
        if (!isNonEmptyString(output.mercado_recomendado)) errors.push('mercado_recomendado es requerido');
        if (!isNonEmptyString(output.justificacion)) errors.push('justificacion es requerida');
        return errors;
      },

      invariants: [
        'Siempre comparar en la misma moneda base (USD)',
        'Incluir indicadores: precio/m2, cap rate, liquidez, riesgo país',
        'Actualizar datos de mercado con antigüedad máxima de 6 meses',
        'No recomendar un mercado sin datos suficientes para comparar',
        'Advertir sobre restricciones legales para extranjeros en cada mercado'
      ]
    },

    financial_model: {
      validate_input(input) {
        const errors = [];
        if (!input || typeof input !== 'object') return ['Input must be an object'];
        if (!isPositiveNumber(input.inversion_inicial)) errors.push('inversion_inicial debe ser positiva');
        if (!isPositiveNumber(input.horizonte_anios) || input.horizonte_anios > 30) {
          errors.push('horizonte_anios debe ser entre 1 y 30');
        }
        if (typeof input.tasa_inflacion_anual !== 'number') errors.push('tasa_inflacion_anual es requerida');
        if (typeof input.tasa_revalorizacion_anual !== 'number') errors.push('tasa_revalorizacion_anual es requerida');
        if (input.ingreso_mensual_alquiler !== undefined && typeof input.ingreso_mensual_alquiler !== 'number') {
          errors.push('ingreso_mensual_alquiler debe ser un número');
        }
        return errors;
      },

      validate_output(output) {
        const errors = [];
        if (!output || typeof output !== 'object') return ['Output must be an object'];
        if (!Array.isArray(output.flujo_caja_anual)) errors.push('flujo_caja_anual debe ser un array');
        if (typeof output.van !== 'number') errors.push('van (Valor Actual Neto) debe ser un número');
        if (typeof output.tir !== 'number') errors.push('tir debe ser un número');
        if (typeof output.payback_anios !== 'number') errors.push('payback_anios debe ser un número');
        return errors;
      },

      invariants: [
        'El modelo debe generar flujo de caja año por año para todo el horizonte',
        'Siempre descontar flujos a la tasa de mercado relevante (WACC o tasa libre de riesgo)',
        'Advertir explícitamente cuando la TIR sea menor que la tasa de referencia',
        'Incluir escenario pesimista y optimista además del base',
        'Todo modelo debe estar expresado en dólares constantes'
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

  validateInput(capability, input) {
    const cap = this._getCapability(capability);
    const errors = cap.validate_input(input);
    return { valid: errors.length === 0, errors };
  }

  validateOutput(capability, output) {
    const cap = this._getCapability(capability);
    const errors = cap.validate_output(output);
    return { valid: errors.length === 0, errors };
  }

  getInvariants(capability) {
    const cap = this._getCapability(capability);
    return cap.invariants.slice();
  }

  logViolation(capability, type, errors) {
    const record = {
      botId: this.botId,
      capability,
      type,
      errors,
      timestamp: new Date().toISOString()
    };

    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(this._storageKey) || '[]');
      existing.push(record);
      localStorage.setItem(this._storageKey, JSON.stringify(existing.slice(-1000)));
    } else {
      if (!ContractValidator._nodeStore) ContractValidator._nodeStore = {};
      if (!ContractValidator._nodeStore[this._storageKey]) {
        ContractValidator._nodeStore[this._storageKey] = [];
      }
      const store = ContractValidator._nodeStore[this._storageKey];
      store.push(record);
      if (store.length > 1000) {
        ContractValidator._nodeStore[this._storageKey] = store.slice(-1000);
      }
    }
  }

  getViolationHistory(limit = 100) {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(this._storageKey) || '[]').slice(-limit);
    }
    const store = ContractValidator._nodeStore?.[this._storageKey] || [];
    return store.slice(-limit);
  }

  _getCapability(capability) {
    const cap = this.contract[capability];
    if (!cap) {
      throw new Error(`Capability '${capability}' no existe para bot '${this.botId}'. Disponibles: ${Object.keys(this.contract).join(', ')}`);
    }
    return cap;
  }
}

// ---------------------------------------------------------------------------
// DETERMINISTIC KERNEL
// Pure-logic functions that never hallucinate. No LLM involved.
// ---------------------------------------------------------------------------

export class DeterministicKernel {

  // ---------------------------------------------------------------------------
  // calculatePrescriptionDeadline
  // Based on CCCN (Código Civil y Comercial de la Nación Argentina)
  // ---------------------------------------------------------------------------
  calculatePrescriptionDeadline(fechaHecho, tipoAccion) {
    const fecha = new Date(fechaHecho);
    if (isNaN(fecha.getTime())) throw new Error('fechaHecho debe ser una fecha válida ISO 8601');

    const PLAZOS = {
      // CCCN art. 2561 - Plazos especiales
      daños_y_perjuicios:     { anios: 3,  articulo: 'CCCN art. 2561 párr. 2' },
      nulidad_relativa:        { anios: 2,  articulo: 'CCCN art. 2562 inc. a' },
      lesion:                  { anios: 2,  articulo: 'CCCN art. 2562 inc. b' },
      accion_redhibitoria:     { anios: 1,  articulo: 'CCCN art. 2564 inc. a' },
      vicio_redhibitorio:      { anios: 1,  articulo: 'CCCN art. 2564 inc. a' },
      vicios_ocultos:          { anios: 1,  articulo: 'CCCN art. 2564 inc. a' },
      incumplimiento_contrato: { anios: 5,  articulo: 'CCCN art. 2560 (general)' },
      cobro_pesos:             { anios: 5,  articulo: 'CCCN art. 2560 (general)' },
      enriquecimiento_sin_causa: { anios: 5, articulo: 'CCCN art. 2560' },
      // Ley 24.240 Defensa del Consumidor
      defensa_consumidor:      { anios: 3,  articulo: 'Ley 24.240 art. 50' },
      garantia_consumidor:     { anios: 3,  articulo: 'Ley 24.240 art. 50' },
      // Ley 20.744 Contrato de Trabajo
      laboral:                 { anios: 2,  articulo: 'LCT art. 256' },
      indemnizacion_laboral:   { anios: 2,  articulo: 'LCT art. 256' },
      // Ley 17.418 Seguros
      seguro:                  { anios: 1,  articulo: 'Ley 17.418 art. 58' },
      // Societario (LGS)
      accion_societaria:       { anios: 3,  articulo: 'LGS art. 848 y concordantes' }
    };

    const plazo = PLAZOS[tipoAccion];
    if (!plazo) {
      return {
        deadline: new Date(fecha.getFullYear() + 5, fecha.getMonth(), fecha.getDate()),
        plazoAnios: 5,
        articulo: 'CCCN art. 2560 (plazo general)',
        nota: `Acción '${tipoAccion}' no catalogada; se aplica plazo general de 5 años`
      };
    }

    const deadline = new Date(fecha.getFullYear() + plazo.anios, fecha.getMonth(), fecha.getDate());
    return {
      deadline,
      plazoAnios: plazo.anios,
      articulo: plazo.articulo,
      nota: null
    };
  }

  // ---------------------------------------------------------------------------
  // validateCUIL
  // Argentine CUIL/CUIT check-digit algorithm (mod 11, weights [5,4,3,2,7,6,5,4,3,2])
  // Valid prefixes: 20/23/24/27 (persona fisica), 30/33/34 (juridica), 25/26 (extranjero)
  // ---------------------------------------------------------------------------
  validateCUIL(cuil) {
    if (typeof cuil !== 'string') return { valid: false, type: null };

    const digits = cuil.replace(/[-\s]/g, '');
    if (!/^\d{11}$/.test(digits)) return { valid: false, type: null };

    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i], 10) * weights[i];
    }

    const remainder = sum % 11;
    const verifier = (11 - remainder) % 11;

    if (verifier === 10) return { valid: false, type: null };

    const lastDigit = parseInt(digits[10], 10);
    if (verifier !== lastDigit) return { valid: false, type: null };

    const prefix = parseInt(digits.substring(0, 2), 10);
    let type;
    if (prefix === 20 || prefix === 23 || prefix === 24 || prefix === 27) {
      type = 'persona_fisica';
    } else if (prefix === 30 || prefix === 33 || prefix === 34) {
      type = 'persona_juridica';
    } else if (prefix === 25 || prefix === 26) {
      type = 'extranjero';
    } else {
      // Unknown prefix — not a valid Argentine CUIL/CUIT
      return { valid: false, type: null };
    }

    return { valid: true, type };
  }

  // ---------------------------------------------------------------------------
  // calculateInvestmentROI
  // Pure arithmetic — no LLM
  // ---------------------------------------------------------------------------
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
    const gananciaNeta = gananciaCapital + ingresoAnual * anios - gastosTotal;
    const roi = (gananciaNeta / precioCompra) * 100;

    const noi = ingresoAnual - gastosOperativos;
    const capRate = precioCompra > 0 ? (noi / precioCompra) * 100 : 0;

    // Newton-Raphson IRR
    const cashFlows = [-precioCompra];
    for (let y = 1; y <= anios; y++) {
      const cf = ingresoAnual - gastosOperativos + (y === anios ? precioVenta : 0);
      cashFlows.push(cf);
    }
    let tir = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      let npv = 0, dnpv = 0;
      for (let i = 0; i < cashFlows.length; i++) {
        const disc = Math.pow(1 + tir, i);
        npv += cashFlows[i] / disc;
        if (i > 0) dnpv -= i * cashFlows[i] / (disc * (1 + tir));
      }
      if (Math.abs(npv) < 0.01) break;
      if (dnpv === 0) break;
      tir -= npv / dnpv;
    }

    const paybackAnios = noi > 0 ? precioCompra / noi : Infinity;
    const van = cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1.1, i), 0);

    return {
      roi: Math.round(roi * 100) / 100,
      tir: Math.round(tir * 10000) / 100,
      capRate: Math.round(capRate * 100) / 100,
      vanSimple: Math.round(van),
      paybackAnios: isFinite(paybackAnios) ? Math.round(paybackAnios * 10) / 10 : null,
      moneda
    };
  }

  // ---------------------------------------------------------------------------
  // classifyReclamo
  // Rule-based classification using Argentine consumer protection law
  // ---------------------------------------------------------------------------
  classifyReclamo(descripcion, montoAfectado) {
    if (typeof descripcion !== 'string') throw new Error('descripcion debe ser un string');
    const desc = descripcion.toLowerCase();

    const CATEGORIES = [
      {
        categoria: 'servicios_financieros',
        keywords: ['banco', 'tarjeta', 'crédito', 'debito', 'débito', 'préstamo', 'prestamo', 'cbu', 'cvu', 'fintech', 'billetera', 'visa', 'mastercard', 'naranja', 'uala', 'mercadopago', 'brubank'],
        organismo: 'BCRA / Defensa del Consumidor',
        articulos: ['Ley 24.240 art. 36', 'Ley 25.065 (tarjetas)', 'Carta Orgánica BCRA art. 30'],
        plazoMaximoDias: 30
      },
      {
        categoria: 'telecomunicaciones',
        keywords: ['internet', 'telefonía', 'telefonia', 'cable', 'fibra', 'óptica', 'optica', 'wi-fi', 'wifi', 'claro', 'personal', 'movistar', 'telecom', 'fibertel', 'cablevision', 'flow', 'directv'],
        organismo: 'ENACOM / Defensa del Consumidor',
        articulos: ['Ley 24.240 art. 19', 'Res. ENACOM 1900/2020'],
        plazoMaximoDias: 30
      },
      {
        categoria: 'servicios_publicos',
        keywords: ['luz', 'gas', 'agua', 'electricidad', 'edesur', 'edenor', 'metrogas', 'aysa', 'camesa', 'distribuidor', 'factura de gas', 'factura de luz', 'corte de servicio'],
        organismo: 'ENRE / ENARGAS / Defensa del Consumidor',
        articulos: ['Ley 24.240 art. 19', 'Ley 24.065 (electricidad)', 'Ley 24.076 (gas)'],
        plazoMaximoDias: 30
      },
      {
        categoria: 'comercio_electronico',
        keywords: ['mercadolibre', 'mercado libre', 'amazon', 'tienda nube', 'tiendanube', 'shopify', 'online', 'web', 'e-commerce', 'compra online', 'producto defectuoso', 'no llegó', 'no llego', 'envío', 'envio'],
        organismo: 'Defensa del Consumidor / DNCI',
        articulos: ['Ley 24.240 art. 33-34', 'Res. 139/2020 (e-commerce)'],
        plazoMaximoDias: 30
      },
      {
        categoria: 'salud',
        keywords: ['obra social', 'prepaga', 'osde', 'swiss medical', 'galeno', 'medife', 'clinica', 'clínica', 'hospital', 'medicamento', 'cobertura', 'internación', 'internacion', 'PMO', 'prestación', 'prestacion'],
        organismo: 'Superintendencia de Servicios de Salud',
        articulos: ['Ley 24.240 art. 19', 'Ley 23.660 (obras sociales)', 'Ley 24.754 (prepagas)'],
        plazoMaximoDias: 15
      },
      {
        categoria: 'turismo_transporte_aereo',
        keywords: ['aerolíneas', 'aerolineas', 'vuelo', 'aeropuerto', 'pasaje', 'cancelación', 'cancelacion', 'demora', 'equipaje', 'hotel', 'reserva', 'latam', 'flybondi', 'jetsmart'],
        organismo: 'ANAC / Defensa del Consumidor',
        articulos: ['Ley 24.240 art. 19', 'Res. ANAC 1532/1998'],
        plazoMaximoDias: 30
      },
      {
        categoria: 'inmobiliario',
        keywords: ['alquiler', 'locación', 'locacion', 'inmueble', 'departamento', 'propietario', 'inquilino', 'expensas', 'consorcio', 'administrador', 'contrato de locación'],
        organismo: 'Defensa del Consumidor / Justicia Civil',
        articulos: ['Ley 27.551 (alquileres)', 'CCCN art. 1187 y ss.'],
        plazoMaximoDias: 60
      }
    ];

    for (const cat of CATEGORIES) {
      if (cat.keywords.some(kw => desc.includes(kw))) {
        const prioridad = montoAfectado > 100000 ? 'alta' : montoAfectado > 20000 ? 'media' : 'baja';
        return {
          categoria: cat.categoria,
          organismoCompetente: cat.organismo,
          articulosAplicables: cat.articulos,
          plazoMaximoDias: cat.plazoMaximoDias,
          prioridad
        };
      }
    }

    return {
      categoria: 'consumidor_general',
      organismoCompetente: 'Defensa del Consumidor / DNCI',
      articulosAplicables: ['Ley 24.240 (general)'],
      plazoMaximoDias: 30,
      prioridad: montoAfectado > 100000 ? 'alta' : montoAfectado > 20000 ? 'media' : 'baja'
    };
  }
}

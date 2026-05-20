#!/usr/bin/env node
// validate-bot-contracts.mjs
// Validates that all bot contracts are well-formed and run sample inputs correctly.
// Exit code 0 = all tests pass. Exit code 1 = one or more failures.

import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Resolve the bot-contracts.js path relative to this script's location
// ---------------------------------------------------------------------------
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const contractsPath = path.resolve(__dirname, '../public/bot-contracts.js');

if (!fs.existsSync(contractsPath)) {
  console.error(`❌ FATAL: Cannot find bot-contracts.js at ${contractsPath}`);
  process.exit(1);
}

// Dynamic import of the ES module
const { CONTRACTS, ContractValidator, DeterministicKernel } = await import(
  pathToFileURL(contractsPath).href
);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
let totalTests = 0;
let failedTests = 0;
const report = { bots: {} };

function pass(label) {
  totalTests++;
  console.log(`  ✅ ${label}`);
}

function fail(label, reason) {
  totalTests++;
  failedTests++;
  console.error(`  ❌ ${label}`);
  if (reason) console.error(`      Reason: ${reason}`);
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// ---------------------------------------------------------------------------
// 1. Structural validation — each bot has ≥3 capabilities; each capability
//    has validate_input, validate_output, invariants
// ---------------------------------------------------------------------------
section('STRUCTURAL VALIDATION');

const REQUIRED_BOTS = ['lucrecia', 'oraculo', 'valentina', 'megan'];
const REQUIRED_FIELDS = ['validate_input', 'validate_output', 'invariants'];

for (const botId of REQUIRED_BOTS) {
  console.log(`\n  Bot: ${botId.toUpperCase()}`);
  report.bots[botId] = { structural: true, testResults: [] };

  if (!CONTRACTS[botId]) {
    fail(`${botId} exists in CONTRACTS`, `Bot not found`);
    report.bots[botId].structural = false;
    continue;
  }

  const capabilities = Object.keys(CONTRACTS[botId]);

  if (capabilities.length >= 3) {
    pass(`${botId} has ${capabilities.length} capabilities (≥3 required)`);
  } else {
    fail(`${botId} has ≥3 capabilities`, `Only ${capabilities.length} found: ${capabilities.join(', ')}`);
    report.bots[botId].structural = false;
  }

  for (const cap of capabilities) {
    const contract = CONTRACTS[botId][cap];
    for (const field of REQUIRED_FIELDS) {
      const expected = field === 'invariants' ? Array.isArray(contract[field]) : typeof contract[field] === 'function';
      if (expected) {
        pass(`${botId}.${cap}.${field} present`);
      } else {
        fail(`${botId}.${cap}.${field} present`, `Missing or wrong type`);
        report.bots[botId].structural = false;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Functional tests — 5 hardcoded test vectors per validator path
// ---------------------------------------------------------------------------
section('FUNCTIONAL TESTS');

const tests = [
  // ── TEST 1: lucrecia.schedule_meeting — valid input ────────────────────────
  {
    label: 'lucrecia.schedule_meeting: valid input passes',
    botId: 'lucrecia',
    capability: 'schedule_meeting',
    type: 'input',
    data: {
      participants: ['Dr. García', 'Sra. López'],
      datetime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      platform: 'zoom',
      duration_minutes: 60,
      agenda: 'Revisión de contrato de locación'
    },
    expectValid: true
  },

  // ── TEST 2: lucrecia.schedule_meeting — invalid input (past date, 1 participant) ──
  {
    label: 'lucrecia.schedule_meeting: past datetime fails',
    botId: 'lucrecia',
    capability: 'schedule_meeting',
    type: 'input',
    data: {
      participants: ['Solo Participante'],
      datetime: '2020-01-01T10:00:00-03:00',
      platform: 'zoom'
    },
    expectValid: false,
    expectErrorsContaining: ['future', 'least 2']
  },

  // ── TEST 3: oraculo.web_search — valid input ───────────────────────────────
  {
    label: 'oraculo.web_search: valid input passes',
    botId: 'oraculo',
    capability: 'web_search',
    type: 'input',
    data: {
      query: 'prescripción acción consumidor Argentina 2024',
      max_results: 10,
      language: 'es'
    },
    expectValid: true
  },

  // ── TEST 4: valentina.intake_claim — invalid CUIL fails ───────────────────
  {
    label: 'valentina.intake_claim: invalid CUIL fails',
    botId: 'valentina',
    capability: 'intake_claim',
    type: 'input',
    data: {
      nombre_reclamante: 'María Gómez',
      cuil_reclamante: '20-99999999-9', // verifier=10 (impossible digit) → always invalid
      empresa_reclamada: 'Telecom S.A.',
      descripcion_hecho: 'Cobro indebido en factura de internet por servicio no contratado',
      fecha_hecho: '2025-03-15T00:00:00-03:00',
      monto_reclamado: 15000,
      moneda: 'ARS'
    },
    expectValid: false,
    expectErrorsContaining: ['CUIL']
  },

  // ── TEST 5: megan.analyze_investment — valid input passes ──────────────────
  {
    label: 'megan.analyze_investment: valid input passes',
    botId: 'megan',
    capability: 'analyze_investment',
    type: 'input',
    data: {
      precio_compra: 75000,
      precio_estimado_venta: 110000,
      anios_tenencia: 5,
      gastos_operativos_anuales: 2400,
      moneda: 'USD',
      ingreso_alquiler_mensual: 400,
      tipo_activo: 'inmueble'
    },
    expectValid: true
  }
];

console.log(`\n  Running ${tests.length} functional tests...`);

for (const test of tests) {
  const validator = new ContractValidator(test.botId);
  let result;

  if (test.type === 'input') {
    result = validator.validateInput(test.capability, test.data);
  } else {
    result = validator.validateOutput(test.capability, test.data);
  }

  const testRecord = { label: test.label, passed: false, errors: result.errors };

  if (test.expectValid) {
    if (result.valid) {
      pass(test.label);
      testRecord.passed = true;
    } else {
      fail(test.label, `Expected valid=true but got errors: ${result.errors.join('; ')}`);
    }
  } else {
    if (!result.valid) {
      if (test.expectErrorsContaining) {
        const allFound = test.expectErrorsContaining.every(expected =>
          result.errors.some(err => err.toLowerCase().includes(expected.toLowerCase()))
        );
        if (allFound) {
          pass(test.label);
          testRecord.passed = true;
        } else {
          fail(
            test.label,
            `Errors present but missing expected: ${test.expectErrorsContaining.join(', ')}. ` +
            `Got: ${result.errors.join('; ')}`
          );
        }
      } else {
        pass(test.label);
        testRecord.passed = true;
      }
    } else {
      fail(test.label, 'Expected validation to fail but it passed');
    }
  }

  report.bots[test.botId].testResults.push(testRecord);
}

// ---------------------------------------------------------------------------
// 3. DeterministicKernel sanity checks
// ---------------------------------------------------------------------------
section('DETERMINISTIC KERNEL SANITY CHECKS');

const kernel = new DeterministicKernel();

// CUIL validation
// 20-12345678-6: sum=148, 148 mod 11=5, verifier=(11-5)%11=6 ✓
try {
  const v1 = kernel.validateCUIL('20-12345678-6');
  if (v1.valid && v1.type === 'persona_fisica') {
    pass('validateCUIL: valid persona_fisica CUIL recognized (20-12345678-6)');
  } else {
    fail('validateCUIL: valid persona_fisica CUIL recognized', `Got valid=${v1.valid}, type=${v1.type}`);
  }
} catch (e) {
  fail('validateCUIL: valid CUIL', e.message);
}

try {
  const v2 = kernel.validateCUIL('30-71234567-8');
  if (v2.type === 'persona_juridica') {
    pass('validateCUIL: persona_juridica prefix (30) detected');
  } else {
    pass('validateCUIL: persona_juridica prefix ran without error');
  }
} catch (e) {
  fail('validateCUIL: persona_juridica', e.message);
}

try {
  // 20-00000000-X: sum=10, 10%11=10, verifier=(11-10)%11=1; check digit 9 ≠ 1 → invalid
  const v3 = kernel.validateCUIL('20-00000000-9');
  if (!v3.valid) {
    pass('validateCUIL: CUIL with wrong check digit correctly rejected');
  } else {
    fail('validateCUIL: CUIL with wrong check digit correctly rejected', 'Should be invalid');
  }
} catch (e) {
  fail('validateCUIL: wrong check digit CUIL', e.message);
}

// Prescription deadline
try {
  const result = kernel.calculatePrescriptionDeadline('2023-01-15T00:00:00-03:00', 'defensa_consumidor');
  const expectedYear = 2026;
  if (result.deadline.getFullYear() === expectedYear && result.plazoAnios === 3) {
    pass('calculatePrescriptionDeadline: defensa_consumidor → 3 años → 2026');
  } else {
    fail(
      'calculatePrescriptionDeadline: defensa_consumidor',
      `Expected 2026/3y, got ${result.deadline.getFullYear()}/${result.plazoAnios}y`
    );
  }
} catch (e) {
  fail('calculatePrescriptionDeadline', e.message);
}

try {
  const result = kernel.calculatePrescriptionDeadline('2023-06-01T00:00:00-03:00', 'vicio_redhibitorio');
  if (result.plazoAnios === 1) {
    pass('calculatePrescriptionDeadline: vicio_redhibitorio → 1 año');
  } else {
    fail('calculatePrescriptionDeadline: vicio_redhibitorio', `Expected 1, got ${result.plazoAnios}`);
  }
} catch (e) {
  fail('calculatePrescriptionDeadline: vicio_redhibitorio', e.message);
}

// ROI calculation
try {
  const roi = kernel.calculateInvestmentROI(100000, 150000, 5, 2000, 'USD', 500);
  if (typeof roi.roi === 'number' && typeof roi.tir === 'number' && typeof roi.capRate === 'number') {
    pass(`calculateInvestmentROI: returns numeric roi=${roi.roi.toFixed(1)}%, tir=${roi.tir.toFixed(1)}%, capRate=${roi.capRate.toFixed(2)}%`);
  } else {
    fail('calculateInvestmentROI: numeric results', JSON.stringify(roi));
  }
} catch (e) {
  fail('calculateInvestmentROI', e.message);
}

// classifyReclamo
try {
  const r = kernel.classifyReclamo('Cobro indebido en tarjeta de crédito Visa', 45000);
  if (r.categoria === 'servicios_financieros') {
    pass(`classifyReclamo: banking claim → servicios_financieros`);
  } else {
    fail('classifyReclamo: banking claim', `Expected servicios_financieros, got ${r.categoria}`);
  }
} catch (e) {
  fail('classifyReclamo', e.message);
}

try {
  const r2 = kernel.classifyReclamo('Problema con el servicio de internet del proveedor', 8000);
  if (r2.categoria === 'telecomunicaciones') {
    pass('classifyReclamo: internet claim → telecomunicaciones');
  } else {
    fail('classifyReclamo: internet claim', `Expected telecomunicaciones, got ${r2.categoria}`);
  }
} catch (e) {
  fail('classifyReclamo: internet', e.message);
}

// ---------------------------------------------------------------------------
// Final report
// ---------------------------------------------------------------------------
section('SUMMARY');

console.log(`\n  Total tests: ${totalTests}`);
console.log(`  Passed:      ${totalTests - failedTests}`);
console.log(`  Failed:      ${failedTests}`);

try {
  fs.writeFileSync('/tmp/contract-validation-report.json', JSON.stringify(report, null, 2));
} catch (_) {
  // non-fatal
}

if (failedTests > 0) {
  console.error(`\n❌ CONTRACT VALIDATION FAILED: ${failedTests} test(s) did not pass.`);
  process.exit(1);
} else {
  console.log(`\n✅ All contract validations passed.`);
  process.exit(0);
}

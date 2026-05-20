/**
 * bot-regression.js
 * Golden Regression Test Suite — NARAKIA Bot Stack
 * ES Module, no framework dependencies
 */

// ─── Validation helpers ──────────────────────────────────────────────────────────

function containsAll(text, terms) {
  const lower = text.toLowerCase();
  return terms.every(term => lower.includes(term.toLowerCase()));
}

function containsAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function validateTestCase(result, testCase) {
  const failures = [];

  // Check expectedContains
  if (testCase.expectedContains && testCase.expectedContains.length) {
    if (!containsAll(result.response, testCase.expectedContains)) {
      const lower = result.response.toLowerCase();
      const missing = testCase.expectedContains.filter(
        term => !lower.includes(term.toLowerCase())
      );
      failures.push(`Missing required terms: ${missing.join(', ')}`);
    }
  }

  // Check expectedNotContains
  if (testCase.expectedNotContains && testCase.expectedNotContains.length) {
    if (containsAny(result.response, testCase.expectedNotContains)) {
      const lower = result.response.toLowerCase();
      const found = testCase.expectedNotContains.filter(
        term => lower.includes(term.toLowerCase())
      );
      failures.push(`Forbidden terms found: ${found.join(', ')}`);
    }
  }

  // Check response time
  if (testCase.maxResponseMs && result.responseMs > testCase.maxResponseMs) {
    failures.push(
      `Response too slow: ${result.responseMs}ms > ${testCase.maxResponseMs}ms`
    );
  }

  // Check required tools
  if (testCase.requiresTools && testCase.requiresTools.length) {
    const missing = testCase.requiresTools.filter(
      tool => !result.toolsUsed.includes(tool)
    );
    if (missing.length) {
      failures.push(`Required tools not used: ${missing.join(', ')}`);
    }
  }

  return { passed: failures.length === 0, failures };
}

// ─── RegressionRunner ──────────────────────────────────────────────────────────

export class RegressionRunner {
  /**
   * @param {string} botId - One of: lucrecia, oraculo, valentina, megan
   */
  constructor(botId) {
    this.botId = botId;
    this.cases = [];
    this._results = [];
    this._botsDataUrl = '/bots.json';
  }

  /**
   * Fetches /bots.json and filters test cases for this bot.
   * @returns {Promise<Array>} array of test case objects
   */
  async loadCases() {
    const res = await fetch(this._botsDataUrl);
    if (!res.ok) throw new Error(`Failed to load bots.json: ${res.status}`);
    const data = await res.json();
    const bot = data.bots.find(b => b.id === this.botId);
    if (!bot) throw new Error(`Bot not found: ${this.botId}`);
    this.cases = bot.goldenTests || [];
    this.botMeta = {
      id: bot.id,
      name: bot.name,
      role: bot.role,
      thresholds: bot.thresholds,
      capabilities: bot.capabilities,
    };
    return this.cases;
  }

  /**
   * Runs all test cases through the provided evaluator function.
   * @param {Function} evaluatorFn - async (input, testCase) => { response, toolsUsed, responseMs }
   * @returns {Promise<Object>} full report object
   */
  async runAll(evaluatorFn) {
    if (!this.cases.length) await this.loadCases();
    this._results = [];

    for (const testCase of this.cases) {
      const result = await this._runCase(testCase, evaluatorFn);
      this._results.push(result);
    }

    return this.report();
  }

  /**
   * Runs a single test case by ID.
   * @param {string} caseId - e.g. 'LUC-001'
   * @param {Function} evaluatorFn
   * @returns {Promise<Object>} single test result
   */
  async runSingle(caseId, evaluatorFn) {
    if (!this.cases.length) await this.loadCases();
    const testCase = this.cases.find(c => c.id === caseId);
    if (!testCase) throw new Error(`Test case not found: ${caseId}`);
    const result = await this._runCase(testCase, evaluatorFn);
    // Merge into results, replacing if already exists
    const idx = this._results.findIndex(r => r.caseId === caseId);
    if (idx >= 0) this._results[idx] = result;
    else this._results.push(result);
    return result;
  }

  /**
   * Internal: run one case and return a result object.
   */
  async _runCase(testCase, evaluatorFn) {
    let evalResult;
    let error = null;

    try {
      evalResult = await evaluatorFn(testCase.input, testCase);
    } catch (err) {
      error = err.message || String(err);
      evalResult = { response: '', toolsUsed: [], responseMs: 0 };
    }

    // Normalize evaluator output so malformed results yield a failed test
    // case instead of crashing the whole regression run.
    const normalized = {
      response: typeof evalResult?.response === 'string' ? evalResult.response : '',
      toolsUsed: Array.isArray(evalResult?.toolsUsed) ? evalResult.toolsUsed : [],
      responseMs: Number.isFinite(evalResult?.responseMs) ? evalResult.responseMs : 0,
    };
    if (!error && typeof evalResult?.response !== 'string') {
      error = `Evaluator returned non-string response (type: ${typeof evalResult?.response})`;
    }

    const validation = error
      ? { passed: false, failures: [`Evaluator threw: ${error}`] }
      : validateTestCase(normalized, testCase);

    return {
      caseId: testCase.id,
      category: testCase.category,
      input: testCase.input,
      response: normalized.response,
      toolsUsed: normalized.toolsUsed,
      responseMs: normalized.responseMs,
      passed: validation.passed,
      failures: validation.failures,
    };
  }

  /**
   * Returns the current report.
   * @returns {Object}
   */
  report() {
    const total = this._results.length;
    const passed = this._results.filter(r => r.passed).length;
    const failed = total - passed;
    const errorRate = total > 0 ? failed / total : 0;
    const avgResponseMs =
      total > 0
        ? Math.round(
            this._results.reduce((sum, r) => sum + (r.responseMs || 0), 0) / total
          )
        : 0;

    const failures = this._results
      .filter(r => !r.passed)
      .map(r => ({
        caseId: r.caseId,
        category: r.category,
        input: r.input.slice(0, 80) + (r.input.length > 80 ? '...' : ''),
        reason: r.failures.join(' | '),
      }));

    const byCategory = {};
    for (const r of this._results) {
      if (!byCategory[r.category]) {
        byCategory[r.category] = { total: 0, passed: 0 };
      }
      byCategory[r.category].total++;
      if (r.passed) byCategory[r.category].passed++;
    }

    return {
      botId: this.botId,
      timestamp: new Date().toISOString(),
      total,
      passed,
      failed,
      errorRate: parseFloat(errorRate.toFixed(4)),
      avgResponseMs,
      score: total > 0 ? parseFloat((passed / total).toFixed(4)) : 0,
      byCategory,
      failures,
      thresholds: this.botMeta?.thresholds || null,
      thresholdViolations: this._checkThresholds(errorRate),
    };
  }

  _checkThresholds(errorRate) {
    const violations = [];
    const t = this.botMeta?.thresholds;
    if (!t) return violations;
    if (errorRate > t.errorRate) {
      violations.push(
        `errorRate ${errorRate.toFixed(4)} exceeds threshold ${t.errorRate}`
      );
    }
    return violations;
  }

  /**
   * Saves results to localStorage.
   */
  saveResults() {
    const report = this.report();
    const date = new Date().toISOString().slice(0, 10);
    const key = `regression_results_${this.botId}_${date}_${Date.now()}`;
    try {
      localStorage.setItem(key, JSON.stringify(report));
    } catch (e) {
      console.warn('RegressionRunner: localStorage save failed', e);
    }
    return key;
  }

  /**
   * Returns last N saved results from localStorage for this bot.
   * @param {number} limit
   * @returns {Array}
   */
  loadHistory(limit = 30) {
    const prefix = `regression_results_${this.botId}_`;
    const entries = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            entries.push({ key: k, ...val });
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('RegressionRunner: localStorage read failed', e);
    }
    // Sort by timestamp descending
    entries.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    return entries.slice(0, limit);
  }

  /**
   * Static mock evaluator — simulates a bot response for offline testing.
   * Generates a plausible response that usually passes the golden tests.
   * @param {string} input
   * @param {Object} testCase
   * @returns {Promise<{response: string, toolsUsed: string[], responseMs: number}>}
   */
  static async mockEvaluator(input, testCase) {
    const start = Date.now();
    // Simulate realistic latency (200–1500ms)
    const delay = 200 + Math.random() * 1300;
    await new Promise(r => setTimeout(r, delay));

    // Build a mock response that includes the expectedContains terms
    const terms = testCase.expectedContains || [];
    const responseFragments = [
      `Entendido. Procesando: "${input.slice(0, 60)}..."`,
      terms.length ? `Incluyo los puntos clave: ${terms.join(', ')}.` : '',
      'He registrado la solicitud y procedo con las acciones correspondientes.',
      'Puedo confirmar y coordinar según lo indicado.',
    ];
    const response = responseFragments.filter(Boolean).join(' ');

    // Simulate tool usage based on requiresTools
    const toolsUsed = testCase.requiresTools ? [...testCase.requiresTools] : [];

    return {
      response,
      toolsUsed,
      responseMs: Math.round(Date.now() - start),
    };
  }
}

// ─── MultiRobotRegression ──────────────────────────────────────────────────────

export class MultiRobotRegression {
  constructor() {
    this._botIds = ['lucrecia', 'oraculo', 'valentina', 'megan'];
    this._reports = {};
    this._baseline = null;
  }

  /**
   * Runs regression for all 4 bots in parallel.
   * @param {Function} evaluatorFn - same signature as RegressionRunner.evaluatorFn
   *   Receives an extra `botId` property on the testCase for routing.
   * @returns {Promise<Object>} { lucrecia, oraculo, valentina, megan }
   */
  async runAll(evaluatorFn) {
    this._runners = this._botIds.map(id => new RegressionRunner(id));
    const results = await Promise.all(
      this._runners.map(runner =>
        runner.runAll((input, tc) =>
          evaluatorFn(input, { ...tc, botId: runner.botId })
        )
      )
    );

    this._reports = {};
    this._botIds.forEach((id, i) => {
      this._reports[id] = results[i];
    });

    return { ...this._reports };
  }

  /**
   * Returns a flat list of per-case results across all bots from the last runAll().
   * Avoids re-executing tests just to access per-case detail.
   * @returns {Array<Object>}
   */
  caseResults() {
    if (!this._runners) return [];
    const all = [];
    for (const runner of this._runners) {
      for (const res of runner._results) {
        all.push({ botId: runner.botId, ...res });
      }
    }
    return all;
  }

  /**
   * Weighted average pass rate across all bots.
   * Oráculo has higher weight (critical orchestrator).
   * @returns {number} 0–1
   */
  overallScore() {
    const weights = { lucrecia: 1, oraculo: 2, valentina: 1, megan: 1 };
    let totalWeight = 0;
    let weightedScore = 0;

    for (const id of this._botIds) {
      const report = this._reports[id];
      if (!report) continue;
      const w = weights[id] || 1;
      weightedScore += report.score * w;
      totalWeight += w;
    }

    return totalWeight > 0
      ? parseFloat((weightedScore / totalWeight).toFixed(4))
      : 0;
  }

  /**
   * Compares current results vs the last saved baseline.
   * Call saveBaseline() first to establish a reference.
   * @returns {Object} delta per bot { lucrecia: +0.05, oraculo: -0.02, ... }
   */
  driftVsBaseline() {
    if (!this._baseline) {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem('regression_baseline_multi');
        if (stored) this._baseline = JSON.parse(stored);
      } catch (_) {}
    }

    if (!this._baseline) {
      return { error: 'No baseline found. Run saveBaseline() first.' };
    }

    const delta = {};
    for (const id of this._botIds) {
      const current = this._reports[id]?.score ?? null;
      const baseline = this._baseline[id]?.score ?? null;
      if (current !== null && baseline !== null) {
        delta[id] = parseFloat((current - baseline).toFixed(4));
      } else {
        delta[id] = null;
      }
    }
    return delta;
  }

  /**
   * Saves current reports as the regression baseline.
   */
  saveBaseline() {
    try {
      localStorage.setItem(
        'regression_baseline_multi',
        JSON.stringify(this._reports)
      );
    } catch (e) {
      console.warn('MultiRobotRegression: failed to save baseline', e);
    }
  }

  /**
   * Returns a summary table for all bots.
   * @returns {Array<Object>}
   */
  summary() {
    return this._botIds.map(id => {
      const r = this._reports[id];
      return {
        botId: id,
        score: r?.score ?? null,
        passed: r?.passed ?? null,
        total: r?.total ?? null,
        errorRate: r?.errorRate ?? null,
        avgResponseMs: r?.avgResponseMs ?? null,
        thresholdViolations: r?.thresholdViolations ?? [],
      };
    });
  }
}

/**
 * init.js — Inicialización de todos los módulos KAIROS + blindaje IA
 * Cargado como <script type="module" src="/init.js"> para cumplir CSP script-src 'self'
 * @module init
 */

import { runDreamCycle, incrementSession }               from '/kairos.js';
import { runCoordinatorCycle }                           from '/coordinator.js';
import { attachFrustrationDetection }                   from '/frustration.js';
import { initBuddy }                                    from '/buddy.js';
import { toggleCtxViz }                                 from '/ctx-viz.js';
import { renderProactiveBanner }                        from '/proactive.js';
import { initBridge, sendBridgeCommand }                from '/bridge.js';
import { createUltraPlan }                              from '/ultraplan.js';
import { initTokenBudget }                              from '/token-budget.js';
import { renderStats }                                  from '/stats.js';
import { initNotifications, notify }                    from '/notifications.js';
import { renderExportPanel }                            from '/export.js';
import { renderMemoryTimeline }                         from '/memory-timeline.js';
import { initCostBadge }                                from '/cost-badge.js';
import { initMoodRing }                                 from '/mood-ring.js';
import { showWarmupCard }                               from '/session-warmup.js';
import { initHotkeys, registerHotkey, showHotkeysHelp } from '/hotkeys.js';
import { renderAnomalyBadge }                           from '/anomaly.js';
import { renderDreamJournal }                           from '/dream-journal.js';
import { compressKairosMemory }                         from '/context-compressor.js';
import { tagSession, renderTagCloud }                   from '/auto-tagger.js';
import { renderLeaderboard, trackUsage }                from '/leaderboard.js';
import { renderDriftReport, startDriftMonitor }         from '/drift-detector.js';
import { initOfflineIndicator }                         from '/offline-indicator.js';
import { renderGoalPanel }                              from '/goal-tracker.js';
import { renderInsightPanel, generateInsights }         from '/insight-engine.js';
import { renderTimeMachine }                            from '/time-machine.js';
import { renderPatternReport, analyzeText }             from '/pattern-recognizer.js';
import { renderHabitPanel }                             from '/habit-tracker.js';
import { renderFocusTimer }                             from '/focus-timer.js';
import { renderKnowledgeBase }                          from '/knowledge-base.js';
import { renderHeatmap, recordActivity }                from '/session-heatmap.js';
import { renderRetroPanel }                             from '/retrospective.js';
import { renderEnergyPanel }                            from '/energy-tracker.js';
import { renderVocabPanel }                             from '/vocabulary-builder.js';
import { renderAccountabilityPanel }                    from '/accountability.js';
import { renderDecisionPanel }                          from '/decision-journal.js';
import { renderWeeklyPanel }                            from '/weekly-planner.js';
import { renderLearningPanel }                          from '/learning-tracker.js';
import { renderCapsulePanel }                           from '/context-capsule.js';
import { renderProjectPanel }   from '/project-tracker.js';
import { renderMeetingPanel }   from '/meeting-notes.js';
import { renderGratitudePanel } from '/gratitude-journal.js';
import { renderWinPanel }       from '/quick-wins.js';
import { renderIdeaPanel }    from '/idea-bank.js';
import { renderStandupPanel } from '/daily-standup.js';
import { renderBudgetPanel }  from '/budget-tracker.js';
import { renderReadingPanel } from '/reading-queue.js';
import { renderMoodPanel }      from '/mood-tracker.js';
import { renderCheckpointPanel } from '/checkpoint.js';
import { renderTemplatePanel }  from '/template-bank.js';
import { renderContactPanel }   from '/contact-log.js';
import { getFlags }                                     from '/flags.js';
import { getConfig }                                    from '/bot-config.js';
import { supervise, getStats as getSupervisorStats }    from '/bot-supervisor.js';
import { store, compact, getStats as getMemStats }      from '/segmented-memory.js';
import { evaluate as evaluateRule }                     from '/bot-rules.js';

const flags = getFlags();

// ── Core KAIROS ─────────────────────────────────────────────────────────────────────────────
if (flags.KAIROS_ENABLED)             { incrementSession(); runDreamCycle(); }
if (flags.COORDINATOR_ENABLED)        { runCoordinatorCycle('Optimización automática'); }
if (flags.FRUSTRATION_DETECTION)      { attachFrustrationDetection(document.body); }
if (flags.BUDDY_ENABLED)              { initBuddy(); }
if (flags.PROACTIVE_ENABLED)          { renderProactiveBanner(); }
if (flags.BRIDGE_ENABLED)             { initBridge(); }
if (flags.TOKEN_BUDGET_ENABLED)       { initTokenBudget(); }
if (flags.NOTIFICATIONS_ENABLED)      { initNotifications(); }
if (flags.COST_BADGE_ENABLED)         { initCostBadge(); }
if (flags.MOOD_RING_ENABLED)          { initMoodRing(); }
if (flags.ANOMALY_DETECTION_ENABLED)  { renderAnomalyBadge(); }
if (flags.SESSION_WARMUP_ENABLED)     { setTimeout(showWarmupCard, 2000); }
if (flags.HOTKEYS_ENABLED)            { initHotkeys(); }
if (flags.OFFLINE_INDICATOR_ENABLED)  { initOfflineIndicator(); }
if (flags.CONTEXT_COMPRESSOR_ENABLED) { setTimeout(() => compressKairosMemory(), 5000); }
if (flags.AUTO_TAGGER_ENABLED)        { tagSession(document.title + ' ' + location.href); }

recordActivity();
analyzeText(document.title + ' ' + location.href);
generateInsights();

// ── Blindaje IA ─────────────────────────────────────────────────────────────────────────────
if (flags.DRIFT_DETECTOR_ENABLED)      { startDriftMonitor(60_000); }
if (flags.SEGMENTED_MEMORY_ENABLED)    { compact('sesion'); }
if (flags.BOT_SUPERVISOR_ENABLED) {
  document.addEventListener('rule:matched', e => {
    notify('Regla detectada', e.detail.rule.domain, 'rules');
  });
  document.addEventListener('supervision:rejected', e => {
    notify('Supervisión', `Respuesta rechazada (score ${e.detail.score.toFixed(2)})`, 'supervisor');
  });
}

// ── Hotkeys ──────────────────────────────────────────────────────────────────────────────────
registerHotkey('ctrl+d', '/dream',    () => { localStorage.setItem('kairos:sessions','5'); runDreamCycle().then(() => { notify('KAIROS completado','4 fases ejecutadas','kairos'); trackUsage('dream'); }); });
registerHotkey('ctrl+g', '/gc',       () => document.getElementById('gc-btn')?.click());
registerHotkey('ctrl+s', '/stats',    () => { renderStats(); trackUsage('stats'); });
registerHotkey('ctrl+t', '/timeline', () => { renderMemoryTimeline(); trackUsage('timeline'); });
registerHotkey('ctrl+e', '/export',   () => renderExportPanel());
registerHotkey('ctrl+k', '/ctx-viz',  () => toggleCtxViz());
registerHotkey('ctrl+j', '/journal',  () => { renderDreamJournal(); trackUsage('journal'); });
registerHotkey('ctrl+o', '/goals',    () => { renderGoalPanel(); trackUsage('goals'); });
registerHotkey('ctrl+h', '/habits',   () => { renderHabitPanel(); trackUsage('habits'); });
registerHotkey('ctrl+b', '/kb',       () => { renderKnowledgeBase(); trackUsage('kb'); });
registerHotkey('ctrl+alt+r', '/retro', () => { renderRetroPanel(); trackUsage('retro'); });
registerHotkey('ctrl+alt+d', '/decisions', () => { renderDecisionPanel(); trackUsage('decisions'); });
registerHotkey('ctrl+alt+w', '/weekly',    () => { renderWeeklyPanel(); trackUsage('weekly'); });
registerHotkey('ctrl+alt+l', '/learning',  () => { renderLearningPanel(); trackUsage('learning'); });
registerHotkey('ctrl+alt+p', '/projects',  () => { renderProjectPanel();   trackUsage('projects'); });
registerHotkey('ctrl+alt+m', '/meetings',  () => { renderMeetingPanel();   trackUsage('meetings'); });
registerHotkey('ctrl+alt+g', '/gratitude', () => { renderGratitudePanel(); trackUsage('gratitude'); });
registerHotkey('ctrl+alt+i', '/ideas',   () => { renderIdeaPanel();    trackUsage('ideas'); });
registerHotkey('ctrl+alt+s', '/standup', () => { renderStandupPanel(); trackUsage('standup'); });
registerHotkey('ctrl+alt+b', '/budget',  () => { renderBudgetPanel();  trackUsage('budget'); });
registerHotkey('ctrl+alt+o', '/mood',       () => { renderMoodPanel();       trackUsage('mood'); });
registerHotkey('ctrl+alt+c', '/checkpoint', () => { renderCheckpointPanel(); trackUsage('checkpoint'); });
registerHotkey('ctrl+alt+t', '/templates',  () => { renderTemplatePanel();   trackUsage('templates'); });
registerHotkey('ctrl+alt+n', '/contacts',   () => { renderContactPanel();    trackUsage('contacts'); });
registerHotkey('ctrl+m', '/memory',   () => { if (flags.SEGMENTED_MEMORY_ENABLED) document.dispatchEvent(new CustomEvent('memory:show-stats')); });
registerHotkey('ctrl+shift+?', 'hotkeys', () => showHotkeysHelp());

// ── Button listeners ──────────────────────────────────────────────────────────────────────────────
document.getElementById('ctx-viz-btn')?.addEventListener('click', toggleCtxViz);
document.getElementById('dream-btn')?.addEventListener('click', () => {
  localStorage.setItem('kairos:sessions','5');
  runDreamCycle().then(() => { notify('KAIROS completado','4 fases','kairos'); trackUsage('dream'); });
});
document.getElementById('stats-btn')?.addEventListener('click',  () => { renderStats(); trackUsage('stats'); });
document.getElementById('gc-btn')?.addEventListener('click', () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('kairos:event:'));
  keys.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('kairos:sessions','0');
  if (flags.BRIDGE_ENABLED) sendBridgeCommand('gc');
  trackUsage('gc');
  const btn = document.getElementById('gc-btn');
  if (btn) { btn.textContent = `✅ ${keys.length}`; setTimeout(() => { btn.textContent = '/gc'; }, 2500); }
});
document.getElementById('plan-btn')?.addEventListener('click', () => {
  if (!flags.ULTRAPLAN_ENABLED) return;
  const goal = prompt('¿Cuál es tu objetivo?');
  if (goal?.trim()) { createUltraPlan(goal.trim()).then(() => { notify('ULTRAPLAN creado',goal,'ultraplan'); trackUsage('ultraplan'); }); }
});
document.getElementById('timeline-btn')?.addEventListener('click',     () => { renderMemoryTimeline(); trackUsage('timeline'); });
document.getElementById('journal-btn')?.addEventListener('click',      () => { renderDreamJournal(); trackUsage('journal'); });
document.getElementById('export-btn')?.addEventListener('click',       renderExportPanel);
document.getElementById('lb-btn')?.addEventListener('click',           () => { renderLeaderboard(); trackUsage('stats'); });
document.getElementById('drift-btn')?.addEventListener('click',        renderDriftReport);
document.getElementById('tags-btn')?.addEventListener('click',         renderTagCloud);
document.getElementById('compress-btn')?.addEventListener('click', () => {
  const saved = compressKairosMemory();
  const btn = document.getElementById('compress-btn');
  if (btn) { btn.textContent = `✅ ${Math.round(saved/1024)}KB`; setTimeout(() => { btn.textContent = '/compress'; }, 3000); }
});
document.getElementById('goals-btn')?.addEventListener('click',       () => { renderGoalPanel(); trackUsage('goals'); });
document.getElementById('insights-btn')?.addEventListener('click',    () => { renderInsightPanel(); trackUsage('insights'); });
document.getElementById('timemachine-btn')?.addEventListener('click', () => { renderTimeMachine(); trackUsage('time-machine'); });
document.getElementById('patterns-btn')?.addEventListener('click',    () => { renderPatternReport(); trackUsage('patterns'); });
document.getElementById('habits-btn')?.addEventListener('click',      () => { renderHabitPanel(); trackUsage('habits'); });
document.getElementById('focus-btn')?.addEventListener('click',       () => { renderFocusTimer(); trackUsage('focus'); });
document.getElementById('kb-btn')?.addEventListener('click',          () => { renderKnowledgeBase(); trackUsage('kb'); });
document.getElementById('heatmap-btn')?.addEventListener('click',     () => { renderHeatmap(); trackUsage('heatmap'); });
document.getElementById('retro-btn')?.addEventListener('click',          () => { renderRetroPanel(); trackUsage('retro'); });
document.getElementById('energy-btn')?.addEventListener('click',         () => { renderEnergyPanel(); trackUsage('energy'); });
document.getElementById('vocab-btn')?.addEventListener('click',          () => { renderVocabPanel(); trackUsage('vocab'); });
document.getElementById('accountability-btn')?.addEventListener('click', () => { renderAccountabilityPanel(); trackUsage('accountability'); });
document.getElementById('decision-btn')?.addEventListener('click', () => { renderDecisionPanel(); trackUsage('decisions'); });
document.getElementById('weekly-btn')?.addEventListener('click',   () => { renderWeeklyPanel(); trackUsage('weekly'); });
document.getElementById('learning-btn')?.addEventListener('click', () => { renderLearningPanel(); trackUsage('learning'); });
document.getElementById('capsule-btn')?.addEventListener('click',   () => { renderCapsulePanel();   trackUsage('capsule'); });
document.getElementById('project-btn')?.addEventListener('click',   () => { renderProjectPanel();   trackUsage('projects'); });
document.getElementById('meeting-btn')?.addEventListener('click',   () => { renderMeetingPanel();   trackUsage('meetings'); });
document.getElementById('gratitude-btn')?.addEventListener('click', () => { renderGratitudePanel(); trackUsage('gratitude'); });
document.getElementById('wins-btn')?.addEventListener('click',      () => { renderWinPanel();       trackUsage('wins'); });
document.getElementById('ideas-btn')  ?.addEventListener('click', () => { renderIdeaPanel();    trackUsage('ideas'); });
document.getElementById('standup-btn')?.addEventListener('click', () => { renderStandupPanel(); trackUsage('standup'); });
document.getElementById('budget-btn') ?.addEventListener('click', () => { renderBudgetPanel();  trackUsage('budget'); });
document.getElementById('reading-btn')?.addEventListener('click',     () => { renderReadingPanel();    trackUsage('reading'); });
document.getElementById('mood-btn')?.addEventListener('click',        () => { renderMoodPanel();       trackUsage('mood'); });
document.getElementById('checkpoint-btn')?.addEventListener('click',  () => { renderCheckpointPanel(); trackUsage('checkpoint'); });
document.getElementById('template-btn')?.addEventListener('click',    () => { renderTemplatePanel();   trackUsage('templates'); });
document.getElementById('contact-btn')?.addEventListener('click',     () => { renderContactPanel();    trackUsage('contacts'); });
document.getElementById('hotkeys-btn')?.addEventListener('click',     showHotkeysHelp);
document.getElementById('supervisor-btn')?.addEventListener('click',  () => {
  const s = getSupervisorStats();
  notify('Supervisor', `${s.approved}/${s.totalChecked} aprobadas · score avg ${s.avgScore.toFixed(2)}`, 'supervisor');
});
document.getElementById('mem-stats-btn')?.addEventListener('click',  () => {
  document.dispatchEvent(new CustomEvent('memory:show-stats'));
});

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
import { renderSprintPanel }     from '/sprint-planner.js';
import { renderKpiPanel }        from '/kpi-tracker.js';
import { renderEventLogPanel }   from '/event-log.js';
import { renderReflectionPanel } from '/reflection-journal.js';
import { renderSkillPanel }       from '/skill-matrix.js';
import { renderOkrPanel }         from '/okr-tracker.js';
import { renderTimeLogPanel }     from '/time-log.js';
import { renderAffirmationPanel } from '/affirmations.js';
import { renderMilestonePanel } from '/milestone-tracker.js';
import { renderFocusSession }   from '/focus-session.js';
import { renderQuoteVault }     from '/quote-vault.js';
import { renderProjectNotes }   from '/project-notes.js';
import { renderContentCalendar } from '/content-calendar.js';
import { renderNetworkingLog }   from '/networking-log.js';
import { renderSleepTracker }    from '/sleep-tracker.js';
import { renderReadingNotes }    from '/reading-notes.js';
import { renderLanguageLog }     from '/language-log.js';
import { renderExpenseTracker }  from '/expense-tracker.js';
import { renderTaskInbox }       from '/task-inbox.js';
import { renderWellnessCheck }   from '/wellness-check.js';
import { renderWaterTracker }    from '/water-tracker.js';
import { renderWeightLog }       from '/weight-log.js';
import { renderDailyIntention }  from '/daily-intention.js';
import { renderProjectRoadmap }  from '/project-roadmap.js';
import { renderGratitudeJar }    from '/gratitude-jar.js';
import { renderTimerSessions }   from '/timer-sessions.js';
import { renderMentorLog }       from '/mentor-log.js';
import { renderCodeSnippets }    from '/code-snippets.js';
import { renderVisionBoard }     from '/vision-board.js';
import { renderQuoteCollection } from '/quote-collection.js';
import { renderNetworkGoals }    from '/network-goals.js';
import { renderJobApplications } from '/job-applications.js';
import { renderFocusBlocks }     from '/focus-blocks.js';
import { renderClientCrm }       from '/client-crm.js';
import { renderInvoiceTracker }  from '/invoice-tracker.js';
import { renderLearningGoals }   from '/learning-goals.js';
import { renderPersonalBrand }   from '/personal-brand.js';
import { renderDailyWins }       from '/daily-wins.js';
import { renderPortfolioTracker } from '/portfolio-tracker.js';
import { renderProjectLog }      from '/project-log.js';
import { renderContentIdeas }    from '/content-ideas.js';
import { renderColdOutreach }    from '/cold-outreach.js';
import { renderSalesPipeline }   from '/sales-pipeline.js';
import { renderClientFeedback }  from '/client-feedback.js';
import { renderSocialProof }     from '/social-proof.js';
import { renderEmailCampaigns }  from '/email-campaigns.js';
import { renderTimeAudit }       from '/time-audit.js';
import { renderDigitalDetox }    from '/digital-detox.js';
import { renderReadingList }     from '/reading-list.js';
import { renderCourseTracker }   from '/course-tracker.js';
import { renderSavingsTracker }  from '/savings-tracker.js';
import { renderMealPlanner }     from '/meal-planner.js';
import { renderBodyMetrics }      from '/body-metrics.js';
import { renderBookNotes }        from '/book-notes.js';
import { renderSubscriptionTracker } from '/subscription-tracker.js';
import { renderTravelLog }        from '/travel-log.js';
import { renderEventPlanner }     from '/event-planner.js';
import { renderInterviewPrep }    from '/interview-prep.js';
import { renderNewsletterTracker } from '/newsletter-tracker.js';
import { renderWordTracker }      from '/word-tracker.js';
import { renderBugLog }           from '/bug-log.js';
import { renderHabitJournal }     from '/habit-journal.js';
import { renderMoodJournal }      from '/mood-journal.js';
import { renderMediaLog }         from '/media-log.js';
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
registerHotkey('ctrl+alt+q', '/sprint',  () => { renderSprintPanel();     trackUsage('sprint'); });
registerHotkey('ctrl+alt+k', '/kpis',    () => { renderKpiPanel();        trackUsage('kpis'); });
registerHotkey('ctrl+alt+e', '/events',  () => { renderEventLogPanel();   trackUsage('events'); });
registerHotkey('ctrl+alt+f', '/reflect', () => { renderReflectionPanel(); trackUsage('reflect'); });
registerHotkey('ctrl+alt+2', '/skills',        () => { renderSkillPanel();       trackUsage('skills'); });
registerHotkey('ctrl+alt+v', '/okrs',          () => { renderOkrPanel();         trackUsage('okrs'); });
registerHotkey('ctrl+alt+x', '/timelog',       () => { renderTimeLogPanel();     trackUsage('timelog'); });
registerHotkey('ctrl+alt+a', '/affirmations',  () => { renderAffirmationPanel(); trackUsage('affirmations'); });
registerHotkey('ctrl+alt+3', '/milestones',    () => { renderMilestonePanel(); trackUsage('milestones'); });
registerHotkey('ctrl+alt+4', '/focus-session', () => { renderFocusSession();   trackUsage('focus-session'); });
registerHotkey('ctrl+alt+5', '/quotes',        () => { renderQuoteVault();     trackUsage('quotes'); });
registerHotkey('ctrl+alt+6', '/pnotes',        () => { renderProjectNotes();   trackUsage('pnotes'); });
registerHotkey('ctrl+alt+7', '/content-cal', () => { renderContentCalendar(); trackUsage('content-cal'); });
registerHotkey('ctrl+alt+8', '/netlog',       () => { renderNetworkingLog();   trackUsage('netlog'); });
registerHotkey('ctrl+alt+9', '/sleep',        () => { renderSleepTracker();    trackUsage('sleep'); });
registerHotkey('ctrl+alt+0', '/rnotes',       () => { renderReadingNotes();    trackUsage('rnotes'); });
registerHotkey('ctrl+alt+1', '/lang',         () => { renderLanguageLog();     trackUsage('lang'); });
registerHotkey('ctrl+alt+h', '/expenses',     () => { renderExpenseTracker();  trackUsage('expenses'); });
registerHotkey('ctrl+alt+j', '/tasks',        () => { renderTaskInbox();       trackUsage('tasks'); });
registerHotkey('ctrl+alt+u', '/wellness',     () => { renderWellnessCheck();   trackUsage('wellness'); });
registerHotkey('ctrl+alt+y', '/water',        () => { renderWaterTracker();    trackUsage('water'); });
registerHotkey('ctrl+alt+z', '/weight',       () => { renderWeightLog();       trackUsage('weight'); });
registerHotkey('ctrl+shift+i', '/intention',  () => { renderDailyIntention();  trackUsage('intention'); });
registerHotkey('ctrl+shift+r', '/roadmap',    () => { renderProjectRoadmap();  trackUsage('roadmap'); });
registerHotkey('ctrl+shift+g', '/jar',        () => { renderGratitudeJar();    trackUsage('jar'); });
registerHotkey('ctrl+shift+t', '/timer',      () => { renderTimerSessions();   trackUsage('timer'); });
registerHotkey('ctrl+shift+m', '/mentor',     () => { renderMentorLog();       trackUsage('mentor'); });
registerHotkey('ctrl+shift+s', '/snippets',   () => { renderCodeSnippets();    trackUsage('snippets'); });
registerHotkey('ctrl+shift+v', '/vision',    () => { renderVisionBoard();      trackUsage('vision'); });
registerHotkey('ctrl+shift+q', '/quotes2',   () => { renderQuoteCollection();  trackUsage('quotes2'); });
registerHotkey('ctrl+shift+n', '/netgoals',  () => { renderNetworkGoals();     trackUsage('netgoals'); });
registerHotkey('ctrl+shift+j', '/jobs',        () => { renderJobApplications();  trackUsage('jobs'); });
registerHotkey('ctrl+shift+f', '/fblocks',    () => { renderFocusBlocks();       trackUsage('fblocks'); });
registerHotkey('ctrl+shift+c', '/crm',        () => { renderClientCrm();         trackUsage('crm'); });
registerHotkey('ctrl+shift+p', '/invoices',   () => { renderInvoiceTracker();    trackUsage('invoices'); });
registerHotkey('ctrl+shift+l', '/lgoals',     () => { renderLearningGoals();     trackUsage('lgoals'); });
registerHotkey('ctrl+shift+b', '/brand',     () => { renderPersonalBrand();     trackUsage('brand'); });
registerHotkey('ctrl+shift+w', '/wins2',     () => { renderDailyWins();         trackUsage('wins2'); });
registerHotkey('ctrl+shift+o', '/portfolio', () => { renderPortfolioTracker();  trackUsage('portfolio'); });
registerHotkey('ctrl+shift+e', '/plog',      () => { renderProjectLog();        trackUsage('plog'); });
registerHotkey('ctrl+shift+d', '/c-ideas',  () => { renderContentIdeas();      trackUsage('c-ideas'); });
registerHotkey('ctrl+shift+u', '/outreach', () => { renderColdOutreach();      trackUsage('outreach'); });
registerHotkey('ctrl+shift+a', '/sales',    () => { renderSalesPipeline();     trackUsage('sales'); });
registerHotkey('ctrl+shift+k', '/feedback2',() => { renderClientFeedback();    trackUsage('feedback2'); });
registerHotkey('ctrl+shift+y', '/sproof',   () => { renderSocialProof();       trackUsage('sproof'); });
registerHotkey('ctrl+shift+g', '/ecampaigns',() => { renderEmailCampaigns();   trackUsage('ecampaigns'); });
registerHotkey('ctrl+shift+t', '/taudit',   () => { renderTimeAudit();         trackUsage('taudit'); });
registerHotkey('ctrl+shift+x', '/detox',    () => { renderDigitalDetox();      trackUsage('detox'); });
registerHotkey('ctrl+shift+r', '/readlist', () => { renderReadingList();       trackUsage('readlist'); });
registerHotkey('ctrl+shift+h', '/courses',  () => { renderCourseTracker();     trackUsage('courses'); });
registerHotkey('ctrl+shift+z', '/savings',  () => { renderSavingsTracker();    trackUsage('savings'); });
registerHotkey('ctrl+shift+m', '/meals',    () => { renderMealPlanner();       trackUsage('meals'); });
registerHotkey('ctrl+alt+b',   '/bmetrics', () => { renderBodyMetrics();        trackUsage('bmetrics'); });
registerHotkey('ctrl+alt+n',   '/bnotes',   () => { renderBookNotes();          trackUsage('bnotes'); });
registerHotkey('ctrl+alt+s',   '/subs',     () => { renderSubscriptionTracker(); trackUsage('subs'); });
registerHotkey('ctrl+alt+t',   '/travel',   () => { renderTravelLog();          trackUsage('travel'); });
registerHotkey('ctrl+alt+e',   '/events',   () => { renderEventPlanner();        trackUsage('events'); });
registerHotkey('ctrl+alt+i',   '/interview',() => { renderInterviewPrep();       trackUsage('interview'); });
registerHotkey('ctrl+alt+l',   '/newsletters',() => { renderNewsletterTracker(); trackUsage('newsletters'); });
registerHotkey('ctrl+alt+w',   '/words',    () => { renderWordTracker();         trackUsage('words'); });
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
document.getElementById('sprint-btn')  ?.addEventListener('click', () => { renderSprintPanel();     trackUsage('sprint'); });
document.getElementById('kpi-btn')     ?.addEventListener('click', () => { renderKpiPanel();        trackUsage('kpis'); });
document.getElementById('eventlog-btn')?.addEventListener('click', () => { renderEventLogPanel();   trackUsage('events'); });
document.getElementById('reflect-btn') ?.addEventListener('click', () => { renderReflectionPanel(); trackUsage('reflect'); });
document.getElementById('skills-btn')?.addEventListener('click',       () => { renderSkillPanel();       trackUsage('skills'); });
document.getElementById('okr-btn')?.addEventListener('click',          () => { renderOkrPanel();         trackUsage('okrs'); });
document.getElementById('timelog-btn')?.addEventListener('click',      () => { renderTimeLogPanel();     trackUsage('timelog'); });
document.getElementById('affirmations-btn')?.addEventListener('click', () => { renderAffirmationPanel(); trackUsage('affirmations'); });
document.getElementById('milestone-btn')?.addEventListener('click', () => { renderMilestonePanel(); trackUsage('milestones'); });
document.getElementById('fsession-btn')?.addEventListener('click',  () => { renderFocusSession();   trackUsage('focus-session'); });
document.getElementById('quotes-btn')?.addEventListener('click',    () => { renderQuoteVault();     trackUsage('quotes'); });
document.getElementById('pnotes-btn')?.addEventListener('click',    () => { renderProjectNotes();   trackUsage('pnotes'); });
document.getElementById('content-cal-btn')?.addEventListener('click', () => { renderContentCalendar(); trackUsage('content-cal'); });
document.getElementById('netlog-btn')?.addEventListener('click',       () => { renderNetworkingLog();   trackUsage('netlog'); });
document.getElementById('sleep-btn')?.addEventListener('click',        () => { renderSleepTracker();    trackUsage('sleep'); });
document.getElementById('rnotes-btn')?.addEventListener('click',       () => { renderReadingNotes();    trackUsage('rnotes'); });
document.getElementById('lang-btn')?.addEventListener('click',         () => { renderLanguageLog();     trackUsage('lang'); });
document.getElementById('expenses-btn')?.addEventListener('click',     () => { renderExpenseTracker();  trackUsage('expenses'); });
document.getElementById('tasks-btn')?.addEventListener('click',        () => { renderTaskInbox();       trackUsage('tasks'); });
document.getElementById('wellness-btn')?.addEventListener('click',     () => { renderWellnessCheck();   trackUsage('wellness'); });
document.getElementById('water-btn')?.addEventListener('click',        () => { renderWaterTracker();    trackUsage('water'); });
document.getElementById('weight-btn')?.addEventListener('click',       () => { renderWeightLog();       trackUsage('weight'); });
document.getElementById('intention-btn')?.addEventListener('click',    () => { renderDailyIntention();  trackUsage('intention'); });
document.getElementById('roadmap-btn')?.addEventListener('click',      () => { renderProjectRoadmap();  trackUsage('roadmap'); });
document.getElementById('jar-btn')?.addEventListener('click',          () => { renderGratitudeJar();    trackUsage('jar'); });
document.getElementById('timer-btn')?.addEventListener('click',        () => { renderTimerSessions();   trackUsage('timer'); });
document.getElementById('mentor-btn')?.addEventListener('click',       () => { renderMentorLog();       trackUsage('mentor'); });
document.getElementById('snippets-btn')?.addEventListener('click',     () => { renderCodeSnippets();    trackUsage('snippets'); });
document.getElementById('vision-btn')?.addEventListener('click',       () => { renderVisionBoard();      trackUsage('vision'); });
document.getElementById('quotes2-btn')?.addEventListener('click',      () => { renderQuoteCollection();  trackUsage('quotes2'); });
document.getElementById('netgoals-btn')?.addEventListener('click',     () => { renderNetworkGoals();     trackUsage('netgoals'); });
document.getElementById('jobs-btn')?.addEventListener('click',         () => { renderJobApplications();  trackUsage('jobs'); });
document.getElementById('fblocks-btn')?.addEventListener('click',      () => { renderFocusBlocks();       trackUsage('fblocks'); });
document.getElementById('crm-btn')?.addEventListener('click',          () => { renderClientCrm();         trackUsage('crm'); });
document.getElementById('invoices-btn')?.addEventListener('click',     () => { renderInvoiceTracker();    trackUsage('invoices'); });
document.getElementById('lgoals-btn')?.addEventListener('click',       () => { renderLearningGoals();     trackUsage('lgoals'); });
document.getElementById('brand-btn')?.addEventListener('click',        () => { renderPersonalBrand();     trackUsage('brand'); });
document.getElementById('wins2-btn')?.addEventListener('click',        () => { renderDailyWins();         trackUsage('wins2'); });
document.getElementById('portfolio-btn')?.addEventListener('click',    () => { renderPortfolioTracker();  trackUsage('portfolio'); });
document.getElementById('plog-btn')?.addEventListener('click',         () => { renderProjectLog();        trackUsage('plog'); });
document.getElementById('cideas-btn')?.addEventListener('click',       () => { renderContentIdeas();      trackUsage('c-ideas'); });
document.getElementById('outreach-btn')?.addEventListener('click',     () => { renderColdOutreach();      trackUsage('outreach'); });
document.getElementById('sales-btn')?.addEventListener('click',        () => { renderSalesPipeline();     trackUsage('sales'); });
document.getElementById('feedback2-btn')?.addEventListener('click',    () => { renderClientFeedback();    trackUsage('feedback2'); });
document.getElementById('sproof-btn')?.addEventListener('click',      () => { renderSocialProof();       trackUsage('sproof'); });
document.getElementById('ecampaigns-btn')?.addEventListener('click',  () => { renderEmailCampaigns();   trackUsage('ecampaigns'); });
document.getElementById('taudit-btn')?.addEventListener('click',      () => { renderTimeAudit();         trackUsage('taudit'); });
document.getElementById('detox-btn')?.addEventListener('click',       () => { renderDigitalDetox();      trackUsage('detox'); });
document.getElementById('readlist-btn')?.addEventListener('click',    () => { renderReadingList();       trackUsage('readlist'); });
document.getElementById('courses-btn')?.addEventListener('click',     () => { renderCourseTracker();     trackUsage('courses'); });
document.getElementById('savings-btn')?.addEventListener('click',     () => { renderSavingsTracker();    trackUsage('savings'); });
document.getElementById('meals-btn')?.addEventListener('click',       () => { renderMealPlanner();       trackUsage('meals'); });
document.getElementById('bmetrics-btn')?.addEventListener('click',    () => { renderBodyMetrics();        trackUsage('bmetrics'); });
document.getElementById('bnotes-btn')?.addEventListener('click',      () => { renderBookNotes();          trackUsage('bnotes'); });
document.getElementById('subs-btn')?.addEventListener('click',        () => { renderSubscriptionTracker(); trackUsage('subs'); });
document.getElementById('travel-btn')?.addEventListener('click',      () => { renderTravelLog();          trackUsage('travel'); });
document.getElementById('events-btn')?.addEventListener('click',      () => { renderEventPlanner();        trackUsage('events'); });
document.getElementById('interview-btn')?.addEventListener('click',   () => { renderInterviewPrep();       trackUsage('interview'); });
document.getElementById('newsletters-btn')?.addEventListener('click', () => { renderNewsletterTracker();   trackUsage('newsletters'); });
document.getElementById('words-btn')?.addEventListener('click',       () => { renderWordTracker();         trackUsage('words'); });
document.getElementById('buglog-btn')?.addEventListener('click',      () => { renderBugLog();              trackUsage('buglog'); });
document.getElementById('hjournal-btn')?.addEventListener('click',   () => { renderHabitJournal();        trackUsage('hjournal'); });
document.getElementById('mjournal-btn')?.addEventListener('click',   () => { renderMoodJournal();         trackUsage('mjournal'); });
document.getElementById('medialog-btn')?.addEventListener('click',   () => { renderMediaLog();            trackUsage('medialog'); });
document.getElementById('hotkeys-btn')?.addEventListener('click',     showHotkeysHelp);
document.getElementById('supervisor-btn')?.addEventListener('click',  () => {
  const s = getSupervisorStats();
  notify('Supervisor', `${s.approved}/${s.totalChecked} aprobadas · score avg ${s.avgScore.toFixed(2)}`, 'supervisor');
});
document.getElementById('mem-stats-btn')?.addEventListener('click',  () => {
  document.dispatchEvent(new CustomEvent('memory:show-stats'));
});

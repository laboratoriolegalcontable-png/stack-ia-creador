/**
 * Notifications — notificaciones del navegador cuando ciclos KAIROS completan
 * @module notifications
 */
import { getFlags } from './flags.js';

let permission = Notification.permission;

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (permission === 'granted') return true;
  permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * @param {string} title
 * @param {string} body
 * @param {'kairos'|'coordinator'|'ultraplan'|'buddy'|'budget'} type
 */
export function notify(title, body, type = 'kairos') {
  if (!getFlags().NOTIFICATIONS_ENABLED) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const icons = {
    kairos:      '\u{1F4AD}',
    coordinator: '\u{1F9E0}',
    ultraplan:   '⚡',
    buddy:       '\u{1F43E}',
    budget:      '\u{1F7E1}',
  };

  const icon = icons[type] || 'ℹ️';
  new Notification(`${icon} ${title}`, {
    body,
    tag: `kairos-${type}`,
    renotify: true,
    silent: false,
  });
}

export function initNotifications() {
  if (!getFlags().NOTIFICATIONS_ENABLED) return;
  if (!('Notification' in window)) return;
  // Pedir permiso la primera vez si no se ha decidido
  if (Notification.permission === 'default') {
    setTimeout(() => requestNotificationPermission(), 3000);
  }
}

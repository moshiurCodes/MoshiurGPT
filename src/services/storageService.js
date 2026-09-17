/**
 * Storage Service
 * Manages chat history, sessions, and preferences in LocalStorage.
 */

const SESSIONS_KEY = 'moshiurgpt_sessions';
const ACTIVE_SESSION_KEY = 'moshiurgpt_active_session_id';
const THEME_KEY = 'moshiurgpt_theme';
const SETTINGS_KEY = 'moshiurgpt_settings';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {
      modelName: 'Gemini 2.0 Flash',
      systemPrompt: '',
      streamSim: true,
      autoScroll: true
    };
  } catch {
    return {
      modelName: 'Gemini 2.0 Flash',
      systemPrompt: '',
      streamSim: true,
      autoScroll: true
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getAllSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading sessions from storage:', e);
    return [];
  }
}

export function saveAllSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions to storage:', e);
  }
}

export function getActiveSessionId() {
  return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
}

export function saveActiveSessionId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

export function createNewSession(initialTitle = 'New Chat') {
  const newSession = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    title: initialTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  const sessions = getAllSessions();
  sessions.unshift(newSession);
  saveAllSessions(sessions);
  saveActiveSessionId(newSession.id);

  return newSession;
}

export function deleteSession(id) {
  const sessions = getAllSessions().filter(s => s.id !== id);
  saveAllSessions(sessions);
  
  const activeId = getActiveSessionId();
  if (activeId === id) {
    const nextActive = sessions.length > 0 ? sessions[0].id : null;
    saveActiveSessionId(nextActive);
    return nextActive;
  }
  return activeId;
}

export function renameSession(id, newTitle) {
  const sessions = getAllSessions().map(s => {
    if (s.id === id) {
      return { ...s, title: newTitle, updatedAt: new Date().toISOString() };
    }
    return s;
  });
  saveAllSessions(sessions);
}

export function clearAllHistory() {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

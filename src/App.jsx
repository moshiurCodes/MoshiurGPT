import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import N8nWorkflowModal from './components/N8nWorkflowModal';

import { 
  getTheme, 
  saveTheme, 
  getAllSessions, 
  saveAllSessions, 
  getActiveSessionId, 
  saveActiveSessionId, 
  createNewSession, 
  deleteSession, 
  renameSession, 
  clearAllHistory, 
  getSettings, 
  saveSettings 
} from './services/storageService';

import { 
  sendMessageToN8N, 
  getStoredWebhookUrl, 
  saveWebhookUrl 
} from './services/n8nService';

export default function App() {
  const [theme, setTheme] = useState(getTheme());
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [settings, setSettingsState] = useState(getSettings());
  const [isLoading, setIsLoading] = useState(false);
  
  const abortControllerRef = useRef(null);

  // Initialize theme, sessions, and settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const loadedSessions = getAllSessions();
    setSessions(loadedSessions);

    const savedActiveId = getActiveSessionId();
    if (savedActiveId && loadedSessions.some(s => s.id === savedActiveId)) {
      setActiveSessionId(savedActiveId);
    } else if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].id);
      saveActiveSessionId(loadedSessions[0].id);
    } else {
      // Create an initial empty session
      const initial = createNewSession('New Chat');
      setSessions([initial]);
      setActiveSessionId(initial.id);
    }

    setWebhookUrlState(getStoredWebhookUrl());
    setSettingsState(getSettings());
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewChat = () => {
    const newSession = createNewSession('New Chat');
    setSessions(getAllSessions());
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    saveActiveSessionId(id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id) => {
    const nextActiveId = deleteSession(id);
    const updated = getAllSessions();
    setSessions(updated);
    if (updated.length === 0) {
      const fresh = createNewSession('New Chat');
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setActiveSessionId(nextActiveId);
    }
  };

  const handleRenameSession = (id, newTitle) => {
    renameSession(id, newTitle);
    setSessions(getAllSessions());
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      clearAllHistory();
      const fresh = createNewSession('New Chat');
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    }
  };

  const handleSaveWebhookUrl = (newUrl) => {
    saveWebhookUrl(newUrl);
    setWebhookUrlState(newUrl);
  };

  const handleSaveSettings = (newSettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);
  };

  // Dispatch message to n8n AI Agent
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading || !activeSessionId) return;

    const userMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    // Auto rename session title on first user message if title is 'New Chat'
    let currentSession = sessions.find(s => s.id === activeSessionId);
    let newTitle = currentSession?.title;
    if (currentSession && (currentSession.title === 'New Chat' || currentSession.messages.length === 0)) {
      newTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    }

    const updatedMessages = [...(currentSession?.messages || []), userMessage];

    // Optimistically update session in state & storage
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    saveAllSessions(updatedSessions);

    setIsLoading(true);

    try {
      // Send to n8n
      const response = await sendMessageToN8N({
        message: text,
        sessionId: activeSessionId,
        chatHistory: updatedMessages,
        customUrl: webhookUrl
      });

      const aiMessage = {
        id: 'msg_' + Date.now() + '_ai',
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        raw: response.raw
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalSessions = getAllSessions().map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: finalMessages
          };
        }
        return s;
      });

      setSessions(finalSessions);
      saveAllSessions(finalSessions);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: 'msg_' + Date.now() + '_err',
        role: 'assistant',
        content: error.message || 'Failed to connect to n8n webhook. Please check your network and n8n webhook configuration.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      const finalMessages = [...updatedMessages, errorMessage];
      const finalSessions = getAllSessions().map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: finalMessages
          };
        }
        return s;
      });

      setSessions(finalSessions);
      saveAllSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length === 0 || isLoading) return;
    
    // Find last user message
    const msgs = [...activeSession.messages];
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;
    const lastUserPrompt = msgs[lastUserIndex].content;

    // Prune subsequent messages
    const trimmedMessages = msgs.slice(0, lastUserIndex);
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: trimmedMessages
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    saveAllSessions(updatedSessions);

    // Resend
    handleSendMessage(lastUserPrompt);
  };

  const handleRetry = () => {
    handleRegenerate();
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleExportChat = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    
    let markdownContent = `# ${activeSession.title}\n\n*Exported from MoshiurGPT on ${new Date().toLocaleString()}*\n\n---\n\n`;
    activeSession.messages.forEach(msg => {
      const sender = msg.role === 'user' ? '👤 **You**' : '✨ **Gemini AI**';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      markdownContent += `### ${sender} _(${time})_\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = activeSession.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    link.download = `${sanitizedTitle || 'chat_export'}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isWebhookConnected = Boolean(webhookUrl && webhookUrl.trim());

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAll={handleClearAllHistory}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-content">
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasMessages={messages.length > 0}
          onExportChat={handleExportChat}
        />

        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={handleSendMessage} />
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onRegenerate={handleRegenerate}
            onRetry={handleRetry}
          />
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
        />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webhookUrl={webhookUrl}
        onSaveWebhookUrl={handleSaveWebhookUrl}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <N8nWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />
    </div>
  );
}

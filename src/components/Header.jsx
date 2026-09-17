import React from 'react';
import { 
  Menu, 
  Moon, 
  Sun, 
  Settings, 
  Download 
} from 'lucide-react';

export default function Header({ 
  theme, 
  onToggleTheme, 
  onOpenSidebar, 
  onOpenSettings,
  hasMessages = false,
  onExportChat
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onOpenSidebar}
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="header-right">
        {hasMessages && (
          <button 
            className="header-btn"
            onClick={onExportChat}
            title="Export conversation as Markdown"
            aria-label="Export Chat"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        )}

        <button 
          className="header-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button 
          className="header-btn"
          onClick={onOpenSettings}
          title="Configure n8n Webhook & Settings"
          aria-label="Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}

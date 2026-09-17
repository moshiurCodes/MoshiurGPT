import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Settings 
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAll,
  onOpenSettings
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const pastWeek = today - 86400000 * 7;

    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: []
    };

    filtered.forEach(session => {
      const date = new Date(session.updatedAt || session.createdAt).getTime();
      if (date >= today) {
        groups.Today.push(session);
      } else if (date >= yesterday) {
        groups.Yesterday.push(session);
      } else if (date >= pastWeek) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups.Older.push(session);
      }
    });

    return groups;
  }, [sessions, searchTerm]);

  const handleStartEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <img src="/avatar.jpg" alt="MoshiurGPT" className="brand-avatar-img" />
            <span className="brand-title-gradient">MoshiurGPT</span>
          </div>
        </div>

        <div className="new-chat-btn-wrapper">
          <button className="new-chat-btn" onClick={onNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="sidebar-search-box">
          <div className="search-input-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="action-icon-btn" 
                style={{ position: 'absolute', right: 8 }}
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-history-container">
          {Object.entries(groupedSessions).map(([groupName, groupItems]) => {
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="history-group">
                <div className="history-group-label">{groupName}</div>
                {groupItems.map(session => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = session.id === editingId;

                  return (
                    <div 
                      key={session.id}
                      className={`history-item ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <div className="history-title-wrap">
                        <MessageSquare size={16} />
                        {isEditing ? (
                          <input 
                            type="text"
                            className="search-input"
                            style={{ padding: '2px 6px', fontSize: '0.85rem' }}
                            value={editTitle}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(e, session.id);
                              if (e.key === 'Escape') handleCancelEdit(e);
                            }}
                          />
                        ) : (
                          <span className="history-title" title={session.title}>
                            {session.title}
                          </span>
                        )}
                      </div>

                      <div className="history-actions">
                        {isEditing ? (
                          <>
                            <button 
                              className="action-icon-btn" 
                              title="Save" 
                              onClick={(e) => handleSaveEdit(e, session.id)}
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              className="action-icon-btn" 
                              title="Cancel" 
                              onClick={handleCancelEdit}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="action-icon-btn" 
                              title="Rename" 
                              onClick={(e) => handleStartEdit(e, session)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              className="action-icon-btn delete" 
                              title="Delete" 
                              onClick={(e) => handleDelete(e, session.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No chat history yet.<br/>Start a conversation!
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="footer-action-row">
            <button 
              className="footer-btn" 
              onClick={onOpenSettings}
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            {sessions.length > 0 && (
              <button 
                className="footer-btn" 
                onClick={onClearAll}
                title="Clear all conversations"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

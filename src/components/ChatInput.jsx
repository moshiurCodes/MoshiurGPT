import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square 
} from 'lucide-react';

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  onStopGeneration,
  placeholder = "Ask MoshiurGPT anything..." 
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="chat-input-dock-wrapper">
      <div className="chat-input-container">
        <div className="chat-input-card">
          <textarea
            ref={textareaRef}
            className="auto-growing-textarea"
            rows={1}
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="input-actions-inline">
            {isLoading ? (
              <button 
                type="button" 
                className="send-btn" 
                onClick={onStopGeneration}
                title="Stop generation"
                style={{ background: '#ef4444' }}
              >
                <Square size={14} fill="#fff" />
              </button>
            ) : (
              <button 
                type="button" 
                className="send-btn" 
                onClick={handleSubmit}
                disabled={!input.trim()}
                title="Send message (Enter)"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

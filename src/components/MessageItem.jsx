import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { renderMarkdown } from '../utils/markdownRenderer';

export default function MessageItem({ 
  message, 
  isLast, 
  isLoading, 
  onRegenerate, 
  onRetry 
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  // Format timestamp
  const formattedTime = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Strip markdown symbols for cleaner TTS
      const plainText = message.content.replace(/[#*`_~[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <div className={`message-wrapper ${isUser ? 'user-msg' : 'ai-msg'}`}>
      {!isUser && (
        <div className="message-avatar ai">
          <img src="/avatar.jpg" alt="MoshiurGPT" className="message-avatar-img" />
        </div>
      )}

      <div className="message-body">
        <div className="message-header">
          <span className="sender-name">{isUser ? 'You' : 'MoshiurGPT'}</span>
          <span className="message-time">{formattedTime}</span>
        </div>

        {isUser ? (
          <div className="user-content-box">
            {message.content}
          </div>
        ) : (
          <div className="ai-content-box">
            {message.isError ? (
              <div className="message-error-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  <span>Workflow Execution Error</span>
                </div>
                <div>{message.content}</div>
                {onRetry && (
                  <button className="retry-btn" onClick={onRetry}>
                    <RefreshCw size={13} />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            ) : (
              <div 
                className="markdown-rendered-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            )}

            {!message.isError && (
              <div className="message-actions-toolbar">
                <button 
                  className="msg-action-btn" 
                  onClick={handleCopyMessage}
                  title={copied ? 'Copied to clipboard' : 'Copy message'}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>

                <button 
                  className="msg-action-btn" 
                  onClick={handleToggleSpeech}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX size={14} color="#f59e0b" /> : <Volume2 size={14} />}
                </button>

                {isLast && !isLoading && onRegenerate && (
                  <button 
                    className="msg-action-btn" 
                    onClick={onRegenerate}
                    title="Regenerate response"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

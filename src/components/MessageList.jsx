import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Sparkles } from 'lucide-react';

export default function MessageList({
  messages,
  isLoading,
  onRegenerate,
  onRetry
}) {
  const bottomRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Set up global handler for code block copy buttons inside rendered markdown
  useEffect(() => {
    window.copyCodeFromBlock = (buttonEl) => {
      try {
        const encoded = buttonEl.getAttribute('data-code');
        const code = decodeURIComponent(encoded);
        navigator.clipboard.writeText(code);

        const copyTextEl = buttonEl.querySelector('.copy-text');
        const originalText = copyTextEl ? copyTextEl.textContent : 'Copy';

        buttonEl.classList.add('copied');
        if (copyTextEl) copyTextEl.textContent = 'Copied!';

        setTimeout(() => {
          buttonEl.classList.remove('copied');
          if (copyTextEl) copyTextEl.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };
  }, []);

  return (
    <div className="chat-scroll-area">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            message={msg}
            isLast={index === messages.length - 1}
            isLoading={isLoading}
            onRegenerate={msg.role === 'assistant' ? onRegenerate : undefined}
            onRetry={msg.isError ? onRetry : undefined}
          />
        ))}

        {isLoading && (
          <div className="message-wrapper ai-msg">
            <div className="message-avatar ai">
              <img src="/avatar.jpg" alt="MoshiurGPT" className="message-avatar-img" />
            </div>
            <div className="message-body">
              <div className="message-header">
                <span className="sender-name">MoshiurGPT</span>
              </div>
              <div className="gemini-loading-container">
                <div className="gemini-loading-wave">
                  <div className="wave-dot"></div>
                  <div className="wave-dot"></div>
                  <div className="wave-dot"></div>
                </div>
                <span className="loading-status-text">Thinking....</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}

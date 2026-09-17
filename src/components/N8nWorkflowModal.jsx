import React, { useState } from 'react';
import { X, Workflow, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

const N8N_SAMPLE_WORKFLOW = {
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chat-agent",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300],
      "id": "webhook-node-1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.body.message }}",
        "options": {
          "systemMessage": "You are Gemini AI, a helpful, precise, and polite AI assistant running inside an n8n workflow."
        }
      },
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [500, 300],
      "id": "ai-agent-node-2"
    },
    {
      "parameters": {
        "modelName": "models/gemini-2.0-flash",
        "options": {
          "temperature": 0.7
        }
      },
      "name": "Google Gemini Chat Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      "typeVersion": 1,
      "position": [500, 520],
      "id": "gemini-model-node-3"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"output\": {{ JSON.stringify($json.output) }},\n  \"timestamp\": \"{{ new Date().toISOString() }}\",\n  \"status\": \"success\"\n}",
        "options": {}
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [800, 300],
      "id": "respond-webhook-node-4"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Google Gemini Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

export default function N8nWorkflowModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(N8N_SAMPLE_WORKFLOW, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Workflow size={20} color="var(--accent-gemini-2)" />
            <span>n8n AI Agent Workflow Template</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'var(--gemini-gradient-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', marginBottom: 4 }}>
              <Sparkles size={16} color="var(--accent-gemini-1)" />
              <span>How to setup in n8n in 1 minute:</span>
            </h4>
            <ol style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>Copy the JSON snippet below.</li>
              <li>Open your <strong>n8n Canvas</strong> and press <code>Ctrl + V</code> (paste).</li>
              <li>Add your <strong>Google Gemini API Key</strong> in the Gemini Chat Model node.</li>
              <li>Toggle the workflow to <strong>Active</strong> and copy the <strong>Production Webhook URL</strong>.</li>
              <li>Paste the URL into MoshiurGPT <strong>Settings</strong>!</li>
            </ol>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Workflow Template JSON</label>
              <button 
                type="button" 
                className="code-copy-btn" 
                onClick={handleCopy}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span className="copy-text">{copied ? 'Copied to Clipboard!' : 'Copy Workflow JSON'}</span>
              </button>
            </div>

            <pre style={{ 
              background: 'var(--code-bg)', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--code-border)',
              maxHeight: 220,
              fontSize: '0.8rem'
            }}>
              <code>{jsonString}</code>
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Workflow JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}

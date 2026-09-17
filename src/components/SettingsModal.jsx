import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { testWebhookConnection } from '../services/n8nService';

export default function SettingsModal({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
  settings,
  onSaveSettings
}) {
  const [urlInput, setUrlInput] = useState(webhookUrl || '');
  const [modelName, setModelName] = useState(settings?.modelName || 'Gemini 2.0 Flash');
  const [systemPrompt, setSystemPrompt] = useState(settings?.systemPrompt || '');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setUrlInput(webhookUrl || '');
    setModelName(settings?.modelName || 'Gemini 2.0 Flash');
    setSystemPrompt(settings?.systemPrompt || '');
    setTestResult(null);
  }, [isOpen, webhookUrl, settings]);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Webhook URL first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testWebhookConnection(urlInput);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveWebhookUrl(urlInput.trim());
    onSaveSettings({
      ...settings,
      modelName,
      systemPrompt
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={20} color="var(--accent-gemini-1)" />
            <span>n8n Webhook & Model Settings</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Webhook Configuration */}
          <div className="form-group">
            <label className="form-label">n8n Webhook URL</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://your-n8n.instance/webhook/chat-agent"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={handleTestPing}
                disabled={isTesting}
              >
                {isTesting ? <Loader2 size={15} className="spin" /> : <Radio size={15} />}
                <span>Test Ping</span>
              </button>
            </div>
            <span className="form-hint">
              Leave blank to use the built-in intelligent demo simulation mode. Or set via <code>VITE_N8N_WEBHOOK_URL</code>.
            </span>

            {testResult && (
              <div
                style={{
                  marginTop: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: testResult.success ? '#10b981' : '#f87171',
                  border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="form-group">
            <label className="form-label">AI Model Engine</label>
            <select
              className="form-input"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            >
              <option value="Gemini 2.0 Flash">Google Gemini 2.0 Flash (Fastest)</option>
              <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro (Complex Reasoning)</option>
              <option value="Gemini 1.5 Flash">Google Gemini 1.5 Flash</option>
              <option value="n8n Custom AI Agent">n8n Custom Multi-Agent Chain</option>
            </select>
            <span className="form-hint">Select the Gemini model or agent connected inside your n8n workflow.</span>
          </div>

          {/* System Prompt */}
          <div className="form-group">
            <label className="form-label">Custom System Instructions (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. You are a senior automation architect specialized in n8n, Node.js, and API integrations..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <span className="form-hint">Passed as metadata context with each message payload.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

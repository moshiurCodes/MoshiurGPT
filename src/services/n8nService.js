/**
 * n8n Webhook Service
 * Handles communication between the frontend chatbot and n8n AI Agent workflows.
 */

// Default URL from Vite environment variable or configured endpoint
export const DEFAULT_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-f2ty.srv1670697.hstgr.cloud/webhook-test/9568d0e2-07e0-4ebf-8b4a-72e278e0c3ef';

/**
 * Get active webhook URL from localStorage or fall back to default env
 */
export function getStoredWebhookUrl() {
  const custom = localStorage.getItem('moshiurgpt_n8n_url');
  if (custom !== null && custom !== undefined && custom.trim() !== '') {
    return custom.trim();
  }
  return DEFAULT_WEBHOOK_URL;
}

/**
 * Save custom webhook URL to localStorage
 */
export function saveWebhookUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('moshiurgpt_n8n_url', url.trim());
  } else {
    localStorage.removeItem('moshiurgpt_n8n_url');
  }
}

/**
 * Sends a message to the n8n webhook and extracts the AI agent's response.
 * 
 * @param {Object} params
 * @param {string} params.message - The current user message
 * @param {string} params.sessionId - Unique identifier for the conversation session
 * @param {Array} params.chatHistory - Previous messages array [{role: 'user'|'assistant', content: '...'}]
 * @param {string} [params.customUrl] - Optional override webhook URL
 * @returns {Promise<{text: string, raw: any, success: boolean}>}
 */
export async function sendMessageToN8N({ message, sessionId, chatHistory = [], customUrl }) {
  const webhookUrl = (customUrl || getStoredWebhookUrl()).trim();

  // If no webhook URL is configured, use fallback simulator with helpful guidance
  if (!webhookUrl) {
    return simulateAiResponse(message, sessionId, "NO_WEBHOOK_CONFIGURED");
  }

  const payload = {
    message,
    sessionId,
    chatHistory: chatHistory.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    })),
    timestamp: new Date().toISOString(),
    source: 'MoshiurGpt-Web'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for complex LLM chains

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`n8n Webhook responded with status ${response.status} (${response.statusText}): ${errorText.slice(0, 200)}`);
    }

    const rawText = await response.text();
    let resultText = '';
    let rawData = null;

    if (!rawText || !rawText.trim()) {
      throw new Error(
        "n8n Webhook-টি ফাঁকা রেসপন্স (0 bytes) পাঠিয়েছে। আপনার n8n ওয়ার্কফ্লোতে Webhook নোডের 'Respond' অপশনটি 'Using Respond to Webhook Node' করুন এবং AI Agent-এর পর একটি 'Respond to Webhook' নোড যুক্ত করুন!"
      );
    }

    try {
      const data = JSON.parse(rawText);
      rawData = data;
      resultText = extractTextFromN8nResponse(data);
    } catch {
      // Plain text or markdown
      resultText = rawText;
      rawData = { text: rawText };
    }

    if (!resultText || !resultText.trim()) {
      resultText = "*(Received an empty response from n8n webhook)*";
    }

    return {
      text: resultText,
      raw: rawData,
      success: true
    };
  } catch (error) {
    console.error('n8n Webhook Error:', error);
    
    // Check if it's a CORS or Network error, or AbortError
    if (error.name === 'AbortError') {
      throw new Error('Request timed out (60s). Your n8n workflow might still be executing a heavy AI model.');
    }
    
    // Re-throw with helpful diagnostics
    throw error;
  }
}

/**
 * Extracts AI text from common n8n AI agent response formats
 */
function extractTextFromN8nResponse(data) {
  if (!data) return '';
  
  if (typeof data === 'string') return data;
  
  // If data is an array (n8n node output items list)
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const first = data[0];
    if (typeof first === 'object' && first !== null) {
      if (first.json) return extractTextFromN8nResponse(first.json);
      return extractTextFromN8nResponse(first);
    }
    return String(first);
  }

  // Common n8n AI Agent / LangChain / Webhook response keys
  if (data.output !== undefined) return formatField(data.output);
  if (data.text !== undefined) return formatField(data.text);
  if (data.response !== undefined) return formatField(data.response);
  if (data.message !== undefined) return formatField(data.message);
  if (data.reply !== undefined) return formatField(data.reply);
  if (data.content !== undefined) return formatField(data.content);
  if (data.answer !== undefined) return formatField(data.answer);
  if (data.result !== undefined) return formatField(data.result);

  // If nested under json or data
  if (data.json && typeof data.json === 'object') {
    return extractTextFromN8nResponse(data.json);
  }
  if (data.data && typeof data.data === 'object') {
    return extractTextFromN8nResponse(data.data);
  }

  // Fallback: Format as JSON string
  return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
}

function formatField(val) {
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return extractTextFromN8nResponse(val);
  }
  return String(val);
}

/**
 * Test ping for webhook connectivity
 */
export async function testWebhookConnection(url) {
  const targetUrl = (url || getStoredWebhookUrl()).trim();
  if (!targetUrl) {
    return { success: false, message: 'Please provide a valid Webhook URL.' };
  }

  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: true,
        message: 'Ping test from MoshiurGPT',
        timestamp: new Date().toISOString()
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        latency,
        message: `Connected successfully! (Status ${response.status}, ${latency}ms latency)`
      };
    } else {
      return {
        success: false,
        status: response.status,
        latency,
        message: `Server returned error status ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      latency,
      message: error.name === 'AbortError' 
        ? 'Connection timed out after 12s.' 
        : `Connection failed (${error.message}). Check CORS headers or webhook activation status in n8n.`
    };
  }
}

/**
 * Intelligent simulation fallback when user hasn't set an n8n webhook URL yet
 */
async function simulateAiResponse(message, sessionId, reason) {
  // Simulate natural delay
  await new Promise(r => setTimeout(r, 900));

  const lower = message.toLowerCase();

  let reply = '';

  if (reason === "NO_WEBHOOK_CONFIGURED") {
    reply += `> 💡 **Tip:** No **n8n Webhook URL** is connected yet. You can open **Settings** (⚙️ top right) to connect your live n8n workflow or \`.env\` file.\n\n`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    reply += `### Hello! I am your **Gemini AI Assistant** ✨\n\nI am ready to help you with:\n* 🚀 **Building and executing n8n workflows**\n* 💻 **Coding, debugging, & architecture**\n* 🧠 **Reasoning, math, and data analysis**\n* ✍️ **Writing and ideation**\n\nHow can I assist you today?`;
  } else if (lower.includes('n8n') || lower.includes('webhook') || lower.includes('workflow')) {
    reply += `### ⚡ Connecting to n8n AI Agent Workflow\n\nHere is how your n8n workflow works:\n\n1. **Webhook Node**: Receives \`POST\` with \`{ message, sessionId, chatHistory }\`\n2. **AI Agent / LangChain Node**: Connected to Gemini 1.5/2.0 or OpenAI\n3. **Respond to Webhook Node**: Sends back the response JSON: \`{ "output": "..." }\`\n\n\`\`\`json\n{\n  "status": "connected",\n  "message": "${message.replace(/"/g, '\\"')}",\n  "timestamp": "${new Date().toISOString()}"\n}\n\`\`\`\n\nClick the **n8n Workflow** button in the top bar to inspect and copy a complete ready-to-import template!`;
  } else if (lower.includes('code') || lower.includes('javascript') || lower.includes('python') || lower.includes('react')) {
    reply += `### 💻 Here is a clean solution\n\nHere is an example demonstrating modern async data fetching with error handling:\n\n\`\`\`javascript\n// Async n8n Webhook Dispatcher\nasync function dispatchToN8N(prompt, sessionId) {\n  try {\n    const response = await fetch('YOUR_N8N_WEBHOOK_URL', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        message: prompt,\n        sessionId: sessionId,\n        timestamp: new Date().toISOString()\n      })\n    });\n    \n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    \n    const data = await response.json();\n    return data.output || data.response;\n  } catch (error) {\n    console.error('Workflow dispatch failed:', error);\n    throw error;\n  }\n}\n\`\`\`\n\nLet me know if you would like me to adapt this for Python or another framework!`;
  } else {
    reply += `### Response to: "${message}"\n\nI have processed your request. When connected to your **n8n Webhook**, this will run directly through your personalized AI Agent and custom tools!\n\n| Attribute | Value |\n| :--- | :--- |\n| **Session ID** | \`${sessionId.slice(0, 8)}...\` |\n| **Mode** | Interactive Assistant |\n| **Engine** | Gemini 2.0 Flash / n8n Agent |\n\nLet me know what you would like to explore next!`;
  }

  return {
    text: reply,
    raw: { simulated: true },
    success: true
  };
}

# MoshiurGPT — Gemini-Inspired AI Chatbot with n8n Webhook Integration

A modern, state-of-the-art AI chatbot web application inspired by Google Gemini, featuring an original futuristic UI design, glassmorphism, glowing multi-color gradients, full Markdown & syntax-highlighted code support, chat history, and seamless connection to **n8n AI Agent Webhooks**.

---

## ✨ Features

- **Gemini-Inspired Aesthetics**: Sleek obsidian dark mode & crisp pearl light mode, glowing multi-color Gemini gradients (`#4e80ee`, `#8b5cf6`, `#ec4899`, `#f59e0b`), smooth micro-animations.
- **Sidebar & History Management**:
  - `+ New Chat` button with animated hover
  - Past conversations grouped automatically by date (*Today*, *Yesterday*, *Previous 7 Days*, *Older*)
  - Inline chat renaming & deletion
  - Search filter across all conversations
  - LocalStorage persistence
- **Gemini Welcome Screen**:
  - Animated floating Gemini star constellation icon
  - Multi-color gradient greeting (*"Hello, Moshiur"* & *"How can I help you today?"*)
  - 4 interactive prompt suggestion cards across *n8n Automation*, *Coding & Debug*, *Ideas & Strategy*, and *Data & Analysis*
- **Rich Message Stream**:
  - User & AI message bubbles
  - Full GitHub-Flavored Markdown support (headings, tables, blockquotes, lists)
  - Code syntax highlighting with language badge and 1-click **Copy Code** button
  - Action toolbar: **Copy Message**, **Regenerate Response**, and **Text-to-Speech (Read Aloud)**
  - Gemini wave loading dots animation while processing
- **Chat Input Dock**:
  - Auto-growing multi-line textarea with smooth height adjustments
  - Speech-to-Text voice dictation (Web Speech API)
  - Insert Code snippet helper
  - `Enter` to send, `Shift+Enter` for new line, character counter
- **n8n Integration**:
  - Configurable via `.env` (`VITE_N8N_WEBHOOK_URL`) or in-app **Settings Modal**
  - Live **Test Ping** button with latency timer
  - Handles diverse n8n output formats (`output`, `text`, `response`, `message`, `data`, or raw text)
  - Built-in **n8n AI Agent Workflow Template** with 1-click JSON copy ready to paste directly into n8n!

---

## 🚀 Getting Started

### 1. Run the Development Server

```bash
cd MoshiurGpt
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ n8n Integration Setup

### Webhook Flow
```
User Message → MoshiurGPT Frontend → POST Request → n8n Webhook → AI Agent (Gemini) → n8n Response → MoshiurGPT Frontend
```

### Request Payload
MoshiurGPT sends a `POST` request with:
```json
{
  "message": "User question or prompt",
  "sessionId": "session_1740000000_abc123",
  "chatHistory": [
    { "role": "user", "content": "Hi", "timestamp": "2026-09-16T..." },
    { "role": "assistant", "content": "Hello! How can I help?", "timestamp": "2026-09-16T..." }
  ],
  "timestamp": "2026-09-16T23:00:00.000Z",
  "source": "MoshiurGpt-Web"
}
```

### Expected n8n Response
Return a JSON response from n8n's **Respond to Webhook** node:
```json
{
  "output": "Your AI generated response text with Markdown and code blocks.",
  "status": "success"
}
```

### Environment Variables
Create or edit `.env`:
```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-agent
```
*(You can also configure or override the URL directly in the in-app Settings modal without restarting the server!)*

---

## 🛠️ Tech Stack

- **React 18**
- **Vite 6**
- **Lucide React** (icons)
- **Marked** (Markdown parser)
- **Highlight.js** (syntax highlighting)
- **Modern Vanilla CSS System** (Design tokens & CSS variables)

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { chat } from '../../api';

const ChatbotScreen = ({ topic }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Ask me anything about interview prep. I can help you clarify doubts, practice answers, and explain concepts."
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const apiMessages = useMemo(
    () => messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setIsSending(true);

    try {
      const data = await chat({ messages: apiMessages.concat({ role: 'user', content: text }), topic });
      const reply = typeof data?.reply === 'string' ? data.reply : 'Sorry, I could not generate a reply.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Chat service is not reachable. Is the backend running on port 8000?' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="ds-page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ds-page-inner"
      >
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: 'rgba(37, 99, 235, 0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Chatbot</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {topic ? `Topic: ${topic}` : 'Ask doubts, get explanations, prepare answers.'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: 16,
              background: 'rgba(248, 250, 252, 0.6)',
              height: 420,
              overflow: 'auto',
              padding: 12
            }}
          >
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 10
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 680,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        flexDirection: isUser ? 'row-reverse' : 'row'
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isUser ? 'rgba(15, 23, 42, 0.06)' : 'rgba(37, 99, 235, 0.12)',
                          color: isUser ? '#0f172a' : '#2563eb'
                        }}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: 16,
                          background: isUser ? 'white' : 'rgba(37, 99, 235, 0.06)',
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          color: '#0f172a',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isSending ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
                <div className="animate-pulse">Thinking...</div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <input
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isSending}
            />
            <button type="button" className="btn-primary" onClick={send} disabled={isSending || !input.trim()}>
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatbotScreen;

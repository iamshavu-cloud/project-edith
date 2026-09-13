'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  BarChart3,
  Calendar,
  AlertTriangle,
  Users,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toaster';
import {
  getChatHistory,
  addChatMessage,
  clearChatHistory,
  loadDemoData,
  getUser,
} from '@/lib/store';
import { processEdithMessage } from '@/lib/edith-agent';
import type { ChatMessage } from '@/types';

const quickPrompts = [
  'Can I bunk Physics tomorrow?',
  'Am I cooked for Maths?',
  "What's everyone doing in our project?",
  'Plan my evening schedule',
  "What assignments are due?",
  'Check all my attendance percentages',
];

export default function AskEdithPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getUser()) loadDemoData();
    const history = getChatHistory();
    if (history.length === 0) {
      // Seed friendly welcome message
      const welcome: ChatMessage = {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Yo, what's good! I'm EDITH — the senior you wish you had in freshman year. 🎓\n\nI've got your actual attendance numbers, your timetable, your project deliverables, and your deadlines loaded up. No corporate BS, no fake AI hallucinations.\n\nWhat are we tackling today? Hit one of the quick buttons below or just type.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
      addChatMessage(welcome);
    } else {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown bold and emoji for clean pronunciation
      const clean = text
        .replace(/[*_#`]/g, '')
        .replace(/[^\w\s.,!?'"%-]/gi, ' ')
        .slice(0, 250);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast('Voice recognition not supported in this browser', { type: 'warning' });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening... speak now 🎙️', { type: 'info' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast('Could not detect voice input', { type: 'error' });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 8),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate natural senior thinking delay
    setTimeout(() => {
      const result = processEdithMessage(text);

      const assistantMsg: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 8),
        role: 'assistant',
        content: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tool_calls: result.toolUsed
          ? [{ name: result.toolUsed, args: { query: text }, result: result.toolData }]
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addChatMessage(assistantMsg);
      setIsTyping(false);
      speakText(result.message);
    }, 600);
  };

  const handleClearHistory = () => {
    if (confirm('Clear EDITH conversation history?')) {
      clearChatHistory();
      setMessages([]);
      toast('Chat history cleared', { type: 'info' });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-bg-primary">
      {/* Top Header */}
      <div className="p-4 md:px-8 border-b border-border/80 bg-bg-secondary flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-bg-secondary rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-text-primary tracking-tight">EDITH AI</h1>
              <Badge variant="accent" size="sm">
                Senior Memory Active 🧠
              </Badge>
            </div>
            <p className="text-[11px] text-text-muted">
              Connected to Attendance • Schedule • Tasks • Projects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/voice"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold hover:bg-amber-500/20 transition-all shadow-sm"
            title="Open Full Voice Orb Interface"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Voice Orb HUD</span>
          </Link>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              voiceEnabled
                ? 'bg-accent/15 border-accent/30 text-accent-hover'
                : 'bg-bg-elevated border-border text-text-muted'
            }`}
            title={voiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-bg-elevated border border-border text-text-muted hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] md:max-w-[78%] ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-accent text-white'
                    : 'bg-bg-card border border-accent/40 text-accent-hover'
                }`}
              >
                {m.role === 'user' ? 'You' : <Zap className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className="space-y-1.5">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-white rounded-tr-none shadow-md shadow-accent/20'
                      : 'bg-bg-card border border-border/80 text-text-primary rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-2">
                    {m.content}
                  </div>
                </div>

                {/* Tool Trigger Badge if tool was called */}
                {m.tool_calls && m.tool_calls.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-accent-hover">
                    <Sparkles className="w-3 h-3" />
                    <span>Tool executed: {m.tool_calls[0].name.replace('_', ' ')}</span>
                  </div>
                )}

                <span className="text-[10px] text-text-muted px-2 block">{m.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-bg-card border border-accent/40 text-accent-hover flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="bg-bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.3s]" />
              <span className="text-xs text-text-muted ml-2">EDITH is checking your records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Command Suggestion Chips */}
      <div className="p-3 border-t border-border/60 bg-bg-secondary/60">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted shrink-0 pl-1">
            Senior Prompts:
          </span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-bg-card border border-border hover:border-accent/40 hover:text-text-primary text-text-secondary transition-all shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 md:px-8 border-t border-border/80 bg-bg-secondary">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-xl border transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-bg-card border-border text-text-secondary hover:text-text-primary hover:border-accent/40'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to talk (Voice EDITH)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder="Ask anything: 'Can I bunk Physics?', 'Am I cooked?', 'Plan my day'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all"
          />

          <Button
            variant="primary"
            size="md"
            icon={<Send className="w-4 h-4" />}
            onClick={() => handleSend()}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

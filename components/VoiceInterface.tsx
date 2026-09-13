"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { processEdithMessage } from "@/lib/edith-agent";
import { addChatMessage, getChatHistory } from "@/lib/store";

/* ============================================================
   TYPES
   ============================================================ */

export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface EdithMessage {
  id: string;
  role: "user" | "edith";
  text: string;
  timestamp: number;
}

const voiceStateLabel: Record<VoiceState, string> = {
  idle: "STANDBY",
  listening: "RECEIVING",
  thinking: "PROCESSING",
  speaking: "TRANSMITTING",
  error: "SIGNAL LOST",
};

const voiceStateColor: Record<VoiceState, string> = {
  idle: "#6B6357",
  listening: "#4FA8FF",
  thinking: "#F2A65A",
  speaking: "#F2A65A",
  error: "#E0554F",
};

/* ============================================================
   VOICE ORB — central mic control, sonar-ring pulse per state
   ============================================================ */

interface VoiceOrbProps {
  state: VoiceState;
  onPress?: () => void;
  size?: number;
}

export function VoiceOrb({ state, onPress, size = 180 }: VoiceOrbProps) {
  const color = voiceStateColor[state];
  const isActive = state === "listening" || state === "speaking";
  const isThinking = state === "thinking";
  const rings = useMemo(() => (isActive ? [0, 0.6, 1.2] : []), [isActive]);

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Edith voice control — ${voiceStateLabel[state].toLowerCase()}`}
      className="relative flex items-center justify-center rounded-full outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[#12100D] active:scale-95 cursor-pointer select-none"
      style={{ width: size, height: size }}
    >
      {rings.map((delay, i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full border animate-[edith-ping_2.4s_ease-out_infinite] pointer-events-none"
          style={{ borderColor: color, animationDelay: `${delay}s`, opacity: 0.5 }}
        />
      ))}

      <span
        className={`relative flex h-[70%] w-[70%] items-center justify-center rounded-full border transition-colors duration-500 ${
          isThinking ? "animate-[edith-spin_3s_linear_infinite]" : ""
        }`}
        style={{
          borderColor: color,
          background: "radial-gradient(circle at 35% 30%, rgba(242,236,228,0.06), rgba(18,16,13,0.9))",
          boxShadow: isActive ? `0 0 32px -6px ${color}` : "none",
        }}
      >
        <span
          className="h-3 w-3 rounded-full transition-all duration-500"
          style={{ background: color, boxShadow: `0 0 12px 2px ${color}` }}
        />
      </span>

      <style jsx>{`
        @keyframes edith-ping {
          0% { transform: scale(0.7); opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes edith-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

/* ============================================================
   WAVEFORM — amplitude bars, flat at idle
   ============================================================ */

interface WaveformProps {
  state: VoiceState;
  levels?: number[];
  barCount?: number;
}

const IDLE_LEVELS = Array(24).fill(0.06);

export function Waveform({ state, levels, barCount = 24 }: WaveformProps) {
  const color = voiceStateColor[state];
  const isFlat = state === "idle" || state === "error";
  const values = levels && levels.length === barCount ? levels : IDLE_LEVELS.slice(0, barCount);

  return (
    <div role="img" aria-label="Voice amplitude" className="flex h-16 w-full items-center justify-center gap-[3px]">
      {values.map((v, i) => {
        const height = isFlat ? 3 : Math.max(4, v * 64);
        const distanceFromCenter = Math.abs(i - (barCount - 1) / 2) / (barCount / 2);
        const delay = distanceFromCenter * 0.15;
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-[height] duration-150 ${
              !isFlat ? "animate-[edith-bar_1.1s_ease-in-out_infinite]" : ""
            }`}
            style={{ height, background: color, opacity: isFlat ? 0.35 : 0.85, animationDelay: `${delay}s` }}
          />
        );
      })}
      <style jsx>{`
        @keyframes edith-bar {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1.15); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   CONVERSATION LOG — scrolling transcript
   ============================================================ */

interface ConversationLogProps {
  messages: EdithMessage[];
  emptyHint?: string;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ConversationLog({ messages, emptyHint = "Say something to start or tap the Orb." }: ConversationLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center px-6 text-center font-mono text-sm text-[#6B6357]">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex max-w-[85%] flex-col gap-1 ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
        >
          {m.role === "edith" && (
            <span className="font-mono text-[10px] tracking-tight text-[#F2A65A]">
              EDITH · {formatTime(m.timestamp)}
            </span>
          )}
          <p
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
              m.role === "user"
                ? "rounded-tr-sm bg-[#1D1A16] text-[#F2ECE4] border border-[#2A2620]"
                : "rounded-tl-sm border border-[#2A2620] bg-[#14120F] text-[#F2ECE4]"
            }`}
          >
            {m.text}
          </p>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

/* ============================================================
   STATUS BAR — telemetry strip
   ============================================================ */

interface StatusBarProps {
  state: VoiceState;
  connected: boolean;
  latencyMs?: number;
}

export function StatusBar({ state, connected, latencyMs }: StatusBarProps) {
  const color = voiceStateColor[state];

  return (
    <div className="flex w-full items-center justify-between border-b border-[#2A2620] bg-[#12100D]/95 px-4 py-2 font-mono text-[11px] text-[#948B7C]">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px 1px ${color}` }} />
        <span style={{ color }}>{voiceStateLabel[state]}</span>
      </div>
      <span className="tracking-tight text-[#6B6357]">EDITH NEURAL INTERFACE</span>
      <div className="flex items-center gap-3">
        {typeof latencyMs === "number" && <span>{latencyMs}ms</span>}
        <span className={connected ? "text-[#4FA8FF]" : "text-[#E0554F]"}>{connected ? "LINK OK" : "LINK DOWN"}</span>
      </div>
    </div>
  );
}

/* ============================================================
   EDITH INTERFACE — full voice integration
   ============================================================ */

export default function EdithInterface() {
  const [state, setState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<EdithMessage[]>([]);
  const [activeLevels, setActiveLevels] = useState<number[]>(IDLE_LEVELS);
  const recognitionRef = useRef<any>(null);

  // Initialize greeting & load stored chat history if any
  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "edith" : "user",
          text: m.content,
          timestamp: Date.now(),
        }))
      );
    } else {
      setMessages([
        {
          id: "init",
          role: "edith",
          text: "Yo, what's good! Tap the orb and speak to me. I've got your attendance, deadlines, and schedule loaded.",
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  // Voice synthesis speaker
  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setState("idle");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*_#`]/g, "")
        .replace(/[^\w\s.,!?'"%-]/gi, " ")
        .slice(0, 300);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Animate waveform during speaking
      const interval = setInterval(() => {
        setActiveLevels(Array.from({ length: 24 }, () => Math.random() * 0.7 + 0.15));
      }, 150);

      utterance.onend = () => {
        clearInterval(interval);
        setActiveLevels(IDLE_LEVELS);
        setState("idle");
      };

      utterance.onerror = () => {
        clearInterval(interval);
        setActiveLevels(IDLE_LEVELS);
        setState("idle");
      };

      setState("speaking");
      window.speechSynthesis.speak(utterance);
    } catch {
      setState("idle");
    }
  };

  // Process user speech via EDITH senior brain
  const handleUserQuery = (text: string) => {
    const userMsg: EdithMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    addChatMessage({
      id: userMsg.id,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    setState("thinking");

    setTimeout(() => {
      const result = processEdithMessage(text);
      const edithMsg: EdithMessage = {
        id: crypto.randomUUID(),
        role: "edith",
        text: result.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, edithMsg]);
      addChatMessage({
        id: edithMsg.id,
        role: "assistant",
        content: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      speakResponse(result.message);
    }, 700);
  };

  // Start Speech Recognition
  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo simulation if browser speech API is unavailable
      setState("listening");
      setTimeout(() => {
        handleUserQuery("Can I bunk Physics tomorrow?");
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setState("listening");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserQuery(transcript);
      };

      recognition.onerror = () => {
        setState("idle");
      };

      recognition.onend = () => {
        if (state === "listening") {
          setState("idle");
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setState("idle");
    }
  };

  function handlePress() {
    if (state === "idle" || state === "error") {
      startListening();
    } else if (state === "listening") {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setState("idle");
    } else if (state === "speaking") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setState("idle");
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#12100D] text-[#F2ECE4]">
      <StatusBar state={state} connected latencyMs={state === "idle" ? undefined : 84} />
      <div className="flex-1 overflow-hidden">
        <ConversationLog messages={messages} />
      </div>
      <div className="flex flex-col items-center gap-6 border-t border-[#2A2620] px-6 py-8 bg-[#12100D]/80 backdrop-blur-md">
        <Waveform state={state} levels={state === "speaking" ? activeLevels : undefined} />
        <div className="flex flex-col items-center gap-2">
          <VoiceOrb state={state} onPress={handlePress} />
          <p className="font-mono text-xs text-[#948B7C] tracking-wider uppercase">
            {state === "idle" && "Tap Orb to Speak"}
            {state === "listening" && "Listening... Tap to Stop"}
            {state === "thinking" && "Processing with EDITH Brain..."}
            {state === "speaking" && "Transmitting Audio... Tap to Silence"}
          </p>
        </div>
      </div>
    </div>
  );
}

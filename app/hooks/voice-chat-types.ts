/**
 * 语音聊天类型定义 - 从 useVoiceChat.ts 提取
 */

export type VoiceChatMode = 'tap' | 'hold';

export interface VoiceChatState {
  mode: VoiceChatMode;
  isRecording: boolean;
  interimText: string;
  finalText: string;
  isSpeaking: boolean;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  autoSpeak: boolean;
  volume: number;
  rate: number;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  toggleMode: () => void;
  toggleAutoSpeak: () => void;
  setVolume: (v: number) => void;
  setRate: (r: number) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  resetFinalText: () => void;
}

// ===== SpeechRecognition 类型声明 =====

export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

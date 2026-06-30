/**
 * ChatModule 共享类型
 */

export interface VoiceChatProps {
  isRecording: boolean;
  interimText: string;
  finalText: string;
  isSpeaking: boolean;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  autoSpeak: boolean;
  mode: 'tap' | 'hold';
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  onToggleAutoSpeak: () => void;
  onToggleMode: () => void;
  onSubmitText: (text: string) => void;
}

export interface ShortcutItem {
  id: string;
  name: string;
  prompt: string;
}

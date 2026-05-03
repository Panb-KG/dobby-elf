"use client";

import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Wand2, 
  History, 
  Settings, 
  User as UserIcon,
  MessageSquare,
  ChevronRight,
  BrainCircuit,
  Languages,
  Calculator,
  Calendar,
  Hourglass,
  Pencil,
  PanelRightClose,
  PanelRightOpen,
  X,
  Layout,
  Image as ImageIcon,
  FileText,
  Trophy,
  Medal,
  Star,
  Award,
  TrendingUp,
  Paperclip,
  Mic,
  File,
  Video,
  Music,
  Trash2,
  Plus,
  LogOut,
  LogIn,
  AlertCircle,
  Bell,
  Droplets,
  Leaf,
  CheckCircle2,
  Circle,
  RotateCcw,
  VolumeX,
  Library,
  CloudRain,
  Flame,
  Camera,
  Loader2
} from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { dobi, type Message } from './services/magicElf';
import { cn } from './lib/utils';
import { DobiAvatar } from './components/DobiAvatar';
import { DobiMascot } from './components/DobiMascot';
import { authService } from './services/auth';
import { dataService } from './services/data';
import { User, Course, Achievement } from './services/types';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0a0502] p-6 text-center">
          <div className="glass-panel p-8 max-w-md space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-serif font-bold text-white">魔法出错了</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              哎呀，多比的魔法好像出了点小问题。别担心，你可以尝试刷新页面或者稍后再试。
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-white/40 text-left overflow-auto max-h-32">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-magic-accent text-white rounded-xl font-bold"
            >
              重试魔法
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SPELLS = [
  { id: 'schedule', name: '课程表', icon: Calendar, prompt: '多比，帮我看看我的课程安排，或者帮我制定一个学习计划吧！' },
  { id: 'homework', name: '作业', icon: Pencil, prompt: '多比，这是我的作业照片，请帮我批改一下：' },
  { id: 'words', name: '学单词', icon: Languages, prompt: '多比，我想学习一些新单词，或者帮我翻译一下：' },
  { id: 'poetry', name: '诗词', icon: BookOpen, prompt: '多比，我想练习古诗词，帮我出一道诗词题吧！' },
  { id: 'math', name: '互动练习', icon: BrainCircuit, prompt: '多比，我想练习一下最近学的知识点，帮我出几道题吧！' },
  { id: 'focus', name: '魔法专注', icon: Hourglass, prompt: '多比，我想开始一段专注学习，帮我开启魔法沙漏吧！' },
  { id: 'achievements', name: '成就墙', icon: Trophy, prompt: '多比，快来看看我的成就墙，帮我记录一下新的荣誉，或者看看我攒了多少积分啦！' },
];

export default function App() {
  return (
    <ErrorBoundary>
      <MagicApp />
    </ErrorBoundary>
  );
}

function MagicApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [sidebarContentType, setSidebarContentType] = useState<'none' | 'schedule' | 'exercise' | 'homework' | 'poetry' | 'image' | 'achievements' | 'focus' | 'content' | 'monitor'>('schedule');
  const [scheduleView, setScheduleView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState('周一');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ day: '周一', subject: '', time: '', type: '校内' as '校内' | '课外' });
  const [isParsingSchedule, setIsParsingSchedule] = useState(false);
  const [parseScheduleError, setParseScheduleError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([
    { day: '周一', subject: '魔法数学', time: '09:00 - 10:30', type: '校内', color: 'bg-blue-500/20 border-blue-500/30' },
    { day: '周一', subject: '飞行课', time: '11:00 - 12:00', type: '校内', color: 'bg-sky-500/20 border-sky-500/30' },
    { day: '周二', subject: '咒语文学', time: '10:45 - 12:15', type: '校内', color: 'bg-purple-500/20 border-purple-500/30' },
    { day: '周二', subject: '神奇动物学', time: '14:00 - 15:30', type: '校内', color: 'bg-orange-500/20 border-orange-500/30' },
    { day: '周三', subject: '星象科学', time: '14:00 - 15:30', type: '校内', color: 'bg-amber-500/20 border-amber-500/30' },
    { day: '周三', subject: '魔药学', time: '16:00 - 17:30', type: '校内', color: 'bg-green-500/20 border-green-500/30' },
    { day: '周四', subject: '药草英语', time: '09:00 - 10:30', type: '校内', color: 'bg-emerald-500/20 border-emerald-500/30' },
    { day: '周四', subject: '黑魔法防御术', time: '13:00 - 14:30', type: '校内', color: 'bg-slate-500/20 border-slate-500/30' },
    { day: '周五', subject: '奥数竞技', time: '15:45 - 17:15', type: '课外', color: 'bg-rose-500/20 border-rose-500/30' },
    { day: '周五', subject: '魔法史', time: '10:00 - 11:30', type: '校内', color: 'bg-yellow-500/20 border-yellow-500/30' },
    { day: '周六', subject: '魁地奇训练', time: '09:00 - 11:00', type: '课外', color: 'bg-red-500/20 border-red-500/30' },
    { day: '周六', subject: '钢琴魔法', time: '14:00 - 15:30', type: '课外', color: 'bg-indigo-500/20 border-indigo-500/30' },
    { day: '周日', subject: '幻影显形模拟', time: '10:00 - 11:30', type: '课外', color: 'bg-cyan-500/20 border-cyan-500/30' },
    { day: '周日', subject: '自由魔法实验', time: '15:00 - 17:00', type: '课外', color: 'bg-lime-500/20 border-lime-500/30' },
  ]);
  const [points, setPoints] = useState(1250);
  const [level, setLevel] = useState('魔法学徒');
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'task1', text: '完成3道奥数题', completed: false, reward: 50 },
    { id: 'task2', text: '背诵5个新单词', completed: false, reward: 30 },
    { id: 'task3', text: '查看今日课程表', completed: false, reward: 10 },
  ]);
  const [homeworkTasks, setHomeworkTasks] = useState<any[]>([
    { id: 'hw1', subject: '数学', title: '分数乘法练习', status: 'pending', dueDate: '2026-03-30', image: null },
    { id: 'hw2', subject: '语文', title: '古诗背诵', status: 'completed', dueDate: '2026-03-28', image: null },
    { id: 'hw3', subject: '英语', title: '单词拼写', status: 'pending', dueDate: '2026-03-31', image: null },
  ]);
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [newHomework, setNewHomework] = useState({ subject: '', title: '', dueDate: '' });
  const [homeworkImage, setHomeworkImage] = useState<string | null>(null);
  const [isParsingHomework, setIsParsingHomework] = useState(false);
  const [parseHomeworkError, setParseHomeworkError] = useState<string | null>(null);
  const [homeworkInputText, setHomeworkInputText] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: '三好学生', date: '2025-12', type: 'school', iconName: 'Award', color: 'text-amber-400' },
    { id: '2', title: '奥数竞赛一等奖', date: '2026-01', type: 'competition', iconName: 'Trophy', color: 'text-yellow-500' },
    { id: '3', title: '单词达人', date: '2026-02', type: 'learning', iconName: 'Star', color: 'text-blue-400' },
  ]);
  const [activeReminder, setActiveReminder] = useState<{subject: string, time: string} | null>(null);

  // Magic Teaching States
  const [knowledgeGraph, setKnowledgeGraph] = useState([
    { name: '分数乘法', status: 'mastered', subject: '数学' },
    { name: '过去进行时', status: 'learning', subject: '英语' },
    { name: '古诗词鉴赏', status: 'learning', subject: '语文' },
  ]);
  const [dynamicExercises, setDynamicExercises] = useState<{
    subject: string;
    grade: string;
    questions: any[];
  } | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseResult, setShowExerciseResult] = useState(false);

  // 诗词练习状态
  const [poetryExercise, setPoetryExercise] = useState<{
    title: string;
    author: string;
    dynasty: string;
    fullText: string;
    questions: Array<{ id: string; type: 'fill' | 'match' | 'comprehension'; question: string; answer: string; options?: string[]; hint: string }>;
    currentIndex: number;
  } | null>(null);
  const [poetryAnswer, setPoetryAnswer] = useState('');
  const [poetryResult, setPoetryResult] = useState<'correct' | 'incorrect' | null>(null);
  const [poetryScore, setPoetryScore] = useState({ correct: 0, total: 0 });
  const [isGeneratingPoetry, setIsGeneratingPoetry] = useState(false);

  // 监控状态
  const [monitorStats, setMonitorStats] = useState<any>(null);
  const [monitorLogs, setMonitorLogs] = useState<any[]>([]);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorLogFilter, setMonitorLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [monitorTab, setMonitorTab] = useState<'stats' | 'logs'>('stats');

  // Focus Tool States
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [isHourglassBroken, setIsHourglassBroken] = useState(false);
  const [whiteNoise, setWhiteNoise] = useState<'none' | 'library' | 'rain' | 'fire'>('none');

  // Complex Content States
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        setMessages(prev => [...prev, { role: 'model', text: `呼啦啦！欢迎回来，${currentUser.displayName}！多比已经准备好为你服务了。✨`, timestamp: Date.now() }]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync User Profile
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const loadUserData = async () => {
      try {
        const userData = await dataService.getUser(user.id);
        if (userData) {
          if (userData.points !== undefined) setPoints(userData.points);
          if (userData.level !== undefined) setLevel(userData.level);
          if (userData.treeGrowth !== undefined) setTreeGrowth(userData.treeGrowth);
          if (userData.dailyTasks !== undefined) setDailyTasks(userData.dailyTasks);
        } else {
          // Initialize user profile
          await dataService.saveUser(user);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, [user, isAuthReady]);

  // Sync Courses
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const loadCourses = async () => {
      try {
        const fetchedCourses = await dataService.getCourses(user.id);
        if (fetchedCourses.length > 0) {
          setCourses(fetchedCourses);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };

    loadCourses();
  }, [user, isAuthReady]);

  // Sync Achievements
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const loadAchievements = async () => {
      try {
        const fetchedAchievements = await dataService.getAchievements(user.id);
        if (fetchedAchievements.length > 0) {
          setAchievements(fetchedAchievements);
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, [user, isAuthReady]);

  // Smart Reminder System
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      courses.forEach(course => {
        if (course.day === currentDay) {
          const startTime = course.time.split(' - ')[0];
          if (!startTime) return;
          
          const [h, m] = startTime.split(':').map(Number);
          const courseDate = new Date();
          courseDate.setHours(h, m, 0, 0);
          
          const diff = (courseDate.getTime() - now.getTime()) / (1000 * 60);
          // Trigger reminder if class starts in 1-5 minutes
          if (diff > 0 && diff <= 5) {
             setActiveReminder({ subject: course.subject, time: startTime });
          }
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [courses]);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Focus Timer Logic
  useEffect(() => {
    let interval: any;
    if (isFocusActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setIsFocusActive(false);
      setMessages(prev => [...prev, { role: 'model', text: '呼啦啦！专注时间结束！小主人你太棒了，魔法能量充满了你的大脑！✨' }]);
      setPoints(prev => prev + 50);
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusTime]);

  // Tab Visibility Detection (Hourglass Breaking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocusActive) {
        setIsFocusActive(false);
        setIsHourglassBroken(true);
        setMessages(prev => [...prev, { role: 'model', text: '哎呀！沙漏碎掉了... 专注魔法被打断了。小主人，我们要保持一心一意哦。🪄' }]);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFocusActive]);

  // White Noise Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    
    const audio = audioRef.current;

    if (whiteNoise !== 'none') {
      const urls = {
        library: 'https://www.soundjay.com/ambient/library-ambience-01.mp3',
        rain: 'https://www.soundjay.com/nature/rain-01.mp3',
        fire: 'https://www.soundjay.com/household/fireplace-01.mp3'
      };
      
      const targetUrl = urls[whiteNoise as keyof typeof urls];
      if (audio.src !== targetUrl) {
        audio.src = targetUrl;
        audio.load();
      }
      
      audio.volume = 0.5;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playback prevented by browser:", error);
          // Auto-retry once or wait for next interaction
        });
      }
    } else {
      audio.pause();
    }
  }, [whiteNoise]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // 检查浏览器是否支持语音识别
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported by browser');
      setSpeechRecognitionSupported(false);
      return;
    }

    // 检查是否在安全环境中（HTTPS 或 localhost）
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      console.log('Speech recognition requires HTTPS or localhost');
      setSpeechRecognitionSupported(false);
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        // 给用户友好的错误提示
        let errorMessage = '语音识别出错了';
        switch (event.error) {
          case 'network':
            errorMessage = '网络连接问题，请检查网络后重试';
            break;
          case 'not-allowed':
            errorMessage = '请允许麦克风权限';
            setSpeechRecognitionSupported(false);
            break;
          case 'no-speech':
            errorMessage = '没有检测到语音';
            break;
          case 'audio-capture':
            errorMessage = '无法捕获音频，请检查麦克风';
            break;
        }
        console.warn(errorMessage);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setSpeechRecognitionSupported(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend || !textToSend.trim()) && attachments.length === 0) return;

    // Convert attachments to base64
    const fileData = await Promise.all(attachments.map(async (file) => {
      const base64 = await fileToBase64(file);
      return { mimeType: file.type, data: base64 };
    }));

    const userMsg: Message = { 
      role: 'user', 
      text: textToSend || (attachments.length > 0 ? "请帮我识别这张图片中的课表信息，并帮我记录到课程表中" : ""),
      files: fileData.length > 0 ? fileData : undefined,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const updatedMessages = [...messages, userMsg];
      const history = updatedMessages;
      let fullResponse = '';
      
      // Add a placeholder message for streaming
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: Date.now() }]);

      const stream = dobi.chatStream(history);
      for await (const chunk of stream) {
        if (typeof chunk === 'object' && chunk.functionCalls) {
          for (const call of chunk.functionCalls) {
            if (call.name === 'addCourse') {
              const args = call.args as any;
              await performAddCourse(args);
            } else if (call.name === 'generateExercises') {
              const args = call.args as any;
              setDynamicExercises(args);
              setCurrentExerciseIndex(0);
              setExerciseAnswers({});
              setShowExerciseResult(false);
              setSidebarContentType('exercise');
              setIsRightSidebarOpen(true);
            } else if (call.name === 'updateKnowledgeGraph') {
              const args = call.args as any;
              setKnowledgeGraph(prev => {
                const newGraph = [...prev];
                args.points.forEach((newPoint: any) => {
                  const existingIndex = newGraph.findIndex(p => p.name === newPoint.name);
                  if (existingIndex >= 0) {
                    newGraph[existingIndex] = newPoint;
                  } else {
                    newGraph.push(newPoint);
                  }
                });
                return newGraph;
              });
              setSidebarContentType('exercise');
              setIsRightSidebarOpen(true);
            }
          }
          continue;
        }
        if (typeof chunk === 'string') {
          fullResponse += chunk;
          
          // Check for image generation trigger
          const imageMatch = fullResponse.match(/\[GENERATE_IMAGE:\s*(.*?)\]/);
          if (imageMatch) {
            const prompt = imageMatch[1];
            // Remove the trigger tag from display
            const cleanText = fullResponse.replace(/\[GENERATE_IMAGE:.*?\]/g, '');
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'model', text: cleanText, timestamp: Date.now() };
              return newMessages;
            });

            // Trigger image generation in background
            dobi.generateMagicImage(prompt).then(url => {
              if (url) {
                setGeneratedImage(url);
                setIsRightSidebarOpen(true);
                setSidebarContentType('image');
              }
            });
          } else {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse, timestamp: Date.now() };
              return newMessages;
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Magic failed:', error);
      const errorMessage = error.message || '未知魔法干扰';
      const errorDetails = error.stack ? `\n\n调试信息：${errorMessage}` : errorMessage;
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'model', 
          text: `哎呀，魔法能量好像有点不稳定... 错误信息：${errorDetails}`,
          timestamp: Date.now()
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current && speechRecognitionSupported) {
        setIsRecording(true);
        recognitionRef.current.start();
      } else if (!speechRecognitionSupported) {
        console.warn("语音识别功能不可用，请使用 HTTPS 或现代浏览器（Chrome/Edge/Safari）");
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddHomework = async () => {
    if (!newHomework.subject || !newHomework.title || !newHomework.dueDate) return;
    
    const homework = {
      id: `hw${Date.now()}`,
      subject: newHomework.subject,
      title: newHomework.title,
      status: 'pending',
      dueDate: newHomework.dueDate,
      image: homeworkImage
    };
    
    setHomeworkTasks(prev => [...prev, homework]);
    setIsAddingHomework(false);
    setNewHomework({ subject: '', title: '', dueDate: '' });
    setHomeworkImage(null);
  };

  const handleHomeworkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileToBase64(file).then(setHomeworkImage);
    }
  };

  const toggleHomeworkStatus = (id: string) => {
    setHomeworkTasks(prev => prev.map(hw => 
      hw.id === id ? { ...hw, status: hw.status === 'pending' ? 'completed' : 'pending' } : hw
    ));
  };

  const deleteHomework = (id: string) => {
    setHomeworkTasks(prev => prev.filter(hw => hw.id !== id));
  };

  const handleParseHomework = async () => {
    if (!homeworkInputText && !homeworkImage) return;

    setIsParsingHomework(true);
    setParseHomeworkError(null);

    try {
      const body: any = {};
      
      if (homeworkImage) {
        body.image = homeworkImage;
      }
      
      if (homeworkInputText) {
        body.text = homeworkInputText;
      }

      const res = await fetch('/api/homework/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '识别失败');
      }

      if (!data.tasks || data.tasks.length === 0) {
        setParseHomeworkError('未识别到作业信息，请确认内容清晰');
        setIsParsingHomework(false);
        return;
      }

      // 批量添加识别到的作业
      const today = new Date().toISOString().split('T')[0];
      const newTasks = data.tasks.map((task: any, idx: number) => ({
        id: `hw${Date.now()}_${idx}`,
        subject: task.subject,
        title: task.title,
        description: task.description || '',
        status: 'pending',
        dueDate: task.dueDate || today,
        image: homeworkImage,
      }));

      setHomeworkTasks(prev => [...prev, ...newTasks]);
      
      // 清空输入
      setHomeworkInputText('');
      setHomeworkImage(null);
    } catch (error: any) {
      console.error('Parse homework error:', error);
      setParseHomeworkError(error.message || '识别失败');
    } finally {
      setIsParsingHomework(false);
    }
  };

  const handleGenerateExercise = async (subject: string, topic: string) => {
    try {
      const res = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade: '小学',
          topic,
          count: 5,
          difficulty: 'medium',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失败');
      }

      if (!data.questions || data.questions.length === 0) {
        setMessages(prev => [...prev, { role: 'model', text: '哎呀，多比没能生成练习题，请稍后再试。', timestamp: Date.now() }]);
        return;
      }

      // 更新练习状态
      setDynamicExercises({
        subject,
        grade: '小学',
        questions: data.questions,
      });
      setCurrentExerciseIndex(0);
      setExerciseAnswers({});
      setShowExerciseResult(false);
      setSidebarContentType('exercise');
      setIsRightSidebarOpen(true);

    } catch (error: any) {
      console.error('Generate exercise error:', error);
      setMessages(prev => [...prev, { role: 'model', text: `生成练习题失败：${error.message}`, timestamp: Date.now() }]);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.subject || !newCourse.time) return;
    await performAddCourse(newCourse);
    setIsAddingCourse(false);
    setNewCourse({ day: '周一', subject: '', time: '', type: '校内' });
  };

  const handleScheduleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingSchedule(true);
    setParseScheduleError(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch('/api/courses/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '识别失败');
      }

      if (!data.courses || data.courses.length === 0) {
        setParseScheduleError('未识别到课程信息，请确认图片清晰且包含课表');
        setIsParsingSchedule(false);
        return;
      }

      // 批量保存识别到的课程
      const colors = [
        'bg-blue-500/20 border-blue-500/30',
        'bg-purple-500/20 border-purple-500/30',
        'bg-amber-500/20 border-amber-500/30',
        'bg-emerald-500/20 border-emerald-500/30',
        'bg-rose-500/20 border-rose-500/30',
        'bg-sky-500/20 border-sky-500/30',
        'bg-indigo-500/20 border-indigo-500/30',
      ];

      for (const course of data.courses) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const finalCourse = {
          day: course.day,
          subject: course.subject,
          time: course.time,
          type: course.type || '校内',
          color: randomColor,
        };

        if (user) {
          try {
            await dataService.saveCourse(user.id, finalCourse);
          } catch (err) {
            console.error('Failed to save course:', err);
          }
        } else {
          setCourses(prev => [...prev, finalCourse]);
        }
      }

      // 完成"查看课程表"任务
      completeTask('task3');
    } catch (error: any) {
      console.error('Upload error:', error);
      setParseScheduleError(error.message || '上传失败');
    } finally {
      setIsParsingSchedule(false);
    }
  };

  const performAddCourse = async (courseData: any) => {
    // ... existing colors ...
    const colors = [
      'bg-blue-500/20 border-blue-500/30',
      'bg-purple-500/20 border-purple-500/30',
      'bg-amber-500/20 border-amber-500/30',
      'bg-emerald-500/20 border-emerald-500/30',
      'bg-rose-500/20 border-rose-500/30',
      'bg-sky-500/20 border-sky-500/30',
      'bg-indigo-500/20 border-indigo-500/30'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const finalCourse = { 
      type: '课外',
      color: randomColor,
      ...courseData 
    };

    if (user) {
      try {
        await dataService.saveCourse(user.id, finalCourse);
        // Complete "View Schedule" task if adding a course
        completeTask('task3');
      } catch (err) {
        console.error('Failed to save course:', err);
      }
    } else {
      setCourses(prev => [...prev, finalCourse]);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const newTasks = dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
    const newPoints = points + task.reward;
    
    // Calculate new level
    let newLevel = level;
    if (newPoints >= 5000) newLevel = '大魔法师';
    else if (newPoints >= 3000) newLevel = '高级魔法师';
    else if (newPoints >= 2000) newLevel = '中级魔法师';
    else if (newPoints >= 1000) newLevel = '初级魔法师';

    try {
      await dataService.updateUser(user.id, {
        dailyTasks: newTasks,
        points: newPoints,
        level: newLevel
      });
      
      // Celebration effect (simulated by message)
      setMessages(prev => [...prev, { role: 'model', text: `🎉 呼啦啦！恭喜小主人完成了任务：**${task.text}**！获得了 **${task.reward}** 魔法积分！变！✨` }]);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const waterTree = async () => {
    if (!user || points < 50) return;
    
    try {
      await dataService.updateUser(user.id, {
        points: points - 50,
        treeGrowth: treeGrowth + 1
      });
      setMessages(prev => [...prev, { role: 'model', text: `💧 你用 50 积分灌溉了“知识之树”，它又长大了一点点！瞧，它的叶子更绿了。🌿` }]);
    } catch (err) {
      console.error('Failed to water tree:', err);
    }
  };

  const useSpell = (spell: typeof SPELLS[0]) => {
    setInput(spell.prompt);
    // Automatically open sidebar and set content based on spell
    if (spell.id === 'schedule') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('schedule');
    } else if (spell.id === 'homework') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('homework');
    } else if (spell.id === 'poetry') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('poetry');
      handleGeneratePoetry();
    } else if (spell.id === 'math') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('exercise');
    } else if (spell.id === 'achievements') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('achievements');
    } else if (spell.id === 'focus') {
      setIsRightSidebarOpen(true);
      setSidebarContentType('focus');
    }
  };

  const handleGeneratePoetry = async () => {
    setIsGeneratingPoetry(true);
    setPoetryResult(null);
    setPoetryAnswer('');
    setPoetryScore({ correct: 0, total: 0 });

    try {
      const res = await fetch('/api/exercises/poetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: 5,
          grade: '小学',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失败');
      }

      if (!data.poetry) {
        setMessages(prev => [...prev, { role: 'model', text: '多比的诗词魔法暂时失灵了，请稍后再试。', timestamp: Date.now() }]);
        return;
      }

      setPoetryExercise({
        title: data.poetry.title,
        author: data.poetry.author,
        dynasty: data.poetry.dynasty,
        fullText: data.poetry.fullText,
        questions: data.poetry.questions,
        currentIndex: 0,
      });
    } catch (error: any) {
      console.error('Generate poetry error:', error);
      setMessages(prev => [...prev, { role: 'model', text: `生成诗词练习失败：${error.message}`, timestamp: Date.now() }]);
    } finally {
      setIsGeneratingPoetry(false);
    }
  };

  const handlePoetryAnswer = () => {
    if (!poetryExercise || !poetryAnswer.trim()) return;

    const currentQ = poetryExercise.questions[poetryExercise.currentIndex];
    const isCorrect = poetryAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase();

    setPoetryResult(isCorrect ? 'correct' : 'incorrect');
    setPoetryScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setMessages(prev => [...prev, { role: 'model', text: '✨ 回答正确！太棒了！', timestamp: Date.now() }]);
    }
  };

  const loadMonitorData = async () => {
    setMonitorLoading(true);
    try {
      // 加载统计数据
      const statsRes = await fetch('/api/system/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setMonitorStats(statsData);
      }
      
      // 加载日志
      const logsRes = await fetch('/api/system/logs?limit=30');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setMonitorLogs(logsData);
      }
    } catch (error) {
      console.error('Failed to load monitor data:', error);
    } finally {
      setMonitorLoading(false);
    }
  };

  // 检查消息是否包含复杂内容
  const isComplexContent = (text: string) => {
    // 检查是否包含表格、HTML、长文本等复杂内容
    return (
      text.includes('<table') ||
      text.includes('<div') ||
      text.includes('<h1') ||
      text.includes('<h2') ||
      text.length > 500
    );
  };

  // 处理复杂内容点击
  const handleComplexContentClick = (text: string) => {
    setSelectedContent(text);
    // 提取标题
    const titleMatch = text.match(/<h1[^>]*>(.*?)<\/h1>/);
    setContentTitle(titleMatch ? titleMatch[1] : '详细内容');
    setSidebarContentType('content'); // 使用新的内容类型
    setIsRightSidebarOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      await authService.login(loginForm.username, loginForm.password);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } catch (error: any) {
      setAuthError(error.message || '登录失败');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('两次输入的密码不一致');
      return;
    }
    
    if (registerForm.password.length < 6) {
      setAuthError('密码长度至少6位');
      return;
    }
    
    try {
      await authService.register(registerForm.username, registerForm.password);
      setShowRegisterModal(false);
      setRegisterForm({ username: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      setAuthError(error.message || '注册失败');
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Background Atmosphere */}
      <div className="atmosphere" />

      {/* Smart Reminder Toast */}
      <AnimatePresence>
        {activeReminder && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="p-4 rounded-2xl bg-magic-accent border border-white/20 shadow-2xl shadow-magic-accent/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">魔法提醒！✨</h4>
                <p className="text-white/80 text-xs">
                  小主人，你的“<span className="font-bold">{activeReminder.subject}</span>”课程将在 <span className="font-bold">{activeReminder.time}</span> 开始。快准备好你的魔法棒吧！
                </p>
              </div>
              <button 
                onClick={() => setActiveReminder(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-end border-b border-[#2A2A2E] pb-8 px-6 pt-6 z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#D97706]/20 blur-xl rounded-full group-hover:bg-[#D97706]/40 transition-all" />
              <div className="relative w-16 h-16 origin-center transform scale-[0.4]">
                <DobiMascot className="w-64 h-80 -mt-16 -ml-24" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">魔法小课桌 / Magic Desk</h1>
          </div>
          <p className="text-[#71717A] font-mono text-xs uppercase tracking-widest opacity-60">
            Enhanced by Dobi AI • Creator Edition
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={cn(
              "p-3 rounded-xl transition-all border",
              isRightSidebarOpen ? "bg-[#D97706] text-[#0F0F11] border-[#D97706]" : "bg-[#1A1A1E] border-[#2A2A2E] text-white/60 hover:text-white"
            )}
            title={isRightSidebarOpen ? "关闭展示栏" : "打开展示栏"}
          >
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
          <div className="px-4 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 uppercase">Dobi Online</span>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white">{user.displayName}</span>
              <button 
                onClick={() => authService.logout()}
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all"
                title="登出魔法世界"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-[#D97706] text-[#0F0F11] font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <LogIn className="w-4 h-4" />
              <span>魔法登录</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 grid grid-cols-12 gap-6 p-4 pb-20 md:pb-6 md:p-6 overflow-hidden z-10 transition-all duration-300 ease-in-out"
        style={{ marginRight: isRightSidebarOpen ? '24rem' : '0' }}
      >
        {/* Left Sidebar - Spells (Desktop) */}
        <aside className="hidden md:flex col-span-3">
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-3xl p-6 w-full h-full flex flex-col">
            <h3 className="text-[#71717A] text-[10px] font-mono uppercase tracking-[0.3em] mb-6 px-2">魔法咒语库 / spells</h3>
            <nav className="space-y-1 flex-1">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group text-left"
                >
                  <spell.icon className="w-5 h-5 text-[#71717A] group-hover:text-[#D97706] transition-colors" />
                  <span className="font-bold text-sm tracking-tight text-[#71717A] group-hover:text-white transition-colors">{spell.name}</span>
                </button>
              ))}
            </nav>
            <div className="mt-4 p-4 rounded-2xl bg-[#0F0F11] border border-[#2A2A2E]">
              <p className="text-xs text-[#71717A]/60 leading-relaxed italic">
                "知识是唯一的魔法，而你是那个伟大的魔法师。"
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Area - col-span-6 */}
        <section className="col-span-6 flex flex-col gap-4">
          <div className="flex-1 bg-[#1A1A1E] border border-[#2A2A2E] rounded-[40px] p-8 overflow-y-auto relative custom-scrollbar">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <span className="text-[200px] font-black underline underline-offset-8">DOBI</span>
            </div>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-6 py-4 rounded-[30px] text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-[#D97706] text-[#0F0F11] font-bold" 
                      : "bg-[#0F0F11] border border-[#2A2A2E] text-white"
                  )}>
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5">
                            {file.mimeType.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-emerald-400" />
                            ) : file.mimeType.startsWith('video/') ? (
                              <Video className="w-4 h-4 text-blue-400" />
                            ) : (
                              <File className="w-4 h-4 text-amber-400" />
                            )}
                            <span className="text-[10px] text-white/40 uppercase tracking-tighter">附件 {idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* 复杂内容显示 */}
                    {msg.role === 'model' && isComplexContent(msg.text) && (
                      <div 
                        className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => handleComplexContentClick(msg.text)}
                      >
                        <FileText className="w-4 h-4 text-magic-accent" />
                        <span className="text-sm text-white/70">查看详细内容 →</span>
                      </div>
                    )}
                    {msg.role === 'model' ? (
                      <div className="markdown-body">
                        <Markdown rehypePlugins={[rehypeRaw]}>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 mt-2",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    {msg.role === 'model' && <DobiAvatar size="sm" />}
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      {msg.role === 'user' ? 'Seeker' : 'Dobi'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-magic-accent/60"
              >
                <DobiAvatar size="sm" />
                <span className="text-xs italic font-serif">正在施展魔法...</span>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-full p-2 flex items-center gap-2 group focus-within:border-[#D97706] transition-all shadow-2xl">
            {/* File Previews */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-2 px-2 pt-2"
                >
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative group p-2 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                      ) : file.type.startsWith('video/') ? (
                        <Video className="w-4 h-4 text-blue-400" />
                      ) : (
                        <File className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-[10px] text-white/60 max-w-[80px] truncate">{file.name}</span>
                      <button 
                        onClick={() => removeAttachment(idx)}
                        className="p-1 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Spells Quick Access */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F0F11] border border-[#2A2A2E] text-xs text-[#71717A]"
                >
                  <spell.icon className="w-3 h-3" />
                  {spell.name}
                </button>
              ))}
            </div>

            <button className="p-3 text-[#71717A] hover:text-[#D97706] transition-colors" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              multiple 
            />
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入你的问题，让魔法发生..." 
              className="flex-1 bg-transparent border-none outline-none text-white font-medium px-4 text-sm placeholder:text-[#71717A]/50"
            />
            <button
              onClick={toggleRecording}
              disabled={!speechRecognitionSupported}
              className={cn(
                "p-3 transition-colors",
                isRecording ? "text-red-500 animate-pulse" : 
                !speechRecognitionSupported ? "opacity-30 cursor-not-allowed text-[#71717A]/30" : 
                "text-[#71717A] hover:text-[#D97706]"
              )}
              title={!speechRecognitionSupported ? "语音识别不可用（需HTTPS或现代浏览器）" : isRecording ? "停止录音" : "语音输入"}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="w-14 h-14 bg-[#D97706] rounded-full flex items-center justify-center text-[#0F0F11] hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              <ChevronRight className="w-6 h-6 stroke-[3px]" />
            </button>
          </div>
        </section>

        {/* Right Sidebar - Content Display */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: '24rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full z-50 flex flex-col glass-panel overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-magic-accent" />
                    <h2 className="text-sm font-serif italic text-white/80">魔法展示窗</h2>
                  </div>
                  <button 
                    onClick={() => setIsRightSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {sidebarContentType === 'none' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-serif italic">
                        等待多比为你展示魔法内容...<br/>
                        你可以试着点击左侧的“课程表”或“作业”。
                      </p>
                    </div>
                  )}

                  {sidebarContentType === 'content' && selectedContent && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
                        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
                          <div>
                            <h3 className="text-lg font-serif font-bold text-white mb-1">{contentTitle}</h3>
                            <p className="text-xs text-white/40">多比的魔法内容</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="markdown-body">
                          <Markdown rehypePlugins={[rehypeRaw]}>{selectedContent}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {sidebarContentType === 'schedule' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
                      {/* Sticky Header Section */}
                      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
                        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
                          <div>
                            <h3 className="text-lg font-serif font-bold text-white mb-1">我的魔法课程表</h3>
                            <p className="text-xs text-white/40">2026年3月 · 第一周</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setIsAddingCourse(!isAddingCourse)}
                              className={cn(
                                "p-2 rounded-xl transition-all border",
                                isAddingCourse ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"
                              )}
                              title="添加课程"
                            >
                              {isAddingCourse ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                              <button 
                                onClick={() => setScheduleView('week')}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                  scheduleView === 'week' ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                )}
                              >
                                周
                              </button>
                              <button 
                                onClick={() => setScheduleView('day')}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                  scheduleView === 'day' ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                )}
                              >
                                日
                              </button>
                            </div>
                          </div>
                        </div>

                        {isAddingCourse && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <select 
                                value={newCourse.day}
                                onChange={(e) => setNewCourse({...newCourse, day: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                              >
                                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <select 
                                value={newCourse.type}
                                onChange={(e) => setNewCourse({...newCourse, type: e.target.value as '校内' | '课外'})}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                              >
                                <option value="校内">校内</option>
                                <option value="课外">课外</option>
                              </select>
                            </div>
                            <input 
                              type="text" 
                              placeholder="课程名称 (如: 魔法数学)"
                              value={newCourse.subject}
                              onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                            />
                            <input 
                              type="text" 
                              placeholder="时间 (如: 09:00 - 10:30)"
                              value={newCourse.time}
                              onChange={(e) => setNewCourse({...newCourse, time: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                            />
                            <button 
                              onClick={handleAddCourse}
                              className="w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              添加魔法课程
                            </button>
                          </motion.div>
                        )}

                        {scheduleView === 'day' && (
                          <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
                            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                              <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                  "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                                  selectedDay === day 
                                    ? "bg-white/10 border-magic-accent text-magic-accent" 
                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 图片识别上传 */}
                        <div className="space-y-2">
                          <label className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                            <Camera className="w-4 h-4 text-white/60" />
                            <span className="text-xs text-white/60">上传课表图片识别</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScheduleImageUpload}
                              className="hidden"
                              disabled={isParsingSchedule}
                            />
                          </label>
                          {isParsingSchedule && (
                            <div className="flex items-center justify-center gap-2 text-white/60 text-xs">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>正在识别课表...</span>
                            </div>
                          )}
                          {parseScheduleError && (
                            <div className="text-red-400 text-xs text-center">{parseScheduleError}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {scheduleView === 'week' ? (
                          /* 周视图 - 课表网格 */
                          <div className="space-y-3">
                            {/* 星期标题行 */}
                            <div className="grid grid-cols-8 gap-1">
                              <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider text-center py-2">时间</div>
                              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                                <div key={day} className="text-[9px] font-bold text-white/40 uppercase tracking-wider text-center py-2">
                                  {day.replace('周', '')}
                                </div>
                              ))}
                            </div>
                            {/* 时间段行 */}
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => {
                              const coursesAtTime = courses.filter(c => {
                                const startTime = c.time.split(' - ')[0] || c.time.split('-')[0];
                                return startTime === time;
                              });
                              
                              return (
                                <div key={time} className="grid grid-cols-8 gap-1 min-h-[48px]">
                                  <div className="text-[9px] text-white/30 font-mono flex items-center justify-center">
                                    {time}
                                  </div>
                                  {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => {
                                    const course = coursesAtTime.find(c => c.day === day);
                                    return (
                                      <div key={`${day}-${time}`} className="relative">
                                        {course && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={cn(
                                              "absolute inset-0 rounded-lg p-1.5 flex flex-col items-center justify-center cursor-default border transition-all hover:scale-105",
                                              course.color || 'bg-magic-accent/20 border-magic-accent/30'
                                            )}
                                          >
                                            <span className="text-[9px] font-bold text-white truncate w-full text-center leading-tight">
                                              {course.subject}
                                            </span>
                                            {course.type === '课外' && (
                                              <span className="text-[7px] text-magic-accent font-bold">课外</span>
                                            )}
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* 日视图 - 卡片列表 */
                          <div className="space-y-2">
                            {courses
                              .filter(c => c.day === selectedDay)
                              .map((course, idx) => (
                                <motion.div
                                  key={`${course.day}-${course.subject}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={cn(
                                    "p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default",
                                    course.color || 'bg-white/5 border-white/10'
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                      <Calendar className="w-5 h-5 text-magic-accent" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">{course.subject}</h4>
                                      <p className="text-xs text-white/40">{course.time}</p>
                                    </div>
                                  </div>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                    course.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent"
                                  )}>
                                    {course.type}
                                  </span>
                                </motion.div>
                              ))}
                            {courses.filter(c => c.day === selectedDay).length === 0 && (
                              <div className="text-center py-8">
                                <Calendar className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                <p className="text-xs text-white/30">今天没有课程</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarContentType === 'exercise' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Knowledge Graph */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                          <BrainCircuit className="w-3 h-3" />
                          魔法知识图谱
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {knowledgeGraph.map((point, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{point.subject}</span>
                                <span className="text-sm text-white font-medium">{point.name}</span>
                              </div>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                point.status === 'mastered' ? "bg-emerald-500/20 text-emerald-400" : "bg-magic-accent/20 text-magic-accent animate-pulse"
                              )}>
                                {point.status === 'mastered' ? '已掌握' : '修炼中'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Exercises */}
                      {dynamicExercises ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">互动练习：{dynamicExercises.subject}</h3>
                            <span className="text-[10px] text-magic-accent font-bold">{currentExerciseIndex + 1} / {dynamicExercises.questions.length}</span>
                          </div>
                          
                          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                            {!showExerciseResult ? (
                              <>
                                <p className="text-sm text-white leading-relaxed">
                                  {dynamicExercises.questions[currentExerciseIndex].question}
                                </p>
                                <div className="space-y-2">
                                  {dynamicExercises.questions[currentExerciseIndex].options.map((opt: string, idx: number) => (
                                    <button
                                      key={idx}
                                      onClick={() => setExerciseAnswers(prev => ({ ...prev, [dynamicExercises.questions[currentExerciseIndex].id]: opt }))}
                                      className={cn(
                                        "w-full p-3 rounded-xl border text-left text-xs transition-all",
                                        exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id] === opt
                                          ? "bg-magic-accent/10 border-magic-accent text-magic-accent"
                                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                  {currentExerciseIndex > 0 && (
                                    <button 
                                      onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                                      className="flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase"
                                    >
                                      上一题
                                    </button>
                                  )}
                                  {currentExerciseIndex < dynamicExercises.questions.length - 1 ? (
                                    <button 
                                      onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                                      disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]}
                                      className="flex-1 py-2 rounded-xl bg-magic-accent text-white text-[10px] font-bold uppercase disabled:opacity-50"
                                    >
                                      下一题
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setShowExerciseResult(true)}
                                      disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]}
                                      className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase disabled:opacity-50"
                                    >
                                      提交魔法
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="space-y-4 text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                                  <Trophy className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h4 className="text-lg font-serif italic text-white">练习完成！</h4>
                                <p className="text-xs text-white/60">你真棒！多比为你准备了详细的魔法解析。</p>
                                <div className="space-y-4 text-left mt-6">
                                  {dynamicExercises.questions.map((q: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40">第 {idx + 1} 题</span>
                                        {exerciseAnswers[q.id] === q.answer ? (
                                          <span className="text-[10px] font-bold text-emerald-400 uppercase">正确</span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-magic-accent uppercase">错误</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-white/80">{q.question}</p>
                                      <p className="text-[10px] text-emerald-400/80 leading-relaxed italic">
                                        <span className="font-bold">魔法解析：</span>{q.explanation}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <button 
                                  onClick={() => setDynamicExercises(null)}
                                  className="w-full py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
                                >
                                  返回图谱
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center">
                            <Wand2 className="w-6 h-6 text-magic-accent" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-white">暂无动态练习</h4>
                            <p className="text-[10px] text-white/40 leading-relaxed">
                              你可以对多比说“我想练习一下分数乘法”，多比会立刻为你生成专属题目！
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarContentType === 'homework' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      {/* 作业识别区 */}
                      <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20">
                        <h3 className="text-sm font-serif font-bold text-white mb-3">📝 作业识别</h3>
                        
                        {/* 文字输入 */}
                        <textarea
                          value={homeworkInputText}
                          onChange={(e) => setHomeworkInputText(e.target.value)}
                          placeholder="输入作业内容，如：今天数学作业：完成练习册P45第1-3题，背诵课文《春晓》"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50 resize-none h-24"
                        />
                        
                        {/* 图片上传 */}
                        <div className="mt-2 space-y-2">
                          <label className="w-full py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                            <Camera className="w-4 h-4 text-white/60" />
                            <span className="text-xs text-white/60">上传作业图片</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const base64 = await fileToBase64(file);
                                  setHomeworkImage(base64);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {homeworkImage && (
                            <div className="relative">
                              <img src={homeworkImage} alt="作业图片" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                              <button
                                onClick={() => setHomeworkImage(null)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/60 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* 识别按钮 */}
                        <button
                          onClick={handleParseHomework}
                          disabled={isParsingHomework || (!homeworkInputText && !homeworkImage)}
                          className="w-full mt-3 py-2.5 bg-magic-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {isParsingHomework ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              识别中...
                            </span>
                          ) : '✨ 识别作业'}
                        </button>
                        
                        {parseHomeworkError && (
                          <div className="mt-2 text-red-400 text-xs text-center">{parseHomeworkError}</div>
                        )}
                      </div>

                      {/* 作业列表 */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
                          <Pencil className="w-3 h-3" />
                          我的作业 ({homeworkTasks.length})
                        </h3>
                        
                        {homeworkTasks.length === 0 ? (
                          <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center">
                              <Pencil className="w-6 h-6 text-magic-accent" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-white">暂无作业</h4>
                              <p className="text-[10px] text-white/40 leading-relaxed">
                                上传作业图片或输入作业内容，多比会自动帮你分解任务！
                              </p>
                            </div>
                          </div>
                        ) : (
                          homeworkTasks.map((hw, idx) => (
                            <motion.div
                              key={hw.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default",
                                hw.status === 'completed' 
                                  ? "bg-emerald-500/10 border-emerald-500/30" 
                                  : "bg-white/5 border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  onClick={() => toggleHomeworkStatus(hw.id)}
                                  className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    hw.status === 'completed' 
                                      ? "bg-emerald-500 border-emerald-500" 
                                      : "border-white/30 hover:border-magic-accent"
                                  )}
                                >
                                  {hw.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className={cn(
                                      "font-medium",
                                      hw.status === 'completed' ? "text-white/60 line-through" : "text-white"
                                    )}>
                                      {hw.title}
                                    </h4>
                                    <span className={cn(
                                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                      hw.subject === '数学' ? "bg-blue-500/20 text-blue-400" :
                                      hw.subject === '语文' ? "bg-purple-500/20 text-purple-400" :
                                      hw.subject === '英语' ? "bg-emerald-500/20 text-emerald-400" :
                                      "bg-white/10 text-white/60"
                                    )}>
                                      {hw.subject}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-white/40 mt-0.5">截止日期：{hw.dueDate}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    // 点击作业任务，进入练习界面
                                    setDynamicExercises({
                                      subject: hw.subject,
                                      grade: '小学',
                                      questions: [],
                                    });
                                    setCurrentExerciseIndex(0);
                                    setExerciseAnswers({});
                                    setShowExerciseResult(false);
                                    setSidebarContentType('exercise');
                                    // 调用 AI 生成练习题
                                    handleGenerateExercise(hw.subject, hw.title);
                                  }}
                                  className="p-2 rounded-lg bg-magic-accent/20 text-magic-accent hover:bg-magic-accent/30 transition-all"
                                  title="开始练习"
                                >
                                  <Wand2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteHomework(hw.id)}
                                  className="p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarContentType === 'poetry' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      {/* 诗词练习头部 */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-serif font-bold text-white">📜 诗词练习</h3>
                          {poetryExercise && (
                            <span className="text-xs text-white/40">{poetryScore.correct}/{poetryScore.total}</span>
                          )}
                        </div>
                        {!poetryExercise && (
                          <button
                            onClick={handleGeneratePoetry}
                            disabled={isGeneratingPoetry}
                            className="w-full py-2.5 bg-purple-500/30 border border-purple-500/40 text-white rounded-xl text-xs font-bold hover:bg-purple-500/40 transition-all disabled:opacity-50"
                          >
                            {isGeneratingPoetry ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                生成中...
                              </span>
                            ) : '✨ 开始诗词练习'}
                          </button>
                        )}
                      </div>

                      {/* 诗词练习内容 */}
                      {poetryExercise && (
                        <div className="space-y-4">
                          {/* 诗词信息 */}
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <h4 className="text-lg font-serif font-bold text-white mb-1">{poetryExercise.title}</h4>
                            <p className="text-xs text-white/40">{poetryExercise.dynasty} · {poetryExercise.author}</p>
                          </div>

                          {/* 当前题目 */}
                          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-purple-400 uppercase">
                                第 {poetryExercise.currentIndex + 1} 题
                              </span>
                              <span className="text-[10px] font-bold text-white/30">
                                {poetryExercise.currentIndex + 1} / {poetryExercise.questions.length}
                              </span>
                            </div>

                            <p className="text-sm text-white leading-relaxed mb-4 font-serif">
                              {poetryExercise.questions[poetryExercise.currentIndex].question}
                            </p>

                            {/* 填空题 */}
                            {poetryExercise.questions[poetryExercise.currentIndex].type === 'fill' && (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={poetryAnswer}
                                  onChange={(e) => {
                                    setPoetryAnswer(e.target.value);
                                    setPoetryResult(null);
                                  }}
                                  placeholder="填入缺失的字词"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white text-center outline-none focus:border-purple-500/50"
                                  disabled={poetryResult !== null}
                                />
                              </div>
                            )}

                            {/* 选择题 */}
                            {poetryExercise.questions[poetryExercise.currentIndex].options && (
                              <div className="space-y-2">
                                {poetryExercise.questions[poetryExercise.currentIndex].options!.map((opt: string, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setPoetryAnswer(opt);
                                      setPoetryResult(null);
                                    }}
                                    className={cn(
                                      "w-full p-3 rounded-xl border text-left text-sm transition-all",
                                      poetryAnswer === opt
                                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                    )}
                                    disabled={poetryResult !== null}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* 答案反馈 */}
                            {poetryResult && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                  "mt-3 p-3 rounded-xl text-sm",
                                  poetryResult === 'correct' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                                )}
                              >
                                {poetryResult === 'correct' ? '✨ 回答正确！' : `正确答案：${poetryExercise.questions[poetryExercise.currentIndex].answer}`}
                                <p className="text-xs text-white/50 mt-1">{poetryExercise.questions[poetryExercise.currentIndex].hint}</p>
                              </motion.div>
                            )}

                            {/* 操作按钮 */}
                            <div className="mt-3 flex gap-2">
                              {poetryResult === null ? (
                                <button
                                  onClick={handlePoetryAnswer}
                                  disabled={!poetryAnswer.trim()}
                                  className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl text-xs font-bold hover:bg-purple-500/90 transition-all disabled:opacity-50"
                                >
                                  提交答案
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (poetryExercise.currentIndex < poetryExercise.questions.length - 1) {
                                      setPoetryExercise(prev => prev ? {
                                        ...prev,
                                        currentIndex: prev.currentIndex + 1,
                                      } : null);
                                      setPoetryAnswer('');
                                      setPoetryResult(null);
                                    } else {
                                      // 练习结束
                                      setMessages(prev => [...prev, { role: 'model', text: `📜 诗词练习完成！你答对了 ${poetryScore.correct}/${poetryScore.total} 题，太棒了！`, timestamp: Date.now() }]);
                                      setPoetryExercise(null);
                                    }
                                  }}
                                  className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl text-xs font-bold hover:bg-purple-500/90 transition-all"
                                >
                                  {poetryExercise.currentIndex < poetryExercise.questions.length - 1 ? '下一题' : '完成练习'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 完整诗词 */}
                          <details className="rounded-2xl bg-white/5 border border-white/10">
                            <summary className="p-3 text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors">查看完整诗词</summary>
                            <div className="p-4 pt-0 text-sm text-white/60 font-serif whitespace-pre-line leading-loose">
                              {poetryExercise.fullText}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarContentType === 'image' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 min-h-[200px] flex items-center justify-center">
                        {generatedImage ? (
                          <img 
                            src={generatedImage} 
                            alt="魔法生成图片" 
                            className="w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-8 h-8 text-magic-accent animate-pulse" />
                            <p className="text-xs text-white/40 italic">正在绘制魔法图像...</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-3 h-3 text-white/40" />
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">多比的魔法绘图</span>
                        </div>
                        {generatedImage && (
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generatedImage;
                              link.download = 'magic-image.png';
                              link.click();
                            }}
                            className="text-[10px] text-magic-accent hover:underline font-bold uppercase tracking-wider"
                          >
                            保存魔法
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarContentType === 'achievements' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Points Card */}
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-magic-accent to-orange-600 shadow-lg shadow-magic-accent/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">当前等级</span>
                            <span className="text-white font-serif font-bold text-lg">{level}</span>
                          </div>
                          <TrendingUp className="w-4 h-4 text-white/60" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-serif font-bold text-white">{points}</span>
                          <span className="text-sm text-white/60 font-medium">pts</span>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (points % 1000) / 10)}%` }}
                          />
                        </div>
                        <p className="text-[10px] mt-2 text-white/60">距离下一等级还差 {1000 - (points % 1000)} 积分</p>
                      </div>

                      {/* Knowledge Tree Card */}
                      <div className="p-5 rounded-3xl bg-emerald-900/40 border border-emerald-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-serif italic text-emerald-100">知识之树</h3>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">等级 {Math.floor(treeGrowth / 5) + 1}</span>
                        </div>
                        
                        <div className="relative h-32 flex items-end justify-center mb-4">
                          {/* Simple SVG Tree Growth */}
                          <svg viewBox="0 0 100 100" className="w-24 h-24">
                            <motion.path
                              d="M50 90 L50 60"
                              stroke="#5d4037"
                              strokeWidth="4"
                              fill="none"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                            />
                            {treeGrowth > 0 && (
                              <motion.circle
                                cx="50" cy="50" r={Math.min(30, 10 + treeGrowth * 2)}
                                fill="#2e7d32"
                                fillOpacity="0.6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              />
                            )}
                            {treeGrowth > 10 && (
                              <motion.circle
                                cx="35" cy="40" r="15"
                                fill="#43a047"
                                fillOpacity="0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              />
                            )}
                            {treeGrowth > 20 && (
                              <motion.circle
                                cx="65" cy="40" r="15"
                                fill="#43a047"
                                fillOpacity="0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              />
                            )}
                          </svg>
                        </div>

                        <button 
                          onClick={waterTree}
                          disabled={points < 50}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Droplets className="w-4 h-4" />
                          灌溉知识之树 (50 pts)
                        </button>
                      </div>

                      {/* Daily Tasks */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">每日魔法任务</h3>
                        <div className="space-y-2">
                          {dailyTasks.map(task => (
                            <button
                              key={task.id}
                              onClick={() => completeTask(task.id)}
                              disabled={task.completed}
                              className={cn(
                                "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left",
                                task.completed 
                                  ? "bg-white/5 border-white/5 opacity-60" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"
                              )}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-white/20" />
                              )}
                              <div className="flex-1">
                                <p className={cn("text-sm font-medium", task.completed ? "text-white/40 line-through" : "text-white")}>
                                  {task.text}
                                </p>
                                <span className="text-[10px] text-magic-accent font-bold">+{task.reward} pts</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Achievement List */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">荣誉记录</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {achievements.map((ach: any) => {
                            const IconComponent = { Award, Trophy, Star, Medal }[ach.iconName] || Award;
                            return (
                              <div key={ach.id || ach.title} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                                <div className={cn("p-3 rounded-xl bg-white/5", ach.color)}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-white">{ach.title}</h4>
                                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{ach.date}</p>
                                </div>
                                <Medal className="w-4 h-4 text-white/10 group-hover:text-magic-accent transition-colors" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add Button */}
                      <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-white/30 text-xs hover:border-magic-accent/40 hover:text-magic-accent/60 transition-all flex items-center justify-center gap-2 group">
                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-lg leading-none">+</span>
                        </div>
                        记录新成就
                      </button>
                    </div>
                  )}

                  {sidebarContentType === 'monitor' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-serif font-bold text-white">🔍 系统监控</h3>
                        <button
                          onClick={loadMonitorData}
                          className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Tab 切换 */}
                      <div className="flex bg-white/5 p-1 rounded-xl">
                        <button
                          onClick={() => setMonitorTab('stats')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            monitorTab === 'stats' ? "bg-magic-accent text-white" : "text-white/40"
                          )}
                        >
                          概览
                        </button>
                        <button
                          onClick={() => setMonitorTab('logs')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            monitorTab === 'logs' ? "bg-magic-accent text-white" : "text-white/40"
                          )}
                        >
                          日志
                        </button>
                      </div>

                      {monitorLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-magic-accent animate-spin" />
                        </div>
                      ) : monitorTab === 'stats' ? (
                        <div className="space-y-3">
                          {/* 健康状态 */}
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-emerald-400 font-bold">系统运行正常</span>
                          </div>

                          {/* 用户统计 */}
                          {monitorStats && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                  <p className="text-lg font-bold text-white">{monitorStats.users.total}</p>
                                  <p className="text-[9px] text-white/40 uppercase">总用户</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                  <p className="text-lg font-bold text-magic-accent">{monitorStats.users.activeThisWeek}</p>
                                  <p className="text-[9px] text-white/40 uppercase">本周活跃</p>
                                </div>
                              </div>

                              {/* API 使用 */}
                              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">API 调用</h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">本周总调用</span>
                                    <span className="text-white font-mono">{monitorStats.api.weekTotal}</span>
                                  </div>
                                  {monitorStats.api.today.map((ep: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-[10px]">
                                      <span className="text-white/40 font-mono truncate mr-2">{ep.endpoint}</span>
                                      <span className="text-white/60 font-mono">{ep.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 内容统计 */}
                              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">内容数据</h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">课程</span>
                                    <span className="text-white font-mono">{monitorStats.content.courses}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">作业 (待完成)</span>
                                    <span className="text-magic-accent font-mono">{monitorStats.content.homeworkPending}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">练习次数</span>
                                    <span className="text-white font-mono">{monitorStats.content.exerciseSessions}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">平均分</span>
                                    <span className="text-emerald-400 font-mono">{monitorStats.content.avgScore}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* 错误统计 */}
                              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">错误</h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">今天</span>
                                    <span className={cn("font-mono", monitorStats.errors.today > 0 ? "text-red-400" : "text-emerald-400")}>
                                      {monitorStats.errors.today}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-white/60">本周</span>
                                    <span className={cn("font-mono", monitorStats.errors.week > 0 ? "text-red-400" : "text-emerald-400")}>
                                      {monitorStats.errors.week}
                                    </span>
                                  </div>
                                </div>
                                {monitorStats.errors.recent.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                    {monitorStats.errors.recent.slice(0, 3).map((err: any, idx: number) => (
                                      <p key={idx} className="text-[9px] text-red-400/70 truncate">{err.message}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        /* 日志列表 */
                        <div className="space-y-2">
                          {/* 过滤 */}
                          <div className="flex gap-1">
                            {(['all', 'info', 'warn', 'error'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => setMonitorLogFilter(level)}
                                className={cn(
                                  "flex-1 py-1 rounded-lg text-[9px] font-bold transition-all",
                                  monitorLogFilter === level
                                    ? level === 'error' ? "bg-red-500/30 text-red-400" : level === 'warn' ? "bg-amber-500/30 text-amber-400" : "bg-white/10 text-white"
                                    : "text-white/30"
                                )}
                              >
                                {level === 'all' ? '全部' : level.toUpperCase()}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {monitorLogs
                              .filter(log => monitorLogFilter === 'all' || log.level === monitorLogFilter)
                              .map((log) => (
                                <div
                                  key={log.id}
                                  className={cn(
                                    "p-2.5 rounded-xl border text-[10px]",
                                    log.level === 'error' ? "bg-red-500/5 border-red-500/10" :
                                    log.level === 'warn' ? "bg-amber-500/5 border-amber-500/10" :
                                    "bg-white/5 border-white/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                      "font-bold uppercase",
                                      log.level === 'error' ? "text-red-400" :
                                      log.level === 'warn' ? "text-amber-400" : "text-white/40"
                                    )}>
                                      {log.level}
                                    </span>
                                    <span className="text-white/30 font-mono">{log.created_at}</span>
                                  </div>
                                  <p className="text-white/60">{log.message}</p>
                                  {log.category && (
                                    <span className="text-[8px] text-white/30 mt-1 block">[{log.category}]</span>
                                  )}
                                </div>
                              ))}
                            {monitorLogs.length === 0 && (
                              <div className="text-center py-8 text-white/30 text-xs">暂无日志</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarContentType === 'focus' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Magic Hourglass */}
                      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent" />
                        </div>

                        <div className="relative mb-6">
                          <motion.div
                            animate={isFocusActive ? { rotate: 180 } : { rotate: 0 }}
                            transition={{ duration: 2, repeat: isFocusActive ? Infinity : 0, ease: "easeInOut" }}
                            className={cn("w-24 h-24 flex items-center justify-center", isHourglassBroken && "animate-shake")}
                          >
                            <Hourglass className={cn("w-16 h-16 transition-colors", isFocusActive ? "text-magic-accent" : "text-white/20", isHourglassBroken && "text-red-500")} />
                          </motion.div>
                          {isHourglassBroken && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <X className="w-20 h-20 text-red-500/50" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 mb-8">
                          <h3 className="text-3xl font-mono font-bold text-white tracking-widest">
                            {Math.floor(focusTime / 60).toString().padStart(2, '0')}:
                            {(focusTime % 60).toString().padStart(2, '0')}
                          </h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            {isFocusActive ? '专注魔法生效中...' : isHourglassBroken ? '魔法沙漏已碎裂' : '准备好开始专注了吗？'}
                          </p>
                        </div>

                        <div className="flex gap-3 w-full">
                          {!isFocusActive ? (
                            <button
                              onClick={() => {
                                setIsFocusActive(true);
                                setIsHourglassBroken(false);
                                setFocusTime(25 * 60);
                              }}
                              className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all"
                            >
                              开启沙漏
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsFocusActive(false)}
                              className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
                            >
                              暂停魔法
                            </button>
                          )}
                          {(isHourglassBroken || (!isFocusActive && focusTime < 25 * 60)) && (
                            <button
                              onClick={() => {
                                setFocusTime(25 * 60);
                                setIsHourglassBroken(false);
                              }}
                              className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* White Noise Selector */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">背景魔法音</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'none', name: '静音', icon: VolumeX },
                            { id: 'library', name: '魔法图书馆', icon: Library },
                            { id: 'rain', name: '禁林细雨', icon: CloudRain },
                            { id: 'fire', name: '休息室壁炉', icon: Flame },
                          ].map(sound => (
                            <button
                              key={sound.id}
                              onClick={() => {
                                setWhiteNoise(sound.id as any);
                                // Explicitly trigger play on click to satisfy browser autoplay policies
                                if (sound.id !== 'none' && audioRef.current) {
                                  audioRef.current.play().catch(() => {});
                                }
                              }}
                              className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                                whiteNoise === sound.id 
                                  ? "bg-magic-accent/10 border-magic-accent text-magic-accent" 
                                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                              )}
                            >
                              <sound.icon className="w-5 h-5" />
                              <span className="text-[10px] font-bold">{sound.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Focus Tips */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-4 h-4 text-magic-accent shrink-0 mt-0.5" />
                          <p className="text-[10px] text-white/60 leading-relaxed">
                            <span className="text-white font-bold">魔法提示：</span>
                            在沙漏开启期间，请不要离开这个页面。如果你切换标签页或去玩手机，魔法沙漏就会碎掉哦！
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                  <button 
                    onClick={() => setSidebarContentType('schedule')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'schedule' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    课表
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('homework')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'homework' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    作业
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('poetry')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'poetry' ? "bg-purple-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    诗词
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('exercise')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'exercise' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    练习
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('achievements')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'achievements' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    成就
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('focus')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'focus' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    专注
                  </button>
                  <button 
                    onClick={() => {
                      setSidebarContentType('monitor');
                      loadMonitorData();
                    }}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'monitor' ? "bg-cyan-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    监控
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation (Mobile) */}
      <nav className="md:hidden flex items-center justify-around py-3 border-t border-white/5 bg-black/60 backdrop-blur-xl z-50 safe-bottom">
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'chat' ? "text-magic-accent" : "text-white/40")}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">对话</span>
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'library' ? "text-magic-accent" : "text-white/40")}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">书库</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'profile' ? "text-magic-accent" : "text-white/40")}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">我的</span>
        </button>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-magic-accent mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-white mb-2">魔法登录</h2>
                <p className="text-sm text-white/60">欢迎回到魔法小课桌</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">魔法用户名</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-magic-accent/50"
                    placeholder="输入你的魔法用户名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">魔法密码</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-magic-accent/50"
                    placeholder="输入你的魔法密码"
                    required
                  />
                </div>
                {authError && (
                  <div className="text-red-400 text-xs text-center">{authError}</div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-magic-accent text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  开始魔法之旅
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  还没有魔法账号？{' '}
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                    className="text-magic-accent hover:underline"
                  >
                    立即注册
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Wand2 className="w-12 h-12 text-magic-accent mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-white mb-2">魔法注册</h2>
                <p className="text-sm text-white/60">加入魔法小课桌大家庭</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">魔法用户名</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-magic-accent/50"
                    placeholder="选择你的魔法用户名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">魔法密码</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-magic-accent/50"
                    placeholder="设置你的魔法密码（至少6位）"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">确认密码</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-magic-accent/50"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
                {authError && (
                  <div className="text-red-400 text-xs text-center">{authError}</div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-magic-accent text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  创建魔法账号
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  已有魔法账号？{' '}
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                    className="text-magic-accent hover:underline"
                  >
                    立即登录
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  Flame
} from 'lucide-react';
import Markdown from 'react-markdown';
import { dobby, type Message } from './services/magicElf';
import { cn } from './lib/utils';
import { DobbyAvatar } from './components/DobbyAvatar';
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
  { id: 'homework', name: '批改作业', icon: Pencil, prompt: '多比，这是我的作业照片，请帮我批改一下：' },
  { id: 'words', name: '学单词', icon: Languages, prompt: '多比，我想学习一些新单词，或者帮我翻译一下：' },
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
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [sidebarContentType, setSidebarContentType] = useState<'none' | 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus'>('schedule');
  const [scheduleView, setScheduleView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState('周一');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ day: '周一', subject: '', time: '', type: '校内' as '校内' | '课外' });
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

  // Focus Tool States
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [isHourglassBroken, setIsHourglassBroken] = useState(false);
  const [whiteNoise, setWhiteNoise] = useState<'none' | 'library' | 'rain' | 'fire'>('none');
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
    if (SpeechRecognition) {
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
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
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

      const stream = dobby.chatStream(history);
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
            dobby.generateMagicImage(prompt).then(url => {
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
      if (recognitionRef.current) {
        setIsRecording(true);
        recognitionRef.current.start();
      } else {
        alert("哎呀，你的浏览器好像不支持魔法语音，换个现代点的浏览器试试吧！");
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

  const handleAddCourse = async () => {
    if (!newCourse.subject || !newCourse.time) return;
    await performAddCourse(newCourse);
    setIsAddingCourse(false);
    setNewCourse({ day: '周一', subject: '', time: '', type: '校内' });
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
    } else if (spell.id === 'homework' || spell.id === 'math') {
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
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <DobbyAvatar size="md" />
          <div>
            <h1 className="text-xl font-serif font-bold tracking-wide text-white">魔法小课桌</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-magic-accent font-bold">Dobby's Magic Desk</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={cn(
              "p-2 rounded-full transition-all",
              isRightSidebarOpen ? "bg-magic-accent/20 text-magic-accent" : "hover:bg-white/5 text-white/60"
            )}
            title={isRightSidebarOpen ? "关闭展示栏" : "打开展示栏"}
          >
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <History className="w-5 h-5 text-white/60" />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-medium text-white">{user.displayName}</span>
                <span className="text-[8px] text-white/40 uppercase tracking-widest">魔法师</span>
              </div>
              <button 
                onClick={() => authService.logout()}
                className="p-2 rounded-full hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all"
                title="登出魔法世界"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-magic-accent text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-magic-accent/20"
            >
              <LogIn className="w-4 h-4" />
              <span>魔法登录</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10">
        {/* Left Sidebar - Spells (Desktop) */}
        <aside className="hidden md:flex flex-col gap-4 w-64">
          <div className="glass-panel p-6 flex-1 flex flex-col gap-6">
            <h2 className="text-sm font-serif italic text-white/60 border-b border-white/10 pb-2">魔法咒语库</h2>
            <div className="space-y-3">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
                >
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-magic-accent/20 transition-colors">
                    <spell.icon className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{spell.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            
            <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-magic-accent/10 to-transparent border border-magic-accent/20">
              <p className="text-xs text-white/60 leading-relaxed italic">
                "知识是唯一的魔法，而你是那个伟大的魔法师。"
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col glass-panel overflow-hidden relative">
          {/* Messages Viewport */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
            style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)' }}
          >
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
                    "px-5 py-3 rounded-3xl text-sm md:text-base leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-magic-accent/20 border border-magic-accent/30 text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-stone-200 rounded-tl-none"
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
                    {msg.role === 'model' ? (
                      <div className="markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 mt-2",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    {msg.role === 'model' && <DobbyAvatar size="sm" />}
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      {msg.role === 'user' ? 'Seeker' : 'Dobby'}
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
                <DobbyAvatar size="sm" />
                <span className="text-xs italic font-serif">正在施展魔法...</span>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-black/20">
            {/* File Previews */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative group p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
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
            <div className="flex md:hidden gap-2 overflow-x-auto pb-4 no-scrollbar">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
                >
                  <spell.icon className="w-3 h-3" />
                  {spell.name}
                </button>
              ))}
            </div>

            <div className="relative group flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isRecording ? "正在倾听魔法的声音..." : "输入你的问题，让魔法发生..."}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 pr-24 text-sm md:text-base focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all resize-none h-14 md:h-16 flex items-center",
                    isRecording && "border-magic-accent/50 bg-magic-accent/5 ring-2 ring-magic-accent/20"
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    multiple 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    title="上传附件"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white"
                    )}
                    title={isRecording ? "停止录音" : "语音输入"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-magic-accent flex items-center justify-center text-white shadow-lg shadow-magic-accent/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Sidebar - Content Display */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: '28rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden lg:flex flex-col glass-panel overflow-hidden"
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
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        {courses
                        .filter(item => scheduleView === 'week' || item.day === selectedDay)
                        .map((item, idx) => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={`${item.day}-${item.subject}-${idx}`} 
                            className={cn("p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default", item.color)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.day}</span>
                                <h4 className="font-medium text-white">{item.subject}</h4>
                              </div>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                item.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent"
                              )}>
                                {item.type}
                              </span>
                            </div>
                            <span className="text-xs text-white/40 font-mono">{item.time}</span>
                          </motion.div>
                        ))}
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
                    课程表
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('exercise')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'exercise' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    练习题
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('achievements')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'achievements' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    成就墙
                  </button>
                  <button 
                    onClick={() => setSidebarContentType('focus')}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'focus' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    专注
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation (Mobile) */}
      <nav className="md:hidden flex items-center justify-around py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl z-10">
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

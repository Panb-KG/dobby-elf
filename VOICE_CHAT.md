# 语音聊天功能增强 - 实现说明

## 概述

为小学生设计的语音聊天功能，平衡本地处理（零延迟、免费）和 AI 处理能力。

## 架构设计

### 本地处理（Web Speech API）
| 功能 | API | 优势 | 局限 |
|------|-----|------|------|
| 语音识别（STT） | `SpeechRecognition` | 零延迟、免费、支持中文 | 需要浏览器支持（Chrome/Edge 最佳） |
| 语音合成（TTS） | `SpeechSynthesis` | 即时朗读、离线可用 | 音质一般 |

### AI 处理（可选扩展）
| 功能 | API | 优势 | 局限 |
|------|-----|------|------|
| 高质量 TTS | DashScope TTS | 音质自然、多音色 | 有延迟、有成本 |
| 精准 STT | DashScope 语音识别 | 更准确、支持方言 | 有延迟、有成本 |

**当前实现**：全部使用本地 API，零成本零延迟。AI 处理可作为未来增强选项。

## 新增文件

| 文件 | 说明 |
|------|------|
| `app/hooks/useVoiceChat.ts` | 语音聊天核心 Hook |
| `app/components/chat/VoiceButton.tsx` | 语音按钮组件（可选，ChatModule 已内嵌） |

## 修改文件

| 文件 | 修改内容 |
|------|----------|
| `app/components/chat/ChatModule.tsx` | 添加语音按钮、消息朗读按钮 |
| `app/hooks/useChat.ts` | 添加 `onAutoSpeak` 回调支持 |
| `app/components/MagicLayout.tsx` | 集成 `useVoiceChat` Hook |

## 功能特性

### 1. 语音输入（STT）
- **点击说话**：点麦克风按钮开始，再点停止
- **按住说话**：按住录音，松开停止（适合小孩）
- 实时显示识别文字（ interim + final ）
- 识别完成自动发送

### 2. 语音输出（TTS）
- **自动朗读**：AI 回复完成后自动朗读（默认开启）
- **手动朗读**：每条 AI 消息旁有朗读按钮
- **朗读控制**：点击可停止朗读

### 3. 小学生友好设计
- 大按钮（12×12 / 14×14），适合触控
- 录音时脉冲动画，直观反馈
- 自动朗读，不用看屏幕也能听
- 语音识别状态实时显示

## 浏览器兼容性

| 浏览器 | STT | TTS |
|--------|-----|-----|
| Chrome | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Safari | ⚠️ (webkitSpeechRecognition) | ✅ |
| Firefox | ❌ | ✅ |

不支持 STT 时自动隐藏语音按钮，TTS 不影响。

## 未来扩展

1. **AI 高质量 TTS**：在 `useVoiceChat` 中接入 DashScope TTS API
2. **语音唤醒词**：本地检测 "你好多比" 等唤醒词
3. **离线模式**：Service Worker + 本地 TTS
4. **方言支持**：`lang: 'zh-TW'`、`'yue'` 等

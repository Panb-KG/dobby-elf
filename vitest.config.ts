/**
 * Vitest 配置文件
 * 
 * 测试策略：
 * - Hooks 单元测试（@testing-library/react-hooks）
 * - 工具函数测试
 * - 组件集成测试
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 仅测量有对应测试文件的源文件，排除服务端模块和未测组件
      include: [
        'app/lib/utils.ts',
        'app/lib/validate.ts',
        'app/lib/storage.ts',
        'app/lib/error-helper.ts',
        'app/hooks/useCourses.ts',
        'app/hooks/useHomework.ts',
        'app/hooks/useLocalStorage.ts',
        'app/hooks/useSync.ts',
        'app/components/chat/ChatInput.tsx',
        'app/components/course/CourseModule.tsx',
        'app/components/DobiAvatar.tsx',
        'app/components/DobiMascot.tsx',
        'app/components/DailyAdventure.tsx',
        'app/components/ErrorBoundary.tsx',
        'app/components/ui/LoadingScreen.tsx',
        'app/lib/supabase-diary.ts',
        'app/lib/supabase-diary-types.ts',
        'app/components/v2/DiaryEntryItem.tsx',
        'app/components/v2/DiaryNewForm.tsx',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 60,
        lines: 60,
      },
    },
    include: ['tests/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}', 'app/**/*.spec.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
});

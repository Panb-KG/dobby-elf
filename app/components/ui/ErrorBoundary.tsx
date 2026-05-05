"use client";

/**
 * ErrorBoundary - 错误边界组件
 * 
 * 捕获子组件渲染错误，显示友好的错误页面
 * 而不是白屏
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-magic-dark via-magic-dark/95 to-magic-accent/10 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">哎呀，魔法出错了！</h2>
              <p className="text-sm text-white/60">
                多比的魔法棒好像出了点小问题...
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-magic-accent text-white text-sm font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all"
              >
                <Home className="w-4 h-4" />
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

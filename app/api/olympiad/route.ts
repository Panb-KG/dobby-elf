/**
 * 奥数知识库 API
 *
 * GET /api/olympiad          - 查询题目
 * GET /api/olympiad/topics   - 获取知识点目录
 * GET /api/olympiad/random   - 随机获取一题
 * GET /api/olympiad/stats    - 获取统计信息
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { queryProblems, getRandomProblem, getTopics, getStats, getProblemById } from '@/services/olympiad-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'query';

  try {
    switch (action) {
      case 'query': {
        const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;
        const topic = searchParams.get('topic') || undefined;
        const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
        const random = searchParams.get('random') === 'true';
        const result = queryProblems({ grade, topic, difficulty, limit, random });
        return NextResponse.json(result);
      }

      case 'random': {
        const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;
        const problem = getRandomProblem(grade);
        if (!problem) return NextResponse.json({ error: '没有找到题目' }, { status: 404 });
        return NextResponse.json({ problem });
      }

      case 'topics': {
        const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;
        const topics = getTopics(grade);
        return NextResponse.json({ topics, total: topics.length });
      }

      case 'stats': {
        return NextResponse.json(getStats());
      }

      case 'byId': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id 参数不能为空' }, { status: 400 });
        const problem = getProblemById(id);
        if (!problem) return NextResponse.json({ error: '题目不存在' }, { status: 404 });
        return NextResponse.json({ problem });
      }

      default:
        return NextResponse.json({ error: '未知的 action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}

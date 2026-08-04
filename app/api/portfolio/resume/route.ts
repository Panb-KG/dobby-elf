/**
 * 星光档案 - AI 简历生成
 * 
 * POST /api/portfolio/resume - 根据档案项和提示词生成简历
 * GET  /api/portfolio/resume   - 获取历史简历列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import type { PortfolioItem } from '@/types';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const CATEGORY_LABELS: Record<string, string> = {
  award: '奖状荣誉',
  certificate: '证书',
  report_card: '成绩单',
  photo: '重要照片',
  artwork: '作品',
  activity: '活动记录',
  other: '其他',
};

// GET: 获取历史简历列表
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  const { data, error } = await client
    .from('resumes')
    .select('id, title, purpose, style, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[Resume] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resumes: data || [] });
}

// POST: 生成简历
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const client = getSupabaseServer();
  if (!client) return NextResponse.json({ error: '服务未配置' }, { status: 503 });

  try {
    const body = await req.json();
    const { purpose, style, time_range_start, time_range_end, extra_prompt, item_ids } = body;

    // 获取用户的档案项
    let query = client
      .from('portfolio_items')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    // 如果指定了 item_ids，只取这些
    if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
      query = query.in('id', item_ids);
    }

    // 时间范围过滤
    if (time_range_start) {
      query = query.gte('event_date', time_range_start);
    }
    if (time_range_end) {
      query = query.lte('event_date', time_range_end);
    }

    const { data: items, error: itemsError } = await query;
    if (itemsError) {
      console.error('[Resume] Query items error:', itemsError.message);
      return NextResponse.json({ error: '获取档案失败' }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '没有可用的档案记录，请先上传一些成长记录' }, { status: 400 });
    }

    // 构建档案摘要
    const portfolioSummary = items.map((item: PortfolioItem) => {
      const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
      const date = item.event_date || '日期不详';
      const tags = item.tags?.length > 0 ? ` [${item.tags.join(', ')}]` : '';
      return `- [${date}] ${categoryLabel}: ${item.title}${item.description ? ' - ' + item.description : ''}${item.source ? ' (' + item.source + ')' : ''}${tags}`;
    }).join('\n');

    // 构建 AI prompt
    const systemPrompt = `你是一位专业的学生简历撰写助手。请根据以下学生的成长档案记录，生成一份结构清晰、内容丰富的学生简历。

要求：
- 用途：${purpose || '一般展示'}
- 风格：${style || '简洁大方'}
${extra_prompt ? '- 其他要求：' + extra_prompt : ''}

简历应包含以下部分（根据实际情况取舍）：
1. 基本信息（姓名、年级等）
2. 荣誉奖项
3. 学术成绩
4. 特长与作品
5. 社会实践与活动经历
6. 自我评价（基于档案内容推断）

请用 Markdown 格式输出，语言生动但得体，适合小学生使用。`;

    const userPrompt = `以下是学生的成长档案记录：\n\n${portfolioSummary}\n\n请根据以上档案生成一份完整的学生简历。`;

    // 调用 LLM
    const apiKey = process.env.TOKEN_PLAN_API_KEY || process.env.DASHSCOPE_API_KEY || '';
    const baseUrl = process.env.TOKEN_PLAN_BASE_URL || process.env.DASHSCOPE_BASE_URL || '';

    if (!apiKey) {
      return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AGENT_MODEL || 'qwen3.6-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Resume] LLM error:', errText);
      return NextResponse.json({ error: 'AI 生成失败' }, { status: 500 });
    }

    const llmData = await response.json();
    const content = llmData.choices?.[0]?.message?.content || '';

    if (!content) {
      return NextResponse.json({ error: 'AI 未返回有效内容' }, { status: 500 });
    }

    // 保存简历
    const title = `${purpose || '学生'}简历 - ${new Date().toLocaleDateString('zh-CN')}`;
    const { data: resume, error: saveError } = await client
      .from('resumes')
      .insert({
        user_id: user.id,
        purpose: purpose || null,
        style: style || null,
        time_range_start: time_range_start || null,
        time_range_end: time_range_end || null,
        extra_prompt: extra_prompt || null,
        title,
        content,
        portfolio_item_ids: items.map((i: PortfolioItem) => i.id),
      })
      .select()
      .single();

    if (saveError) {
      console.error('[Resume] Save error:', saveError.message);
      // 即使保存失败也返回生成的内容
    }

    return NextResponse.json({
      resume: resume || { id: null, title, content, created_at: new Date().toISOString() },
      itemCount: items.length,
    });
  } catch (err) {
    console.error('[Resume] POST exception:', err);
    return NextResponse.json({ error: '生成简历失败' }, { status: 500 });
  }
}

import { getSupabaseBrowserClient } from '../../lib/supabase';

/**
 * 健康检查接口
 * 检查 Supabase 连接是否正常
 */
export async function GET() {
  try {
    const supabase = getSupabaseBrowserClient();
    
    if (!supabase) {
      return Response.json({
        status: 'degraded',
        message: 'Supabase 未配置',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 简单 ping Supabase（查一条记录）
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      return Response.json(
        { status: 'error', message: 'Supabase 连接失败', detail: error.message },
        { status: 503 }
      );
    }
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'connected',
      },
    });
  } catch (err) {
    return Response.json(
      { status: 'error', message: '服务异常', detail: String(err) },
      { status: 503 }
    );
  }
}

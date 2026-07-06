// Cloudflare Pages Function: /api/user/data
// GET: 获取用户云端数据
// POST: 保存用户云端数据

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

async function getKV(env) {
  return env && env.USER_DATA ? env.USER_DATA : null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const user = url.searchParams.get('user') || 'admin';

  try {
    const kv = await getKV(env);
    if (kv) {
      const data = await kv.get(`user:${user}`);
      if (data) {
        return jsonResponse({ success: true, data: JSON.parse(data), source: 'kv' });
      }
    }
    return jsonResponse({ success: true, data: null, source: 'empty' });
  } catch (e) {
    return jsonResponse({ success: false, error: e.message }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const user = body.user || 'admin';
    const payload = body.data;
    if (!payload) {
      return jsonResponse({ success: false, error: 'no data provided' }, 400);
    }
    payload._syncedAt = new Date().toISOString();
    const kv = await getKV(env);
    if (kv) {
      await kv.put(`user:${user}`, JSON.stringify(payload));
    }
    return jsonResponse({ success: true, syncedAt: payload._syncedAt, source: kv ? 'kv' : 'memory' });
  } catch (e) {
    return jsonResponse({ success: false, error: e.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

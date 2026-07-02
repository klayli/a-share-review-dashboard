const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

const EASTMONEY_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://quote.eastmoney.com/',
  'Accept': 'application/json, text/plain, */*'
};

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return resp;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function fetchSectorData() {
  const sectorUrl = 'https://push2.eastmoney.com/api/qt/clist/get';
  const sectors = [];
  for (const fs of ['m:90+t:2', 'm:90+t:1']) {
    try {
      const url = `${sectorUrl}?pn=1&pz=50&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=${fs}&fields=f12,f14,f3,f10,f15&_=${Date.now()}`;
      const r = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 8000);
      if (r.ok) {
        const data = await r.json();
        if (data.data && data.data.diff) {
          data.data.diff.forEach(s => {
            sectors.push({
              code: s.f12, name: s.f14, pct: s.f3,
              vol: s.f15, amount: s.f10
            });
          });
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch sectors for fs=${fs}:`, e);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  sectors.sort((a, b) => b.pct - a.pct);
  return sectors;
}

async function fetchZtPoolData() {
  const today = new Date();
  const dateStr = formatDate(today).replace(/-/g, '');
  const ztStocks = {};
  const sectorLeaders = {};
  let ztCount = 0, dtCount = 0, sealCount = 0, totalZt = 0;
  try {
    const url = `https://push2ex.eastmoney.com/getTopicZTPool?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt&Pageindex=0&Pagesize=500&sort=fbt:asc&date=${dateStr}&_=${Date.now()}`;
    const resp = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 10000);
    if (resp.ok) {
      const data = await resp.json();
      if (data.data && data.data.pool) {
        data.data.pool.forEach(s => {
          totalZt++;
          if (s.zbc === 0) sealCount++;
          const hyName = s.hybk || s.hy || '';
          const stockInfo = {
            name: s.n, code: s.c,
            time: typeof s.fbt === 'number' ? String(s.fbt).padStart(6, '0').replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') : '',
            seal: s.fund ? (s.fund / 10000).toFixed(0) + '万' : '—',
            lbc: s.lbc || 0, hy: hyName
          };
          ztStocks[s.c] = stockInfo;
          if (hyName) {
            if (!sectorLeaders[hyName]) sectorLeaders[hyName] = [];
            sectorLeaders[hyName].push(stockInfo);
          }
        });
        ztCount = totalZt;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch ZT pool:', e);
  }
  try {
    const url = `https://push2ex.eastmoney.com/getTopicDTPool?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt&Pageindex=0&Pagesize=500&sort=fund:asc&date=${dateStr}&_=${Date.now()}`;
    const resp = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 8000);
    if (resp.ok) {
      const data = await resp.json();
      if (data.data && data.data.pool) dtCount = data.data.pool.length;
    }
  } catch (e) {
    console.warn('Failed to fetch DT pool:', e);
  }
  return { ztStocks, sectorLeaders, ztCount, dtCount, sealCount, totalZt };
}

async function fetchTotalVolume() {
  let totalVol = 0;
  for (const secid of ['1.000001', '0.399001']) {
    try {
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f47&_=${Date.now()}`;
      const resp = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 6000);
      if (resp.ok) {
        const data = await resp.json();
        if (data.data && data.data.f47) totalVol += data.data.f47;
      }
    } catch (e) {
      console.warn(`Failed to fetch volume for ${secid}:`, e);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return totalVol > 0 ? '约' + (totalVol / 100000000).toFixed(2) + '万亿' : '';
}

function findLeadersForSector(sectorName, sectorLeaders) {
  let matchedHy = Object.keys(sectorLeaders).find(hy =>
    hy && (hy === sectorName || hy.includes(sectorName) || sectorName.includes(hy))
  );
  if (!matchedHy && sectorName.length >= 3) {
    const prefix3 = sectorName.slice(0, 3);
    matchedHy = Object.keys(sectorLeaders).find(hy =>
      hy && (hy.startsWith(prefix3) || sectorName.startsWith(hy.slice(0, 3)))
    );
  }
  if (matchedHy && sectorLeaders[matchedHy] && sectorLeaders[matchedHy].length > 0) {
    return sectorLeaders[matchedHy].slice(0, 4).map(s => `${s.name}(${s.code})`).join(' · ');
  }
  return '';
}

function generateSentiment(ztCount) {
  if (ztCount > 100) return '强势';
  if (ztCount > 50) return '偏强';
  if (ztCount > 20) return '一般';
  return '偏弱';
}

function generateStrategy(ztCount, theme, sentiment) {
  if (ztCount > 100 && sentiment === '强势') return `市场情绪强势（${ztCount}只涨停），主线${theme}，可持股待涨，关注补涨机会`;
  if (ztCount > 50) return `涨停${ztCount}只情绪尚可，聚焦${theme}主线，轻仓参与龙头回调`;
  if (ztCount > 20) return `涨停仅${ztCount}只情绪偏弱，控制仓位，观望为主，不追高`;
  return `市场极度弱势（涨停${ztCount}只），空仓等待，严守纪律`;
}

function generateOvernightPlan(theme, ztStocks) {
  const lbcStocks = Object.values(ztStocks).filter(s => s.lbc >= 2).sort((a, b) => b.lbc - a.lbc).slice(0, 5);
  let plan = `主线方向：${theme}\n`;
  if (lbcStocks.length > 0) plan += `关注连板梯队：${lbcStocks.map(s => `${s.name}(${s.lbc}板)`).join('、')}\n`;
  plan += '策略：尾盘观察主线板块龙头承接情况，若封板坚定可考虑隔夜排队';
  return plan;
}

async function collectDailyData() {
  const today = formatDate(new Date());
  const sectors = await fetchSectorData();
  const { ztStocks, sectorLeaders, ztCount, dtCount, sealCount, totalZt } = await fetchZtPoolData();
  const volume = await fetchTotalVolume();

  // 获取全市场涨跌家数
  let upCount = 0, downCount = 0, flatCount = 0;
  try {
    for (const secid of ['1.000001', '0.399001']) {
      try {
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f104,f105,f106&fltt=2&invt=2&_=${Date.now()}`;
        const resp = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 6000);
        if (resp.ok) {
          const data = await resp.json();
          if (data.data) {
            if (typeof data.data.f104 === 'number') upCount += data.data.f104;
            if (typeof data.data.f105 === 'number') downCount += data.data.f105;
            if (typeof data.data.f106 === 'number') flatCount += data.data.f106;
          }
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
  } catch (e) { console.warn('Failed to fetch up/down counts:', e); }
  const udStr = (upCount > 0 || downCount > 0) ? `${upCount} : ${downCount}${flatCount > 0 ? ' : ' + flatCount : ''}` : '';
  let earnEffect = '';
  if (upCount > 0 || downCount > 0) {
    const total = upCount + downCount;
    const ratio = total > 0 ? upCount / total : 0;
    if (ratio > 0.6) earnEffect = '很好';
    else if (ratio > 0.45) earnEffect = '一般';
    else if (ratio > 0.3) earnEffect = '较差';
    else earnEffect = '很差';
  }

  const sealRate = totalZt > 0 ? (sealCount / totalZt * 100).toFixed(0) + '%' : '—';
  const sentiment = generateSentiment(ztCount);
  const theme = sectors.slice(0, 3).map(s => s.name).join('+');
  const sectorName = sectors.slice(0, 2).map(s => s.name).join('·');
  const topSectors = sectors.slice(0, 10).map(s => ({ name: s.name, pct: s.pct }));
  const heatMap = sectors.slice(0, 30).map(s => ({ name: s.name, pct: s.pct, vol: s.vol }));
  const sectorHeat = sectors.slice(0, 30).map(s => {
    const leaders = findLeadersForSector(s.name, sectorLeaders);
    return {
      name: s.name, pct: s.pct,
      size: Math.max(16, Math.min(46, Math.abs(s.pct) * 10)),
      desc: s.pct >= 0 ? '上涨' + Math.abs(s.pct).toFixed(2) + '%' : '下跌' + Math.abs(s.pct).toFixed(2) + '%',
      leaders: leaders || (s.pct >= 0 ? '领涨股' : '领跌股')
    };
  });
  const strategy = generateStrategy(ztCount, theme, sentiment);
  const overnightPlan = generateOvernightPlan(theme, ztStocks);
  // 生成drivers
  const drivers = [];
  if (theme) drivers.push(`${theme}板块异动领涨`);
  if (ztCount > 0) drivers.push(`全市场共${ztCount}只涨停，情绪${sentiment}`);
  // 生成direction
  let direction = '';
  if (ztCount > 0) {
    if (ztCount > 100) direction = '情绪回暖，可适当加仓主线龙头，持股待涨为主';
    else if (ztCount > 50) direction = '情绪尚可，聚焦主线龙头低吸，控制仓位5成以内';
    else if (ztCount > 20) direction = '情绪偏弱，以观望为主，轻仓试错龙头，设好止损';
    else direction = '情绪极差，空仓等待，严守纪律不抄底';
  }
  // 生成hotThemes
  const hotThemes = sectors.slice(0, 12).map((s, idx) => {
    const matchedHy = Object.keys(sectorLeaders).find(hy => hy.includes(s.name) || s.name.includes(hy));
    const leaders = matchedHy && sectorLeaders[matchedHy] ? sectorLeaders[matchedHy].slice(0, 3).map(l => `${l.name}(${l.code})`).join('、') : '';
    return {
      rank: idx + 1,
      name: s.name,
      desc: `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%${leaders ? '，龙头带动' : ''}`,
      stocks: leaders || '—',
      badge: idx < 3 ? '主线' : idx < 8 ? '活跃' : '',
      dim: idx >= 10
    };
  });
  // 生成备选标的（从连板高标中选）
  const watchlist = [];
  const lbcSorted = Object.values(ztStocks).filter(s => s.lbc >= 2).sort((a, b) => b.lbc - a.lbc).slice(0, 5);
  lbcSorted.forEach(s => {
    watchlist.push({
      code: s.code, sector: s.hy || '主线',
      time: s.time || '—', seal: s.seal || '—',
      pure: s.lbc >= 3, pureNote: s.lbc >= 3 ? '连板高标' : '二板晋级',
      strategy: s.lbc >= 3 ? '观察高标断板反包机会，不追高' : '若竞价超预期可关注换手板机会'
    });
  });
  const lines = [];
  if (volume) lines.push(`成交额：${volume}`);
  if (udStr) lines.push(`个股涨跌比：${udStr}`);
  lines.push(`涨停家数：${ztCount || '—'}只`);
  lines.push(`跌停家数：${dtCount || '—'}只`);
  lines.push(`封板率：${sealRate}`);
  lines.push(`高标情绪：${sentiment}`);
  if (theme) lines.push(`当日主题：${theme}`);
  if (sectorName) lines.push(`主线板块：${sectorName}`);
  if (topSectors.length > 0) {
    lines.push(`领涨板块：${topSectors.slice(0, 5).map(s => s.name + ' +' + s.pct.toFixed(2) + '%').join('、')}`);
  }
  const appendix = lines.join('\n');
  return {
    date: today,
    sectorHeat,
    topSectors,
    heatMap,
    limitUp: ztCount || 0,
    limitDown: dtCount || 0,
    sealRate,
    volume,
    sentiment,
    theme,
    sectorName,
    drivers,
    leader: sectorHeat.length > 0 ? sectorHeat[0].leaders : '',
    sectorBadge: sectors[0] && sectors[0].pct >= 3 ? '领涨主线' : sectors[0] && sectors[0].pct > 0 ? '活跃板块' : '',
    sectorStrength: sentiment === '强势' ? '强' : sentiment === '偏强' ? '一般' : '弱',
    sectorReason: sectors[0] ? `板块涨幅${sectors[0].pct.toFixed(2)}%` : '',
    ud: udStr,
    earnEffect,
    direction,
    watchlist,
    hotThemes,
    overnight: overnightPlan,
    strategy,
    overnightPlan,
    appendix,
    updatedAt: new Date().toISOString()
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    const pathMatch = url.pathname.match(/^\/api\/daily\/(\d{4}-\d{2}-\d{2})\.json$/);
    if (pathMatch) {
      const date = pathMatch[1];
      try {
        const cached = await env.DAILY_DATA.get(`daily:${date}`);
        if (cached) {
          return new Response(cached, { headers: CORS_HEADERS });
        }
        return new Response(JSON.stringify({ error: 'not_found', date }), {
          status: 404,
          headers: CORS_HEADERS
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'server_error', message: e.message }), {
          status: 500,
          headers: CORS_HEADERS
        });
      }
    }
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
        headers: CORS_HEADERS
      });
    }
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: CORS_HEADERS
    });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        console.log('[Worker] Starting scheduled data collection...');
        const data = await collectDailyData();
        const key = `daily:${data.date}`;
        await env.DAILY_DATA.put(key, JSON.stringify(data));
        console.log(`[Worker] Data collected and stored for ${data.date}: ${data.limitUp} ZT, ${data.volume}`);
      } catch (e) {
        console.error('[Worker] Scheduled collection failed:', e);
      }
    })());
  }
};

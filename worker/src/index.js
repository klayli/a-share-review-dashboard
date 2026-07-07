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

// 2026年中国A股法定节假日
const CN_HOLIDAYS_2026 = {
  '2026-01-01': true, '2026-01-02': true, '2026-01-03': true,
  '2026-02-16': true, '2026-02-17': true, '2026-02-18': true, '2026-02-19': true, '2026-02-20': true, '2026-02-21': true, '2026-02-22': true, '2026-02-23': true,
  '2026-04-04': true, '2026-04-05': true, '2026-04-06': true,
  '2026-05-01': true, '2026-05-02': true, '2026-05-03': true, '2026-05-04': true, '2026-05-05': true,
  '2026-06-19': true, '2026-06-20': true, '2026-06-21': true,
  '2026-09-25': true, '2026-09-26': true, '2026-09-27': true,
  '2026-10-01': true, '2026-10-02': true, '2026-10-03': true, '2026-10-04': true, '2026-10-05': true, '2026-10-06': true, '2026-10-07': true, '2026-10-08': true
};

// 2026年调休工作日
const CN_WORKDAYS_2026 = {
  '2026-02-14': true, '2026-02-15': true, '2026-02-28': true,
  '2026-04-26': true, '2026-09-28': true, '2026-10-10': true, '2026-10-11': true
};

function isTradingDay(date) {
  const dow = date.getDay();
  const dateStr = formatDate(date);
  if (dow === 0 || dow === 6) {
    return CN_WORKDAYS_2026[dateStr] === true;
  }
  return CN_HOLIDAYS_2026[dateStr] !== true;
}

function getWeekdayCN(date) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

function getWeekdayEN(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
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

async function fetchIndexData(secid) {
  try {
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f57,f58,f60,f107,f116,f117,f162,f167,f168,f169,f170,f171&fltt=2&invt=2&_=${Date.now()}`;
    const resp = await fetchWithTimeout(url, { headers: EASTMONEY_HEADERS }, 8000);
    if (resp.ok) {
      const data = await resp.json();
      if (data.data) {
        return {
          name: data.data.f58 || data.data.f57 || '',
          price: data.data.f43 || 0,
          chg: data.data.f169 || 0,
          chgPct: data.data.f170 || 0,
          high: data.data.f44 || 0,
          low: data.data.f45 || 0,
          volume: data.data.f47 || 0,
          amount: data.data.f48 || 0
        };
      }
    }
  } catch (e) {
    console.warn(`Failed to fetch index ${secid}:`, e);
  }
  return null;
}

async function generateMorningReport() {
  const now = new Date();
  // 北京时间
  const cstNow = new Date(now.getTime() + 8 * 3600000);
  const today = formatDate(cstNow);
  const weekday = getWeekdayCN(cstNow);
  const weekdayEn = getWeekdayEN(cstNow);

  // 获取A股指数数据
  const [shIdx, szIdx, cyIdx] = await Promise.all([
    fetchIndexData('1.000001'),
    fetchIndexData('0.399001'),
    fetchIndexData('0.399006')
  ]);

  // 获取港股恒生指数
  const hsiIdx = await fetchIndexData('100.HSI');

  // 获取商品数据
  const [gold, copper, oil] = await Promise.all([
    fetchIndexData('113.CMXG'),  // 黄金
    fetchIndexData('113.CMCU'),  // 铜
    fetchIndexData('113.CLNY')   // 原油
  ]);

  // 获取外汇数据
  const [dxy, usdcnh] = await Promise.all([
    fetchIndexData('133.DINIW'),  // 美元指数
    fetchIndexData('133.USDCNH')  // 离岸人民币
  ]);

  // 构建核心指数数据
  const coreIndices = [];
  if (shIdx) coreIndices.push({ name: '上证指数', value: shIdx.price.toFixed(2), chg: shIdx.chgPct });
  if (szIdx) coreIndices.push({ name: '深证成指', value: szIdx.price.toFixed(2), chg: szIdx.chgPct });
  if (cyIdx) coreIndices.push({ name: '创业板指', value: cyIdx.price.toFixed(2), chg: cyIdx.chgPct });
  if (hsiIdx) coreIndices.push({ name: '恒生指数', value: hsiIdx.price.toFixed(2), chg: hsiIdx.chgPct });
  if (gold) coreIndices.push({ name: '现货黄金', value: '$' + gold.price.toFixed(2), chg: gold.chgPct });
  if (dxy) coreIndices.push({ name: '美元指数', value: dxy.price.toFixed(2), chg: dxy.chgPct });

  // 构建核心关注
  const coreFocus = [];
  if (shIdx) {
    const direction = shIdx.chgPct >= 0 ? '上涨' : '下跌';
    coreFocus.push(`上证指数前日${direction}${Math.abs(shIdx.chgPct).toFixed(2)}%报${shIdx.price.toFixed(0)}点，今日关注能否站稳${direction === '上涨' ? '上方' : '支撑'}`);
  }
  if (hsiIdx) {
    coreFocus.push(`港股恒生指数前日收${hsiIdx.price.toFixed(0)}点${hsiIdx.chgPct >= 0 ? '+' : ''}${hsiIdx.chgPct.toFixed(2)}%，关注今日开盘表现`);
  }
  if (gold) {
    coreFocus.push(`现货黄金报$${gold.price.toFixed(0)}，${gold.chgPct >= 0 ? '上涨' : '下跌'}${Math.abs(gold.chgPct).toFixed(2)}%`);
  }
  coreFocus.push('关注今日A股开盘前30分钟成交量变化，判断市场情绪');
  coreFocus.push('今日关注板块轮动节奏，留意昨日强势板块是否延续');

  // 构建风险提示
  let coreAlert = {
    title: '今日关注',
    content: '市场有风险，投资需谨慎。请关注今日开盘竞价方向，严控仓位，设好止损。'
  };
  if (shIdx && Math.abs(shIdx.chgPct) > 2) {
    coreAlert = {
      title: shIdx.chgPct > 0 ? '前日大涨' : '前日大跌',
      content: shIdx.chgPct > 0
        ? `上证指数前日大涨${shIdx.chgPct.toFixed(2)}%，今日注意获利回吐压力，不宜追高。`
        : `上证指数前日大跌${Math.abs(shIdx.chgPct).toFixed(2)}%，今日关注超跌反弹机会，但需控制仓位。`
    };
  }

  // 构建A股复盘
  const aSharePoints = [];
  if (shIdx) aSharePoints.push(`上证指数前日收${shIdx.price.toFixed(0)}点，${shIdx.chgPct >= 0 ? '+' : ''}${shIdx.chgPct.toFixed(2)}%`);
  if (szIdx) aSharePoints.push(`深证成指前日收${szIdx.price.toFixed(0)}点，${szIdx.chgPct >= 0 ? '+' : ''}${szIdx.chgPct.toFixed(2)}%`);
  if (cyIdx) aSharePoints.push(`创业板指前日收${cyIdx.price.toFixed(0)}点，${cyIdx.chgPct >= 0 ? '+' : ''}${cyIdx.chgPct.toFixed(2)}%`);

  // 构建港股
  const hkPoints = [];
  if (hsiIdx) hkPoints.push(`恒生指数前日收${hsiIdx.price.toFixed(0)}点，${hsiIdx.chgPct >= 0 ? '+' : ''}${hsiIdx.chgPct.toFixed(2)}%`);

  // 构建商品外汇
  const commodities = [];
  if (gold) commodities.push({ name: '现货黄金', value: `$${gold.price.toFixed(2)}`, chg: gold.chgPct, chgVal: `${gold.chgPct >= 0 ? '+' : ''}${gold.chgPct.toFixed(2)}%` });
  if (copper) commodities.push({ name: '铜', value: `$${copper.price.toFixed(2)}`, chg: copper.chgPct, chgVal: `${copper.chgPct >= 0 ? '+' : ''}${copper.chgPct.toFixed(2)}%` });
  if (oil) commodities.push({ name: 'WTI原油', value: `$${oil.price.toFixed(2)}`, chg: oil.chgPct, chgVal: `${oil.chgPct >= 0 ? '+' : ''}${oil.chgPct.toFixed(2)}%` });

  const forex = [];
  if (dxy) forex.push({ name: '美元指数', value: dxy.price.toFixed(2), chg: dxy.chgPct, chgVal: `${dxy.chgPct >= 0 ? '+' : ''}${dxy.chgPct.toFixed(2)}%` });
  if (usdcnh) forex.push({ name: '离岸人民币', value: usdcnh.price.toFixed(4), chg: usdcnh.chgPct, chgVal: `${usdcnh.chgPct >= 0 ? '+' : ''}${usdcnh.chgPct.toFixed(2)}%` });

  return {
    date: today,
    weekday,
    dateEn: `${today} ${weekdayEn}`,
    summary: '覆盖全球宏观 · A股 · 港股 · 美股 · 外汇 · 商品 · 加密货币',
    autoGenerated: true,
    generatedAt: new Date().toISOString(),
    coreIndices,
    coreFocus,
    coreAlert,
    usStock: {
      title: '美股 · 隔夜表现',
      indices: [
        { name: '道琼斯工业', value: '—', chg: 0, chgVal: '数据待更新' },
        { name: '标普500', value: '—', chg: 0, chgVal: '数据待更新' },
        { name: '纳斯达克综合', value: '—', chg: 0, chgVal: '数据待更新' }
      ],
      points: ['美股隔夜数据待更新，请关注美股收盘后数据']
    },
    aShare: {
      title: 'A股 · 前日复盘',
      indices: [
        { name: '上证指数', value: shIdx ? shIdx.price.toFixed(0) : '—', chg: shIdx ? shIdx.chgPct : 0, chgVal: shIdx ? `${shIdx.chgPct >= 0 ? '+' : ''}${shIdx.chgPct.toFixed(2)}%` : '—' },
        { name: '深证成指', value: szIdx ? szIdx.price.toFixed(0) : '—', chg: szIdx ? szIdx.chgPct : 0, chgVal: szIdx ? `${szIdx.chgPct >= 0 ? '+' : ''}${szIdx.chgPct.toFixed(2)}%` : '—' },
        { name: '创业板指', value: cyIdx ? cyIdx.price.toFixed(0) : '—', chg: cyIdx ? cyIdx.chgPct : 0, chgVal: cyIdx ? `${cyIdx.chgPct >= 0 ? '+' : ''}${cyIdx.chgPct.toFixed(2)}%` : '—' }
      ],
      points: aSharePoints
    },
    hkStock: {
      title: '港股 · 前日表现',
      indices: hsiIdx ? [
        { name: '恒生指数', value: hsiIdx.price.toFixed(0), chg: hsiIdx.chgPct, chgVal: `${hsiIdx.chgPct >= 0 ? '+' : ''}${hsiIdx.chgPct.toFixed(2)}%` }
      ] : [],
      points: hkPoints
    },
    futures: {
      commodities,
      forex
    },
    news: {
      items: [
        { tag: '市场', tagClass: 'report-tag-market', title: '今日A股开盘，关注竞价方向及成交量' },
        { tag: '宏观', tagClass: 'report-tag-macro', title: '关注本周经济数据发布及政策动态' },
        { tag: '行业', tagClass: 'report-tag-sector', title: '关注昨日强势板块是否延续' },
        { tag: '全球', tagClass: 'report-tag-global', title: '隔夜美股表现及全球市场动态' },
        { tag: '商品', tagClass: 'report-tag-commodity', title: '关注黄金、原油等大宗商品价格走势' }
      ]
    },
    calendar: [],
    outlook: `市场有风险，投资需谨慎。建议关注今日开盘竞价方向，${shIdx && shIdx.chgPct > 1 ? '前日涨幅较大，注意短期回调风险' : shIdx && shIdx.chgPct < -1 ? '前日跌幅较大，关注超跌反弹机会' : '控制仓位，等待方向明确'}。`,
    sources: [
      { name: '东方财富', title: '实时行情数据', url: '#' }
    ],
    disclaimer: '免责声明：本早报基于公开市场数据自动生成，仅供参考，不构成任何投资建议。投资有风险，入市须谨慎。'
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
    // 早报 API 端点
    const morningMatch = url.pathname.match(/^\/api\/morning\/(\d{4}-\d{2}-\d{2})\.json$/);
    if (morningMatch) {
      const date = morningMatch[1];
      try {
        const cached = await env.DAILY_DATA.get(`morning:${date}`);
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
        const now = new Date();
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const cstHours = (hours + 8) % 24;
        const cstNow = new Date(now.getTime() + 8 * 3600000);

        // 8:30 AM CST (UTC 22:30) 生成早报
        if (cstHours === 8 && minutes >= 30 && minutes < 40) {
          if (!isTradingDay(cstNow)) {
            console.log('[Worker] Non-trading day, skipping morning report');
            return;
          }
          console.log('[Worker] Generating morning report...');
          const report = await generateMorningReport();
          const mrKey = `morning:${report.date}`;
          await env.DAILY_DATA.put(mrKey, JSON.stringify(report));
          console.log(`[Worker] Morning report stored for ${report.date}`);
          return;
        }

        // 其他时间触发：采集每日数据
        console.log('[Worker] Starting scheduled data collection...');
        const data = await collectDailyData();
        const key = `daily:${data.date}`;
        await env.DAILY_DATA.put(key, JSON.stringify(data));
        console.log(`[Worker] Data collected and stored for ${data.date}: ${data.limitUp} ZT, ${data.volume}`);
      } catch (e) {
        console.error('[Worker] Scheduled task failed:', e);
      }
    })());
  }
};

#!/usr/bin/env python3
"""A股复盘看板 - 自动更新脚本
每个交易日北京时间08:30由GitHub Actions运行，获取前一交易日的指数、股票、基金数据。
"""
import json, os, sys, urllib.request, urllib.error, re
from datetime import datetime, timedelta, timezone

BJT = timezone(timedelta(hours=8))

CN_HOLIDAYS_2026 = {
    '2026-01-01','2026-01-02','2026-01-03',
    '2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20',
    '2026-02-21','2026-02-22','2026-02-23','2026-02-24',
    '2026-04-04','2026-04-05','2026-04-06',
    '2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
    '2026-06-19','2026-06-20','2026-06-21',
    '2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05',
    '2026-10-06','2026-10-07','2026-10-08',
}
CN_WORKDAYS_2026 = {'2026-02-14','2026-02-15','2026-02-28','2026-09-28','2026-10-10'}

def is_trading_day(ds):
    dt = datetime.strptime(ds, '%Y-%m-%d')
    if ds in CN_HOLIDAYS_2026: return False
    if ds in CN_WORKDAYS_2026: return True
    return dt.weekday() < 5

def prev_trading_day(ref):
    d = ref - timedelta(days=1)
    for _ in range(15):
        if is_trading_day(d.strftime('%Y-%m-%d')): return d
        d -= timedelta(days=1)
    return d

def fetch(url, extra_headers=None):
    h = {'User-Agent':'Mozilla/5.0','Referer':'https://quote.eastmoney.com/'}
    if extra_headers: h.update(extra_headers)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8')

def fetch_em_quote(secid):
    url = f'https://push2delay.eastmoney.com/api/qt/stock/get?secid={secid}&fields=f43,f60,f170&fltt=2&invt=2&_={int(datetime.now().timestamp()*1000)}'
    try:
        d = json.loads(fetch(url))
        if d.get('rc')==0 and d.get('data'):
            p=float(d['data'].get('f43',0)); pc=float(d['data'].get('f60',0)); ct=float(d['data'].get('f170',0))
            if p>0 and pc>0: return {'price':p,'prev':pc,'pct':ct}
    except: pass
    return None

def fetch_qq(sym):
    url = f'https://qt.gtimg.cn/q={sym}'
    try:
        t = fetch(url, {'Referer':'https://gu.qq.com/'})
        parts = t.split('~')
        if len(parts)>=5:
            p=float(parts[3]); pc=float(parts[4])
            if p>0 and pc>0: return {'price':p,'prev':pc,'pct':round((p-pc)/pc*100,2)}
    except: pass
    return None

def fetch_fund(code):
    url = f'https://fundgz.1234567.com.cn/js/{code}.js?rt={int(datetime.now().timestamp()*1000)}'
    try:
        t = fetch(url, {'Referer':f'https://fund.eastmoney.com/{code}.html'})
        m = re.search(r'jsonpgz\((.*?)\)', t)
        if m:
            d = json.loads(m.group(1))
            return {'nav':float(d.get('dwjz',0)),'date':d.get('jzrq',''),
                    'gsz':float(d.get('gsz',0)) if d.get('gsz') else 0,'gztime':d.get('gztime','')}
    except: pass
    return None

def main():
    now = datetime.now(BJT)
    prev = prev_trading_day(now)
    ps = prev.strftime('%Y-%m-%d')
    print(f'[INFO] BJ time: {now.strftime("%Y-%m-%d %H:%M:%S")}, prev trading day: {ps}')

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    api_path = os.path.join(root,'site','api','portfolio.json')
    if not os.path.exists(api_path):
        print(f'[ERROR] {api_path} not found'); sys.exit(1)
    with open(api_path,'r',encoding='utf-8') as f: pf = json.load(f)

    # Indices
    indices = [('sh000001','1.000001','sh','上证指数'),('sz399001','0.399001','sz','深证成指'),('sz399006','0.399006','cy','创业板指')]
    idx_d = {}
    for sym,secid,key,name in indices:
        q = fetch_em_quote(secid) or fetch_qq(sym)
        if q:
            pct = round((q['price']-q['prev'])/q['prev']*100,2)
            idx_d[key] = [round(q['price'],2),pct]
            print(f'[IDX] {name}: {q["price"]:.2f} ({pct:+.2f}%)')

    # Stocks
    stocks = {'518880':{'sym':'sh518880','secid':'1.518880','shares':600,'name':'黄金ETF'},
              '159941':{'sym':'sz159941','secid':'0.159941','shares':6100,'name':'纳指ETF'},
              '601288':{'sym':'sh601288','secid':'1.601288','shares':600,'name':'农业银行'}}
    stk_daily = 0; price_d = {}
    for code,info in stocks.items():
        q = fetch_em_quote(info['secid']) or fetch_qq(info['sym'])
        if q:
            pnl = round((q['price']-q['prev'])*info['shares'],2)
            stk_daily += pnl; price_d[code] = round(q['price'],3)
            print(f'[STK] {info["name"]}({code}): {q["price"]:.3f} prev={q["prev"]:.3f} pnl={pnl:+.2f}')

    # Funds
    funds = [('006502','财通集成电路',55.63,8.9880,9.1075),('006195','国金量化多因子',673.52,3.3800,3.6217)]
    fnd_daily = 0; fnd_d = {}
    for code,name,shares,cost,prev_nav_ref in funds:
        fi = fetch_fund(code)
        if fi:
            nav = fi['nav']; nd = fi['date']; gsz = fi.get('gsz',0)
            if nd == ps and nav>0:
                pnl = round((nav-prev_nav_ref)*shares,2)
                hi = round((nav-cost)*shares,2); hy = round((nav-cost)/cost*100,2)
                fnd_daily += pnl
                fnd_d[code] = {'latestNav':round(nav,4),'navDate':ps[5:],'dailyIncome':pnl,
                              'holdingIncome':hi,'holdingYield':hy,'amount':round(nav*shares,2)}
                print(f'[FND] {name}({code}): nav={nav:.4f}({nd}) pnl={pnl:+.2f}')
            elif gsz>0:
                pnl = round((gsz-nav)*shares,2)
                hi = round((gsz-cost)*shares,2); hy = round((gsz-cost)/cost*100,2)
                fnd_daily += pnl
                fnd_d[code] = {'latestNav':round(gsz,4),'navDate':ps[5:]+'(估)','dailyIncome':pnl,
                              'holdingIncome':hi,'holdingYield':hy,'amount':round(gsz*shares,2)}
                print(f'[FND] {name}({code}): est={gsz:.4f} nav_date={nd}')

    total = round(stk_daily+fnd_daily,2)
    print(f'\n[RESULT] stock={stk_daily:+.2f} fund={fnd_daily:+.2f} total={total:+.2f}')

    if 'days' not in pf: pf['days'] = {}
    wn = ['周一','周二','周三','周四','周五','周六','周日']
    pf['days'][ps] = {'date':ps,'weekday':wn[prev.weekday()],'price':price_d,'idx':idx_d,
                      'stockDaily':stk_daily,'fundDaily':fnd_daily,'totalDaily':total,'funds':fnd_d}
    if 'funds' in pf:
        for code,fd in fnd_d.items():
            for f in pf['funds']:
                if f.get('code')==code: f.update(fd)
    pf['lastUpdate'] = now.strftime('%Y-%m-%d %H:%M:%S')
    pf['lastTradingDay'] = ps
    with open(api_path,'w',encoding='utf-8') as f: json.dump(pf,f,ensure_ascii=False,indent=2)
    print(f'[SAVE] Updated {api_path}')
    return 0

if __name__=='__main__': sys.exit(main())

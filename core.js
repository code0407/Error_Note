// ========================================================
// 错题本 · 智能错题  ——  数据层 Core
// localStorage + 艾宾浩斯复习周期
// ========================================================
(() => {
  const KEY = 'errorbook_db';
  const SETTINGS_KEY = 'errorbook_settings';

  const seed = [
    {
      subject: '数学', folder: '三角函数',
      question: '已知函数 f(x) = x³ - 3x² + 2，求 f(x) 的单调区间与极值。',
      wrongAnswer: "f'(x)=3x²-6x，令等于0，得x=2，所以只有一个极值点。",
      rightAnswer: "f'(x)=3x(x-2)，令f'(x)=0得x=0或x=2；递增区间(-∞,0)和(2,+∞)，递减区间(0,2)；极大值f(0)=2，极小值f(2)=-2。",
      reason: '导数为零点有两个，漏掉一个',
      tags: ['函数','导数'], difficulty: 4, images: [],
      wrongCount: 2, mastered: false, favorite: true,
      createdAt: Date.now() - 30*86400000,
      nextReviewAt: Date.now() - 7*86400000
    },
    {
      subject: '数学', folder: '方程',
      question: '解方程 x² - 5x + 6 = 0。',
      wrongAnswer: 'x²-5x+6=(x-6)(x+1)=0，x=6或x=-1',
      rightAnswer: '(x-2)(x-3)=0，x=2 或 x=3',
      reason: '因式分解符号错误',
      tags: ['方程','二次'], difficulty: 2, images: [],
      wrongCount: 1, mastered: false, favorite: false,
      createdAt: Date.now() - 15*86400000,
      nextReviewAt: Date.now() - 2*86400000
    },
    {
      subject: '物理', folder: '力学',
      question: '质量 m=2kg 的物体受水平力 F=10N，动摩擦因数 μ=0.2，求加速度(g=10)。',
      wrongAnswer: 'a=F/m=5m/s²',
      rightAnswer: 'f=μmg=4N，a=(F-f)/m=3m/s²',
      reason: '忘记扣掉摩擦力',
      tags: ['牛顿定律','加速度'], difficulty: 3, images: [],
      wrongCount: 1, mastered: false, favorite: false,
      createdAt: Date.now() - 10*86400000,
      nextReviewAt: Date.now() - 1*86400000
    },
    {
      subject: '英语', folder: '语法',
      question: 'By the time he arrives, we ____ already the work.',
      wrongAnswer: 'will finish',
      rightAnswer: 'will have finished（将来完成时）',
      reason: 'By the time 从句需要将来完成时',
      tags: ['时态','完成时'], difficulty: 2, images: [],
      wrongCount: 3, mastered: false, favorite: true,
      createdAt: Date.now() - 5*86400000,
      nextReviewAt: Date.now()
    },
    {
      subject: '化学', folder: '反应',
      question: '在反应 Fe + CuSO₄ = FeSO₄ + Cu 中，还原剂是？',
      wrongAnswer: 'Cu²+',
      rightAnswer: 'Fe 失去电子，是还原剂；Cu²+ 是氧化剂',
      reason: '还原剂是失电子的一方，不是氧化剂',
      tags: ['氧化还原','电子'], difficulty: 3, images: [],
      wrongCount: 2, mastered: false, favorite: false,
      createdAt: Date.now() - 2*86400000,
      nextReviewAt: Date.now()
    },
    {
      subject: '数学', folder: '几何',
      question: '直角三角形两直角边 3、4，求斜边。',
      wrongAnswer: '5²=25',
      rightAnswer: '勾股定理 3²+4²=25，斜边=5',
      reason: '没写步骤，直接跳结果',
      tags: ['几何','三角形','勾股'], difficulty: 1, images: [],
      wrongCount: 1, mastered: true, favorite: false,
      createdAt: Date.now() - 40*86400000,
      nextReviewAt: null
    }
  ];

  const defaultSettings = {
    theme: 'light',
    font: 'm',
    masterThreshold: 3,
    ebbinghaus: [1, 2, 4, 7, 15, 30]
  };

  function loadDB() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (e) { console.warn('loadDB fail', e); }
    saveDB(seed);
    return seed.slice();
  }
  function saveDB(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); }
    catch (e) { console.warn('saveDB fail', e); }
  }
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
    } catch (e) {}
    return { ...defaultSettings };
  }
  function saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
    catch (e) {}
  }

  const state = {
    db: loadDB(),
    settings: loadSettings()
  };

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.setAttribute('data-font', state.settings.font);
  }

  function addQ(q) {
    const id = (state.db[0]?.id || 0) + 1;
    const now = Date.now();
    const item = {
      id, subject: q.subject || '数学', folder: q.folder || '',
      tags: (q.tags || []).filter(Boolean),
      difficulty: q.difficulty || 2,
      question: q.question || '',
      wrongAnswer: q.wrongAnswer || '',
      rightAnswer: q.rightAnswer || '',
      reason: q.reason || '',
      images: q.images || [],
      wrongCount: 1,
      mastered: false, favorite: false,
      createdAt: now,
      nextReviewAt: now
    };
    state.db.unshift(item);
    saveDB(state.db);
    return item;
  }
  function updateQ(id, patch) {
    const i = state.db.findIndex(x => x.id === id);
    if (i >= 0) {
      state.db[i] = { ...state.db[i], ...patch };
      saveDB(state.db);
      return state.db[i];
    }
    return null;
  }
  function delQ(id) {
    state.db = state.db.filter(x => x.id !== id);
    saveDB(state.db);
  }
  function toggleFav(id) {
    const i = state.db.findIndex(x => x.id === id);
    if (i >= 0) { state.db[i].favorite = !state.db[i].favorite; saveDB(state.db); }
  }

  function markMastered(id) {
    const i = state.db.findIndex(x => x.id === id);
    if (i < 0) return;
    const q = state.db[i];
    q.wrongCount += 1;
    if (q.wrongCount >= state.settings.masterThreshold) {
      q.mastered = true;
      q.nextReviewAt = null;
    } else {
      const days = state.settings.ebbinghaus[Math.min(q.wrongCount - 1, state.settings.ebbinghaus.length - 1)];
      q.nextReviewAt = Date.now() + days * 86400000;
    }
    saveDB(state.db);
  }
  function markReviewLater(id) {
    const i = state.db.findIndex(x => x.id === id);
    if (i < 0) return;
    const q = state.db[i];
    q.mastered = false;
    q.wrongCount = Math.max(1, q.wrongCount);
    q.nextReviewAt = Date.now();
    saveDB(state.db);
  }

  function getTodayReview() {
    const now = Date.now();
    return state.db.filter(q => !q.mastered && q.nextReviewAt !== null && q.nextReviewAt <= now + 3600000);
  }

  function getStats() {
    const total = state.db.length;
    const mastered = state.db.filter(q => q.mastered).length;
    const toReview = getTodayReview().length;
    const favorites = state.db.filter(q => q.favorite).length;

    const subjectCount = {};
    state.db.forEach(q => { subjectCount[q.subject] = (subjectCount[q.subject] || 0) + 1; });

    const tagCount = {};
    state.db.forEach(q => {
      (q.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
    });
    const topTags = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0, 8);

    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const start = Date.now() - (w + 1) * 7 * 86400000;
      const end = Date.now() - w * 7 * 86400000;
      weeks.push(state.db.filter(q => q.createdAt >= start && q.createdAt < end).length);
    }

    return { total, mastered, toReview, favorites, subjectCount, topTags, weeks };
  }

  function backupData() {
    const data = {
      db: state.db, settings: state.settings,
      exportedAt: new Date().toISOString(),
      version: 1
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `错题本_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  function importData(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const data = JSON.parse(fr.result);
          if (Array.isArray(data.db)) {
            state.db = data.db;
            saveDB(state.db);
            if (data.settings) { state.settings = { ...defaultSettings, ...data.settings }; saveSettings(state.settings); }
            applyTheme();
            resolve(true);
          } else reject(new Error('文件格式不正确'));
        } catch (e) { reject(e); }
      };
      fr.onerror = () => reject(new Error('读取失败'));
      fr.readAsText(file);
    });
  }
  function clearAll() {
    state.db = []; saveDB(state.db);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function buildPrintHTML(list, title) {
    const parts = [];
    parts.push('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + escapeHtml(title || '错题本') + '</title>');
    parts.push('<style>body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#222;padding:24px;}h1{font-size:20px;margin-bottom:16px;border-bottom:2px solid #1976d2;padding-bottom:8px;}.q{border-left:3px solid #1976d2;padding:10px 14px;margin-bottom:14px;background:#fafafa;}.q .s{display:inline-block;background:#e3f2fd;color:#1976d2;padding:2px 10px;border-radius:10px;font-size:12px;margin-right:6px;}.q .t{font-weight:600;margin:6px 0;line-height:1.5;white-space:pre-wrap;}.q .a{background:#fff;padding:10px;border-left:2px solid #43a047;margin-top:8px;white-space:pre-wrap;}.q .w{background:#fff8e1;padding:8px;border-left:2px solid #f57c00;margin-top:4px;font-size:13px;white-space:pre-wrap;}.q .r{background:#fff3e0;padding:8px;border-left:2px solid #e53935;margin-top:4px;font-size:13px;white-space:pre-wrap;}img{max-width:100%;border:1px solid #eee;border-radius:4px;margin-top:6px;}</style></head><body>');
    parts.push('<h1>' + escapeHtml(title || '错题本全部错题') + ' — 共 ' + list.length + ' 题</h1>');
    list.forEach((q, i) => {
      parts.push('<div class="q">');
      parts.push('<span class="s">' + escapeHtml(q.subject) + '</span>');
      (q.tags || []).forEach(t => parts.push('<span class="s"># ' + escapeHtml(t) + '</span>'));
      parts.push('<div class="t">第 ' + (i+1) + ' 题 · ' + escapeHtml(q.question) + '</div>');
      (q.images || []).forEach(src => parts.push('<img src="' + src + '" alt="图片">'));
      if (q.wrongAnswer) parts.push('<div class="w">❌ 错误答案：' + escapeHtml(q.wrongAnswer) + '</div>');
      if (q.rightAnswer) parts.push('<div class="a">✅ 正确答案：' + escapeHtml(q.rightAnswer) + '</div>');
      if (q.reason) parts.push('<div class="r">💡 错误原因：' + escapeHtml(q.reason) + '</div>');
      parts.push('</div>');
    });
    parts.push('</body></html>');
    return parts.join('');
  }

  function _openWindowBlob(html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function _buildPaperTXT(list, title) {
    const lines = [];
    lines.push(title || '错题本全部错题');
    lines.push('='.repeat(30));
    lines.push('共 ' + list.length + ' 题');
    lines.push('');
    list.forEach((q, i) => {
      lines.push('第 ' + (i+1) + ' 题  [' + q.subject + '] ' + (q.tags || []).map(t => '#' + t).join(' '));
      if (q.question) lines.push('  题干：' + q.question.replace(/\n/g,' '));
      if (q.wrongAnswer) lines.push('  ❌ 我的答案：' + q.wrongAnswer.replace(/\n/g,' '));
      if (q.rightAnswer) lines.push('  ✅ 正确答案：' + q.rightAnswer.replace(/\n/g,' '));
      if (q.reason) lines.push('  💡 错因：' + q.reason.replace(/\n/g,' '));
      lines.push('');
    });
    return lines.join('\n');
  }

  function exportPaper(list, title) {
    _openWindowBlob(buildPrintHTML(list, title), (title || '错题卷') + '.html');
  }

  function exportPaperTxt(list, title) {
    const txt = _buildPaperTXT(list, title);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title || '错题卷') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function exportPrint(list, title) {
    const html = buildPrintHTML(list, title);
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { toast('请允许弹出窗口'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  // --- 真实 OCR：使用 Tesseract.js v5 via CDN ---
  let _tesseractLoaderPromise = null;
  function loadTesseract() {
    if (_tesseractLoaderPromise) return _tesseractLoaderPromise;
    _tesseractLoaderPromise = new Promise((resolve, reject) => {
      if (typeof Tesseract !== 'undefined') { resolve(); return; }
      const sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      sc.async = true;
      sc.onload = () => resolve();
      sc.onerror = () => reject(new Error('OCR 引擎加载失败，请检查网络'));
      document.head.appendChild(sc);
    });
    return _tesseractLoaderPromise;
  }

  function recognizeImage(imageDataUrl, onProgress) {
    return loadTesseract().then(() => {
      if (typeof Tesseract === 'undefined') throw new Error('Tesseract 未加载');
      return Tesseract.recognize(
        imageDataUrl,
        'chi_sim+eng',
        {
          logger: m => {
            if (onProgress && m && typeof m.progress === 'number') {
              onProgress({ status: m.status, progress: m.progress });
            }
          }
        }
      );
    }).then(({ data }) => {
      let text = (data && data.text) ? String(data.text) : '';
      text = text.replace(/\n{3,}/g, '\n\n').trim();
      return text;
    }).catch(err => {
      console.warn('OCR 失败:', err);
      return '';
    });
  }

  function toast(msg, ms = 2200) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);background:rgba(30,30,30,0.92);color:#fff;padding:10px 20px;border-radius:24px;font-size:14px;z-index:10000;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;max-width:90%;text-align:center;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)'; });
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(-10px)';
    }, ms);
  }

  window.Core = {
    state, addQ, updateQ, delQ, toggleFav,
    markMastered, markReviewLater, getTodayReview, getStats,
    backupData, importData, clearAll,
    exportPrint, exportPaper, exportPaperTxt, buildPrintHTML,
    recognizeImage, loadTesseract, toast, applyTheme, saveSettings
  };
})();

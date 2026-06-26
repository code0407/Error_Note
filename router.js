// ========================================================
// 错题本 · 智能错题  ——  路由层 Router
// 手机优先 · 底部5tab · 五大页
// ========================================================
(() => {
  const views = {};
  function register(name, fn) { views[name] = fn; }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function home() {
    const { state } = window.Core;
    const s = window.Core.getStats();
    const recent = state.db.slice(0, 3);

    return `
    <div class="card">
      <div class="card-title">错题总览</div>
      <div class="stat-grid">
        <div class="stat-cell"><div class="stat-num">${s.total}</div><div class="stat-label">总错题</div></div>
        <div class="stat-cell"><div class="stat-num">${s.toReview}</div><div class="stat-label">待复习</div></div>
        <div class="stat-cell"><div class="stat-num">${s.mastered}</div><div class="stat-label">已掌握</div></div>
        <div class="stat-cell"><div class="stat-num">${s.favorites}</div><div class="stat-label">收藏</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📚 今日待复习 · ${s.toReview} 题</div>
      <button class="btn btn-primary" id="goReview" style="width:100%;margin-top:12px;">开始今日刷题 →</button>
    </div>

    <div class="card">
      <div class="card-title">最近添加</div>
      ${recent.length === 0 ? '<div class="empty"><div class="ee">📝</div>还没有错题，先去录入吧</div>' :
        recent.map(q => `
        <div class="recent-q" data-id="${q.id}">
          <span class="subj">${escapeHtml(q.subject)}</span>
          <span class="qtext">${escapeHtml(q.question.slice(0, 40))}${q.question.length > 40 ? '...' : ''}</span>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-title">🛠 工具</div>
      <div class="quick-grid">
        <button class="quick-item" data-act="export"><div class="ic">🖨</div><div>生成试卷</div></button>
        <button class="quick-item" data-act="settings"><div class="ic">⚙️</div><div>设置</div></button>
        <button class="quick-item" data-act="backup"><div class="ic">📦</div><div>备份数据</div></button>
        <button class="quick-item" data-act="import"><div class="ic">📥</div><div>导入数据</div></button>
      </div>
    </div>
    `;
  }

  function input() {
    return `
    <div class="card">
      <div class="card-title">录入错题</div>

      <div class="f-group">
        <label class="f-label">科目</label>
        <div class="f-row">
          <select id="inpSubject">
            <option>数学</option><option>语文</option><option>英语</option>
            <option>物理</option><option>化学</option><option>生物</option>
            <option>历史</option><option>地理</option><option>政治</option>
          </select>
          <input type="text" id="inpFolder" placeholder="知识点文件夹（如：三角函数）" />
        </div>
      </div>

      <div class="f-group">
        <label class="f-label">难度</label>
        <div class="star" id="inpStar">
          ${[1,2,3,4,5].map(n => `<span data-n="${n}" class="${n<=2?'on':''}">★</span>`).join('')}
        </div>
      </div>

      <div class="f-group">
        <label class="f-label">题干 *</label>
        <textarea id="inpQuestion" placeholder="输入题干，或先添加图片后OCR识别..." maxlength="1200"></textarea>

        <div id="inpOcrBox" style="display:none;margin-top:8px;padding:10px;background:#f3f3f3;border-radius:10px;font-size:13px;color:#555;">
          <div id="inpOcrLine">正在识别图片中的文字...</div>
          <div style="margin-top:6px;">
            <div class="ocr-bar-bg"><div id="inpOcrBar" class="ocr-bar" style="width:0%;"></div></div>
          </div>
        </div>

        <div class="f-row" style="margin-top:8px;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="inpAddImg">📷 添加图片</button>
          <button class="btn btn-ghost btn-sm" id="inpOcrAgain" style="display:none;">🔄 重新识别</button>
          <input type="file" id="inpFileAny" accept="image/*" multiple style="display:none;" />
        </div>

        <div id="inpPics" class="pic-list" style="margin-top:10px;"></div>
      </div>

      <div class="f-group">
        <label class="f-label">错误答案 *</label>
        <textarea id="inpWrong" placeholder="当时你是怎么答的..."></textarea>
      </div>

      <div class="f-group">
        <label class="f-label">正确答案</label>
        <textarea id="inpRight" placeholder="参考答案/老师订正..."></textarea>
      </div>

      <div class="f-group">
        <label class="f-label">错误原因</label>
        <textarea id="inpReason" placeholder="知识点没掌握？计算错误？审题不清？"></textarea>
      </div>

      <div class="f-group">
        <label class="f-label">知识点标签（回车添加）</label>
        <input type="text" id="inpTagInput" placeholder="输入后回车，例如：导数、极值、二次函数" />
        <div id="inpTagsBox" style="margin-top:8px;"></div>
      </div>

      <div class="f-row">
        <button class="btn btn-ghost" id="inpReset">重置</button>
        <button class="btn btn-primary" id="inpSave">保存错题</button>
      </div>
    </div>
    `;
  }

  function list() {
    const { state } = window.Core;
    const subjects = [...new Set(state.db.map(q => q.subject))];
    const allDifficulty = [1,2,3,4,5];

    return `
    <div class="filter-bar">
      <div class="filter-row">
        <select id="fSubject">
          <option value="">全部科目</option>
          ${subjects.map(s => `<option>${s}</option>`).join('')}
        </select>
        <select id="fDifficulty">
          <option value="">全部难度</option>
          ${allDifficulty.map(d => `<option value="${d}">${d}★</option>`).join('')}
        </select>
      </div>
      <div class="filter-row">
        <select id="fStatus">
          <option value="">全部状态</option>
          <option value="fav">仅收藏</option>
          <option value="todo">待复习</option>
          <option value="done">已掌握</option>
        </select>
        <input type="search" id="fSearch" placeholder="搜索题干/标签/原因..." />
      </div>
    </div>
    <div id="listBody"></div>
    `;
  }

  function review() {
    const { state } = window.Core;
    const allSubjects = ['全部科目', ...new Set(state.db.map(q => q.subject))];
    const hasFav = state.db.some(q => q.favorite);
    return `
    <div class="filter-bar">
      <div class="filter-row">
        <select id="rvSubject">
          ${allSubjects.map((s, i) => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select id="rvScope">
          <option value="all">包含已掌握</option>
          <option value="todo" selected>仅待复习</option>
          ${hasFav ? '<option value="fav">仅收藏</option>' : ''}
        </select>
      </div>
      <div class="filter-row">
        <select id="rvOrder">
          <option value="seq">📖 按顺序</option>
          <option value="random">🎲 随机打乱</option>
        </select>
        <button class="btn btn-ghost btn-sm" id="rvReset">🔄 重来</button>
      </div>
    </div>
    <div id="rvCard"></div>
    <div class="review-bts">
      <button class="btn btn-ghost" id="rvPrev">上一题</button>
      <button class="btn btn-primary" id="rvNext">下一题</button>
      <button class="btn btn-ghost" id="rvShow" style="grid-column:span 2;">👁 显示/隐藏答案</button>
      <button class="btn btn-primary" id="rvMaster">✅ 已掌握</button>
      <button class="btn" id="rvAgain" style="background:#fff3e0;color:#f57c00;">🔁 再练一次</button>
    </div>
    `;
  }

  function stats() {
    const { state } = window.Core;
    const s = window.Core.getStats();
    const colors = ['#1976d2','#43a047','#f57c00','#e53935','#8e24aa','#039be5','#6d4c41','#546e7a'];

    const subjectEntries = Object.entries(s.subjectCount);
    const subjectTotal = subjectEntries.reduce((a, [,v]) => a + v, 0) || 1;
    const topMax = Math.max(1, ...s.topTags.map(t => t[1]));
    const weekMax = Math.max(1, ...s.weeks, 1);

    return `
    <div class="card">
      <div class="card-title">科目分布</div>
      <div class="pie-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160" id="pieSvg"></svg>
        <div class="pie-legend" id="pieLegend">
          ${subjectEntries.map(([k, v], i) => `<div class="l"><div class="d" style="background:${colors[i%colors.length]}"></div>${escapeHtml(k)}：${v}</div>`).join('') || '<div class="l">暂无数据</div>'}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">高频易错知识点 Top 8</div>
      <div class="bar-chart">
        ${s.topTags.length === 0 ? '<div class="empty"><div class="ee">📈</div>收录错题后自动生成</div>'
          : s.topTags.map(([k, v]) => `
          <div class="bar-row">
            <div>${escapeHtml(k)}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${(v/topMax*100).toFixed(0)}%"></div></div>
            <div class="v">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">近 4 周新增</div>
      <div class="bar-chart">
        ${s.weeks.map((v, i) => {
          const label = i === 0 ? '第4周' : i === 1 ? '第3周' : i === 2 ? '上周' : '本周';
          return `
          <div class="bar-row">
            <div>${label}</div>
            <div class="bar-track"><div class="bar-fill" style="background:#039be5;width:${(v/weekMax*100).toFixed(0)}%"></div></div>
            <div class="v">${v}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">📊 统计总览</div>
      <div class="stat-grid">
        <div class="stat-cell"><div class="stat-num">${s.total}</div><div class="stat-label">总题数</div></div>
        <div class="stat-cell"><div class="stat-num">${s.mastered}</div><div class="stat-label">已掌握</div></div>
        <div class="stat-cell"><div class="stat-num">${s.toReview}</div><div class="stat-label">待复习</div></div>
        <div class="stat-cell"><div class="stat-num">${Math.round(s.mastered/Math.max(1,s.total)*100)}%</div><div class="stat-label">掌握率</div></div>
      </div>
    </div>
    `;
  }

  function openModal(html) {
    closeModal();
    const bg = document.createElement('div');
    bg.id = 'modalBg';
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box">${html}</div>`;
    bg.onclick = e => { if (e.target === bg) closeModal(); };
    document.body.appendChild(bg);
  }
  function closeModal() {
    const el = document.getElementById('modalBg');
    if (el) el.remove();
  }

  function bindInput() {
    const Core = window.Core;
    let images = [];
    let tags = [];
    let difficulty = 2;
    let editingId = null;
    let lastOcrImage = null;

    const m = new URLSearchParams(location.hash.replace(/^#\??/, '')).get('edit');
    if (m) {
      const q = Core.state.db.find(x => x.id === +m);
      if (q) {
        editingId = q.id;
        document.getElementById('inpSubject').value = q.subject;
        document.getElementById('inpFolder').value = q.folder || '';
        document.getElementById('inpQuestion').value = q.question;
        document.getElementById('inpWrong').value = q.wrongAnswer;
        document.getElementById('inpRight').value = q.rightAnswer;
        document.getElementById('inpReason').value = q.reason;
        images = [...(q.images || [])];
        tags = [...(q.tags || [])];
        difficulty = q.difficulty;
        document.querySelectorAll('#inpStar span').forEach(s => s.classList.toggle('on', +s.dataset.n <= difficulty));
        renderPics(); renderTags();
        history.replaceState({}, '', location.pathname + location.search);
      }
    }

    function renderPics() {
      const box = document.getElementById('inpPics');
      box.innerHTML = images.map((u, i) => `
        <div class="pic-preview">
          <img src="${u}" alt="错题图">
          <button class="rx" data-i="${i}">×</button>
          <div class="pic-ocr-btn" data-i="${i}">🔄识别文字</div>
        </div>`).join('');
      box.querySelectorAll('.rx').forEach(b => b.onclick = () => { images.splice(+b.dataset.i, 1); renderPics(); });
      box.querySelectorAll('.pic-ocr-btn').forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        recognizeAndFill(images[i]);
      });
    }
    function renderTags() {
      const box = document.getElementById('inpTagsBox');
      box.innerHTML = tags.map((t, i) => `<span class="chip del"># ${escapeHtml(t)}<span class="x" data-i="${i}">×</span></span>`).join('');
      box.querySelectorAll('.x').forEach(x => x.onclick = () => { tags.splice(+x.dataset.i, 1); renderTags(); });
    }

    document.querySelectorAll('#inpStar span').forEach(s => {
      s.onclick = () => {
        difficulty = +s.dataset.n;
        document.querySelectorAll('#inpStar span').forEach(x => x.classList.toggle('on', +x.dataset.n <= difficulty));
      };
    });

    const tagInput = document.getElementById('inpTagInput');
    tagInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = tagInput.value.trim().replace(/[，,]/g, '');
        if (v && !tags.includes(v)) tags.push(v);
        tagInput.value = '';
        renderTags();
      }
    });

    function readImage(file) {
      return new Promise(resolve => {
        const fr = new FileReader();
        fr.onload = e => resolve(e.target.result);
        fr.readAsDataURL(file);
      });
    }

    function showOcrBox(show, progress, line) {
      const box = document.getElementById('inpOcrBox');
      if (!box) return;
      box.style.display = show ? 'block' : 'none';
      const bar = document.getElementById('inpOcrBar');
      const ln = document.getElementById('inpOcrLine');
      if (bar && typeof progress === 'number') bar.style.width = Math.round(progress*100) + '%';
      if (ln && line) ln.textContent = line;
    }

    async function recognizeAndFill(dataUrl) {
      showOcrBox(true, 0, '加载OCR引擎...');
      try {
        const text = await Core.recognizeImage(dataUrl, ({status, progress}) => {
          let line = '识别中...';
          if (status && typeof status === 'string') {
            if (status.includes('initializing')) line = '初始化...';
            else if (status.includes('downloading')) line = '下载语言包...';
            else if (status.includes('recognizing')) line = '识别中...';
            else if (status.includes('finalizing')) line = '完成...';
          }
          showOcrBox(true, progress, line);
        });
        showOcrBox(false);
        if (text && text.trim()) {
          const ta = document.getElementById('inpQuestion');
          const cur = ta.value.trim();
          if (cur && cur !== text.trim()) {
            const ok = confirm('识别结果：\n\n' + text.slice(0,200) + '\n\n是否用识别结果覆盖题干？');
            if (ok) ta.value = text.trim();
          } else {
            ta.value = text.trim();
          }
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
          toast('OCR识别完成，可直接修改', 2000);
          return text;
        } else {
          toast('识别结果为空，可手动输入', 2200);
          return '';
        }
      } catch (err) {
        showOcrBox(false);
        console.warn(err);
        toast('识别失败，请检查网络或手动输入', 2500);
        return '';
      }
    }

    // === 核心按钮：📷 添加图片（相册 or 相机，系统自选） ===
    document.getElementById('inpAddImg').onclick = () => {
      const input = document.getElementById('inpFileAny');
      input.value = '';
      input.click();
    };
    document.getElementById('inpFileAny').onchange = async e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      const texts = [];
      for (let i = 0; i < files.length; i++) {
        const u = await readImage(files[i]);
        images.push(u);
        renderPics();
        const t = await recognizeAndFill(u);
        if (t) texts.push(t);
      }
      // 多图合并题干
      const ta = document.getElementById('inpQuestion');
      const cur = ta.value.trim();
      if (!cur && texts.length > 0) {
        ta.value = texts.join('\n\n');
      }
      e.target.value = '';
    };

    // 重新识别（用最后一张图）
    const againBtn = document.getElementById('inpOcrAgain');
    if (againBtn) {
      againBtn.style.display = 'none';
    }
    document.getElementById('inpQuestion').addEventListener('input', () => {
      if (againBtn) againBtn.style.display = images.length > 0 ? 'inline-flex' : 'none';
    });
    if (againBtn) {
      againBtn.onclick = () => {
        if (images.length === 0) { toast('请先添加图片'); return; }
        recognizeAndFill(images[images.length-1]);
      };
    }

    // 保存
    document.getElementById('inpSave').onclick = () => {
      const q = {
        subject: document.getElementById('inpSubject').value,
        folder: document.getElementById('inpFolder').value.trim(),
        question: document.getElementById('inpQuestion').value.trim(),
        wrongAnswer: document.getElementById('inpWrong').value.trim(),
        rightAnswer: document.getElementById('inpRight').value.trim(),
        reason: document.getElementById('inpReason').value.trim(),
        tags: [...tags], difficulty, images: [...images]
      };
      if (!q.question && images.length === 0) { toast('请至少输入题干 或 添加图片'); return; }
      if (!q.question && images.length > 0) { q.question = '[图片]'; }
      if (editingId) {
        Core.updateQ(editingId, q);
        toast('更新成功', 1500);
      } else {
        Core.addQ(q);
        toast('✅ 保存成功', 1800);
      }

      editingId = null; images = []; tags = []; difficulty = 2;
      document.getElementById('inpSubject').selectedIndex = 0;
      document.getElementById('inpFolder').value = '';
      document.getElementById('inpQuestion').value = '';
      document.getElementById('inpWrong').value = '';
      document.getElementById('inpRight').value = '';
      document.getElementById('inpReason').value = '';
      document.querySelectorAll('#inpStar span').forEach(s => s.classList.toggle('on', +s.dataset.n <= 2));
      renderPics(); renderTags();
    };

    document.getElementById('inpReset').onclick = () => {
      editingId = null; images = []; tags = []; difficulty = 2;
      document.getElementById('inpSubject').selectedIndex = 0;
      document.getElementById('inpFolder').value = '';
      document.getElementById('inpQuestion').value = '';
      document.getElementById('inpWrong').value = '';
      document.getElementById('inpRight').value = '';
      document.getElementById('inpReason').value = '';
      document.querySelectorAll('#inpStar span').forEach(s => s.classList.toggle('on', +s.dataset.n <= 2));
      renderPics(); renderTags();
    };
  }

  function bindList() {
    const Core = window.Core;
    const body = document.getElementById('listBody');
    const fSubject = document.getElementById('fSubject');
    const fDifficulty = document.getElementById('fDifficulty');
    const fStatus = document.getElementById('fStatus');
    const fSearch = document.getElementById('fSearch');

    function render() {
      const s = fSubject.value;
      const d = fDifficulty.value;
      const st = fStatus.value;
      const q = (fSearch.value || '').trim().toLowerCase();
      let list = Core.state.db.filter(x => {
        if (s && x.subject !== s) return false;
        if (d && x.difficulty !== +d) return false;
        if (st === 'fav' && !x.favorite) return false;
        if (st === 'todo' && x.mastered) return false;
        if (st === 'done' && !x.mastered) return false;
        if (q) {
          const hay = (x.question + ' ' + x.reason + ' ' + (x.tags||[]).join(' ')).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      if (list.length === 0) {
        body.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">没有错题，请先录入</div>';
        return;
      }

      body.innerHTML = list.map(q => {
        const fav = q.favorite ? '⭐' : '☆';
        const imgTag = (q.images && q.images.length > 0) ? '<span class="pic-mark">🖼</span>' : '';
        return `
        <div class="q-card" data-id="${q.id}">
          <div class="q-head">
            <span class="subj">${escapeHtml(q.subject)}</span>
            <span class="diff">${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</span>
            <span class="fav">${fav}</span>
            ${imgTag}
          </div>
          <div class="q-question">${escapeHtml(q.question.slice(0, 120))}${q.question.length > 120 ? '...' : ''}</div>
          <div class="q-tags">${(q.tags || []).map(t => `<span class="tag"># ${escapeHtml(t)}</span>`).join('')}</div>
          <div class="q-actions">
            <button class="qa qa-del" data-act="del">🗑 删除</button>
            <button class="qa qa-fav" data-act="fav">${q.favorite ? '取消收藏' : '收藏'}</button>
            <button class="qa qa-edit" data-act="edit">✏️ 编辑</button>
            <button class="qa qa-dtl" data-act="detail">详情</button>
          </div>
        </div>
        `;
      }).join('');

      body.querySelectorAll('.q-card').forEach(card => {
        const id = +card.dataset.id;
        card.querySelectorAll('.qa').forEach(btn => {
          btn.onclick = () => {
            const act = btn.dataset.act;
            const q = Core.state.db.find(x => x.id === id);
            if (!q) return;
            if (act === 'fav') { Core.toggleFav(id); render(); }
            else if (act === 'del') {
              openModal(`
                <div style="padding:10px 14px;">
                  <div style="font-size:15px;font-weight:600;margin-bottom:10px;">🗑 确认删除？</div>
                  <div style="color:#888;font-size:13px;margin-bottom:14px;">该错题将从题库中永久移除，无法恢复。</div>
                  <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button class="btn btn-ghost" id="delCancel">取消</button>
                    <button class="btn" id="delConfirm" style="background:#e53935;color:#fff;">🗑 确定删除</button>
                  </div>
                </div>
              `);
              document.getElementById('delCancel').onclick = closeModal;
              document.getElementById('delConfirm').onclick = () => { Core.delQ(id); closeModal(); render(); Core.toast('已删除'); };
            }
            else if (act === 'edit') {
              closeModal();
              route('input', id);
            }
            else if (act === 'detail') {
              openDetail(q);
            }
          };
        });
      });
    }

    function openDetail(q) {
      const tagHtml = (q.tags || []).map(t => `<span class="tag"># ${escapeHtml(t)}</span>`).join('');
      const imgHtml = (q.images || []).map(src => `<img src="${src}" style="max-width:100%;border:1px solid #eee;border-radius:6px;margin-top:6px;">`).join('');
      const html = `
        <div style="padding:14px 16px 18px;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
            <span class="subj">${escapeHtml(q.subject)}</span>
            <span class="diff" style="font-size:13px;color:#f57c00;">${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</span>
            ${q.favorite ? '<span style="margin-left:auto;">⭐</span>' : ''}
          </div>
          <div style="font-weight:600;font-size:15px;margin-bottom:6px;">📖 题干</div>
          <div style="background:#fafafa;padding:10px;border-radius:6px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(q.question)}</div>
          ${imgHtml}
          <div style="margin-top:12px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#f57c00;">❌ 我的答案</div>
            <div style="background:#fff8e1;padding:10px;border-radius:6px;white-space:pre-wrap;">${escapeHtml(q.wrongAnswer)}</div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#43a047;">✅ 正确答案</div>
            <div style="background:#e8f5e9;padding:10px;border-radius:6px;white-space:pre-wrap;">${escapeHtml(q.rightAnswer)}</div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#555;">💡 错误原因</div>
            <div style="background:#f3f3f3;padding:10px;border-radius:6px;white-space:pre-wrap;">${escapeHtml(q.reason)}</div>
          </div>
          <div style="margin-top:10px;">${tagHtml}</div>

          <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-wrap;flex-wrap:wrap;">
            <button class="btn btn-ghost" id="dlClose">关闭</button>
            <button class="btn btn-ghost" id="dlFav">${q.favorite ? '取消收藏' : '⭐ 收藏'}</button>
            <button class="btn btn-ghost" id="dlEdit">✏️ 编辑</button>
            <button class="btn" id="dlDel" style="background:#e53935;color:#fff;">🗑 删除</button>
          </div>
        </div>
      `;
      openModal(html);
      document.getElementById('dlClose').onclick = closeModal;
      document.getElementById('dlFav').onclick = () => { Core.toggleFav(q.id); closeModal(); openDetail(Core.state.db.find(x=>x.id===q.id)); };
      document.getElementById('dlEdit').onclick = () => { closeModal(); route('input', q.id); };
      document.getElementById('dlDel').onclick = () => {
        openModal(`
          <div style="padding:10px 14px;">
            <div style="font-size:15px;font-weight:600;margin-bottom:10px;">🗑 确认删除？</div>
            <div style="color:#888;font-size:13px;margin-bottom:14px;">该错题将从题库中永久移除，无法恢复。</div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <button class="btn btn-ghost" id="cdlCancel">取消</button>
              <button class="btn" id="cdlConfirm" style="background:#e53935;color:#fff;">🗑 确定删除</button>
            </div>
          </div>
        `);
        document.getElementById('cdlCancel').onclick = closeModal;
        document.getElementById('cdlConfirm').onclick = () => { Core.delQ(q.id); closeModal(); render(); Core.toast('已删除'); };
      };
    }

    [fSubject, fDifficulty, fStatus, fSearch].forEach(el => el.addEventListener('input', render));
    fSearch.addEventListener('search', render);
    render();
  }

  function bindReview() {
    const Core = window.Core;
    let idx = 0;
    let showAnswer = false;
    let masterShown = false;

    function buildList() {
      const subj = document.getElementById('rvSubject').value;
      const scope = document.getElementById('rvScope').value;
      const order = document.getElementById('rvOrder').value;
      let list = Core.state.db.filter(q => {
        if (subj && subj !== '全部科目' && q.subject !== subj) return false;
        if (scope === 'todo' && q.mastered) return false;
        if (scope === 'fav' && !q.favorite) return false;
        return true;
      });
      if (order === 'random') {
        for (let i = list.length-1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i+1));
          [list[i], list[j]] = [list[j], list[i]];
        }
      }
      return list;
    }

    let list = buildList();
    const card = document.getElementById('rvCard');

    function show() {
      if (list.length === 0) {
        card.innerHTML = '<div class="empty"><div class="ee">🎉</div>没有需要复习的题啦</div>';
        return;
      }
      const q = list[idx];
      const imgTag = (q.images && q.images.length > 0) ? `
        <div style="margin-top:8px;">
          ${q.images.map(src => `<img src="${src}" style="max-width:100%;border:1px solid #eee;border-radius:6px;">`).join('')}
        </div>` : '';
      card.innerHTML = `
        <div class="q-card">
          <div class="q-head">
            <span class="subj">${escapeHtml(q.subject)}</span>
            <span class="diff">${'★'.repeat(q.difficulty)}</span>
            <span style="margin-left:auto;font-size:12px;color:#888;">${idx+1}/${list.length}</span>
          </div>
          <div class="q-question" style="font-size:15px;">${escapeHtml(q.question)}</div>
          ${imgTag}
          <div class="q-tags">${(q.tags || []).map(t => `<span class="tag"># ${escapeHtml(t)}</span>`).join('')}</div>
          ${showAnswer ? `
            <div style="margin-top:12px;">
              <div style="color:#f57c00;">❌ 我的答案：${escapeHtml(q.wrongAnswer)}</div>
              <div style="color:#43a047;margin-top:6px;">✅ 正确答案：${escapeHtml(q.rightAnswer)}</div>
              <div style="color:#555;margin-top:6px;">💡 原因：${escapeHtml(q.reason)}</div>
            </div>` : `
            <div style="margin-top:12px;text-align:center;color:#888;f-size:12px;">👁 点"显示答案"查看</div>
          `}
        </div>
      `;
    }

    document.getElementById('rvNext').onclick = () => {
      if (idx < list.length - 1) idx++;
      else { Core.toast('已经最后一题了'); return; }
      showAnswer = false; show();
    };
    document.getElementById('rvPrev').onclick = () => {
      if (idx > 0) idx--;
      else { Core.toast('这是第一题'); return; }
      showAnswer = false; show();
    };
    document.getElementById('rvShow').onclick = () => { showAnswer = !showAnswer; show(); };
    document.getElementById('rvMaster').onclick = () => {
      const q = list[idx];
      Core.markMastered(q.id);
      Core.toast('✅ 已标记掌握');
      list = buildList();
      if (idx >= list.length) idx = Math.max(0, list.length - 1);
      showAnswer = false; show();
    };
    document.getElementById('rvAgain').onclick = () => {
      const q = list[idx];
      Core.markReviewLater(q.id);
      Core.toast('🔁 再练一次');
      showAnswer = false; show();
    };
    ['rvSubject','rvScope','rvOrder'].forEach(id => document.getElementById(id).onchange = () => {
      list = buildList(); idx = 0; showAnswer = false; show();
    });
    document.getElementById('rvReset').onclick = () => {
      list = buildList(); idx = 0; showAnswer = false; show();
      Core.toast('重来');
    };

    show();
  }

  function bindStats() {
    // Pie chart
    const svg = document.getElementById('pieSvg');
    if (svg) {
      const { state } = window.Core;
      const s = window.Core.getStats();
      const colors = ['#1976d2','#43a047','#f57c00','#e53935','#8e24aa','#039be5','#6d4c41','#546e7a'];
      const subjectEntries = Object.entries(s.subjectCount);
      const total = subjectEntries.reduce((a, [,v]) => a + v, 0) || 1;
      let cx = 80, cy = 80, r = 72, angle = -90;
      let html = '';
      if (subjectEntries.length === 0) {
        html = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eee"/><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#888" font-size="13">暂无</text>`;
      } else if (subjectEntries.length === 1) {
        html = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors[0]}"/>`;
      } else {
        subjectEntries.forEach(([k, v], i) => {
          const seg = v / total * 360;
          const a2 = angle + seg;
          const r1 = r * Math.cos(angle*Math.PI/180), a1 = r * Math.sin(angle*Math.PI/180);
          const r2 = r * Math.cos(a2*Math.PI/180), a2y = r * Math.sin(a2*Math.PI/180);
          const path = `M${cx},${cy} L${cx+r1},${cy+a1} A${r},${r} 0 ${seg > 180 ? 1 : 0} 1 ${cx+r2},${cy+a2y} Z`;
          html += `<path d="${path}" fill="${colors[i%colors.length]}"></path>`;
          angle = a2;
        });
      }
      svg.innerHTML = html;
    }
  }

  function showPaperMaker() {
    const { state } = window.Core;
    const subjects = [...new Set(state.db.map(q => q.subject))];
    const selected = {};
    const db = state.db;
    subjects.forEach(s => selected[s] = true);
    const html = `
      <div style="padding:14px 16px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:10px;">📚 组卷</div>
        <div style="font-size:13px;color:#888;margin-bottom:10px;">选择要出卷的科目</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <button class="btn btn-ghost btn-sm" id="pmAll">全选</button>
          <button class="btn btn-ghost btn-sm" id="pmNone">全不选</button>
        </div>
        <div id="pmSubjList" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        <div style="margin-top:14px;">
          <label style="font-size:13px;color:#555;">只导出：</label>
          <div style="display:flex;gap:10px;margin-top:8px;font-size:13px;">
            <label><input type="radio" name="pmScope" value="all" checked> 全部错题</label>
            <label><input type="radio" name="pmScope" value="todo"> 仅待复习</label>
            <label><input type="radio" name="pmScope" value="fav"> 仅收藏</label>
          </div>
        </div>
        <div style="margin-top:14px;display:grid;gap:10px;">
          <button class="btn btn-primary" id="pmGen">📄 下载 HTML 试卷（推荐）</button>
          <button class="btn btn-ghost" id="pmTxt">📝 下载 TXT 文本卷</button>
          <button class="btn btn-ghost" id="pmPrint">🖨 在新窗口打开 / 打印</button>
          <button class="btn btn-ghost" id="pmCancel">取消</button>
        </div>
        <div id="pmInfo" style="margin-top:10px;font-size:12px;color:#888;"></div>
      </div>
    `;
    openModal(html);
    const subjList = document.getElementById('pmSubjList');
    function renderSubj() {
      subjList.innerHTML = subjects.map(s => `
        <label class="pm-chip ${selected[s]?'on':''}">
          <input type="checkbox" data-s="${s}" ${selected[s]?'checked':''} style="display:none;">
          ${s}
        </label>
      `).join('');
      subjList.querySelectorAll('input').forEach(cb => cb.onchange = () => {
        selected[cb.dataset.s] = cb.checked;
        renderSubj(); updateInfo();
      });
    }
    renderSubj();
    document.getElementById('pmAll').onclick = () => { subjects.forEach(s => selected[s] = true); renderSubj(); updateInfo(); };
    document.getElementById('pmNone').onclick = () => { subjects.forEach(s => selected[s] = false); renderSubj(); updateInfo(); };
    function getList() {
      let l = db.filter(q => selected[q.subject]);
      const scope = document.querySelector('input[name=pmScope]:checked')?.value || 'all';
      if (scope === 'todo') l = l.filter(q => !q.mastered && q.nextReviewAt !== null);
      if (scope === 'fav') l = l.filter(q => q.favorite);
      return l;
    }
    function updateInfo() {
      document.getElementById('pmInfo').textContent = `将出卷 ${getList().length} 道错题`;
    }
    updateInfo();

    document.getElementById('pmGen').onclick = () => {
      const list = getList();
      if (list.length === 0) { toast('没有选中任何题'); return; }
      Core.exportPaper(list, '错题卷');
      toast('下载开始...');
      closeModal();
    };
    document.getElementById('pmTxt').onclick = () => {
      const list = getList();
      if (list.length === 0) { toast('没有选中任何题'); return; }
      Core.exportPaperTxt(list, '错题卷');
      toast('TXT下载开始...');
      closeModal();
    };
    document.getElementById('pmPrint').onclick = () => {
      const list = getList();
      if (list.length === 0) { toast('没有选中任何题'); return; }
      Core.exportPrint(list, '错题卷');
      toast('已在新窗口打开，Ctrl+P 打印');
      closeModal();
    };
    document.getElementById('pmCancel').onclick = closeModal;
  }

  function showSettings() {
    const { state } = window.Core;
    const html = `
      <div style="padding:14px 16px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:10px;">⚙️ 设置</div>

        <div class="s-row">
          <span>主题</span>
          <div>
            <button class="btn btn-ghost btn-sm" id="stTheme">🌓 切换（当前：${state.settings.theme === 'dark' ? '深色' : '浅色'}）</button>
          </div>
        </div>

        <div class="s-row">
          <span>字号</span>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm" id="stFontS">A-</button>
            <button class="btn btn-ghost btn-sm" id="stFontM">A</button>
            <button class="btn btn-ghost btn-sm" id="stFontL">A+</button>
          </div>
        </div>

        <div class="s-row">
          <span>掌握阈值</span>
          <div>
            <input type="number" id="stThr" min="1" max="10" value="${state.settings.masterThreshold}" style="width:50px;padding:6px;border:1px solid #ddd;border-radius:6px;">
            <span style="margin-left:8px;font-size:12px;color:#888;">连续答对多少题算掌握</span>
          </div>
        </div>

        <div class="s-row">
          <span>艾宾浩斯周期</span>
          <div style="font-size:12px;color:#888;">
            ${state.settings.ebbinghaus.join(' → ')} 天
          </div>
        </div>

        <hr style="margin:12px 0;border:none;border-top:1px solid #eee;">

        <div class="s-row">
          <span>📦 数据备份</span>
          <button class="btn btn-ghost btn-sm" id="stBak">下载 JSON</button>
        </div>
        <div class="s-row">
          <span>📥 导入备份</span>
          <button class="btn btn-ghost btn-sm" id="stImp">选择 JSON</button>
          <input type="file" id="bkImport" accept="application/json" style="display:none;">
        </div>
        <div class="s-row">
          <span>⚠️ 清空全部错题</span>
          <button class="btn" id="stClear" style="background:#e53935;color:#fff;">🗑 清空</button>
        </div>

        <div style="margin-top:14px;text-align:right;">
          <button class="btn btn-ghost" id="stClose">关闭</button>
        </div>
      </div>
    `;
    openModal(html);
    document.getElementById('stTheme').onclick = () => {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      Core.saveSettings(state.settings); Core.applyTheme(); showSettings();
    };
    ['stFontS','stFontM','stFontL'].forEach(id => {
      document.getElementById(id).onclick = () => {
        const map = { stFontS:'s', stFontM:'m', stFontL:'l' };
        state.settings.font = map[id];
        Core.saveSettings(state.settings); Core.applyTheme(); showSettings();
      };
    });
    const thr = document.getElementById('stThr');
    thr.onchange = () => {
      const v = Math.max(1, Math.min(10, +thr.value || 3));
      state.settings.masterThreshold = v;
      Core.saveSettings(state.settings); toast('已保存');
    };
    document.getElementById('stBak').onclick = () => { Core.backupData(); toast('备份开始下载...'); };
    document.getElementById('stImp').onclick = () => document.getElementById('bkImport').click();
    const bkImp = document.getElementById('bkImport');
    bkImp.onchange = async () => {
      try {
        await Core.importData(bkImp.files[0]);
        toast('✅ 导入成功');
        closeModal();
      } catch (e) { toast('导入失败：' + e.message, 3000); }
    };
    document.getElementById('stClear').onclick = () => {
      openModal(`
        <div style="padding:14px 16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:8px;">⚠️ 确定清空全部错题？</div>
          <div style="color:#f57c00;font-size:13px;margin-bottom:12px;">此操作不可恢复！建议先下载"数据备份"。</div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-ghost" id="scCancel">取消</button>
            <button class="btn" id="scOk" style="background:#e53935;color:#fff;">🗑 全部清空</button>
          </div>
        </div>
      `);
      document.getElementById('scCancel').onclick = showSettings;
      document.getElementById('scOk').onclick = () => { Core.clearAll(); closeModal(); route('home'); toast('已清空'); };
    };
    document.getElementById('stClose').onclick = closeModal;
  }

  // ---- 视图注册 ----
  register('home', home);
  register('input', input);
  register('list', list);
  register('review', review);
  register('stats', stats);

  // 页面切换入口
  function route(name, extra) {
    const main = document.getElementById('mainView');
    main.innerHTML = views[name] ? views[name]() : '';
    document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    if (name === 'home') bindHome();
    else if (name === 'input') bindInput();
    else if (name === 'list') bindList();
    else if (name === 'review') bindReview();
    else if (name === 'stats') bindStats();
    window.Core._current = name;
  }

  function bindHome() {
    document.querySelectorAll('#goReview').forEach(b => b.onclick = () => route('review'));
    document.querySelectorAll('.recent-q').forEach(el => {
      el.onclick = () => {
        const id = +el.dataset.id;
        const q = window.Core.state.db.find(x => x.id === id);
        if (q) route('input', q.id);
      };
    });
    document.querySelectorAll('.quick-item').forEach(el => {
      el.onclick = () => {
        const act = el.dataset.act;
        if (act === 'export') showPaperMaker();
        else if (act === 'backup') window.Core.backupData();
        else if (act === 'settings') showSettings();
        else if (act === 'import') showSettings();
        else { const t = el.dataset.target; if (t) route(t); }
      };
    });
  }

  // 顶部按钮
  function bindTop() {
    const Core = window.Core;
    document.getElementById('toggleTheme').onclick = () => {
      Core.state.settings.theme = Core.state.settings.theme === 'dark' ? 'light' : 'dark';
      Core.saveSettings(Core.state.settings); Core.applyTheme();
    };
    document.getElementById('toggleFont').onclick = () => {
      const cur = Core.state.settings.font;
      Core.state.settings.font = cur === 's' ? 'm' : cur === 'm' ? 'l' : cur === 'l' ? 's' : 'm';
      Core.saveSettings(Core.state.settings); Core.applyTheme();
      Core.toast('字号：' + ({s:'小',m:'中',l:'大'}[Core.state.settings.font]));
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.Core.applyTheme();
    bindTop();
    route('home');
  });

  register('input', input);
  register('home', home);
})();

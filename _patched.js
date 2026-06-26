
/* ============================================================
   5 大页面视图（模块注册）
   ============================================================ */
(function () {
  const views = {};
  function register(name, fn) { views[name] = fn; }

  function home() {
    const { state, getStats, getTodayReview } = window.Core;
    const s = getStats();
    const today = getTodayReview();
    const quicks = [
      { icon: '✏️', label: '录入错题', view: 'input' },
      { icon: '🔁', label: '开始刷题', view: 'review' },
      { icon: '📊', label: '数据报表', view: 'stats' },
      { icon: '🖨️', label: '导出打印', action: () => window.Core.exportPrint(state.db, '全部错题') }
    ];
    let html = '';

    html += `<div class="card"><div class="card-title">错题总览</div>
      <div class="stat-grid">
        <div class="stat-cell"><div class="stat-num">${s.total}</div><div class="stat-label">总错题</div></div>
        <div class="stat-cell"><div class="stat-num">${s.toReview}</div><div class="stat-label">待复习</div></div>
        <div class="stat-cell"><div class="stat-num">${s.mastered}</div><div class="stat-label">已掌握</div></div>
        <div class="stat-cell"><div class="stat-num">${s.favorites}</div><div class="stat-label">收藏</div></div>
      </div></div>`;

    html += `<div class="card"><div class="card-title">快捷入口</div>
      <div class="quick-btns">
        ${quicks.map(q => `<div class="quick-item" data-act="${q.action ? 'export' : 'nav'}" data-target="${q.action ? '' : q.view}"><div class="qi">${q.icon}</div><div class="qt">${q.label}</div></div>`).join('')}
      </div></div>`;

    html += `<div class="card"><div class="card-title">今日复习清单 · ${today.length}题</div>
      <div class="today-list">
        ${today.length === 0
          ? '<div class="empty"><div class="ee">🎉</div>今日暂无复习任务</div>'
          : today.map((q, i) => `<div class="tl"><div class="tl-title">${i+1}. ${q.subject} · ${escapeHtml(q.question.slice(0, 30))}${q.question.length>30?'...':''}</div><div style="font-size:12px;color:#666;">答错 ${q.wrongCount} 次 · 难度 ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</div></div>`).join('')}
      </div>
      ${today.length > 0 ? '<button class="btn btn-primary btn-block" data-nav="review" style="margin-top:10px;">开始今日刷题</button>' : ''}
    </div>`;

    return html;
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
        <textarea id="inpQuestion" placeholder="请粘贴或拍照识别题干..." maxlength="600"></textarea>
        <div class="f-row" style="margin-top:8px;">
          <button class="btn btn-ghost btn-sm" id="inpOcr">📷 拍照识别</button>
          <button class="btn btn-ghost btn-sm" id="inpGallery">📁 相册选图</button>
          <input type="file" id="inpOcrFile" accept="image/*" capture="environment" style="display:none;" />
          <input type="file" id="inpGalleryFile" accept="image/*" style="display:none;" />
        </div>
      </div>

      <div class="f-group">
        <label class="f-label">图片（可选，可多张）</label>
        <div id="inpPics" class="pic-list"></div>
        <label class="upload-box" id="inpPicBox">
          <span class="uu">＋</span>
          <span>加图片</span>
          <input type="file" id="inpPicInput" accept="image/*" multiple style="display:none;" />
        </label>
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
    <div class="review-btns">
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

    const listCount = Object.entries(state.settings).length;

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
      <div class="card-title">近 4 周新增趋势</div>
      <div class="progress-box">
        ${s.weeks.map((v, i) => `
          <div class="progress-title">第${i+1}周：${v} 题</div>
          <div class="progress-track"><div class="progress-fill" style="width:${(v/weekMax*100).toFixed(0)}%"></div></div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">数据操作</div>
      <div class="f-row" style="flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" id="bkExport">💾 备份数据</button>
        <label class="btn btn-ghost btn-sm" style="display:inline-flex;">
          📥 导入数据<input type="file" id="bkImport" accept="application/json" style="display:none;">
        </label>
        <button class="btn btn-sm" id="bkPaper">📝 错题组卷</button>
        <button class="btn btn-ghost btn-sm" id="bkPrintAll">🖨 打印全部</button>
        <button class="btn btn-danger btn-sm" id="bkClear">⚠ 清空错题</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">复习周期（艾宾浩斯）</div>
      <div class="progress-title">当前周期：${state.settings.ebbinghaus.join('天、')}天</div>
      <div class="days-list" id="ebbinghausList">
        ${[1,2,4,7,15,30].map(d => `<div class="d ${state.settings.ebbinghaus.includes(d)?'on':''}" data-d="${d}">${d}天</div>`).join('')}
      </div>
      <div class="f-group" style="margin-top:14px;">
        <label class="f-label">掌握阈值（连续答对 N 次标记已掌握）</label>
        <input type="number" id="thresholdInput" min="1" max="10" value="${state.settings.masterThreshold}" />
      </div>
      <button class="btn btn-primary btn-block" id="saveSettings">保存设置</button>
    </div>
    `;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // 绘制饼图
  function drawPie(container, legendEl) {
    const { getStats } = window.Core;
    const s = getStats();
    const entries = Object.entries(s.subjectCount);
    const total = entries.reduce((a, [,v]) => a + v, 0) || 1;
    const colors = ['#1976d2','#43a047','#f57c00','#e53935','#8e24aa','#039be5','#6d4c41','#546e7a'];
    const cx = 80, cy = 80, r = 70;
    let cumulative = 0;
    let svg = '';
    if (entries.length === 0) {
      svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e0e0e0"/>`;
    } else if (entries.length === 1) {
      svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors[0]}"/>`;
    } else {
      entries.forEach(([name, v], i) => {
        const start = (cumulative / total) * 2 * Math.PI - Math.PI/2;
        cumulative += v;
        const end = (cumulative / total) * 2 * Math.PI - Math.PI/2;
        const large = (end - start) > Math.PI ? 1 : 0;
        const x1 = cx + r * Math.cos(start);
        const y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end);
        const y2 = cy + r * Math.sin(end);
        svg += `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i%colors.length]}" stroke="#fff" stroke-width="2" />`;
      });
    }
    container.innerHTML = svg;
  }

  // 组卷
  function showPaperMaker() {
    const { state, exportPaper, exportPaperTxt, toast } = window.Core;
    const subjects = [...new Set(state.db.map(q => q.subject))];
    const subjOpts = subjects.map(function(s){ return '<option>' + s + '</option>'; }).join('');
    var pmList = '<div style="padding:16px;">' +
      '<h3 style="margin-bottom:12px;font-size:16px;">Error Set</h3>' +
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
      '<select id="pmSubject" style="flex:1;min-width:100px;"><option value="">All</option>' + subjOpts + '</select>' +
      '<button class="btn btn-ghost btn-sm" id="pmCheckAll">Select All</button>' +
      '<button class="btn btn-ghost btn-sm" id="pmUncheck">Clear</button></div>' +
      '<div id="pmList" style="max-height:40vh;overflow-y:auto;border:1px solid #eee;border-radius:10px;"></div>' +
      '<div style="margin-top:10px;font-size:12px;color:#888;">Selected: <span id="pmCount">0</span></div>' +
      '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">' +
      '<button class="btn btn-ghost" id="pmCancel" style="flex:1;min-width:70px;">Cancel</button>' +
      '<button class="btn" id="pmGen" style="flex:1;min-width:90px;background:#1976d2;color:#fff;">HTML</button>' +
      '<button class="btn btn-ghost" id="pmTxt" style="flex:1;min-width:70px;">TXT</button>' +
      '<button class="btn" id="pmPrint" style="flex:1;min-width:90px;background:#43a047;color:#fff;">Print</button></div>' +
      '<div style="font-size:11px;color:#888;margin-top:6px;padding:6px 10px;background:#e3f2fd;border-radius:6px;line-height:1.5;">Mobile: tap HTML/TXT to download file, open in Files app.</div>' +
      '</div>';
    openModal('Error Set', pmList);

    function pmRenderList() {
      var subj = document.getElementById('pmSubject').value;
      var list = state.db.slice();
      if (subj) list = list.filter(function(q){ return q.subject === subj; });
      var listEl = document.getElementById('pmList');
      if (list.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">No items yet.</div>';
      } else {
        listEl.innerHTML = list.map(function(q) {
          var stars = '';
          for (var k=0; k<q.difficulty; k++) stars += '*';
          for (var k=q.difficulty; k<5; k++) stars += '.';
          return '<label style="display:flex;gap:10px;padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;align-items:flex-start;">' +
            '<input type="checkbox" class="p-cb" data-id="' + q.id + '" style="margin-top:2px;" />' +
            '<div style="font-size:13px;flex:1;line-height:1.5;"><div><b style="color:#1976d2;">' + escapeHtml(q.subject) + '</b> diff ' + stars + ' count ' + q.wrongCount + '</div>' +
            '<div style="color:#555;margin-top:2px;">' + escapeHtml(q.question.slice(0, 55)) + (q.question.length > 55 ? '...' : '') + '</div></div></label>';
        }).join('');
      }
      pmUpdateCount();
      listEl.querySelectorAll('.p-cb').forEach(function(cb){ cb.onchange = pmUpdateCount; });
    }

    function pmUpdateCount() {
      var n = document.querySelectorAll('.p-cb:checked').length;
      document.getElementById('pmCount').textContent = n;
    }

    function pmGetSel() {
      var cbs = document.querySelectorAll('.p-cb:checked');
      var ids = [];
      for (var k=0;k<cbs.length;k++) ids.push(+cbs[k].dataset.id);
      if (ids.length === 0) { toast('Please pick at least one'); return null; }
      var subjSel = document.getElementById('pmSubject').value;
      var list = state.db.filter(function(q){ return ids.indexOf(q.id) >= 0; });
      var title = subjSel ? (subjSel + ' Practice') : 'Error Set';
      return { list: list, title: title };
    }

    document.getElementById('pmSubject').onchange = pmRenderList;
    document.getElementById('pmCheckAll').onclick = function() {
      var cbs = document.querySelectorAll('.p-cb');
      for (var k=0;k<cbs.length;k++) cbs[k].checked = true;
      pmUpdateCount();
    };
    document.getElementById('pmUncheck').onclick = function() {
      var cbs = document.querySelectorAll('.p-cb');
      for (var k=0;k<cbs.length;k++) cbs[k].checked = false;
      pmUpdateCount();
    };
    document.getElementById('pmCancel').onclick = closeModal;
    document.getElementById('pmGen').onclick = function() {
      var r = pmGetSel(); if (!r) return;
      exportPaper(r.list, r.title, { print: false });
    };
    document.getElementById('pmTxt').onclick = function() {
      var r = pmGetSel(); if (!r) return;
      exportPaperTxt(r.list, r.title);
    };
    document.getElementById('pmPrint').onclick = function() {
      var r = pmGetSel(); if (!r) return;
      exportPaper(r.list, r.title, { print: true });
    };

    pmRenderList();
  }


  function openModal(title, bodyHtml) {
    const root = document.getElementById('modalRoot');
    root.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-head">
          <h3>${title}</h3>
          <button class="modal-x" id="mxBtn">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>`;
    root.style.display = 'flex';
    document.getElementById('mxBtn').onclick = closeModal;
  }
  function closeModal() {
    document.getElementById('modalRoot').style.display = 'none';
  }

  // 详情
  function showDetail(q) {
    const html = `
      <div style="padding:14px;">
        <div style="margin-bottom:10px;">
          <span class="tag">${escapeHtml(q.subject)}</span>
          <span style="margin-left:8px;font-size:13px;color:#888;">难度 ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)} · 错 ${q.wrongCount} 次</span>
        </div>
        <div style="font-size:15px;line-height:1.7;background:#fff;border-radius:10px;padding:14px;margin-bottom:12px;">
          ${escapeHtml(q.question)}
        </div>
        ${q.images && q.images.length ? `<div style="margin-bottom:12px;">${q.images.map(u => `<img src="${u}" style="width:100%;border-radius:10px;margin-bottom:8px;">`).join('')}</div>` : ''}
        ${q.wrongAnswer ? `<div class="review-wrong">❌ 错误答案：${escapeHtml(q.wrongAnswer)}</div>` : ''}
        ${q.rightAnswer ? `<div class="review-answer-wrap"><div class="review-answer">✅ 正确答案：${escapeHtml(q.rightAnswer)}</div></div>` : ''}
        ${q.reason ? `<div class="review-reason">💡 原因：${escapeHtml(q.reason)}</div>` : ''}
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
          ${(q.tags||[]).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;">
          <button class="btn btn-ghost" id="delBtn">🗑 删除</button>
          <button class="btn btn-ghost" id="favBtn">${q.favorite?'★ 取消收藏':'☆ 收藏'}</button>
          <button class="btn btn-primary" id="editBtn">编辑</button>
        </div>
      </div>
    `;
    openModal(q.subject + ' · 题目详情', html);
    document.getElementById('delBtn').onclick = () => {
      const hh = '<div style="padding:16px;"><div style="font-size:20px;margin-bottom:8px;">🗑 删除错题</div><div style="font-size:14px;color:#666;margin-bottom:4px;">删除后不可恢复，确定继续？</div><div style="background:#fff8e1;padding:10px;border-radius:8px;font-size:13px;color:#555;margin-top:10px;line-height:1.5;"><b style="color:#1976d2;">' + escapeHtml(q.subject) + '</b> ' + escapeHtml(q.question.slice(0, 50)) + (q.question.length > 50 ? '...' : '') + '</div><div style="display:flex;gap:10px;margin-top:16px;"><button class="btn btn-ghost" id="ddC" style="flex:1;">取消</button><button class="btn" id="ddO" style="flex:1;background:#e53935;color:#fff;">🗑 确定删除</button></div></div>';
      openModal('删除确认', hh);
      document.getElementById('ddC').onclick = closeModal;
      document.getElementById('ddO').onclick = () => { Core.delQ(q.id); closeModal(); toast('已删除'); route('list'); };
    };
    document.getElementById('favBtn').onclick = () => {
      window.Core.toggleFav(q.id); showDetail(window.Core.state.db.find(x => x.id === q.id));
    };
    document.getElementById('editBtn').onclick = () => { closeModal(); route('input', q.id); };
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
    document.querySelectorAll('.quick-item').forEach(el => {
      el.onclick = () => {
        const act = el.dataset.act;
        const target = el.dataset.target;
        if (act === 'export') window.Core.exportPrint(window.Core.state.db, '全部错题');
        else route(target);
      };
    });
    const today = document.querySelector('[data-nav="review"]');
    if (today) today.onclick = () => route('review');
  }

  function bindInput() {
    const Core = window.Core;
    let images = [];
    let tags = [];
    let difficulty = 2;
    let editingId = null;

    // 编辑模式
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
        </div>`).join('');
      box.querySelectorAll('.rx').forEach(b => b.onclick = () => { images.splice(+b.dataset.i, 1); renderPics(); });
    }
    function renderTags() {
      const box = document.getElementById('inpTagsBox');
      box.innerHTML = tags.map((t, i) => `<span class="chip del"># ${escapeHtml(t)}<span class="x" data-i="${i}">×</span></span>`).join('');
      box.querySelectorAll('.x').forEach(x => x.onclick = () => { tags.splice(+x.dataset.i, 1); renderTags(); });
    }

    // 难度星
    document.querySelectorAll('#inpStar span').forEach(s => {
      s.onclick = () => {
        difficulty = +s.dataset.n;
        document.querySelectorAll('#inpStar span').forEach(x => x.classList.toggle('on', +x.dataset.n <= difficulty));
      };
    });

    // 标签输入
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

    // 图片上传
    function readImage(file) {
      return new Promise(resolve => {
        const fr = new FileReader();
        fr.onload = e => resolve(e.target.result);
        fr.readAsDataURL(file);
      });
    }
    document.getElementById('inpPicBox').addEventListener('click', e => {
      const input = document.getElementById('inpPicInput');
      input.click();
    });
    document.getElementById('inpPicInput').onchange = async e => {
      for (const f of e.target.files) images.push(await readImage(f));
      renderPics(); e.target.value = '';
    };

    // 拍照识别（摄像头/相册）
    document.getElementById('inpOcr').onclick = async () => {
      openModal('📷 拍照识别', `
        <div style="padding:0;">
          <div style="background:#000;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">
            <video id="cam" autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>
          </div>
          <div style="display:flex;gap:12px;padding:16px;justify-content:center;">
            <button class="btn btn-ghost" id="camCancel">✕ 取消</button>
            <button class="btn btn-primary" id="camCap">📸 拍照</button>
          </div>
          <div style="padding:0 16px 16px;text-align:center;">
            <label class="btn btn-ghost btn-sm" style="display:inline-flex;">
              📁 从相册选<input type="file" id="camFile" accept="image/*" style="display:none;">
            </label>
          </div>
        </div>
      `);
      let stream = null, video = null;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => { stream = s; video = document.getElementById('cam'); if (video) video.srcObject = s; })
        .catch(() => { toast('无法访问摄像头，可改为从相册选择'); document.getElementById('cam')?.parentElement.insertAdjacentHTML('beforeend', '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;">📷 请从相册选</div>'); });
      document.getElementById('camCancel').onclick = () => { stream?.getTracks().forEach(t=>t.stop()); closeModal(); };
      document.getElementById('camCap').onclick = async () => {
        if (video) {
          const c = document.createElement('canvas');
          c.width = video.videoWidth; c.height = video.videoHeight;
          c.getContext('2d').drawImage(video, 0, 0);
          images.push(c.toDataURL('image/jpeg'));
        }
        stream?.getTracks().forEach(t=>t.stop());
        closeModal();
        toast('正在识别...');
        const text = await Core.mockOCR();
        document.getElementById('inpQuestion').value = text;
        renderPics();
      };
      document.getElementById('camFile').onchange = async e => {
        const u = await readImage(e.target.files[0]);
        images.push(u);
        closeModal();
        toast('正在识别...');
        const text = await Core.mockOCR();
        document.getElementById('inpQuestion').value = text;
        renderPics();
      };
    };
    document.getElementById('inpGallery').onclick = async () => {
      const input = document.getElementById('inpGalleryFile');
      input.value = '';
      input.click();
      input.onchange = async () => {
        const u = await readImage(input.files[0]);
        images.push(u);
        toast('正在识别...');
        const text = await Core.mockOCR();
        document.getElementById('inpQuestion').value = text;
        renderPics();
      };
    };

    // 保存
    document.getElementById('inpSave').onclick = () => {
      const q = {
        subject: document.getElementById('inpSubject').value,
        folder: document.getElementById('inpFolder').value.trim(),
        question: document.getElementById('inpQuestion').value.trim(),
        wrongAnswer: document.getElementById('inpWrong').value.trim(),
        rightAnswer: document.getElementById('inpRight').value.trim(),
        reason: document.getElementById('inpReason').value.trim(),
        tags, images, difficulty
      };
      if (!q.question || !q.wrongAnswer) { toast('题干和错误答案必填'); return; }
      let saved;
      if (editingId) { saved = Core.updateQ(editingId, q); }
      else { saved = Core.addQ(q); }
      const firstLine = (saved.question || '').slice(0, 30);
      openModal(editingId ? '✅ 更新成功' : '🎉 保存成功', `
        <div style="text-align:center;padding:10px 16px;">
          <div style="font-size:48px;margin-bottom:8px;">${editingId ? '✏️' : '🎯'}</div>
          <div style="font-weight:600;font-size:16px;margin-bottom:8px;">${editingId ? '错题已更新到题库' : '错题已加入题库'}</div>
          <div style="font-size:13px;color:#888;background:#f5f5f5;padding:10px;border-radius:8px;margin-bottom:14px;line-height:1.5;">
            <b>${escapeHtml(saved.subject)}</b> · 难度 ${'★'.repeat(saved.difficulty)}${'☆'.repeat(5-saved.difficulty)}<br>
            ${escapeHtml(firstLine)}${saved.question.length > 30 ? '...' : ''}
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-ghost" id="saveOk">留在录入</button>
            <button class="btn btn-primary" id="saveGo">去刷题</button>
            <button class="btn btn-primary" id="saveList">题库</button>
          </div>
        </div>
      `);
      document.getElementById('saveOk').onclick = () => { closeModal(); resetAll(); };
      document.getElementById('saveGo').onclick = () => { closeModal(); resetAll(); route('review'); };
      document.getElementById('saveList').onclick = () => { closeModal(); resetAll(); route('list'); };
    };

    document.getElementById('inpReset').onclick = () => { resetAll(); };
    function resetAll() {
      images = []; tags = []; difficulty = 2; editingId = null;
      document.getElementById('inpQuestion').value = '';
      document.getElementById('inpWrong').value = '';
      document.getElementById('inpRight').value = '';
      document.getElementById('inpReason').value = '';
      document.getElementById('inpFolder').value = '';
      document.getElementById('inpSubject').selectedIndex = 0;
      document.querySelectorAll('#inpStar span').forEach((s, i) => s.classList.toggle('on', i < 2));
      renderPics(); renderTags();
    }
  }

  function bindList() {
    const { state } = window.Core;
    const subjectFilter = document.getElementById('fSubject');
    const diffFilter = document.getElementById('fDifficulty');
    const statusFilter = document.getElementById('fStatus');
    const search = document.getElementById('fSearch');
    const body = document.getElementById('listBody');

    function render() {
      let list = [...state.db];
      if (subjectFilter.value) list = list.filter(q => q.subject === subjectFilter.value);
      if (diffFilter.value) list = list.filter(q => q.difficulty === +diffFilter.value);
      if (statusFilter.value === 'fav') list = list.filter(q => q.favorite);
      if (statusFilter.value === 'todo') list = list.filter(q => !q.mastered);
      if (statusFilter.value === 'done') list = list.filter(q => q.mastered);
      if (search.value.trim()) {
        const k = search.value.trim();
        list = list.filter(q =>
          q.question.includes(k) || (q.tags||[]).some(t => t.includes(k)) || q.reason.includes(k)
        );
      }
      if (list.length === 0) { body.innerHTML = '<div class="empty"><div class="ee">📭</div>没有匹配到错题</div>'; return; }
      body.innerHTML = list.map(q => `
        <div class="q-item ${q.favorite?'fav':''} ${q.mastered?'mastered':''}">
          <div class="q-top">
            <span class="q-subject">${escapeHtml(q.subject)}</span>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:12px;color:#888;">${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</span>
              ${q.favorite ? '<span style="color:#ffb300;">★</span>' : ''}
            </div>
          </div>
          <div class="q-body">${escapeHtml(q.question)}</div>
          <div class="q-meta">
            <span>错 ${q.wrongCount} 次</span>
            ${q.folder ? `<span>📂 ${escapeHtml(q.folder)}</span>` : ''}
            ${(q.tags||[]).slice(0,3).map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}
            ${q.mastered ? '<span style="color:#43a047;">✓ 已掌握</span>' : ''}
          </div>
          <div class="q-actions">
            <button class="btn btn-ghost btn-sm" data-act="fav" data-id="${q.id}">${q.favorite?'★':'☆'}</button>
            <button class="btn btn-primary btn-sm" data-act="show" data-id="${q.id}">详情</button>
            <button class="btn btn-ghost btn-sm" data-act="del" data-id="${q.id}" style="color:#e53935;">🗑</button>
          </div>
        </div>
      `).join('');
      body.querySelectorAll('.q-item').forEach(el => el.onclick = (e) => {
        if (e.target.closest('.btn')) return;
        const qq = state.db.find(x => x.id === +el.querySelector('[data-act="show"]')?.dataset.id);
        if (qq) showDetail(qq);
      });
      body.querySelectorAll('[data-act="fav"]').forEach(b => b.onclick = () => { Core.toggleFav(+b.dataset.id); render(); });
      body.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = (e) => {
        e.stopPropagation();
        const id = +b.dataset.id;
        const q = Core.state.db.find(x => x.id === id);
        if (!q) return;
        const dh = '<div style="padding:16px;"><div style="font-size:20px;margin-bottom:8px;">🗑 删除错题</div><div style="font-size:14px;color:#666;margin-bottom:4px;">确定要永久删除吗？</div><div style="background:#fff8e1;padding:10px;border-radius:8px;font-size:13px;color:#555;margin-top:10px;line-height:1.5;"><b style="color:#1976d2;">' + escapeHtml(q.subject) + '</b> ' + escapeHtml(q.question.slice(0, 50)) + (q.question.length > 50 ? '...' : '') + '</div><div style="display:flex;gap:10px;margin-top:16px;"><button class="btn btn-ghost" id="dC" style="flex:1;">取消</button><button class="btn" id="dO" style="flex:1;background:#e53935;color:#fff;">🗑 确定删除</button></div></div>';
        openModal('删除错题', dh);
        document.getElementById('dC').onclick = closeModal;
        document.getElementById('dO').onclick = () => { Core.delQ(id); closeModal(); render(); toast('已删除'); };
      });
    }

    subjectFilter.onchange = diffFilter.onchange = statusFilter.onchange = render;
    search.oninput = render;
    render();
  }

  let rvIdx = 0;
  let rvList = [];
  let rvShowAnswer = false;
  function bindReview() {
    const { state, markMastered, markReviewLater, toast } = window.Core;
    const subjectFilter = document.getElementById('rvSubject');
    const scopeFilter = document.getElementById('rvScope');
    const orderFilter = document.getElementById('rvOrder');

    function buildList() {
      let list = [...state.db];
      if (subjectFilter.value && subjectFilter.value !== '全部科目') {
        list = list.filter(q => q.subject === subjectFilter.value);
      }
      if (scopeFilter.value === 'todo') {
        list = list.filter(q => !q.mastered);
      } else if (scopeFilter.value === 'fav') {
        list = list.filter(q => q.favorite);
      }
      if (orderFilter.value === 'random') {
        list = list.sort(() => Math.random() - 0.5);
      } else {
        list = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
      rvList = list;
      rvIdx = 0;
      rvShowAnswer = false;
    }

    function render() {
      const card = document.getElementById('rvCard');
      if (!card) return;

      if (rvList.length === 0) {
        card.innerHTML = '<div class="empty"><div class="ee">📭</div>此筛选下没有可刷的错题<br><small style="color:#888;">试试切换科目或改选"包含已掌握"</small></div>';
        const showBtn = document.getElementById('rvShow');
        const masterBtn = document.getElementById('rvMaster');
        const againBtn = document.getElementById('rvAgain');
        if (showBtn) showBtn.disabled = true;
        if (masterBtn) masterBtn.disabled = true;
        if (againBtn) againBtn.disabled = true;
        return;
      }

      const q = rvList[rvIdx];
      rvShowAnswer = false;

      const showBtn = document.getElementById('rvShow');
      const masterBtn = document.getElementById('rvMaster');
      const againBtn = document.getElementById('rvAgain');
      if (showBtn) showBtn.disabled = false;
      if (masterBtn) masterBtn.disabled = false;
      if (againBtn) againBtn.disabled = false;

      card.innerHTML = `
        <div class="review-tag s">${escapeHtml(q.subject)}</div>
        <div class="review-tag d">难度 ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</div>
        ${q.folder ? `<div class="review-tag s">📂 ${escapeHtml(q.folder)}</div>` : ''}
        ${q.favorite ? '<span class="review-tag d" style="background:#fff8e1;color:#ff9800;">★ 收藏</span>' : ''}
        ${q.mastered ? '<span class="review-tag s" style="background:#e8f5e9;color:#2e7d32;">✓ 已掌握</span>' : ''}
        <div class="review-q">${escapeHtml(q.question)}</div>
        ${q.images && q.images.length ? q.images.map(u => `<img class="review-pic" src="${u}">`).join('') : ''}
        <div id="rvAnswerBox"></div>
        <div style="margin-top:14px;font-size:13px;color:#888;text-align:center;">
          第 ${rvIdx + 1} / ${rvList.length} 题 · 已错 ${q.wrongCount} 次
        </div>
      `;
    }

    function renderAnswerBox() {
      const box = document.getElementById('rvAnswerBox');
      if (!box) return;
      const q = rvList[rvIdx];
      if (!rvShowAnswer || !q) { box.innerHTML = ''; return; }
      let html = '';
      if (q.wrongAnswer) html += `<div class="review-wrong">❌ 错误答案：${escapeHtml(q.wrongAnswer)}</div>`;
      if (q.rightAnswer) html += `<div class="review-answer-wrap"><div class="review-answer">✅ 正确答案：${escapeHtml(q.rightAnswer)}</div></div>`;
      if (q.reason) html += `<div class="review-reason">💡 原因：${escapeHtml(q.reason)}</div>`;
      if ((q.tags || []).length) html += `<div style="margin-top:10px;font-size:12px;color:#888;">知识点：${q.tags.map(t => '<span class="tag" style="margin-right:4px;">#' + escapeHtml(t) + '</span>').join('')}</div>`;
      box.innerHTML = html;
    }

    subjectFilter.onchange = scopeFilter.onchange = orderFilter.onchange = () => { buildList(); render(); };

    document.getElementById('rvReset').onclick = () => { buildList(); render(); window.Core.toast('已重置刷题顺序'); };
    document.getElementById('rvPrev').onclick = () => { if (rvList.length === 0) return; if (rvIdx > 0) rvIdx--; else rvIdx = rvList.length - 1; render(); };
    document.getElementById('rvNext').onclick = () => { if (rvList.length === 0) return; if (rvIdx < rvList.length - 1) rvIdx++; else { window.Core.toast('已是最后一题，已回到第1题'); rvIdx = 0; } render(); };
    document.getElementById('rvShow').onclick = () => {
      rvShowAnswer = !rvShowAnswer;
      renderAnswerBox();
      if (!rvShowAnswer) {
        const btn = document.getElementById('rvShow');
        if (btn) btn.textContent = '👁 显示/隐藏答案（显示中）';
      } else {
        const btn = document.getElementById('rvShow');
        if (btn) btn.textContent = '👁 显示/隐藏答案（隐藏中）';
      }
    };

    document.getElementById('rvMaster').onclick = () => {
      if (rvList.length === 0) return;
      markMastered(rvList[rvIdx].id);
      window.Core.toast('✅ 已掌握，推进到下一周期');
      rvList.splice(rvIdx, 1);
      if (rvList.length === 0) { render(); return; }
      if (rvIdx >= rvList.length) rvIdx = rvList.length - 1;
      render();
    };

    document.getElementById('rvAgain').onclick = () => {
      if (rvList.length === 0) return;
      markReviewLater(rvList[rvIdx].id);
      window.Core.toast('🔁 再练一次');
      if (rvIdx < rvList.length - 1) rvIdx++; else { rvIdx = 0; }
      render();
    };

    buildList();
    render();
    renderAnswerBox();
  }

  function bindStats() {
    setTimeout(() => {
      const svg = document.getElementById('pieSvg');
      if (svg) drawPie(svg, document.getElementById('pieLegend'));
    }, 10);

    document.getElementById('bkExport').onclick = () => window.Core.backupData();
    const importInput = document.getElementById('bkImport');
    importInput.onchange = async e => {
      if (!e.target.files[0]) return;
      try {
        await window.Core.importData(e.target.files[0]);
        window.Core.toast('导入成功');
      } catch (err) { window.Core.toast('导入失败：' + err.message); }
      e.target.value = '';
    };
    document.getElementById('bkPaper').onclick = showPaperMaker;
    document.getElementById('bkPrintAll').onclick = () => window.Core.exportPrint(window.Core.state.db, '全部错题');
    document.getElementById('bkClear').onclick = () => {
      if (confirm('确定清空全部错题？不可恢复！')) {
        window.Core.clearAll();
        window.Core.toast('已清空'); route('home');
      }
    };

    document.querySelectorAll('#ebbinghausList .d').forEach(el => {
      el.onclick = () => {
        el.classList.toggle('on');
        const days = [...document.querySelectorAll('#ebbinghausList .d.on')].map(n => +n.dataset.d).sort((a,b)=>a-b);
        window.Core.state.settings.ebbinghaus = days.length ? days : [1,2,4,7,15,30];
      };
    });

    document.getElementById('saveSettings').onclick = () => {
      const t = document.getElementById('thresholdInput').value;
      window.Core.state.settings.masterThreshold = Math.max(1, Math.min(10, +t || 3));
      window.Core.saveSettings(window.Core.state.settings);
      window.Core.toast('设置已保存');
      route('stats');
    };
  }

  // 顶部按钮
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toggleTheme').onclick = () => {
      const next = window.Core.state.settings.theme === 'dark' ? 'light' : 'dark';
      window.Core.state.settings.theme = next;
      window.Core.saveSettings(window.Core.state.settings);
      window.Core.applyTheme();
      route(window.Core._current || 'home');
    };
    document.getElementById('toggleFont').onclick = () => {
      const next = window.Core.state.settings.font === 'large' ? 'normal' : 'large';
      window.Core.state.settings.font = next;
      window.Core.saveSettings(window.Core.state.settings);
      window.Core.applyTheme();
    };
    document.querySelectorAll('.tab-item').forEach(t => {
      t.onclick = () => route(t.dataset.view);
    });
    window.Core.applyTheme();
    route('home');
  });

  // 暴露
  window.route = route;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window._route = route;
})();


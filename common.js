const MODULE_CONFIG = window.BIKE_MODULE_CONFIG || {};
const API_BASE = MODULE_CONFIG.apiBase || '/api/bike_api.php';

function resolveApiUrl(action, params = {}) {
  const search = new URLSearchParams({ action, ...params });
  const url = `${API_BASE}?${search.toString()}`;
  return url;
}

async function apiGet(action, params = {}) {
  const response = await fetch(resolveApiUrl(action, params));
  return response.json();
}

async function apiPost(action, payload = {}) {
  const response = await fetch(resolveApiUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

function showMessage(elementId, text, success = true) {
  const node = document.getElementById(elementId);
  if (!node) return;
  node.innerHTML = `<span class="${success ? 'message-success' : 'message-error'}">${text}</span>`;
}

function formatRecord(item) {
  return `
    <div class="record">
      <div class="record-header">
        <div>
          <div><strong>单车：</strong>${item.bike_no}</div>
          <div><strong>借出：</strong>${item.borrow_time}</div>
        </div>
        <div class="badge ${item.return_time ? 'badge-returned' : 'badge-active'}">${item.return_time ? '已归还' : '骑行中'}</div>
      </div>
      <div class="record-grid">
        <div><span class="record-label">归还时间</span><div>${item.return_time || '未归还'}</div></div>
        <div><span class="record-label">骑行时长</span><div>${item.duration !== null ? item.duration + ' 分钟' : '待结算'}</div></div>
      </div>
      ${item.return_time ? '' : `<div class="action-row"><button class="btn btn-primary action-btn" onclick="returnBike(${item.id})">立即还车</button></div>`}
    </div>`;
}

function buildBikeItem(bike) {
  return `
    <div class="bike">
      <div><strong>单车编号：</strong>${bike.bike_no}</div>
      <div><strong>停放点位：</strong>${bike.position}</div>
      <div><span class="tag status-${bike.status}">${bike.status}</span></div>
    </div>`;
}

// Inject a unified header and wrap existing body content into a centered container
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.site-header')) {
    const header = document.createElement('header');
    header.className = 'site-header';
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const pages = [
      { path: 'index.html', label: '功能', icon: '🏠' },
      { path: 'borrow.html', label: '借车', icon: '🚲' },
      { path: 'record.html', label: '记录', icon: '🧾' },
      { path: 'repair.html', label: '报修', icon: '🔧' },
      { path: 'payment.html', label: '支付', icon: '💳' },
    ];
    const navLinks = pages.map(page => {
      const active = page.path === currentFile ? 'active' : '';
      return `<a class="${active}" href="${page.path}"><span class="icon">${page.icon}</span>${page.label}</a>`;
    }).join('');
    header.innerHTML = `
      <div class="container">
        <div class="brand"><a href="index.html">共享单车管理</a></div>
        <nav class="site-nav">${navLinks}</nav>
      </div>`;

    document.body.insertBefore(header, document.body.firstChild);
  }

  if (!document.querySelector('.site-main')) {
    const header = document.querySelector('.site-header');
    const main = document.createElement('main');
    main.className = 'container site-main';
    while (header && header.nextSibling) {
      main.appendChild(header.nextSibling);
    }
    document.body.appendChild(main);
  }
});

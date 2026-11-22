'use strict';
/* ===================== STATE & UTIL ===================== */
const S = { token: null, user: null, m: null, cfg: {}, page: null, params: {}, depth: 0, nav: 0, busy: 0, bl: [], bq: '', bs: 'Semua', fk: [], trip: null, doc: null };
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => (n < 0 ? '-' : '') + 'Rp\u00a0' + Math.abs(Math.round(+n || 0)).toLocaleString('id-ID');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fd = d => d ? (+d.slice(8, 10)) + ' ' + MON[+d.slice(5, 7) - 1] + ' ' + d.slice(0, 4) : '-';
const p2 = n => ('0' + n).slice(-2);
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
const dayDiff = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const N = v => parseFloat(v) || 0;
const STC = { Pending: 'P', Terkonfirmasi: 'T', Berjalan: 'J', Selesai: 'S', Batal: 'X' };
const badge = st => `<span class="badge b-${STC[st] || 'S'}">${esc(st)}</span>`;
const ssGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const ssSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } };
const isAdm = () => S.user && S.user.role !== 'Kru';
const isSA = () => S.user && S.user.role === 'Super Admin';

const IC = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clip: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  back: '<path d="m15 18-6-6 6-6"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', bus: '<path d="M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2s-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>', cog: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>', print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>', check: '<path d="M20 6 9 17l-5-5"/>', db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>', dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  rcpt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2zM8 8h8M8 12h8"/>', chev: '<path d="m9 18 6-6-6-6"/>'
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ===================== RPC, TOAST, SHEET ===================== */
/* ===================== JARINGAN: fetch REST + cache SWR + retry + idempotensi ===================== */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const newReqId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const WRITE = { bookingSave: 1, bookingStatus: 1, payAdd: 1, payDel: 1, bookingDel: 1, tripSave: 1, premiPay: 1, kruViewSave: 1, mSave: 1, mDel: 1, uSave: 1, uReset: 1, cfgSave: 1 };
const SWR = { boot: 1, dash: 1, bookingList: 1, calendar: 1, premiList: 1, tagihan: 1, laporan: 1, mList: 1, uList: 1, kruTrips: 1, kruPremi: 1 };
const SILENT_OK = { home: 1, booking: 1, kalender: 1, premi: 1, tagihan: 1, master: 1, laporan: 1, akun: 1, kjadwal: 1, kpremi: 1 };
const TTL = 60000, MEMC = {}, BG = {};
const cfgOk = () => typeof GAS_URL === 'string' && /^https:\/\/script\.google\.com\/.+\/exec$/.test(GAS_URL);
const Perf = { log: [], rec(a, total, server) { const n = server != null ? total - server : null; this.log.push({ aksi: a, total: Math.round(total), server: server, jaringan: n == null ? null : Math.round(n) }); if (this.log.length > 50) this.log.shift(); if (total > 3000) console.warn('[Perf] lambat:', a, Math.round(total) + ' ms, server ' + server + ' ms'); } };

function busy(d) { S.busy += d; $('#progress').classList.toggle('on', S.busy > 0); }
const ckey = (a, p) => 'sb:v2:' + (S.user ? S.user.uid : '-') + ':' + a + ':' + JSON.stringify(p || {});
function cget(k) { if (MEMC[k]) return MEMC[k]; try { const v = localStorage.getItem(k); if (v) return (MEMC[k] = JSON.parse(v)); } catch (e) { } return null; }
function cput(k, d) { const o = { t: Date.now(), d: d }; MEMC[k] = o; try { const j = JSON.stringify(o); if (j.length < 400000) localStorage.setItem(k, j); } catch (e) { } }
function cclear() { Object.keys(MEMC).forEach(k => delete MEMC[k]); try { Object.keys(localStorage).filter(k => k.indexOf('sb:v2:') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) { } }

/** Satu pintu ke backend. Baca: timeout 25 dtk, retry 3x. Tulis: timeout 90 dtk, retry dengan reqId yang sama (idempoten). */
async function net(action, p, o) {
  o = o || {}; const isW = !!WRITE[action], reqId = isW ? newReqId() : undefined, t0 = performance.now(), tmo = isW ? 90000 : 25000;
  if (!cfgOk()) throw new Error('GAS_URL belum diisi di js/config.js.');
  if (!navigator.onLine) throw new Error('Tidak ada koneksi internet.');
  if (!o.quiet) busy(1);
  try {
    let last;
    for (let i = 0; i < 3; i++) {
      const ac = new AbortController(), tm = setTimeout(() => ac.abort(), tmo);
      try {
        const r = await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, token: S.token, p: p || {}, reqId: reqId }), redirect: 'follow', signal: ac.signal });
        clearTimeout(tm);
        if (r.status >= 500 || r.status === 429) { last = new Error('Server sibuk (' + r.status + ').'); await sleep(700 * (i + 1)); continue; }
        let j; try { j = await r.json(); } catch (e) { throw new Error('Respons server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone".'); }
        Perf.rec(action, performance.now() - t0, j.ms);
        if (j.code === 'AUTH') { logout(true); throw new Error(j.message); }
        if (!j.success) throw new Error(j.message || 'Terjadi kesalahan.');
        return j.data;
      } catch (e) {
        clearTimeout(tm);
        if (e.name === 'AbortError') last = new Error('Waktu habis, jaringan lambat.');
        else if (e instanceof TypeError) last = new Error('Gagal terhubung ke server.');
        else throw e;
        if (i < 2) await sleep(700 * (i + 1));
      }
    }
    throw last || new Error('Gagal.');
  } finally { if (!o.quiet) busy(-1); }
}
/** Baca: SWR (tampilkan cache seketika, segarkan di latar bila basi). Tulis: bersihkan cache setelah sukses. */
async function call(action, p, opt) {
  opt = opt || {}; p = p || {};
  const k = SWR[action] ? ckey(action, p) : null;
  if (k && !opt.fresh) { const c = cget(k); if (c) { if (Date.now() - c.t > TTL) bgRefresh(action, p, k, c, opt); return c.d; } }
  const d = await net(action, p);
  if (k) cput(k, d); else if (WRITE[action]) cclear();
  return d;
}
function bgRefresh(a, p, k, old, opt) {
  if (BG[k]) return; BG[k] = 1; const pg = S.page, ps = JSON.stringify(S.params);
  net(a, p, { quiet: true }).then(d => {
    cput(k, d);
    if (JSON.stringify(d) === JSON.stringify(old.d)) return;
    if (opt.upd) opt.upd(d);
    else if (S.page === pg && JSON.stringify(S.params) === ps && SILENT_OK[pg] && !$('#ov') && !$('.pk:checked')) render(true);
  }).catch(() => { }).then(() => { delete BG[k]; });
}
function netWatch() {
  const f = () => { $('#net').hidden = navigator.onLine; };
  window.addEventListener('online', f); window.addEventListener('offline', f); f();
}

function toast(msg, err) {
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.setAttribute('role', err ? 'alert' : 'status'); t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), err ? 5000 : 2600);
}
async function act(btn, fn) {
  if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = 'Memproses…'; }
  try { return await fn(); } catch (e) { toast(e.message, true); } finally { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; } }
}
function sheet(title, html) {
  closeSheet();
  const el = document.createElement('div'); el.className = 'ov'; el.id = 'ov';
  el.innerHTML = `<div class="sh" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sh-h"><h3>${esc(title)}</h3><button class="ib" aria-label="Tutup" onclick="closeSheet()">${ic('x')}</button></div><div class="sh-b">${html}</div></div>`;
  el.addEventListener('click', e => { if (e.target === el) closeSheet(); });
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
}
function closeSheet() { const o = $('#ov'); if (o) o.remove(); }

/* ===================== FORM HELPERS ===================== */
function fld(id, label, type, val, o) {
  o = o || {}; const rq = o.req ? ' required' : '';
  let inp;
  if (type === 'select') inp = `<select id="${id}"${rq}${o.on ? ` onchange="${o.on}"` : ''}>${(o.opts || []).map(x => { const a = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(a[0])}"${String(a[0]) === String(val) ? ' selected' : ''}>${esc(a[1])}</option>`; }).join('')}</select>`;
  else if (type === 'textarea') inp = `<textarea id="${id}" rows="2">${esc(val)}</textarea>`;
  else inp = `<input id="${id}" type="${type}" value="${esc(val)}"${rq}${type === 'number' ? ' inputmode="decimal" step="any"' : ''}${o.list ? ` list="${o.list}"` : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.on ? ` oninput="${o.on}"` : ''}>`;
  return `<div class="f"><label for="${id}">${esc(label)}${o.req ? ' <i>*</i>' : ''}</label>${inp}<small class="err" id="${id}_e"></small></div>`;
}
const val = id => { const e = document.getElementById(id); return e ? e.value : ''; };
const JENIS = ['Big Bus', 'Medium Bus', 'Mini Bus', 'Elf'];
const batIds = a => String((a && a.kru_batangan) || '').split(',').filter(Boolean);
const batNames = a => batIds(a).map(id => (S.m.kru.find(k => k.id === id) || {}).nama).filter(Boolean).join(', ');
const optArm = () => (S.m.armada || []).filter(a => a.status !== 'Nonaktif').map(a => [a.id, `${a.plat} · ${a.jenis} · ${a.seat} seat${batIds(a).length ? ' · Batangan: ' + batNames(a) : ''}${a.status === 'Servis' ? ' (Servis)' : ''}`]);
function kruMulti(id, label, cur, selfId) {
  const sel = {}, used = {}; batIds({ kru_batangan: cur }).forEach(x => sel[x] = 1);
  (S.m.armada || []).forEach(a => { if (a.id !== selfId) batIds(a).forEach(k => used[k] = a.plat); });
  return `<div class="f"><label>${esc(label)}</label><div class="card" style="padding:6px 10px;max-height:230px;overflow:auto;margin:0">${S.m.kru.filter(k => k.status === 'Aktif' || sel[k.id]).map(k => `<label class="row" style="min-height:44px;font-weight:400;gap:10px;flex-wrap:nowrap"><input type="checkbox" class="kb" value="${k.id}"${sel[k.id] ? ' checked' : ''}${used[k.id] ? ' disabled' : ''}><span>${esc(k.nama)} <small class="muted">${k.posisi}${used[k.id] ? ' · batangan ' + esc(used[k.id]) : ''}</small></span></label>`).join('') || '<div class="muted sm">Belum ada kru.</div>'}</div><small class="muted">Sopir dan kernet tetap bus ini. Otomatis terisi saat booking baru. Satu kru hanya untuk satu bus.</small></div>`;
}
const FORMS = {
  Armada: { t: 'Armada', f: [['plat', 'Plat nomor', 'text', 1], ['jenis', 'Jenis bus', 'select', 1, JENIS], ['seat', 'Jumlah seat', 'number', 1], ['tahun', 'Tahun', 'number'], ['status', 'Status', 'select', 1, ['Aktif', 'Servis', 'Nonaktif']], ['tgl_servis', 'Jadwal servis berikutnya', 'date'], ['tgl_kir', 'KIR berlaku sampai', 'date'], ['tgl_pajak', 'Pajak jatuh tempo', 'date'], ['kru_batangan', 'Kru batangan (opsional)', 'krumulti']] },
  Kru: { t: 'Kru', f: [['nama', 'Nama', 'text', 1], ['posisi', 'Posisi', 'select', 1, ['Sopir', 'Kernet']], ['no_hp', 'No. HP', 'tel'], ['no_sim', 'No. SIM', 'text'], ['tgl_sim', 'SIM berlaku sampai', 'date'], ['status', 'Status', 'select', 1, ['Aktif', 'Nonaktif']]] },
  Pelanggan: { t: 'Pelanggan', f: [['nama', 'Nama', 'text', 1], ['instansi', 'Instansi / grup', 'text'], ['no_hp', 'No. HP', 'tel'], ['alamat', 'Alamat', 'textarea']] },
  Tarif: { t: 'Tarif', f: [['rute', 'Rute', 'text', 1], ['jenis_bus', 'Jenis bus', 'select', 1, JENIS], ['harga', 'Harga sewa (Rp)', 'number', 1]] },
  KomponenBiaya: { t: 'Komponen biaya', f: [['nama', 'Nama', 'text', 1], ['jenis', 'Jenis', 'select', 1, [['solar', 'Solar (liter × harga)'], ['tol', 'Tol'], ['parkir', 'Parkir'], ['lainnya', 'Lainnya']]]] },
  BiayaArmada: { t: 'Biaya armada', f: [['armada_id', 'Armada', 'armada', 1], ['tanggal', 'Tanggal', 'date', 1], ['jenis', 'Jenis', 'select', 1, [['servis', 'Servis'], ['pajak', 'Pajak'], ['KIR', 'KIR'], ['lainnya', 'Lainnya']]], ['jumlah', 'Jumlah (Rp)', 'number', 1], ['keterangan', 'Keterangan', 'text']] },
  KomponenPremi: { t: 'Komponen premi', f: [['nama', 'Nama', 'text', 1], ['jenis_nilai', 'Jenis nilai', 'select', 1, [['persen', 'Persen dari dasar premi'], ['nominal', 'Nominal tetap'], ['nominal_hari', 'Nominal × jumlah hari']]], ['nilai_default_sopir', 'Nilai default sopir', 'number'], ['nilai_default_kernet', 'Nilai default kernet', 'number'], ['status', 'Status', 'select', 1, ['Aktif', 'Nonaktif']]] }
};
const BOOTKEY = { Armada: 'armada', Kru: 'kru', Pelanggan: 'pelanggan', Tarif: 'tarif', KomponenBiaya: 'komBiaya', KomponenPremi: 'komPremi' };
S.done = null;
function openForm(table, id, done) {
  const F = FORMS[table], rec = id ? ((S.m[BOOTKEY[table]] || S.list || []).find(r => r.id === id) || {}) : {};
  if (!id && table === 'Armada') { rec.status = 'Aktif'; } if (!id && table === 'Kru') rec.status = 'Aktif'; if (!id && table === 'KomponenPremi') rec.status = 'Aktif'; if (!id && table === 'BiayaArmada') rec.tanggal = todayStr();
  S.done = done || null;
  const h = F.f.map(x => x[2] === 'krumulti' ? kruMulti('f_' + x[0], x[1], rec[x[0]], id) : fld('f_' + x[0], x[1], x[2] === 'armada' ? 'select' : x[2], rec[x[0]] == null ? '' : rec[x[0]], { req: x[3], opts: x[2] === 'armada' ? optArm() : x[4] })).join('') +
    `<div class="row"><button class="btn primary grow" onclick="saveForm('${table}','${id || ''}',this)">Simpan</button>${id && isSA() ? `<button class="btn danger" onclick="delRec('${table}','${id}',this)">${ic('trash')} Hapus</button>` : ''}</div>`;
  sheet((id ? 'Ubah ' : 'Tambah ') + F.t, h);
}
function saveForm(table, id, btn) {
  const F = FORMS[table], rec = { id: id || '' }; let bad = false;
  F.f.forEach(x => { if (x[2] === 'krumulti') { rec[x[0]] = $$('.kb:checked').map(c => c.value).join(','); return; } const v = val('f_' + x[0]); rec[x[0]] = v; const e = $('#f_' + x[0] + '_e'); if (e) e.textContent = ''; if (x[3] && (v === '' || v == null)) { if (e) e.textContent = 'Wajib diisi'; bad = true; } });
  if (bad) return;
  act(btn, async () => {
    const saved = await call('mSave', { table: table, rec: rec });
    closeSheet(); toast('Tersimpan'); await refreshBoot();
    if (S.done) { const d = S.done; S.done = null; d(saved); } else rerender();
  });
}
function delRec(table, id, btn) {
  if (!confirm('Hapus data ini? Super Admin bisa memulihkannya dari menu Terhapus.')) return;
  act(btn, async () => { await call('mDel', { table: table, id: id }); closeSheet(); toast('Dihapus'); await refreshBoot(); rerender(); });
}
function applyBoot(d) { S.m = d; S.cfg = d.cfg || {}; updateBell(); }
async function refreshBoot() { applyBoot(await call('boot', {}, { fresh: true })); }

/* ===================== TEMA ===================== */
function setTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('sb_theme', t); } catch (e) { } const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#08120e' : '#0e8352'; }
function toggleTheme() { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); if (S.token) setHead(S.title, S.back); }
function initTheme() { let t = null; try { t = localStorage.getItem('sb_theme'); } catch (e) { } if (!t) t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; setTheme(t); }

/* ===================== AUTH & SHELL ===================== */
function togglePw(btn) { const i = $('#lp'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; btn.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password'); }
async function doLogin(e) {
  e.preventDefault(); const b = $('#lbtn'), er = $('#lerr'); er.hidden = true; b.disabled = true; b.textContent = 'Memproses…';
  try {
    const d = await net('login', { username: $('#lu').value, password: $('#lp').value });   // login = token + data layar pertama (1 panggilan)
    S.token = d.token; S.user = d.user; ssSet('sb_t', S.token); ssSet('sb_u', JSON.stringify(S.user)); $('#lp').value = '';
    cclear(); applyBoot(d.boot); cput(ckey('boot', {}), d.boot); start();
  } catch (x) { er.textContent = x.message; er.hidden = false; }
  finally { b.disabled = false; b.textContent = 'Masuk'; }
}
function logout(expired) {
  S.token = null; S.user = null; S.m = null; ssSet('sb_t', null); ssSet('sb_u', null); cclear(); closeSheet();
  history.replaceState(null, '', location.pathname + location.search);
  $('#app').hidden = true; $('#login').hidden = false; if (expired) toast('Sesi berakhir, silakan login ulang.', true);
}
const NAV_ADM = [['home', 'Beranda', 'home'], ['booking', 'Booking', 'clip'], ['kalender', 'Kalender', 'cal'], ['premi', 'Premi', 'wallet'], ['more', 'Lainnya', 'menu']];
const NAV_KR = [['kjadwal', 'Jadwal', 'cal'], ['kpremi', 'Premi', 'wallet'], ['kmore', 'Akun', 'user']];
const TABOF = { bform: 'booking', bdetail: 'booking', tagihan: 'more', master: 'more', laporan: 'more', akun: 'more', setting: 'more', log: 'more' };
const TITLE = { home: 'Beranda', booking: 'Booking', bform: 'Booking', bdetail: 'Detail Booking', kalender: 'Kalender Armada', premi: 'Premi Kru', more: 'Lainnya', tagihan: 'Tagihan', master: 'Master Data', laporan: 'Laba-Rugi per Bus', akun: 'Akun', setting: 'Pengaturan', log: 'Log Aktivitas', kjadwal: 'Jadwal Saya', kpremi: 'Premi Saya', kmore: 'Akun' };
function start() {
  $('#login').hidden = true; $('#app').hidden = false;
  const nav = isAdm() ? NAV_ADM : NAV_KR;
  $('#bnav').innerHTML = nav.map(n => `<button data-p="${n[0]}" onclick="tab('${n[0]}')" aria-label="${n[1]}">${ic(n[2])}<span>${n[1]}</span></button>`).join('');
  const extra = isAdm() ? [['tagihan', 'Tagihan', 'rcpt'], ['master', 'Master Data', 'db'], ['laporan', 'Laba-Rugi', 'chart'], ['akun', 'Akun', 'users']].concat(isSA() ? [['setting', 'Pengaturan', 'cog'], ['log', 'Log Aktivitas', 'file']] : []) : [];
  $('#side').innerHTML = `<div class="brand"><span class="bt">${ic('bus')}</span><span><b>${esc(S.cfg.APP_NAME || 'SiBus')}</b><small>${isAdm() ? 'Booking & Armada' : 'Portal Kru'}</small></span></div>` +
    nav.filter(n => n[0] !== 'more' && n[0] !== 'kmore').concat(extra).map(n => `<button data-p="${n[0]}" onclick="tab('${n[0]}')">${ic(n[2])}${n[1]}</button>`).join('') +
    `<div class="grow"></div><div class="ucard"><span class="av">${esc((S.user.nama || '?').charAt(0).toUpperCase())}</span><span class="ui"><b>${esc(S.user.nama)}</b><small>${esc(S.user.role)}</small></span><button class="ib" aria-label="Keluar" onclick="logout()">${ic('out')}</button></div>`;
  S.depth = 0;
  if (!parseHash().pg) location.replace(hashOf(isAdm() ? 'home' : 'kjadwal', {})); else onRoute();
}
function updateBell() { const d = $('#bellDot'); if (d) { const n = (S.m && S.m.rem || []).length; d.textContent = n; d.hidden = !n; } }
function setHead(title, back) {
  S.title = title; S.back = back;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  $('#top').innerHTML = (back ? `<button class="ib" aria-label="Kembali" onclick="goBack()">${ic('back')}</button>` : '') + `<h2>${esc(title)}</h2>` +
    (isAdm() ? `<button class="ib" aria-label="Pengingat" onclick="showRem()">${ic('bell')}<span class="dot" id="bellDot" hidden></span></button>` : '') +
    `<button class="ib" aria-label="Ganti tema" onclick="toggleTheme()">${ic(dark ? 'sun' : 'moon')}</button>`;
  updateBell();
}
function markNav(p) { const t = TABOF[p] || p; $$('#bnav button,#side button').forEach(b => b.classList.toggle('on', b.dataset.p === t || (b.dataset.p === p))); }
/* ===================== ROUTER HASH  #/halaman?param=nilai  (tombol Back Android berfungsi) ===================== */
const KR_PAGES = { kjadwal: 1, kpremi: 1, kmore: 1 };
const BACKP = { bform: 1, bdetail: 1, tagihan: 1, master: 1, laporan: 1, akun: 1, setting: 1, log: 1 };
function parseHash() {
  const h = location.hash.replace(/^#\/?/, ''), i = h.indexOf('?'), pg = i < 0 ? h : h.slice(0, i), p = {};
  new URLSearchParams(i < 0 ? '' : h.slice(i + 1)).forEach((v, k) => p[k] = v);
  return { pg: pg, p: p };
}
function hashOf(pg, p) {
  const q = new URLSearchParams(); Object.keys(p || {}).forEach(k => { if (p[k] !== undefined && p[k] !== null && p[k] !== '') q.set(k, p[k]); });
  const t = q.toString(); return '#/' + pg + (t ? '?' + t : '');
}
function onRoute() {
  if (!S.token || !S.m) return;
  const r = parseHash(), ok = PAGES[r.pg] && (isAdm() ? !KR_PAGES[r.pg] : KR_PAGES[r.pg]);
  S.page = ok ? r.pg : (isAdm() ? 'home' : 'kjadwal'); S.params = ok ? r.p : {}; render();
}
window.addEventListener('hashchange', onRoute);
function go(page, params, opt) {
  opt = opt || {}; const h = hashOf(page, params);
  if (h === location.hash) { S.page = page; S.params = params || {}; render(); return; }
  if (opt.replace) location.replace(h); else { S.depth++; location.hash = h; }
}
function tab(p) { S.depth = 0; go(p, {}, { replace: true }); }
function goBack() { if (S.depth > 0) { S.depth--; history.back(); } else tab(isAdm() ? 'home' : 'kjadwal'); }
function setP(o) { Object.assign(S.params, o); history.replaceState(null, '', hashOf(S.page, S.params)); render(); }
function rerender() { render(); }
async function render(silent) {
  const my = ++S.nav, v = $('#view');
  if (!silent) { closeSheet(); setHead(TITLE[S.page] || 'SiBus', !!BACKP[S.page]); markNav(S.page); v.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'; }
  try {
    const out = await PAGES[S.page](S.params);
    if (my !== S.nav) return;
    const sy = silent ? window.scrollY : 0;
    v.innerHTML = out.html || out; if (out.title) setHead(out.title, !!BACKP[S.page]); if (out.mount) out.mount();
    window.scrollTo(0, sy);
  } catch (e) { if (my === S.nav && !silent) v.innerHTML = `<div class="err-box">${esc(e.message)}</div><button class="btn" onclick="rerender()">Coba lagi</button>`; }
}
function showRem() {
  const r = S.m.rem || [];
  sheet('Pengingat', r.length ? r.map(x => `<div class="kv"><span>${esc(x.label)}</span><span class="${x.days < 0 ? 'neg' : 'sm'}">${x.days < 0 ? 'Lewat ' + (-x.days) + ' hari' : x.days === 0 ? 'Hari ini' : x.days + ' hari lagi'}<br><small class="muted">${fd(x.date)}</small></span></div>`).join('') : '<div class="empty">Tidak ada pengingat.</div>');
}

/* ===================== HALAMAN: BERANDA ===================== */
const PAGES = {};
const kpi = (l, v, c) => `<div class="kpi ${c || ''}"><small>${l}</small><b class="num">${v}</b></div>`;
/** Rupiah ringkas untuk kartu statistik: Rp 142,5 jt. Angka lengkap tetap ada di halaman rincian. */
function rpc(n) {
  const a = Math.abs(n), sg = n < 0 ? '-' : '', f = (v, u) => sg + 'Rp\u00a0' + (Math.round(v * 10) / 10).toString().replace('.', ',') + '\u00a0' + u;
  return a >= 1e9 ? f(a / 1e9, 'M') : a >= 1e6 ? f(a / 1e6, 'jt') : a >= 1e4 ? f(a / 1e3, 'rb') : rp(n);
}
const stat = (tone, icon, value, label, full) => `<div class="stat"${full ? ` title="${esc(full)}"` : ''}><span class="tile ${tone}">${ic(icon)}</span><div><b class="num">${value}</b><small>${label}</small></div></div>`;
function donut(parts, total, label) {
  const R = 52, C = 2 * Math.PI * R, sum = parts.reduce((a, p) => a + p.v, 0) || 1; let off = 0;
  const segs = parts.filter(p => p.v > 0).map(p => { const l = p.v / sum * C, e = `<circle cx="66" cy="66" r="${R}" fill="none" style="stroke:${p.c}" stroke-width="16" stroke-dasharray="${l.toFixed(1)} ${(C - l).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}"/>`; off += l; return e; }).join('');
  return `<div class="donut"><svg viewBox="0 0 132 132" role="img" aria-label="${esc(parts.map(p => p.n + ' ' + p.v).join(', '))}"><circle cx="66" cy="66" r="${R}" fill="none" style="stroke:var(--card2)" stroke-width="16"/>${segs}</svg><div class="ct"><b>${total}</b><small class="muted xs">${label}</small></div></div>`;
}
const salam = () => { const h = new Date().getHours(); return h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'; };
PAGES.home = async () => {
  const d = await call('dash'), mx = Math.max(1, ...d.perDay), td = +d.today.slice(8) - 1, mxl = Math.max(1, ...d.top.map(r => r.laba));
  const lain = Math.max(0, d.total - d.tersedia - d.jalan - d.servis);
  const parts = [{ n: 'Tersedia', v: d.tersedia, c: 'var(--primary)' }, { n: 'Sedang jalan', v: d.jalan, c: 'var(--info)' }, { n: 'Servis', v: d.servis, c: 'var(--warn)' }, { n: 'Nonaktif', v: lain, c: 'var(--s-S)' }];
  return `<section class="hero"><h2>Selamat ${salam()}, ${esc(S.user.nama)}</h2><p>${d.bookingBulan} booking bulan ini · ${d.jalan} bus sedang jalan · sisa tagihan ${rp(d.tagihan)}.</p><button class="btn white" onclick="go('bform',{})">${ic('plus')} Booking baru</button></section>
  <div class="stats">${stat('g', 'clip', d.bookingBulan, 'Booking bulan ini')}${stat('b', 'bus', d.tersedia, 'Bus tersedia')}${stat('v', 'wallet', rpc(d.omzet), 'Omzet bulan ini', rp(d.omzet))}${stat('a', 'chart', rpc(d.laba), 'Laba bersih', rp(d.laba))}</div>
  <div class="stats">${stat('r', 'rcpt', rpc(d.tagihan), 'Sisa tagihan', rp(d.tagihan))}${stat('g', 'bus', d.jalan, 'Bus sedang jalan')}${stat('a', 'cog', d.servis, 'Bus servis')}${stat('b', 'chart', d.util + '%', 'Utilisasi armada')}</div>
  <div class="cols"><div class="card"><h3>Bus jalan per hari</h3><div class="bars" role="img" aria-label="Grafik jumlah bus jalan per hari">${d.perDay.map((n, i) => `<i class="${i === td ? 'today' : ''}" style="height:${Math.round(n / mx * 100)}%" title="Tgl ${i + 1}: ${n} bus"></i>`).join('')}</div><div class="axis"><span>1</span><span>${Math.round(d.perDay.length / 2)}</span><span>${d.perDay.length}</span></div></div>
  <div class="card"><h3>Status armada</h3><div class="donutw">${donut(parts, d.total, 'bus')}<div class="dleg">${parts.filter(p => p.v > 0).map(p => `<div><i style="background:${p.c}"></i>${p.n}<b class="num">${p.v}</b></div>`).join('')}</div></div></div></div>
  <div class="cols"><div class="card"><h3>5 bus teratas (laba bulan ini)</h3>${d.top.length ? d.top.map(r => `<div class="hbar"><span title="${esc(r.plat)}">${esc(r.plat)}</span><span class="tr"><i style="width:${Math.max(3, Math.round(Math.max(0, r.laba) / mxl * 100))}%"></i></span><b class="num ${r.laba < 0 ? 'neg' : ''}">${rp(r.laba)}</b></div>`).join('') : '<div class="empty">Belum ada trip selesai bulan ini.</div>'}</div>
  <div class="card"><h3>Insight otomatis</h3>${d.insight.map(t => `<div class="kv" style="display:block">• ${esc(t)}</div>`).join('')}</div></div>`;
};

/* ===================== BOOKING: DAFTAR ===================== */
function bookingItems() {
  const q = S.bq.toLowerCase(), l = S.bl.filter(b => (S.bs === 'Semua' || b.status === S.bs) && (!q || (b.no_booking + b.pelanggan + b.rute + b.plat).toLowerCase().indexOf(q) >= 0));
  return l.length ? l.map(b => `<button class="item" onclick="go('bdetail',{id:'${b.id}'})"><div class="grow"><div class="t">${esc(b.pelanggan)} · ${esc(b.rute)}</div><div class="s">${esc(b.no_booking)} · ${fd(b.tgl_berangkat)}–${fd(b.tgl_pulang)} · ${esc(b.plat)}</div><div class="s num">${rp(b.harga)}${b.sisa > 0 && b.status !== 'Batal' ? ` · <span class="neg">sisa ${rp(b.sisa)}</span>` : ''}</div></div>${badge(b.status)}</button>`).join('') : '<div class="empty">Tidak ada booking.</div>';
}
PAGES.booking = async () => {
  S.bl = await call('bookingList');
  return {
    html: `<div class="search">${ic('search')}<input id="bq" type="search" placeholder="Cari pelanggan, rute, plat, no. booking" aria-label="Cari booking" value="${esc(S.bq)}" oninput="S.bq=this.value;$('#bl').innerHTML=bookingItems()"></div>
    <div class="chips">${['Semua', 'Pending', 'Terkonfirmasi', 'Berjalan', 'Selesai', 'Batal'].map(s => `<button class="chip ${S.bs === s ? 'on' : ''}" onclick="S.bs='${s}';rerender()">${s}</button>`).join('')}</div>
    <div id="bl">${bookingItems()}</div><button class="fab" aria-label="Booking baru" onclick="go('bform',{})">${ic('plus')}</button>`
  };
};

/* ===================== BOOKING: FORM ===================== */
function syncFk() { S.fk = $$('.fk-row').map(r => ({ kru_id: $('.fk-s', r).value, posisi: r.dataset.pos, persen_premi: N($('.fk-p', r).value) })); }
function renderFk() {
  $('#fkRows').innerHTML = S.fk.length ? S.fk.map((k, i) => `<div class="fk-row row" data-pos="${k.posisi}" style="margin-bottom:8px;flex-wrap:nowrap"><div class="grow" style="min-width:0"><label class="xs muted">${k.posisi}</label><select class="fk-s" aria-label="${k.posisi}"><option value="">— pilih —</option>${S.m.kru.filter(x => x.posisi === k.posisi && (x.status === 'Aktif' || x.id === k.kru_id)).map(x => `<option value="${x.id}"${x.id === k.kru_id ? ' selected' : ''}>${esc(x.nama)}</option>`).join('')}</select></div><div style="width:92px"><label class="xs muted">Premi %</label><input class="fk-p" type="number" inputmode="decimal" step="any" value="${k.persen_premi}" aria-label="Persen premi"></div><button class="ib" style="margin-top:18px" aria-label="Hapus kru" onclick="syncFk();S.fk.splice(${i},1);renderFk()">${ic('trash')}</button></div>`).join('') : '<div class="muted sm">Belum ada kru. Tambahkan sopir dan kernet.</div>';
}
function addFk(pos) { syncFk(); S.fk.push({ kru_id: '', posisi: pos, persen_premi: N(S.cfg[pos === 'Sopir' ? 'PERSEN_SOPIR' : 'PERSEN_KERNET']) }); renderFk(); }
function newPel() {
  openForm('Pelanggan', '', r => {
    const e = $('#bf_pel'); e.innerHTML = '<option value="">— pilih —</option>' + S.m.pelanggan.map(x => `<option value="${x.id}">${esc(x.nama)}</option>`).join(''); e.value = r.id;
  });
}
function onArm() { autoHarga(); if (!S.params.id) fillBatangan(true); }
/** Isi kru dari kru batangan bus terpilih. auto=true: hanya bila belum ada kru yang dipilih manual. */
function fillBatangan(auto) {
  const a = S.m.armada.find(x => x.id === val('bf_arm')); if (!a) { if (!auto) toast('Pilih armada dulu.', true); return; }
  const ids = batIds(a); if (!ids.length) { if (!auto) toast('Bus ini belum punya kru batangan.', true); return; }
  syncFk(); if (auto && S.fk.some(k => k.kru_id)) return;
  S.fk = ids.map(id => { const k = S.m.kru.find(x => x.id === id); return k && k.status === 'Aktif' ? { kru_id: id, posisi: k.posisi, persen_premi: N(S.cfg[k.posisi === 'Sopir' ? 'PERSEN_SOPIR' : 'PERSEN_KERNET']) } : null; }).filter(Boolean);
  renderFk(); toast('Kru batangan ' + a.plat + ' diisi');
}
function autoHarga() {
  const a = S.m.armada.find(x => x.id === val('bf_arm')), r = val('bf_rute').trim().toLowerCase();
  if (!a || !r || N(val('bf_harga'))) return;
  const t = S.m.tarif.find(x => x.rute.toLowerCase() === r && x.jenis_bus === a.jenis); if (t) { $('#bf_harga').value = t.harga; toast('Harga diisi dari tarif'); }
}
function readBf() {
  syncFk();
  return { b: { id: S.params.id || '', pelanggan_id: val('bf_pel'), rute: val('bf_rute'), titik_jemput: val('bf_jemput'), jam_jemput: val('bf_jam'), tgl_berangkat: val('bf_a'), tgl_pulang: val('bf_z'), armada_id: val('bf_arm'), jml_penumpang: val('bf_pax'), harga: val('bf_harga'), status: val('bf_st'), catatan: val('bf_cat') }, kru: S.fk };
}
async function checkConf(btn) {
  const f = readBf(), box = $('#cres');
  box.className = ''; box.textContent = '';
  await act(btn, async () => {
    const c = await call('conflict', { id: f.b.id, armada_id: f.b.armada_id, tgl_berangkat: f.b.tgl_berangkat, tgl_pulang: f.b.tgl_pulang, kru_ids: f.kru.map(k => k.kru_id).filter(Boolean) });
    box.className = c.length ? 'err-box' : 'ok-box'; box.textContent = c.length ? c.join('\n') : 'Tidak ada bentrok. Armada dan kru tersedia.';
  });
}
function saveBooking(btn) {
  const f = readBf(), er = $('#bferr'); er.hidden = true;
  act(btn, async () => {
    try { const r = await call('bookingSave', f); toast('Booking ' + r.no_booking + ' tersimpan'); go('bdetail', { id: r.id }, { replace: true }); }
    catch (e) { er.textContent = e.message; er.hidden = false; er.scrollIntoView({ block: 'center' }); }
  });
}
PAGES.bform = async p => {
  let d = null; if (p.id) d = await call('bookingGet', { id: p.id });
  const b = d ? d.b : { status: 'Pending', tgl_berangkat: p.date || '', tgl_pulang: p.date || '', armada_id: p.armada_id || '', jam_jemput: '07:00' };
  S.fk = d ? d.kru.map(k => ({ kru_id: k.kru_id, posisi: k.posisi, persen_premi: +k.persen_premi })) : [];
  return {
    title: p.id ? 'Ubah Booking' + (b.no_booking ? ' ' + b.no_booking : '') : 'Booking Baru',
    html: `<div class="card"><h3>Pelanggan & rute</h3>
    <div class="f"><label for="bf_pel">Pelanggan <i>*</i></label><div class="row" style="flex-wrap:nowrap"><select id="bf_pel" class="grow">${['<option value="">— pilih —</option>'].concat(S.m.pelanggan.map(x => `<option value="${x.id}"${x.id === b.pelanggan_id ? ' selected' : ''}>${esc(x.nama)}${x.instansi ? ' · ' + esc(x.instansi) : ''}</option>`)).join('')}</select><button class="btn" type="button" onclick="newPel()">Baru</button></div></div>
    <datalist id="dl_rute">${S.m.tarif.map(t => `<option value="${esc(t.rute)}">`).join('')}</datalist>
    ${fld('bf_rute', 'Rute / tujuan', 'text', b.rute || '', { req: 1, list: 'dl_rute', on: 'autoHarga()' })}${fld('bf_jemput', 'Titik jemput', 'text', b.titik_jemput || '')}${fld('bf_jam', 'Jam jemput', 'time', b.jam_jemput || '')}
    <div class="grid2">${fld('bf_a', 'Berangkat', 'date', b.tgl_berangkat, { req: 1 })}${fld('bf_z', 'Pulang', 'date', b.tgl_pulang, { req: 1 })}</div></div>
    <div class="card"><h3>Armada & kru</h3>${fld('bf_arm', 'Armada', 'select', b.armada_id, { req: 1, opts: [['', '— pilih —']].concat(optArm()), on: 'onArm()' })}${fld('bf_pax', 'Jumlah penumpang', 'number', b.jml_penumpang || '', { req: 1 })}
    <div class="sec" style="margin-top:0">Kru (bisa lebih dari satu)</div><div id="fkRows"></div>
    <div class="row"><button class="btn sm" type="button" onclick="addFk('Sopir')">${ic('plus')} Sopir</button><button class="btn sm" type="button" onclick="addFk('Kernet')">${ic('plus')} Kernet</button><button class="btn sm" type="button" onclick="fillBatangan(false)">Kru batangan</button><button class="btn sm grow" type="button" onclick="checkConf(this)">Cek bentrok</button></div><div id="cres" style="margin-top:10px" role="status"></div></div>
    <div class="card"><h3>Harga & status</h3>${fld('bf_harga', 'Harga sewa (Rp)', 'number', b.harga || '', { req: 1 })}${fld('bf_st', 'Status', 'select', b.status, { opts: ['Pending', 'Terkonfirmasi', 'Berjalan', 'Selesai', 'Batal'] })}${fld('bf_cat', 'Catatan', 'textarea', b.catatan || '')}</div>
    <div class="err-box" id="bferr" role="alert" hidden></div>
    <div class="sticky-act"><button class="btn primary lg grow" onclick="saveBooking(this)">Simpan booking</button></div>`,
    mount: () => { renderFk(); if (!p.id && b.armada_id) fillBatangan(true); }
  };
};

/* ===================== BOOKING: DETAIL ===================== */
const NEXT = { Pending: ['Terkonfirmasi', 'Batal'], Terkonfirmasi: ['Berjalan', 'Batal'], Berjalan: ['Selesai'], Selesai: [], Batal: ['Pending'] };
function setStatus(id, st, btn) { if (st === 'Batal' && !confirm('Batalkan booking ini?')) return; act(btn, async () => { await call('bookingStatus', { id: id, status: st }); toast('Status: ' + st); rerender(); }); }
function payHtml(d) {
  const b = d.b, bayar = d.pay.reduce((a, x) => a + N(x.jumlah), 0), sisa = N(b.harga) - bayar;
  return `<div class="card"><div class="kv"><span>Harga sewa</span><span class="num">${rp(b.harga)}</span></div><div class="kv"><span>Terbayar</span><span class="num pos">${rp(bayar)}</span></div><div class="kv"><span>Sisa tagihan</span><span class="num ${sisa > 0 ? 'neg' : 'pos'}">${rp(sisa)}${sisa <= 0 ? ' (Lunas)' : ''}</span></div></div>
  ${d.pay.map(x => `<div class="item" style="cursor:default"><div class="grow"><div class="t">${rp(x.jumlah)} · ${esc(x.jenis)}</div><div class="s">${fd(x.tanggal)} · ${esc(x.metode)}${x.keterangan ? ' · ' + esc(x.keterangan) : ''}</div></div>${x.bukti_url ? `<button class="btn sm" onclick="showBukti('${esc(x.bukti_url)}')">Bukti</button>` : ''}${isSA() ? `<button class="ib" aria-label="Hapus pembayaran" onclick="delPay('${x.id}')">${ic('trash')}</button>` : ''}</div>`).join('') || '<div class="empty">Belum ada pembayaran.</div>'}
  ${b.status !== 'Batal' && sisa > 0 ? `<button class="btn primary block" onclick="payForm('${b.id}',${sisa},${d.pay.length})">${ic('plus')} Catat pembayaran</button>` : ''}`;
}
function showBukti(u) { const m = /\/d\/([^/]+)/.exec(u), src = m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w900' : u; sheet('Bukti pembayaran', `<img src="${esc(src)}" alt="Bukti pembayaran" style="width:100%;border-radius:12px"><p class="xs muted">Jika gambar tidak muncul, buka tautan: <a href="${esc(u)}" target="_blank" rel="noopener">Drive</a></p>`); }
function delPay(id) { if (confirm('Hapus pembayaran ini?')) act(null, async () => { await call('payDel', { id: id }); toast('Dihapus'); rerender(); }); }
function payForm(bid, sisa, n) {
  S.bukti = null;
  sheet('Catat pembayaran', fld('pa_tgl', 'Tanggal', 'date', todayStr(), { req: 1 }) + fld('pa_jml', 'Jumlah (Rp)', 'number', sisa, { req: 1 }) + fld('pa_jenis', 'Jenis', 'select', n ? (sisa ? 'Cicilan' : 'Pelunasan') : 'DP', { opts: ['DP', 'Cicilan', 'Pelunasan'] }) + fld('pa_met', 'Metode', 'select', 'Transfer', { opts: ['Transfer', 'Tunai', 'QRIS', 'Lainnya'] }) + fld('pa_ket', 'Keterangan', 'text', '') +
    `<div class="f"><label for="pa_file">Bukti (foto, opsional)</label><input id="pa_file" type="file" accept="image/*" onchange="pickBukti(this)"></div><div class="err-box" id="paerr" hidden></div><button class="btn primary block" onclick="savePay('${bid}',this)">Simpan</button>`);
}
function pickBukti(inp) {
  const f = inp.files[0]; if (!f) { S.bukti = null; return; }
  const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const sc = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * sc; c.height = im.height * sc; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); S.bukti = { data: c.toDataURL('image/jpeg', .7), mime: 'image/jpeg' }; }; im.src = fr.result; }; fr.readAsDataURL(f);
}
function savePay(bid, btn) {
  const er = $('#paerr'); er.hidden = true;
  act(btn, async () => {
    try { await call('payAdd', { booking_id: bid, tanggal: val('pa_tgl'), jumlah: val('pa_jml'), jenis: val('pa_jenis'), metode: val('pa_met'), keterangan: val('pa_ket'), bukti: S.bukti }); closeSheet(); toast('Pembayaran dicatat'); rerender(); }
    catch (e) { er.textContent = e.message; er.hidden = false; }
  });
}

/* --- Trip & premi --- */
const komAktif = () => S.m.komPremi.filter(k => k.status === 'Aktif');
function tripHtml(d) {
  const b = d.b, hari = dayDiff(b.tgl_berangkat, b.tgl_pulang) + 1, ka = komAktif();
  S.trip = {
    bid: b.id, harga: N(b.harga),
    biaya: d.biaya.length ? d.biaya.map(x => ({ komponen_id: x.komponen_id, liter: x.liter, harga_per_liter: x.harga_per_liter, jumlah: x.jumlah })) : [{ komponen_id: 'KB-SOLAR', liter: '', harga_per_liter: '', jumlah: '' }],
    kru: d.kru.map(k => { const pm = d.premi.find(x => x.kru_id === k.kru_id), vals = {}; ka.forEach(c => { const dd = pm && pm.det.find(x => x.komponen_id === c.id); vals[c.id] = dd ? dd.nilai : (k.posisi === 'Kernet' ? c.nilai_default_kernet : c.nilai_default_sopir); }); return { kru_id: k.kru_id, nama: k.nama, posisi: k.posisi, persen: +k.persen_premi, vals: vals }; })
  };
  return `${b.status !== 'Selesai' ? '<div class="warn-box">Isi realisasi setelah trip selesai. Premi tampil ke kru setelah status Selesai.</div>' : ''}
  <div class="card"><h3>Uang jalan</h3><div class="grid2">${fld('tr_uj', 'Nominal (Rp)', 'number', b.uang_jalan || '', { on: 'tripCalc()' })}${fld('tr_tgl', 'Tanggal diberikan', 'date', b.tgl_uang_jalan || '')}</div>${fld('tr_hari', 'Jumlah hari trip', 'number', hari, { on: 'tripCalc()' })}</div>
  <div class="card"><h3>Realisasi biaya</h3><div id="trBiaya"></div><button class="btn sm" onclick="addBiaya()">${ic('plus')} Tambah biaya</button></div>
  <div class="card"><h3>Kru: persen & komponen</h3><div id="trKru"></div></div>
  <div class="card" id="tprev"></div><div id="trerr" class="err-box" hidden></div>
  <button class="btn primary block lg" onclick="saveTrip(this)">Simpan trip & hitung premi</button>`;
}
function renderBiaya() {
  $('#trBiaya').innerHTML = S.trip.biaya.map((x, i) => { const k = S.m.komBiaya.find(c => c.id === x.komponen_id) || {}, sol = k.jenis === 'solar'; return `<div class="br-row" data-i="${i}" style="border-bottom:1px dashed var(--border);padding-bottom:8px;margin-bottom:8px"><div class="row" style="flex-wrap:nowrap"><select class="br-k grow" aria-label="Komponen biaya" onchange="syncBiaya();renderBiaya();tripCalc()">${S.m.komBiaya.map(c => `<option value="${c.id}"${c.id === x.komponen_id ? ' selected' : ''}>${esc(c.nama)}</option>`).join('')}</select><button class="ib" aria-label="Hapus biaya" onclick="syncBiaya();S.trip.biaya.splice(${i},1);renderBiaya();tripCalc()">${ic('trash')}</button></div>
    <div class="grid2" style="margin-top:6px">${sol ? `<input class="br-l" type="number" inputmode="decimal" step="any" placeholder="Liter" aria-label="Liter" value="${esc(x.liter)}" oninput="tripCalc()"><input class="br-h" type="number" inputmode="decimal" step="any" placeholder="Harga/liter" aria-label="Harga per liter" value="${esc(x.harga_per_liter)}" oninput="tripCalc()">` : ''}<input class="br-j" type="number" inputmode="decimal" step="any" placeholder="${sol ? 'Atau nominal langsung' : 'Nominal (Rp)'}" aria-label="Nominal" value="${esc(x.jumlah)}" oninput="tripCalc()" style="${sol ? 'grid-column:1/-1' : 'grid-column:1/-1'}"></div></div>`; }).join('') || '<div class="muted sm">Belum ada biaya.</div>';
}
function syncBiaya() { S.trip.biaya = $$('.br-row').map(r => ({ komponen_id: $('.br-k', r).value, liter: $('.br-l', r) ? $('.br-l', r).value : '', harga_per_liter: $('.br-h', r) ? $('.br-h', r).value : '', jumlah: $('.br-j', r).value })); }
function addBiaya() { syncBiaya(); S.trip.biaya.push({ komponen_id: (S.m.komBiaya[1] || S.m.komBiaya[0] || {}).id, liter: '', harga_per_liter: '', jumlah: '' }); renderBiaya(); }
function renderTripKru() {
  const ka = komAktif();
  $('#trKru').innerHTML = S.trip.kru.map(k => `<div class="kr-row" data-k="${k.kru_id}" style="border-bottom:1px dashed var(--border);padding-bottom:8px;margin-bottom:10px"><div class="b">${esc(k.nama)} <span class="muted xs">${k.posisi}</span></div><div class="grid2" style="margin-top:6px"><div><label class="xs muted">Premi %</label><input class="kp" type="number" inputmode="decimal" step="any" value="${k.persen}" oninput="tripCalc()"></div>${ka.map(c => `<div><label class="xs muted">${esc(c.nama)} (${c.jenis_nilai === 'persen' ? '%' : c.jenis_nilai === 'nominal_hari' ? 'Rp/hari' : 'Rp'})</label><input class="kc" data-c="${c.id}" type="number" inputmode="decimal" step="any" value="${k.vals[c.id] == null ? '' : k.vals[c.id]}" oninput="tripCalc()"></div>`).join('')}</div></div>`).join('');
}
function readTrip() {
  syncBiaya();
  return { booking_id: S.trip.bid, uang_jalan: val('tr_uj'), tgl_uang_jalan: val('tr_tgl'), hari: val('tr_hari'), biaya: S.trip.biaya,
    kru: $$('.kr-row').map(r => { const komp = {}; $$('.kc', r).forEach(i => komp[i.dataset.c] = i.value); return { kru_id: r.dataset.k, persen: N($('.kp', r).value), komp: komp }; }) };
}
function tripCalc() {
  const t = readTrip(), ka = komAktif(), hari = Math.max(1, N(t.hari) || 1);
  const total = t.biaya.reduce((a, x) => a + ((N(x.liter) > 0 && N(x.harga_per_liter) > 0) ? Math.round(N(x.liter) * N(x.harga_per_liter)) : Math.round(N(x.jumlah))), 0);
  const uj = N(t.uang_jalan), sisa = uj - total, dasar = S.trip.harga - uj + sisa, sp = t.kru.reduce((a, k) => a + k.persen, 0);
  let h = `<h3>Perhitungan</h3><div class="kv"><span>Harga sewa</span><span class="num">${rp(S.trip.harga)}</span></div><div class="kv"><span>Total realisasi biaya</span><span class="num">${rp(total)}</span></div><div class="kv"><span>Sisa uang jalan</span><span class="num ${sisa < 0 ? 'neg' : ''}">${rp(sisa)}${sisa < 0 ? ' (nombok, diganti perusahaan)' : ''}</span></div><div class="kv"><span class="b">Dasar premi</span><span class="num b ${dasar < 0 ? 'neg' : ''}">${rp(dasar)}</span></div>`;
  if (dasar < 0) h += '<div class="warn-box" style="margin-top:8px">Dasar premi negatif. Periksa harga sewa dan biaya.</div>';
  if (sp > 100.0001) h += `<div class="err-box" style="margin-top:8px">Total persentase kru ${sp}% melebihi 100%.</div>`;
  t.kru.forEach(k => { const m = S.trip.kru.find(x => x.kru_id === k.kru_id) || {}; let tot = Math.round(dasar * k.persen / 100); ka.forEach(c => { const v = N(k.komp[c.id]); tot += c.jenis_nilai === 'persen' ? Math.round(dasar * v / 100) : c.jenis_nilai === 'nominal_hari' ? Math.round(v * hari) : Math.round(v); }); h += `<div class="kv"><span>${esc(m.nama)} (${k.persen}%)</span><span class="num b">${rp(tot)}</span></div>`; });
  $('#tprev').innerHTML = h;
}
function saveTrip(btn) {
  const er = $('#trerr'); er.hidden = true;
  act(btn, async () => {
    try { const r = await call('tripSave', readTrip()); toast('Premi dihitung' + (r.warning ? '. ' + r.warning : '')); rerender(); }
    catch (e) { er.textContent = e.message; er.hidden = false; er.scrollIntoView({ block: 'center' }); }
  });
}
function premiViewHtml(d) {
  return d.premi.length ? `<div class="sec">Premi tersimpan</div>` + d.premi.map(p => `<div class="card"><div class="row sp"><b>${esc(p.nama)}</b><span class="badge ${p.status === 'Sudah dibayar' ? 'b-ok' : 'b-warn'}">${esc(p.status)}</span></div><div class="kv"><span>Premi ${p.persen}% dari ${rp(p.dasar_premi)}</span><span class="num">${rp(p.premi)}</span></div>${p.det.filter(x => N(x.jumlah)).map(x => `<div class="kv"><span>${esc(x.nama)}</span><span class="num">${rp(x.jumlah)}</span></div>`).join('')}<div class="kv"><span class="b">Total pendapatan</span><span class="num b">${rp(p.total_pendapatan)}</span></div></div>`).join('') : '';
}
/* --- Cetak --- */
async function showDoc(type, bid, kid, month) {
  await act(null, async () => {
    const d = await call('doc', { type: type, booking_id: bid, kru_id: kid || '', month: month || '' }); S.doc = { d: d, type: type, bid: bid, kid: kid || '', month: month || '' };
    sheet(d.title, `<div class="docwrap"><style>${d.css}</style>${d.body}</div><div class="row"><button class="btn primary grow" onclick="printDoc()">${ic('print')} Cetak</button><button class="btn grow" onclick="pdfDoc(this)">${ic('dl')} Unduh PDF</button></div>`);
  });
}
function printDoc() { $('#printRoot').innerHTML = `<style>${S.doc.d.css}</style>` + S.doc.d.body; window.print(); }
function pdfDoc(btn) {
  act(btn, async () => {
    const r = await call('pdf', { type: S.doc.type, booking_id: S.doc.bid, kru_id: S.doc.kid, month: S.doc.month }), bin = atob(r.b64), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([u], { type: 'application/pdf' })); a.download = r.name; document.body.appendChild(a); a.click(); a.remove(); toast('PDF diunduh');
  });
}
PAGES.bdetail = async p => {
  const d = await call('bookingGet', { id: p.id }), b = d.b, tab = p.tab || 'info';
  const tabs = [['info', 'Info'], ['bayar', 'Bayar'], ['trip', 'Trip & Premi'], ['cetak', 'Cetak']];
  let body = '';
  if (tab === 'info') body = `<div class="card"><div class="row sp"><b>${esc(b.no_booking)}</b>${badge(b.status)}</div>
    <div class="kv"><span>Pelanggan</span><span>${esc(d.pelanggan.nama)}${d.pelanggan.no_hp ? '<br><small class="muted">' + esc(d.pelanggan.no_hp) + '</small>' : ''}</span></div><div class="kv"><span>Rute</span><span>${esc(b.rute)}</span></div>
    <div class="kv"><span>Jemput</span><span>${esc(b.titik_jemput || '-')} · ${esc(b.jam_jemput || '-')}</span></div><div class="kv"><span>Tanggal</span><span>${fd(b.tgl_berangkat)} – ${fd(b.tgl_pulang)}</span></div>
    <div class="kv"><span>Armada</span><span>${esc(d.armada.plat)}<br><small class="muted">${esc(d.armada.jenis)} · ${esc(d.armada.seat)} seat</small></span></div><div class="kv"><span>Penumpang</span><span>${esc(b.jml_penumpang)} orang</span></div>
    <div class="kv"><span>Harga sewa</span><span class="num b">${rp(b.harga)}</span></div>${b.catatan ? `<div class="kv"><span>Catatan</span><span>${esc(b.catatan)}</span></div>` : ''}</div>
    <div class="card"><h3>Kru</h3>${d.kru.map(k => `<div class="kv"><span>${esc(k.nama)} <small>(${esc(k.posisi)})</small></span><span>${k.persen_premi}%</span></div>`).join('')}</div>
    <div class="row">${(NEXT[b.status] || []).map(s => `<button class="btn ${s === 'Batal' ? 'danger' : 'primary'} grow" onclick="setStatus('${b.id}','${s}',this)">${s === 'Pending' ? 'Aktifkan lagi' : s}</button>`).join('')}<button class="btn grow" onclick="go('bform',{id:'${b.id}'})">${ic('edit')} Ubah</button>${isSA() ? `<button class="btn danger" aria-label="Hapus booking" onclick="delBooking('${b.id}')">${ic('trash')}</button>` : ''}</div>`;
  else if (tab === 'bayar') body = payHtml(d);
  else if (tab === 'trip') body = tripHtml(d) + premiViewHtml(d);
  else body = `<button class="item" onclick="showDoc('invoice','${b.id}')">${ic('rcpt')}<div class="grow"><div class="t">Invoice / bukti booking</div><div class="s">Preview, cetak, atau unduh PDF</div></div>${ic('chev')}</button>
    <button class="item" onclick="showDoc('surat','${b.id}')">${ic('file')}<div class="grow"><div class="t">Surat jalan</div><div class="s">Untuk sopir dan kernet</div></div>${ic('chev')}</button>` +
    (d.premi.length ? `<div class="sec">Slip premi kru</div>` + d.premi.map(x => `<button class="item" onclick="showDoc('slip','${b.id}','${x.kru_id}')">${ic('wallet')}<div class="grow"><div class="t">${esc(x.nama)}</div><div class="s">Rincian perhitungan · ${rp(x.total_pendapatan)} · ${esc(x.status)}</div></div>${ic('chev')}</button>`).join('') : '<div class="muted sm" style="margin:8px 2px">Slip premi tersedia setelah premi dihitung di tab Trip & Premi.</div>');
  return { html: `<div class="seg" role="tablist">${tabs.map(t => `<button role="tab" class="${tab === t[0] ? 'on' : ''}" onclick="setP({tab:'${t[0]}'})">${t[1]}</button>`).join('')}</div>${body}`, mount: tab === 'trip' ? () => { renderBiaya(); renderTripKru(); tripCalc(); } : null };
};
function delBooking(id) { if (confirm('Hapus booking ini? (bisa dipulihkan Super Admin)')) act(null, async () => { await call('bookingDel', { id: id }); toast('Dihapus'); S.bl = []; goBack(); }); }

/* ===================== KALENDER ===================== */
PAGES.kalender = async p => {
  const ym = p.ym || todayStr().slice(0, 7), y = +ym.slice(0, 4), mo = +ym.slice(5, 7), dim = new Date(y, mo, 0).getDate(), from = ym + '-01', to = ym + '-' + p2(dim);
  const jf = p.jenis || '', q = (p.q || '').toLowerCase(), data = await call('calendar', { from: from, to: to });
  const cell = {}; data.forEach(b => { const c = cell[b.armada_id] = cell[b.armada_id] || {}; for (let d = Math.max(1, b.a < from ? 1 : +b.a.slice(8)); d <= (b.z > to ? dim : +b.z.slice(8)); d++) c[d] = b; });
  const rows = S.m.armada.filter(a => a.status !== 'Nonaktif' && (!jf || a.jenis === jf) && (!q || a.plat.toLowerCase().indexOf(q) >= 0)), td = todayStr();
  const shift = n => { const d = new Date(y, mo - 1 + n, 1); return d.getFullYear() + '-' + p2(d.getMonth() + 1); };
  const WD = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
  let h = `<div class="row sp" style="margin-bottom:8px"><button class="ib" aria-label="Bulan sebelumnya" onclick="setP({ym:'${shift(-1)}'})">${ic('back')}</button><b>${MON[mo - 1]} ${y}</b><button class="ib" aria-label="Bulan berikutnya" onclick="setP({ym:'${shift(1)}'})" style="transform:scaleX(-1)">${ic('back')}</button></div>
  <div class="grid2" style="margin-bottom:8px"><select aria-label="Filter jenis bus" onchange="setP({jenis:this.value})"><option value="">Semua jenis</option>${JENIS.map(j => `<option${j === jf ? ' selected' : ''}>${j}</option>`).join('')}</select><input type="search" aria-label="Cari plat" placeholder="Cari plat" value="${esc(p.q || '')}" onchange="setP({q:this.value})"></div>
  <div class="calw"><table class="cal" id="calT"><thead><tr><th class="pl">Bus</th>${Array.from({ length: dim }, (_, i) => { const dt = ym + '-' + p2(i + 1), w = new Date(y, mo - 1, i + 1).getDay(); return `<th class="${dt === td ? 'td' : ''}">${i + 1}<br><small class="muted">${WD[w]}</small></th>`; }).join('')}</tr></thead><tbody>`;
  rows.forEach(a => { h += `<tr><td class="pl" title="${esc(a.plat)} ${esc(a.jenis)}">${esc(a.plat)}${a.status === 'Servis' ? ' <small class="neg">servis</small>' : ''}</td>`; const c = cell[a.id] || {};
    for (let d = 1; d <= dim; d++) { const b = c[d], we = [0, 6].indexOf(new Date(y, mo - 1, d).getDay()) >= 0; h += b ? `<td class="${STC[b.st]}"><button data-b="${b.id}" aria-label="${esc(a.plat)} tgl ${d}: ${esc(b.st)}, ${esc(b.pel)}" title="${esc(b.no)} ${esc(b.pel)}">${STC[b.st]}</button></td>` : `<td class="e${we ? ' we' : ''}"><button data-a="${a.id}" data-d="${ym}-${p2(d)}" aria-label="Booking baru ${esc(a.plat)} tgl ${d}">+</button></td>`; }
    h += '</tr>'; });
  h += `</tbody></table></div><div class="legend"><span style="--c:var(--s-P)">P Pending</span><span style="--c:var(--s-T)">T Terkonfirmasi</span><span style="--c:var(--s-J)">J Berjalan</span><span style="--c:var(--s-S)">S Selesai</span></div><p class="xs muted" style="margin:4px 2px">${rows.length} bus. Ketuk kotak berwarna untuk detail, atau kotak kosong untuk booking baru.</p>`;
  return { html: h, mount: () => { $('#calT').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.b) go('bdetail', { id: b.dataset.b }); else go('bform', { armada_id: b.dataset.a, date: b.dataset.d }); }); } };
};

/* ===================== PREMI KRU (manajemen) ===================== */
PAGES.premi = async p => {
  const ym = p.ym || todayStr().slice(0, 7), rows = await call('premiList', { month: ym }), g = {};
  rows.forEach(r => (g[r.kru_id] = g[r.kru_id] || { nama: r.kru, posisi: r.posisi, l: [] }).l.push(r));
  const ks = Object.keys(g).sort((a, b) => g[a].nama < g[b].nama ? -1 : 1), tot = rows.reduce((a, r) => a + r.total, 0), paid = rows.filter(r => r.status === 'Sudah dibayar').reduce((a, r) => a + r.total, 0);
  return {
    html: `<div class="card row sp" style="flex-wrap:nowrap"><div style="min-width:0"><b>Harga sewa tampil ke kru</b><div class="xs muted" id="hgDesc">${S.cfg.TAMPIL_HARGA_KRU === '1' ? 'Kru melihat harga sewa di jadwal dan rincian premi.' : 'Harga sewa disembunyikan dari kru.'}</div></div><button class="sw" id="hgSw" role="switch" aria-label="Tampilkan harga sewa ke kru" aria-checked="${S.cfg.TAMPIL_HARGA_KRU === '1'}" onclick="toggleHarga(this)"><i></i></button></div>
    <div class="grid2">${fld('pm_m', 'Periode', 'month', ym, { on: "setP({ym:this.value})" })}<div class="kpi" style="margin-bottom:12px"><small>Belum dibayar</small><b class="num ${tot - paid ? 'neg' : ''}">${rp(tot - paid)}</b></div></div>
    <div class="grid2" style="margin-bottom:12px">${kpi('Total premi', rp(tot))}${kpi('Sudah dibayar', rp(paid))}</div>
    ${ks.map(k => { const x = g[k], t = x.l.reduce((a, r) => a + r.total, 0), pd = x.l.filter(r => r.status === 'Sudah dibayar').reduce((a, r) => a + r.total, 0); return `<details class="card"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span><b>${esc(x.nama)}</b> <small class="muted">${x.posisi} · ${x.l.length} trip</small></span><span class="num b">${rp(t)}</span></summary><div class="xs muted" style="margin-bottom:6px">Dibayar ${rp(pd)} · Belum ${rp(t - pd)}</div><button class="btn sm block" style="margin-bottom:6px" onclick="showDoc('rekap','','${k}','${ym}')">${ic('print')} Cetak rekap premi ${esc(x.nama)}</button>${x.l.map(r => `<div class="row" style="padding:8px 0;border-top:1px dashed var(--border);flex-wrap:nowrap">${r.status === 'Sudah dibayar' ? `<span class="badge b-ok">Lunas</span>` : `<input type="checkbox" class="pk" value="${r.id}" aria-label="Pilih ${esc(r.no)}">`}<div class="grow" style="min-width:0"><div class="sm b">${esc(r.rute)}</div><div class="xs muted">${esc(r.no)} · ${fd(r.tgl)}${r.tgl_bayar ? ' · bayar ' + fd(r.tgl_bayar) : ''}</div></div><div class="num sm b">${rp(r.total)}</div><button class="ib" aria-label="Slip premi" onclick="showDoc('slip','${r.booking_id}','${k}')">${ic('print')}</button></div>`).join('')}</details>`; }).join('') || '<div class="empty">Belum ada premi pada periode ini.<br><small>Premi muncul setelah booking Selesai dan trip & premi dihitung.</small></div>'}
    ${ks.length ? `<div class="sticky-act"><input type="date" id="pm_tgl" value="${todayStr()}" aria-label="Tanggal bayar" style="max-width:160px"><button class="btn primary grow" onclick="payPremi(this)">Tandai dibayar</button></div>` : ''}`
  };
};
async function toggleHarga(btn) {
  const on = btn.getAttribute('aria-checked') !== 'true';
  btn.setAttribute('aria-checked', on); btn.disabled = true;                      // tampil seketika, dibatalkan bila gagal
  try {
    await call('kruViewSave', { value: on ? '1' : '0' }); S.cfg.TAMPIL_HARGA_KRU = on ? '1' : '0';
    $('#hgDesc').textContent = on ? 'Kru melihat harga sewa di jadwal dan rincian premi.' : 'Harga sewa disembunyikan dari kru.';
    toast(on ? 'Harga sewa ditampilkan ke kru' : 'Harga sewa disembunyikan dari kru');
  } catch (e) { btn.setAttribute('aria-checked', !on); toast(e.message, true); }
  finally { btn.disabled = false; }
}
function payPremi(btn) {
  const ids = $$('.pk:checked').map(c => c.value); if (!ids.length) return toast('Centang premi yang akan ditandai dibayar.', true);
  act(btn, async () => { await call('premiPay', { ids: ids, tgl: val('pm_tgl') }); toast(ids.length + ' premi dibayar'); rerender(); });
}

/* ===================== LAINNYA, TAGIHAN, MASTER ===================== */
PAGES.more = async () => {
  const L = [['tagihan', 'Tagihan & pembayaran', 'rcpt'], ['master', 'Master data', 'db'], ['laporan', 'Laporan laba-rugi bus', 'chart'], ['akun', isSA() ? 'Akun pengguna' : 'Akun kru', 'users']].concat(isSA() ? [['setting', 'Pengaturan', 'cog'], ['log', 'Log aktivitas', 'file']] : []);
  return L.map(n => `<button class="item" onclick="go('${n[0]}')">${ic(n[2])}<div class="grow t">${n[1]}</div>${ic('chev')}</button>`).join('') + `<button class="item" onclick="toggleTheme()">${ic('moon')}<div class="grow t">Mode terang / gelap</div></button><button class="item" onclick="logout()">${ic('out')}<div class="grow t">Keluar (${esc(S.user.nama)})</div></button>`;
};
PAGES.tagihan = async () => {
  const l = await call('tagihan'), tot = l.reduce((a, b) => a + b.sisa, 0);
  return `<div class="kpi hl" style="margin-bottom:12px"><small>Total sisa tagihan</small><b class="num">${rp(tot)}</b></div>` + (l.map(b => `<button class="item" onclick="go('bdetail',{id:'${b.id}',tab:'bayar'})"><div class="grow"><div class="t">${esc(b.pelanggan)}</div><div class="s">${esc(b.no_booking)} · berangkat ${fd(b.tgl_berangkat)}</div></div><div class="r"><div class="num b neg">${rp(b.sisa)}</div>${badge(b.status)}</div></button>`).join('') || '<div class="empty">Semua tagihan lunas.</div>');
};
S.mt = 'Armada'; S.trash = false;
const dd = (label, d, lim) => { if (!d) return ''; const n = dayDiff(todayStr(), d); return n <= lim ? `<span class="badge ${n < 0 ? 'b-bad' : 'b-warn'}">${label} ${n < 0 ? 'lewat' : n + ' hr'}</span> ` : ''; };
PAGES.master = async () => {
  const t = S.mt, rows = await call('mList', { table: t, trash: S.trash && isSA() }); S.list = rows;
  const ar = {}; (S.m.armada || []).forEach(a => ar[a.id] = a);
  const line = r => ({ Armada: [r.plat, `${r.jenis} · ${r.seat} seat · ${r.status}`, (batIds(r).length ? `<span class="xs muted">Batangan: ${esc(batNames(r))}</span><br>` : '') + dd('KIR', r.tgl_kir, 30) + dd('Pajak', r.tgl_pajak, 30) + dd('Servis', r.tgl_servis, 14)], Kru: [r.nama, `${r.posisi} · ${r.no_hp || '-'}`, dd('SIM', r.tgl_sim, 60)], Pelanggan: [r.nama, `${r.instansi || '-'} · ${r.no_hp || '-'}`, ''], Tarif: [r.rute, `${r.jenis_bus} · ${rp(r.harga)}`, ''], KomponenBiaya: [r.nama, r.jenis, ''], BiayaArmada: [(ar[r.armada_id] || {}).plat || '-', `${fd(r.tanggal)} · ${r.jenis} · ${rp(r.jumlah)}`, ''] }[t]);
  return {
    html: `<div class="chips">${Object.keys(FORMS).filter(k => k !== 'KomponenPremi').map(k => `<button class="chip ${k === t ? 'on' : ''}" onclick="S.mt='${k}';rerender()">${FORMS[k].t}</button>`).join('')}${isSA() ? `<button class="chip ${S.trash ? 'on' : ''}" onclick="S.trash=!S.trash;rerender()">Terhapus</button>` : ''}</div>
    ${rows.map(r => { const l = line(r); return `<button class="item" onclick="${S.trash ? `restore('${t}','${r.id}')` : `openForm('${t}','${r.id}')`}"><div class="grow"><div class="t">${esc(l[0])}</div><div class="s">${esc(l[1])}</div>${l[2] ? `<div style="margin-top:4px">${l[2]}</div>` : ''}</div>${S.trash ? '<span class="badge b-warn">Pulihkan</span>' : ic('chev')}</button>`; }).join('') || '<div class="empty">Belum ada data.</div>'}
    ${S.trash ? '' : `<button class="fab" aria-label="Tambah" onclick="openForm('${t}','')">${ic('plus')}</button>`}`
  };
};
function restore(t, id) { if (confirm('Pulihkan data ini?')) act(null, async () => { await call('mDel', { table: t, id: id, restore: true }); toast('Dipulihkan'); await refreshBoot(); rerender(); }); }

/* ===================== LAPORAN ===================== */
PAGES.laporan = async p => {
  const f = p.f || todayStr().slice(0, 7), z = p.z || f, srt = p.s || 'laba';
  const rows = (await call('laporan', { from: f + '-01', to: z + '-31' })).filter(r => r.trip || r.armada);
  const tot = rows.reduce((a, r) => { ['trip', 'sewa', 'biaya', 'kru', 'armada', 'laba'].forEach(k => a[k] += r[k]); return a; }, { trip: 0, sewa: 0, biaya: 0, kru: 0, armada: 0, laba: 0 });
  rows.sort((a, b) => srt === 'laba' ? b.laba - a.laba : srt === 'rugi' ? a.laba - b.laba : a.trip - b.trip);
  S.rep = rows;
  return `<div class="grid2">${fld('lp_f', 'Dari bulan', 'month', f, { on: "setP({f:this.value})" })}${fld('lp_z', 'Sampai bulan', 'month', z, { on: "setP({z:this.value})" })}</div>
  <div class="grid2" style="margin-bottom:12px">${kpi('Total sewa', rp(tot.sewa))}${kpi('Laba bersih', rp(tot.laba), 'hl')}</div>
  <div class="chips">${[['laba', 'Paling untung'], ['rugi', 'Paling rugi'], ['jarang', 'Paling jarang jalan']].map(c => `<button class="chip ${srt === c[0] ? 'on' : ''}" onclick="setP({s:'${c[0]}'})">${c[1]}</button>`).join('')}<button class="chip" onclick="exportLap()">${'Ekspor CSV'}</button></div>
  ${rows.map(r => `<div class="card"><div class="row sp"><b>${esc(r.plat)} <small class="muted">${esc(r.jenis)}</small></b><span class="num b ${r.laba < 0 ? 'neg' : 'pos'}">${r.laba < 0 ? 'Rugi ' : 'Laba '}${rp(r.laba)}</span></div><div class="grid2 xs" style="margin-top:6px"><span class="muted">Trip: ${r.trip}</span><span class="muted r">Sewa: ${rp(r.sewa)}</span><span class="muted">Biaya trip: ${rp(r.biaya)}</span><span class="muted r">Kru: ${rp(r.kru)}</span><span class="muted">Servis/pajak/KIR: ${rp(r.armada)}</span></div></div>`).join('') || '<div class="empty">Belum ada data pada periode ini.</div>'}`;
};
function exportLap() {
  const h = ['Plat', 'Jenis', 'Trip', 'Sewa', 'Biaya trip', 'Pendapatan kru', 'Biaya armada', 'Laba'], c = [h.join(',')].concat(S.rep.map(r => [r.plat, r.jenis, r.trip, r.sewa, r.biaya, r.kru, r.armada, r.laba].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + c.join('\n')], { type: 'text/csv' })); a.download = 'laba-rugi-bus.csv'; document.body.appendChild(a); a.click(); a.remove();
}

/* ===================== AKUN, PENGATURAN, LOG ===================== */
PAGES.akun = async () => {
  const l = await call('uList'); S.users = l;
  return `<p class="xs muted" style="margin:0 2px 10px">${isSA() ? 'Kelola semua akun.' : 'Buat dan reset akun untuk sopir dan kernet.'} Satu kru satu akun.</p>` +
    l.map(u => `<button class="item" onclick="userForm('${u.id}')">${ic('user')}<div class="grow"><div class="t">${esc(u.nama)}</div><div class="s">${esc(u.username)} · ${esc(u.role)}</div></div><span class="badge ${u.status === 'Aktif' ? 'b-ok' : 'b-bad'}">${esc(u.status)}</span></button>`).join('') + `<button class="fab" aria-label="Akun baru" onclick="userForm('')">${ic('plus')}</button>`;
};
function userForm(id) {
  const u = id ? S.users.find(x => x.id === id) : { role: 'Kru', status: 'Aktif' }, has = {}; S.users.forEach(x => { if (x.kru_id && x.id !== id) has[x.kru_id] = 1; });
  sheet(id ? 'Ubah akun' : 'Akun baru', fld('u_role', 'Peran', 'select', u.role, { opts: isSA() ? ['Super Admin', 'Manajemen', 'Kru'] : ['Kru'], on: 'userRole()' }) +
    `<div id="u_kruw">${fld('u_kru', 'Data kru', 'select', u.kru_id || '', { opts: [['', '— pilih —']].concat(S.m.kru.filter(k => !has[k.id]).map(k => [k.id, k.nama + ' (' + k.posisi + ')'])) })}</div><div id="u_namaw">${fld('u_nama', 'Nama', 'text', u.nama || '')}</div>` +
    fld('u_user', 'Username', 'text', u.username || '') + (id ? '' : fld('u_pw', 'Password awal (min. 6)', 'text', '')) + fld('u_st', 'Status', 'select', u.status, { opts: ['Aktif', 'Nonaktif'] }) +
    `<div class="err-box" id="uerr" hidden></div><button class="btn primary block" onclick="saveUser('${id || ''}',this)">Simpan</button>` + (id ? `<div class="sec">Reset password</div>${fld('u_rp', 'Password baru', 'text', '')}<button class="btn block" onclick="resetPw('${id}',this)">Reset password</button>` : ''));
  userRole();
}
function userRole() { const k = val('u_role') === 'Kru'; $('#u_kruw').hidden = !k; $('#u_namaw').hidden = k; }
function saveUser(id, btn) {
  const er = $('#uerr'); er.hidden = true;
  act(btn, async () => { try { await call('uSave', { rec: { id: id, role: val('u_role'), kru_id: val('u_kru'), nama: val('u_nama'), username: val('u_user'), password: val('u_pw'), status: val('u_st') } }); closeSheet(); toast('Akun tersimpan'); rerender(); } catch (e) { er.textContent = e.message; er.hidden = false; } });
}
function resetPw(id, btn) { act(btn, async () => { await call('uReset', { id: id, password: val('u_rp') }); closeSheet(); toast('Password direset'); }); }
PAGES.setting = async () => {
  const g = await call('cfgGet'), c = g.cfg, kp = S.m.komPremi, jn = { persen: 'Persen', nominal: 'Nominal', nominal_hari: 'Nominal × hari' };
  return `<div class="card"><h3>Identitas & default</h3>${fld('c_APP_NAME', 'Nama aplikasi / perusahaan', 'text', c.APP_NAME || '')}${fld('c_ALAMAT', 'Alamat (kop dokumen)', 'text', c.ALAMAT || '')}${fld('c_TELP', 'Telepon', 'tel', c.TELP || '')}${fld('c_REKENING', 'Rekening pembayaran (invoice)', 'text', c.REKENING || '')}
  <div class="grid2">${fld('c_PERSEN_SOPIR', 'Default premi sopir (%)', 'number', c.PERSEN_SOPIR || '')}${fld('c_PERSEN_KERNET', 'Default premi kernet (%)', 'number', c.PERSEN_KERNET || '')}</div>
  ${fld('c_TAMPIL_DASAR_PREMI', 'Rincian perhitungan premi untuk kru', 'select', c.TAMPIL_DASAR_PREMI || '1', { opts: [['1', 'Tampilkan rincian lengkap (dasar premi, biaya trip, uang jalan)'], ['0', 'Sembunyikan (kru hanya lihat persen, premi, total)']] })}<button class="btn primary block" onclick="saveCfg(this)">Simpan pengaturan</button></div>
  <div class="sec">Komponen premi</div>${kp.map(k => `<button class="item" onclick="openForm('KomponenPremi','${k.id}')"><div class="grow"><div class="t">${esc(k.nama)}</div><div class="s">${jn[k.jenis_nilai]} · sopir ${k.nilai_default_sopir} · kernet ${k.nilai_default_kernet}</div></div><span class="badge ${k.status === 'Aktif' ? 'b-ok' : 'b-S'}">${esc(k.status)}</span></button>`).join('')}
  <button class="btn block" onclick="openForm('KomponenPremi','')">${ic('plus')} Tambah komponen premi</button>
  <div class="sec">Penyimpanan</div><div class="card"><div class="kv"><span>ID Spreadsheet</span><span class="xs" style="word-break:break-all">${esc(g.ssId)}</span></div><div class="kv"><span>ID Folder Drive</span><span class="xs" style="word-break:break-all">${esc(g.folderId)}</span></div></div>`;
};
function saveCfg(btn) { const o = {}; ['APP_NAME', 'ALAMAT', 'TELP', 'REKENING', 'PERSEN_SOPIR', 'PERSEN_KERNET', 'TAMPIL_DASAR_PREMI'].forEach(k => o[k] = val('c_' + k)); act(btn, async () => { await call('cfgSave', { cfg: o }); await refreshBoot(); toast('Pengaturan tersimpan'); }); }
PAGES.log = async () => (await call('logList')).map(l => `<div class="kv" style="display:block"><div class="xs muted">${esc(String(l.waktu).replace('T', ' '))} · ${esc(l.user)}</div><div class="sm"><b>${esc(l.aksi)}</b> ${esc(l.detail)}</div></div>`).join('') || '<div class="empty">Belum ada aktivitas.</div>';

/* ===================== KRU (hanya-baca, data milik sendiri) ===================== */
PAGES.kjadwal = async p => {
  const l = await call('kruTrips'), t = todayStr(), seg = p.seg || 'next';
  const f = { next: x => x.a > t && x.st !== 'Selesai', now: x => x.a <= t && x.z >= t && x.st !== 'Selesai' || x.st === 'Berjalan', hist: x => x.st === 'Selesai' || x.z < t }, ordered = l.filter(f[seg]);
  if (seg === 'hist') ordered.reverse();
  return `<div class="seg">${[['next', 'Mendatang'], ['now', 'Berjalan'], ['hist', 'Riwayat']].map(s => `<button class="${seg === s[0] ? 'on' : ''}" onclick="setP({seg:'${s[0]}'})">${s[1]}</button>`).join('')}</div>` +
    (ordered.map(x => `<div class="card"><div class="row sp"><b>${esc(x.rute)}</b>${badge(x.st)}</div><div class="kv"><span>Tanggal</span><span>${fd(x.a)} – ${fd(x.z)}</span></div><div class="kv"><span>Jemput</span><span>${esc(x.titik_jemput || '-')} · ${esc(x.jam || '-')}</span></div><div class="kv"><span>Bus</span><span>${esc(x.plat)} <small class="muted">${esc(x.jenis)}</small></span></div><div class="kv"><span>Penumpang</span><span>${esc(x.pax)} orang · ${esc(x.pel)}</span></div>${x.harga != null ? `<div class="kv"><span>Harga sewa</span><span class="num b">${rp(x.harga)}</span></div>` : ''}<div class="kv"><span>Posisi saya</span><span>${esc(x.posisi)}</span></div>${x.catatan ? `<div class="kv"><span>Catatan</span><span>${esc(x.catatan)}</span></div>` : ''}</div>`).join('') || '<div class="empty">Tidak ada trip.</div>');
};
function calcHtml(x) {
  const c = x.calc, hg = x.harga != null ? `<div class="kv"><span>Harga sewa trip</span><span class="num b">${rp(x.harga)}</span></div>` : '';
  if (!c) return hg + `<div class="kv"><span>Premi ${x.persen}%</span><span class="num">${rp(x.premi)}</span></div>${x.det.map(d => `<div class="kv"><span>${esc(d.nama)}</span><span class="num">${rp(d.jumlah)}</span></div>`).join('')}<div class="kv"><span class="b">Total pendapatan</span><span class="num b">${rp(x.total)}</span></div>`;
  return `<div class="sec" style="margin-top:6px">1. Dasar premi</div>${hg}
  <div class="kv"><span>Uang jalan diterima${c.tgl_uang_jalan ? ' <small>(' + fd(c.tgl_uang_jalan) + ')</small>' : ''}</span><span class="num">${rp(c.uang_jalan)}</span></div>
  ${c.biaya.map(b => `<div class="kv"><span>– ${esc(b.nama)}${b.liter > 0 && b.hpl > 0 ? ` <small>(${b.liter} L × ${rp(b.hpl)})</small>` : ''}</span><span class="num">${rp(b.jumlah)}</span></div>`).join('')}
  <div class="kv"><span>Total realisasi biaya</span><span class="num">${rp(c.total_biaya)}</span></div>
  <div class="kv"><span>Sisa uang jalan${c.sisa < 0 ? ' <small>(nombok, diganti perusahaan)</small>' : ''}</span><span class="num ${c.sisa < 0 ? 'neg' : ''}">${rp(c.sisa)}</span></div>
  <div class="kv"><span class="b">Dasar premi</span><span class="num b">${rp(c.dasar)}</span></div>
  <div class="sec">2. Pendapatan saya (${c.hari} hari)</div>
  ${c.lines.map(l => `<div style="padding:6px 0;border-bottom:1px dashed var(--border)"><div class="row sp"><span>${esc(l.nama)}</span><b class="num">${rp(l.jumlah)}</b></div><div class="xs muted">${esc(l.rumus)}</div></div>`).join('')}
  <div class="kv"><span class="b">Total pendapatan</span><span class="num b">${rp(x.total)}</span></div>
  <div class="xs muted" style="margin-top:6px">Sisa uang jalan = uang jalan − total realisasi biaya.${x.harga != null ? ' Dasar premi = harga sewa − uang jalan + sisa uang jalan.' : ''}</div>`;
}
PAGES.kpremi = async () => {
  const l = await call('kruPremi'), g = {};
  l.forEach(x => (g[x.a.slice(0, 7)] = g[x.a.slice(0, 7)] || []).push(x));
  return Object.keys(g).sort().reverse().map(m => { const a = g[m], t = a.reduce((s, x) => s + x.total, 0), b = a.filter(x => x.status !== 'Sudah dibayar').reduce((s, x) => s + x.total, 0);
    return `<div class="sec">${MON[+m.slice(5) - 1]} ${m.slice(0, 4)}</div><div class="grid2" style="margin-bottom:10px">${kpi(a.length + ' trip · total', rp(t))}${kpi('Belum dibayar', rp(b))}</div>` +
      a.map(x => `<details class="card"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span><b>${esc(x.rute)}</b><br><small class="muted">${fd(x.a)} · ${esc(x.no)}</small></span><span class="r"><b class="num">${rp(x.total)}</b><br><span class="badge ${x.status === 'Sudah dibayar' ? 'b-ok' : 'b-warn'}">${esc(x.status)}</span></span></summary>${calcHtml(x)}${x.tgl_bayar ? `<div class="xs muted">Dibayar ${fd(x.tgl_bayar)}</div>` : ''}</details>`).join(''); }).join('') || '<div class="empty">Belum ada premi. Premi tampil setelah trip selesai dan dihitung.</div>';
};
PAGES.kmore = async () => `<div class="card"><b>${esc(S.user.nama)}</b><div class="muted sm">Akun kru (hanya lihat)</div></div><button class="item" onclick="toggleTheme()">${ic('moon')}<div class="grow t">Mode terang / gelap</div></button><button class="item" onclick="logout()">${ic('out')}<div class="grow t">Keluar</div></button>`;

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', async () => {
  initTheme(); netWatch();
  const t = ssGet('sb_t'), u = ssGet('sb_u');
  if (t && u) {
    try {
      S.token = t; S.user = JSON.parse(u);
      if (S.user.exp && S.user.exp < Date.now() / 1000) throw new Error('kedaluwarsa');
      applyBoot(await call('boot', {}, { upd: applyBoot }));   // cache lokal tampil seketika, disegarkan di latar
      start(); return;
    } catch (e) { if (S.token) { S.token = null; S.user = null; } if (e.message !== 'kedaluwarsa' && e.message.indexOf('Sesi') < 0) toast(e.message, true); }
  }
  $('#login').hidden = false;
  if (!cfgOk()) { const er = $('#lerr'); er.textContent = 'GAS_URL belum diisi. Buka js/config.js dan tempel URL Web App (/exec).'; er.hidden = false; }
});

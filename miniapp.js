// Self-contained Mini App document and client UI; backend routes stay in worker.js.
export function getMiniAppHtml({ safeBotUser, safeNonce, walletQrData, walletAddress, safeWalletAddress, appVersion }) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Merkoo</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet">
  <script nonce="${safeNonce}" src="https://telegram.org/js/telegram-web-app.js"><\/script>
  <script nonce="${safeNonce}" src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js" crossorigin="anonymous"><\/script>
  <style>
    /* ============================================================
       Merkoo Mini App — Design System v6
       Modern · Minimal · Professional. Grouped lists, big touch
       targets, one token-driven layer. JS hooks preserved:
       --primary/--primary-fg/--accent/--accent-fg set inline by JS;
       .dark / .monochrome-theme on <html>; .title-wrap is the
       Sortable drag handle; .item stays a direct child of
       .folder-items; all ids and data-act attributes unchanged.
       ============================================================ */
    :root {
      --primary: #111318;
      --primary-fg: #ffffff;
      --accent: #111318;
      --accent-fg: #ffffff;
      --tint: var(--accent);
      --tint-fg: var(--accent-fg);
      --bg: #f4f4f6;
      --card: #ffffff;
      --folder-bg: #ececf1;
      --item-bg: #ffffff;
      --item-border: #e3e3ea;
      --field: #f1f1f5;
      --text: #0b0b10;
      --muted: #71717e;
      --border: #e4e4ea;
      --btn-bg: #ececf1;
      --tab-bg: rgba(255, 255, 255, 0.88);
      --danger: #e5484d;
      --success: #18a058;
      --warning: #e8930c;
      --info: #2e7cf6;
      --check-ring: #a6a6b4;
      --shadow: 0 1px 2px rgba(16, 16, 24, 0.05), 0 10px 30px rgba(16, 16, 24, 0.05);
      --menu-shadow: 0 16px 44px rgba(16, 16, 24, 0.16), 0 3px 10px rgba(16, 16, 24, 0.08);
      --r-lg: 24px;
      --r-md: 16px;
      --r-sm: 12px;
      --ease: cubic-bezier(0.32, 0.72, 0.24, 1);
    }
    html.monochrome-theme {
      --tint: var(--primary);
      --tint-fg: var(--primary-fg);
    }
    html.dark, body.dark {
      --bg: #0a0a0c;
      --card: #17171b;
      --folder-bg: #101014;
      --item-bg: #1c1c21;
      --item-border: #2a2a31;
      --field: #232329;
      --text: #f5f5f7;
      --muted: #9b9ba6;
      --border: #292930;
      --btn-bg: #232329;
      --tab-bg: rgba(23, 23, 27, 0.88);
      --danger: #f26d6d;
      --success: #3fb96f;
      --warning: #f5a524;
      --info: #5ea2ff;
      --check-ring: #64646f;
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 32px rgba(0, 0, 0, 0.35);
      --menu-shadow: 0 18px 48px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html { height: 100%; }
    body {
      margin: 0;
      min-height: 100dvh;
      background: var(--bg);
      color: var(--text);
      font-family: "Vazir", "Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      overscroll-behavior-y: none;
    }
    button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; padding: 0; }
    input, select { font: inherit; color: var(--text); }
    svg { display: block; }
    ::selection { background: color-mix(in srgb, var(--tint) 26%, transparent); }
    :focus-visible { outline: 2px solid var(--tint); outline-offset: 2px; }

    @keyframes sheetUp { from { transform: translateY(26px); opacity: 0.4; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes popIn { from { transform: translateY(-4px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    @keyframes itemIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* ---------- App frame ---------- */
    .app-container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      padding: calc(10px + env(safe-area-inset-top, 0px)) 14px calc(118px + env(safe-area-inset-bottom, 0px));
      touch-action: pan-y;
    }
    .main-content { display: flex; flex-direction: column; gap: 13px; }
    .board-layout { display: flex; flex-direction: column; gap: 15px; }
    .compose-column, .list-column { min-width: 0; }
    .list-column { display: flex; flex-direction: column; }

    /* ---------- Brand bar ---------- */
    .brand-actions { display: flex; align-items: center; gap: 8px; margin-inline-start: auto; }
    .brand-action {
      width: 41px; height: 41px; flex: 0 0 auto;
      display: grid; place-items: center;
      background: var(--card); border: 1px solid var(--border); border-radius: 50%;
      color: var(--text); text-decoration: none; box-shadow: var(--shadow);
      transition: transform 0.15s var(--ease), border-color 0.15s, color 0.15s;
    }
    .brand-action:active { transform: scale(0.93); }
    .brand-action svg { width: 19px; height: 19px; fill: currentColor; }
    .brand-action > span { display: none; }
    .brand-action.active { border-color: var(--tint); color: var(--tint); }

    /* ---------- Bottom tab bar ---------- */
    .top-nav {
      position: fixed; z-index: 250;
      left: 50%; transform: translateX(-50%);
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      width: min(calc(100vw - 16px), 520px);
      display: flex; align-items: stretch; gap: 2px;
      padding: 5px;
      background: var(--tab-bg);
      border: 1px solid var(--border); border-radius: 25px;
      box-shadow: var(--menu-shadow);
      backdrop-filter: blur(22px) saturate(1.4);
      -webkit-backdrop-filter: blur(22px) saturate(1.4);
    }
    .tabs { display: flex; flex: 1 1 0; gap: 2px; }
    .nav-actions { display: flex; flex: 1 1 0; gap: 2px; }
    .tab, .nav-btn {
      flex: 1 1 0; min-width: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
      padding: 7px 2px 5px; border-radius: 19px;
      color: var(--muted); font-size: 0.63rem; font-weight: 750;
      position: relative;
      transition: background 0.2s var(--ease), color 0.2s, transform 0.12s var(--ease);
    }
    .tab:active, .nav-btn:active { transform: scale(0.95); }
    .nav-item-icon { display: grid; place-items: center; }
    .nav-item-icon svg { width: 23px; height: 23px; fill: currentColor; }
    .nav-icon-cutout { fill: var(--card); }
    .tab-lbl, .nav-item-label { line-height: 1.1; white-space: nowrap; }
    .tab.active, .nav-btn.active { color: var(--tint); background: color-mix(in srgb, var(--tint) 13%, transparent); }
    .badge {
      position: absolute; top: 3px; inset-inline-end: calc(50% - 25px);
      min-width: 19px; height: 19px; padding: 0 5px;
      display: grid; place-items: center;
      background: var(--tint); color: var(--tint-fg);
      border-radius: 999px; font-size: 0.66rem; font-weight: 850; line-height: 1;
    }
    .badge { display: none !important; }

    /* ---------- Budget bar ---------- */
    .budget-bar {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow);
      overflow: hidden;
    }
    .budget-summary {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 13px 15px; cursor: pointer; user-select: none;
    }
    .budget-stats { display: flex; flex-wrap: wrap; gap: 7px; min-width: 0; }
    .stat-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 12px; border-radius: 999px;
      background: var(--folder-bg); font-size: 0.83rem; font-weight: 800; white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .stat-chip.spent { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
    .stat-chip.pending { background: color-mix(in srgb, var(--info) 13%, transparent); color: var(--info); }
    .filter-toggle-btn { font-size: 0.79rem; font-weight: 750; color: var(--muted); white-space: nowrap; }
    .date-filter-panel { display: none; flex-direction: column; gap: 11px; padding: 2px 15px 15px; }
    .date-filter-panel.open { display: flex; animation: fadeUp 0.22s var(--ease); }
    .quick-date-btns { display: flex; gap: 8px; }
    .q-btn {
      flex: 1; height: 39px; border-radius: 12px;
      background: var(--folder-bg); font-size: 0.81rem; font-weight: 750; color: var(--muted);
      transition: background 0.18s, color 0.18s;
    }
    .q-btn.active { background: var(--tint); color: var(--tint-fg); }
    .date-row { display: flex; align-items: center; gap: 8px; font-size: 0.81rem; font-weight: 700; color: var(--muted); }
    .date-row input { flex: 1; min-width: 0; }
    .months-breakdown-title { font-size: 0.79rem; font-weight: 800; color: var(--muted); }
    .months-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .month-card {
      background: var(--folder-bg); border: 1.5px solid transparent; border-radius: 14px;
      padding: 9px 11px; cursor: pointer; transition: border-color 0.18s, background 0.18s, transform 0.12s var(--ease);
    }
    .month-card:active { transform: scale(0.97); }
    .month-name { display: block; font-size: 0.72rem; font-weight: 700; color: var(--muted); }
    .month-val { display: block; font-size: 0.83rem; font-weight: 850; margin-top: 1px; font-variant-numeric: tabular-nums; }
    .month-card.active { border-color: var(--tint); background: color-mix(in srgb, var(--tint) 10%, transparent); }

    /* ---------- Board heading ---------- */
    .board-heading { padding: 2px 4px 0; }
    .board-heading-title { display: flex; align-items: center; gap: 12px; }
    .board-heading-icon {
      width: 45px; height: 45px; flex: 0 0 auto;
      display: grid; place-items: center;
      background: color-mix(in srgb, var(--tint) 11%, transparent);
      border-radius: 15px;
    }
    .board-heading-icon svg { width: 23px; height: 23px; fill: var(--tint); }
    .board-heading h1 { margin: 0; font-size: 1.32rem; font-weight: 900; line-height: 1.3; letter-spacing: -0.01em; }
    .board-caption { font-size: 0.8rem; font-weight: 700; color: var(--muted); }

    /* ---------- Compose / quick add ---------- */
    .compose-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow); padding: 12px;
    }
    .compose-card-heading { display: flex; align-items: center; }
    .compose-card-heading > span:first-child { display: none; }
    .compose-card-mark { display: none; }
    .quick-add-toggle {
      width: 100%; height: 50px;
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      border-radius: 15px;
      background: var(--tint); color: var(--tint-fg);
      font-size: 0.95rem; font-weight: 850;
      transition: transform 0.15s var(--ease), background 0.2s, color 0.2s;
    }
    .quick-add-toggle:active { transform: scale(0.98); }
    .quick-add-toggle.active { background: var(--btn-bg); color: var(--muted); }
    .quick-add-plus { font-size: 1.18rem; font-weight: 800; line-height: 1; }
    .form-box { display: flex; flex-direction: column; gap: 9px; margin-top: 12px; animation: fadeUp 0.22s var(--ease); }
    .form-box.collapsed { display: none; }
    .compose-card .form-box.collapsed { display: none !important; }
    .form-heading { display: flex; align-items: center; justify-content: space-between; font-size: 0.87rem; }
    .form-close {
      width: 31px; height: 31px; display: grid; place-items: center;
      border-radius: 10px; background: var(--btn-bg); color: var(--muted); font-size: 0.8rem;
    }
    .form-grid-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(118px, 38%); gap: 8px; width: 100%; }
    .form-grid-top.tasks-mode { grid-template-columns: 1fr; }
    .form-grid-meta { display: grid; grid-template-columns: minmax(64px, 22%) minmax(84px, 28%) minmax(0, 1fr); gap: 8px; width: 100%; }
    .form-grid-meta.no-price-mode { grid-template-columns: minmax(80px, 35%) minmax(0, 1fr); }
    .form-grid-bottom { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; width: 100%; }

    /* ---------- Fields ---------- */
    input, select {
      width: 100%; height: 48px; padding: 0 14px;
      background: var(--field); border: 1.5px solid transparent; border-radius: var(--r-md);
      font-size: 16px; outline: none; min-width: 0;
      transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    }
    input::placeholder { color: var(--muted); opacity: 0.75; }
    input:focus, select:focus {
      border-color: var(--tint); background: var(--card);
      box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--tint) 14%, transparent);
    }
    input[type="date"] { color-scheme: light; }
    html.dark input[type="date"], html.dark select { color-scheme: dark; }
    .center-inp { text-align: center; }
    .field-group { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .field-label { font-size: 0.8rem; font-weight: 750; color: var(--muted); }

    /* ---------- Buttons ---------- */
    .add-btn {
      height: 48px; padding: 0 20px; border-radius: 15px; white-space: nowrap;
      background: var(--tint); color: var(--tint-fg);
      font-size: 0.92rem; font-weight: 850;
      transition: transform 0.15s var(--ease), opacity 0.15s;
    }
    .add-btn:active { transform: scale(0.97); }
    .secondary-btn {
      width: 100%; height: 48px; border-radius: 15px;
      background: var(--btn-bg); color: var(--text);
      font-size: 0.87rem; font-weight: 800;
      transition: transform 0.15s var(--ease);
    }
    .secondary-btn:active { transform: scale(0.98); }
    .danger-btn {
      height: 40px; padding: 0 15px; border-radius: 13px; white-space: nowrap;
      background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger);
      font-size: 0.84rem; font-weight: 800;
      transition: transform 0.15s var(--ease), background 0.15s, color 0.15s;
    }
    .danger-btn:active { transform: scale(0.97); }
    .danger-btn.confirming { background: var(--danger); color: #fff; }
    #wipeDataSection .danger-btn { width: 100%; height: 48px; background: var(--danger); color: #fff; }
    .close-btn {
      width: 36px; height: 36px; flex: 0 0 auto;
      display: grid; place-items: center; border-radius: 50%;
      background: var(--btn-bg); color: var(--muted); font-size: 0.84rem;
      transition: transform 0.15s var(--ease);
    }
    .close-btn:active { transform: scale(0.92); }
    .act-btn {
      width: 36px; height: 36px; flex: 0 0 auto;
      display: grid; place-items: center; border-radius: 12px;
      transition: background 0.15s, transform 0.12s var(--ease);
    }
    .act-btn:active { transform: scale(0.9); }
    .act-btn:hover { background: var(--folder-bg); }
    .act-btn svg { width: 19px; height: 19px; fill: var(--muted); }
    .actions { display: flex; align-items: center; gap: 2px; flex: 0 0 auto; }

    /* ---------- Custom dropdown ---------- */
    .custom-dd { position: relative; min-width: 0; }
    .custom-dd-trigger {
      width: 100%; height: 48px; padding: 0 14px;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      background: var(--field); border: 1.5px solid transparent; border-radius: var(--r-md);
      font-size: 16px; text-align: start; cursor: pointer;
      transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    }
    .custom-dd.open { z-index: 1200; }
    .custom-dd.open .custom-dd-trigger {
      border-color: var(--tint); background: var(--card);
      box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--tint) 14%, transparent);
    }
    .custom-dd-label { display: inline-flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .custom-dd-arrow {
      width: 16px; height: 16px; flex: 0 0 auto;
      fill: none; stroke: var(--muted); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
      transition: transform 0.22s var(--ease), stroke 0.18s;
    }
    .custom-dd.open .custom-dd-arrow { transform: rotate(180deg); stroke: var(--tint); }
    .custom-dd-menu {
      position: absolute; top: calc(100% + 6px); inset-inline: 0; z-index: 1201;
      display: none; max-height: min(280px, 45vh); overflow-y: auto;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--r-md);
      box-shadow: var(--menu-shadow); padding: 5px;
    }
    .custom-dd.open .custom-dd-menu { display: block; animation: popIn 0.18s var(--ease); }
    .custom-dd-opt {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 11px 12px; border-radius: 11px; font-size: 0.92rem; cursor: pointer;
    }
    .custom-dd-opt:hover { background: var(--folder-bg); }
    .custom-dd-opt.selected { color: var(--tint); font-weight: 800; background: color-mix(in srgb, var(--tint) 9%, transparent); }

    /* ---------- Category toolbar ---------- */
    .cat-toolbar { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 11px; }
    .cat-bar {
      flex: 1 1 auto; min-width: 0;
      display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
      scrollbar-width: none; cursor: grab;
    }
    .cat-bar::-webkit-scrollbar { display: none; }
    .cat-bar.dragging-scroll { cursor: grabbing; }
    .cat-pill {
      flex: 0 0 auto; height: 40px; padding: 0 14px;
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--card); border: 1px solid var(--border); border-radius: 999px;
      font-size: 0.82rem; font-weight: 750; white-space: nowrap;
      transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.15s var(--ease);
    }
    .cat-pill:active { transform: scale(0.96); }
    .cat-pill.active { background: var(--tint); border-color: var(--tint); color: var(--tint-fg); }
    .cat-mini-icon { width: 15px; height: 15px; display: inline-grid; place-items: center; opacity: 0.75; }
    .cat-mini-icon svg { width: 13px; height: 13px; fill: currentColor; }
    .cat-action-btn {
      flex: 0 0 auto; height: 40px; padding: 0 12px;
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--card); border: 1px solid var(--border); border-radius: 999px;
      font-size: 0.79rem; font-weight: 750; white-space: nowrap;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
    }
    .cat-action-btn svg { width: 15px; height: 15px; fill: currentColor; }
    .cat-action-btn.dashed { border-style: dashed; background: transparent; color: var(--muted); }
    .cat-action-btn.active-panel { background: var(--tint); border-color: var(--tint); color: var(--tint-fg); }
    .sub-bar-box {
      display: none; gap: 7px; margin-bottom: 12px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--r-md);
      box-shadow: var(--shadow); padding: 10px;
    }
    .sub-bar-box.open { display: flex; animation: fadeUp 0.2s var(--ease); }
    #newCatBox.open { align-items: center; }
    #newCatBox input { flex: 1; }
    .sort-options-grid { display: flex; flex-wrap: wrap; gap: 7px; }
    .sort-chip {
      height: 37px; padding: 0 13px; border-radius: 999px;
      background: var(--folder-bg); font-size: 0.79rem; font-weight: 750; color: var(--muted);
      transition: background 0.18s, color 0.18s;
    }
    .sort-chip.active { background: var(--tint); color: var(--tint-fg); }

    /* ---------- Folders: one card, grouped rows ---------- */
    .list { display: flex; flex-direction: column; gap: 13px; }
    .folder-box {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow); overflow: hidden;
      animation: fadeUp 0.24s var(--ease);
    }
    .folder-header {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 15px; cursor: pointer; user-select: none;
    }
    .folder-drag-handle { color: var(--muted); cursor: grab; font-size: 0.92rem; padding: 2px; touch-action: none; flex: 0 0 auto; }
    .folder-tile {
      width: 39px; height: 39px; flex: 0 0 auto;
      display: grid; place-items: center;
      background: var(--folder-bg); border-radius: 13px; font-size: 1.02rem;
    }
    .folder-head-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .folder-name { font-size: 0.96rem; font-weight: 850; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .folder-sub { font-size: 0.75rem; font-weight: 700; color: var(--muted); font-variant-numeric: tabular-nums; }
    .folder-cost-sub { color: var(--muted); font-weight: 700; }
    .folder-title-wrap { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .folder-edit-btn {
      width: 31px; height: 31px; flex: 0 0 auto;
      display: grid; place-items: center; border-radius: 10px;
      background: var(--btn-bg); color: var(--muted); font-size: 0.8rem;
    }
    .folder-count {
      width: 31px; height: 31px; flex: 0 0 auto;
      display: grid; place-items: center; border-radius: 50%;
      background: var(--folder-bg); color: var(--muted);
    }
    .chevron-icon { display: inline-block; font-size: 0.7rem; transition: transform 0.25s var(--ease); }
    .folder-box.collapsed .chevron-icon { transform: rotate(-90deg); }
    .folder-items { display: flex; flex-direction: column; }
    .folder-box.collapsed .folder-items { display: none; }
    .sortable-ghost { opacity: 0.35; }
    .sortable-drag { box-shadow: var(--menu-shadow); }

    /* ---------- Item rows ---------- */
    .item {
      padding: 12px 15px; cursor: pointer;
      animation: itemIn 0.18s var(--ease);
      transition: background 0.18s;
    }
    .folder-items > .item + .item { border-top: 1px solid var(--border); }
    .folder-items > .item.expanded { background: color-mix(in srgb, var(--folder-bg) 55%, transparent); }
    #listContainer > .item {
      background: var(--card);
      border-left: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    }
    #listContainer > .item:first-child { border-top: 1px solid var(--border); border-radius: var(--r-md) var(--r-md) 0 0; }
    #listContainer > .item:last-child { border-radius: 0 0 var(--r-md) var(--r-md); }
    #listContainer > .item:only-child { border-radius: var(--r-md); }
    #listContainer > .item.expanded { background: color-mix(in srgb, var(--folder-bg) 55%, transparent); }
    .item.ltr-item { direction: ltr; }
    .item.rtl-item { direction: rtl; }
    .item-main { display: flex; align-items: flex-start; gap: 12px; }
    .status-toggle-btn {
      width: 31px; height: 31px; flex: 0 0 auto; margin-top: 1px;
      display: grid; place-items: center; border-radius: 50%;
      border: 2.2px solid var(--check-ring);
      background: color-mix(in srgb, var(--muted) 10%, transparent); color: transparent;
      transition: background 0.18s, border-color 0.18s, transform 0.12s var(--ease);
    }
    button.status-toggle-btn:active { transform: scale(0.88); }
    button.status-toggle-btn:hover { border-color: var(--success); }
    .status-toggle-btn svg { width: 16px; height: 16px; fill: #fff; }
    .item.done .status-toggle-btn { background: var(--success); border-color: var(--success); }
    .item-body { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; column-gap: 8px; row-gap: 3px; }
    .title-wrap { min-width: 0; }
    .item .title { font-size: 0.95rem; font-weight: 700; line-height: 1.5; word-break: break-word; }
    .item.done .title { text-decoration: line-through; color: var(--muted); }
    .item-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .meta-badge {
      display: inline-flex; align-items: center;
      background: var(--folder-bg); color: var(--muted);
      padding: 2.5px 8px; border-radius: 999px; font-size: 0.69rem; font-weight: 800; white-space: nowrap;
    }
    .folder-items > .item .meta-badge { background: color-mix(in srgb, var(--muted) 13%, transparent); }
    .meta-badge.price-tag { background: color-mix(in srgb, var(--success) 13%, transparent); color: var(--success); }
    .note-indicator { font-size: 0.84rem; }
    .item-side { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .item-price { font-size: 0.89rem; font-weight: 850; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .item-chev {
      width: 16px; height: 16px;
      fill: none; stroke: var(--muted); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
      transition: transform 0.25s var(--ease);
    }
    .item.expanded .item-chev { transform: rotate(180deg); }
    .item-details-panel {
      display: none; margin-top: 10px;
      background: var(--folder-bg); border-radius: 13px;
      padding: 9px 12px; font-size: 0.78rem; line-height: 1.9; color: var(--muted);
    }
    #listContainer > .item .item-details-panel { background: var(--field); }
    .item.expanded .item-details-panel { display: block; animation: fadeUp 0.18s var(--ease); }
    .item-details-panel b { color: var(--text); }
    .item-actions { display: none; gap: 8px; margin-top: 11px; }
    .item.expanded .item-actions { display: flex; animation: fadeUp 0.18s var(--ease); }
    .mini-btn {
      flex: 1; height: 41px;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border-radius: 12px; background: var(--card);
      border: 1px solid var(--border);
      transition: transform 0.12s var(--ease), background 0.15s;
    }
    .mini-btn:active { transform: scale(0.96); }
    .mini-btn svg { width: 18px; height: 18px; fill: var(--muted); }
    .mini-btn.danger { background: color-mix(in srgb, var(--danger) 9%, transparent); border-color: transparent; }
    .mini-btn.danger svg { fill: var(--danger); }
    .empty, .history-empty, .empty-cat {
      text-align: center; color: var(--muted);
      font-size: 0.88rem; font-weight: 600; line-height: 1.95;
      padding: 32px 16px;
      border: 1.5px dashed var(--border); border-radius: var(--r-lg);
      background: color-mix(in srgb, var(--card) 55%, transparent);
    }

    /* ---------- Modals → bottom sheets ---------- */
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 300;
      display: none; align-items: flex-end; justify-content: center;
      background: rgba(8, 8, 12, 0.55);
      backdrop-filter: blur(8px) saturate(1.2);
      -webkit-backdrop-filter: blur(8px) saturate(1.2);
    }
    .modal-backdrop.open { display: flex; }
    .modal {
      width: 100%; max-width: 500px; max-height: 92dvh; overflow-y: auto;
      display: flex; flex-direction: column; gap: 12px;
      background: var(--bg); border: 1px solid var(--border); border-bottom: 0;
      border-radius: 28px 28px 0 0;
      padding: 16px 17px calc(18px + env(safe-area-inset-bottom, 0px));
      box-shadow: var(--menu-shadow);
      animation: sheetUp 0.32s var(--ease);
    }
    .modal::before {
      content: ""; flex: 0 0 auto;
      width: 40px; height: 4.5px; border-radius: 999px;
      background: var(--border); margin: -6px auto 2px;
    }
    @media (min-width: 560px) {
      .modal-backdrop { align-items: center; padding: 16px; }
      .modal { border-radius: 28px; border-bottom: 1px solid var(--border); animation: popIn 0.24s var(--ease); }
      .modal::before { display: none; }
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      font-size: 1.06rem; font-weight: 850;
    }
    .modal-header > span:first-child { min-width: 0; }

    /* ---------- Full-page views (history / catalog / settings) ---------- */
    body.page-view-active .app-container { height: 0; min-height: 0; margin: 0; padding: 0 !important; }
    body.page-view-active .app-container > :not(.top-nav) { display: none !important; }
    .modal-backdrop.page-view {
      display: block !important; position: relative; inset: auto; z-index: 1;
      width: 100%;
      min-height: calc(100dvh - 78px - env(safe-area-inset-top, 0px));
      padding: calc(12px + env(safe-area-inset-top, 0px)) 14px calc(112px + env(safe-area-inset-bottom, 0px));
      background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
    }
    .modal-backdrop.page-view .modal {
      width: 100%; max-width: 520px; height: auto; min-height: 0; max-height: none;
      margin: 0 auto; overflow: visible;
      background: transparent; border: 0; border-radius: 0;
      padding: 2px 0 18px; box-shadow: none;
      animation: fadeUp 0.24s var(--ease);
    }
    .modal-backdrop.page-view .modal::before { display: none; }
    .modal-backdrop.page-view .modal-header { justify-content: flex-start; margin-bottom: 2px; }
    .modal-backdrop.page-view .modal-header .close-btn { display: none; }

    /* ---------- Settings ---------- */
    .settings-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow);
      padding: 16px; display: flex; flex-direction: column; gap: 13px;
    }
    .settings-card-header { font-size: 0.96rem; font-weight: 850; }
    .setting-block { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .setting-label { font-size: 0.8rem; font-weight: 750; color: var(--muted); }
    .setting-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .setting-row + .setting-row { border-top: 1px solid var(--border); padding-top: 13px; }
    .setting-row-info { min-width: 0; }
    .setting-row-title { font-size: 0.89rem; font-weight: 700; line-height: 1.65; }
    .seg-group {
      display: flex; gap: 3px; padding: 3px;
      background: var(--folder-bg); border-radius: 14px;
    }
    .seg-btn {
      flex: 1 1 0; min-width: 0; height: 39px; padding: 0 8px; border-radius: 11px;
      display: inline-flex; align-items: center; justify-content: center; gap: 5px;
      font-size: 0.81rem; font-weight: 750; color: var(--muted); white-space: nowrap;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.12s var(--ease);
    }
    .seg-btn:active { transform: scale(0.97); }
    .seg-btn.active { background: var(--card); color: var(--text); box-shadow: 0 1px 4px rgba(16, 16, 24, 0.14); }
    html.dark .seg-btn.active { background: #2c2c33; }
    .color-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .color-swatch {
      width: 37px; height: 37px; border-radius: 50%; cursor: pointer;
      border: 1px solid var(--border);
      transition: transform 0.15s var(--ease), box-shadow 0.15s;
    }
    .color-swatch:active { transform: scale(0.9); }
    .color-swatch.active { box-shadow: 0 0 0 2.5px var(--card), 0 0 0 5px var(--tint); }
    .mono-swatch { background: linear-gradient(135deg, #111318 50%, #f5f5f7 50%); }
    .switch { position: relative; flex: 0 0 auto; width: 51px; height: 31px; display: inline-block; }
    .switch input { position: absolute; opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; inset: 0; border-radius: 999px; cursor: pointer;
      background: var(--btn-bg); transition: background 0.22s var(--ease);
    }
    .slider::before {
      content: ""; position: absolute; top: 3px; inset-inline-start: 3px;
      width: 25px; height: 25px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 4px rgba(16, 16, 24, 0.3);
      transition: transform 0.22s var(--ease);
    }
    .switch input:checked + .slider { background: var(--tint); }
    [dir="ltr"] .switch input:checked + .slider::before { transform: translateX(20px); }
    [dir="rtl"] .switch input:checked + .slider::before { transform: translateX(-20px); }
    .partner-row {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border);
      font-size: 0.89rem; font-weight: 700;
    }
    .partner-row:last-child { border-bottom: 0; }
    .partner-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }

    /* ---------- History ---------- */
    .history-modal-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
    #historyModal .danger-btn { height: 35px; padding: 0 12px; font-size: 0.79rem; border-radius: 11px; }
    .history-toolbar { min-width: 0; }
    .history-filter-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow);
      padding: 13px; display: flex; flex-direction: column; gap: 10px;
    }
    .history-filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
    .history-filter-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
    .history-filter-field > span { font-size: 0.72rem; font-weight: 750; color: var(--muted); }
    .history-filter-field input, .history-filter-field select { height: 44px; font-size: 15px; }
    .history-filter-field.full, .full { grid-column: 1 / -1; }
    .history-date-range { display: none; grid-template-columns: 1fr 1fr; gap: 9px; }
    .history-date-range.open { display: grid; }
    .history-date-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; font-size: 0.72rem; font-weight: 750; color: var(--muted); }
    .history-date-field input { height: 44px; font-size: 15px; }
    .history-toolbar-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 0.75rem; color: var(--muted); }
    .history-reset-btn {
      height: 33px; padding: 0 12px; border-radius: 999px;
      background: var(--folder-bg); font-size: 0.75rem; font-weight: 750; color: var(--muted);
    }
    .history-list { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    #historyModal.page-view .history-list {
      max-height: calc(100dvh - 430px); overflow-y: auto;
      padding: 2px 2px 10px; border-radius: 18px;
    }
    .history-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-md); box-shadow: var(--shadow);
      padding: 12px 14px; animation: itemIn 0.18s var(--ease);
    }
    .history-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
    .history-badge {
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.69rem; font-weight: 850; white-space: nowrap;
      background: var(--folder-bg); color: var(--muted);
    }
    .history-badge.bought, .history-badge.completed { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
    .history-badge.added { background: color-mix(in srgb, var(--info) 13%, transparent); color: var(--info); }
    .history-badge.edited { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
    .history-badge.deleted { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
    .history-time { font-size: 0.71rem; font-weight: 700; color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .history-title { font-size: 0.91rem; font-weight: 750; line-height: 1.55; word-break: break-word; }
    .history-meta { font-size: 0.77rem; color: var(--muted); margin-top: 3px; line-height: 1.85; }

    /* ---------- Catalog / price bank: one grouped card ---------- */
    .catalog-list {
      display: flex; flex-direction: column;
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow);
      padding: 2px 15px;
    }
    .catalog-list > .empty { border: 0; background: transparent; }
    .catalog-row {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 0; animation: itemIn 0.18s var(--ease);
    }
    .catalog-row + .catalog-row { border-top: 1px solid var(--border); }
    .catalog-info { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .catalog-title { font-size: 0.92rem; font-weight: 750; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .catalog-sub { font-size: 0.73rem; color: var(--muted); }
    .catalog-price-tag {
      flex: 0 0 auto; padding: 5px 11px; border-radius: 999px;
      background: color-mix(in srgb, var(--success) 13%, transparent); color: var(--success);
      font-size: 0.83rem; font-weight: 850; white-space: nowrap; font-variant-numeric: tabular-nums;
    }
    .catalog-form-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 8px; width: 100%; }

    /* ---------- Community & donate ---------- */
    .community-Section { min-width: 0; }
    .comm-links { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .comm-link {
      display: inline-flex; align-items: center; gap: 7px;
      height: 39px; padding: 0 15px;
      background: var(--card); border: 1px solid var(--border); border-radius: 999px;
      font-size: 0.81rem; font-weight: 750; color: var(--text); text-decoration: none;
      transition: border-color 0.18s, transform 0.15s var(--ease);
    }
    .comm-link:active { transform: scale(0.96); }
    .comm-link svg { width: 16px; height: 16px; fill: var(--text); }
    .comm-link.active-tab { border-color: var(--tint); color: var(--tint); }
    .donate-card {
      display: none; flex-direction: column; align-items: center; gap: 11px;
      margin-top: 10px; padding: 17px;
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow);
    }
    .donate-card.open { display: flex; animation: fadeUp 0.22s var(--ease); }
    .qr-box { position: relative; background: #fff; padding: 10px; border-radius: 18px; }
    .qr-box img { width: 168px; height: 168px; display: block; border-radius: 10px; }
    .ton-badge {
      position: absolute; bottom: -8px; inset-inline-end: -8px;
      width: 36px; height: 36px; border-radius: 50%;
      display: grid; place-items: center;
      background: #0098ea; border: 2.5px solid var(--card);
    }
    .ton-badge svg { width: 18px; height: 18px; fill: #fff; }
    .wallet-addr-box {
      direction: ltr; text-align: center; word-break: break-all;
      font-family: ui-monospace, monospace; font-size: 0.68rem; line-height: 1.7;
      background: var(--folder-bg); border-radius: 11px; padding: 9px 11px; width: 100%;
    }
    .copy-wallet-btn {
      width: 100%; height: 48px; border-radius: 15px;
      background: var(--tint); color: var(--tint-fg);
      font-size: 0.89rem; font-weight: 850;
      transition: transform 0.15s var(--ease);
    }
    .copy-wallet-btn:active { transform: scale(0.98); }
    .ton-note { margin: 0; font-size: 0.73rem; color: var(--muted); text-align: center; }
    .credits-footer { text-align: center; color: var(--muted); font-size: 0.73rem; line-height: 1.95; padding: 4px 0 2px; }
    .credits-footer b { color: var(--text); }

    /* ---------- Scrollbars ---------- */
    .modal::-webkit-scrollbar, .custom-dd-menu::-webkit-scrollbar, .history-list::-webkit-scrollbar { width: 5px; }
    .modal::-webkit-scrollbar-thumb, .custom-dd-menu::-webkit-scrollbar-thumb, .history-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    /* ---------- Small screens ---------- */
    @media (max-width: 380px) {
      .tab, .nav-btn { font-size: 0.6rem; }
      .nav-item-icon svg { width: 21px; height: 21px; }
      .form-grid-meta { grid-template-columns: minmax(56px, 22%) minmax(74px, 28%) minmax(0, 1fr); }
      .history-filter-grid { grid-template-columns: 1fr; }
      .history-filter-field.full { grid-column: auto; }
      .catalog-form-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      .catalog-form-grid .add-btn { grid-column: 1 / -1; }
      .brand-name { font-size: 1.02rem; }
    }
    /* ---------- Animated tab icons (play when a tab becomes active) ---------- */
    @keyframes iconCart { 0% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-3.5px) rotate(-5deg); } 55% { transform: translateY(0.5px) rotate(3deg); } 78% { transform: translateY(-1.5px) rotate(-1.5deg); } 100% { transform: translateY(0) rotate(0deg); } }
    @keyframes iconPop { 0% { transform: scale(1); } 35% { transform: scale(1.22) rotate(-3deg); } 65% { transform: scale(0.94); } 100% { transform: scale(1); } }
    @keyframes iconSpinBack { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    @keyframes iconSlide { 0% { transform: translateX(0); } 30% { transform: translateX(1.8px); } 60% { transform: translateX(-1.4px); } 100% { transform: translateX(0); } }
    .nav-item-icon svg { transform-origin: 50% 50%; }
    #tabShopping.active .nav-item-icon svg { animation: iconCart 0.55s var(--ease); }
    #tabTasks.active .nav-item-icon svg { animation: iconPop 0.45s var(--ease); }
    #btnOpenHistory.active .nav-item-icon svg { animation: iconSpinBack 0.6s var(--ease); }
    #btnOpenSettings .nav-item-icon svg { fill: none; stroke: currentColor; stroke-width: 2.1; stroke-linecap: round; }
    #btnOpenSettings .nav-item-icon svg circle { fill: var(--tab-bg); }
    #btnOpenSettings.active .nav-item-icon svg { animation: iconSlide 0.5s var(--ease); }
    .tab:active .nav-item-icon svg, .nav-btn:active .nav-item-icon svg { transform: scale(0.85); }

    /* ---------- Responsive: tablets, iPad & desktop (Telegram Windows) ---------- */
    @media (min-width: 700px) {
      body { font-size: 15.5px; }
      .app-container { max-width: 680px; padding-inline: 20px; }
      .modal-backdrop.page-view .modal { max-width: 680px; }
      .top-nav { width: min(calc(100vw - 24px), 600px); }
    }
    @media (min-width: 1024px) {
      .app-container { max-width: 1080px; padding-inline: 24px; }
      .board-layout { display: grid; grid-template-columns: 350px minmax(0, 1fr); gap: 20px; align-items: start; }
      .compose-column { position: sticky; top: calc(14px + env(safe-area-inset-top, 0px)); }
      .modal-backdrop.page-view { padding-inline: 24px; }
      .modal-backdrop.page-view .modal { max-width: 880px; }
      #historyModal.page-view .history-list { max-height: calc(100dvh - 400px); }
      .top-nav { width: min(calc(100vw - 24px), 640px); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  </style>
</head>
<body>
<div class="app-container">
    <div class="top-nav">
      <div class="tabs">
        <button type="button" class="tab active" id="tabShopping" data-act="switch-tab" data-val="shopping"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.6 3.4h2.1c.6 0 1.1.4 1.2 1l.5 2.1h14a1 1 0 0 1 1 1.3l-2.2 7.5a2 2 0 0 1-1.9 1.4H8a2 2 0 0 1-2-1.6L4.5 5.4H2.6a1 1 0 1 1 0-2Z"/><path d="M8.3 11h9.4l-.8 2.7H8.8L8.3 11Z" fill="var(--tab-bg)"/><circle cx="9" cy="20" r="1.7"/><circle cx="18" cy="20" r="1.7"/></svg></span><span class="tab-lbl" id="lblNavShop">\u062E\u0631\u06CC\u062F</span><span class="badge" id="countShopping">0</span></button>
        <button type="button" class="tab" id="tabTasks" data-act="switch-tab" data-val="tasks"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H6.7A2.7 2.7 0 0 0 4 5.7v13.6A2.7 2.7 0 0 0 6.7 22h10.6a2.7 2.7 0 0 0 2.7-2.7V5.7A2.7 2.7 0 0 0 17.3 3H16v2H8V3Z"/><path d="M9 2h6a1 1 0 0 1 1 1v3H8V3a1 1 0 0 1 1-1Z"/><path class="nav-icon-cutout" d="M8 10h8v1.5H8zm0 4h8v1.5H8zm0 4h5v1.5H8z"/></svg></span><span class="tab-lbl" id="lblNavTasks">\u06A9\u0627\u0631\u0647\u0627</span><span class="badge" id="countTasks">0</span></button>
      </div>
      <div class="nav-actions">
        <button type="button" class="nav-btn" id="btnOpenHistory" data-act="open-history" title="\u062A\u0627\u0631\u06CC\u062E\u0686\u0647 / History"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1-9.1 5.8L1 6h5v5L4.6 9.6A7.5 7.5 0 1 0 12 4.5V2Z"/><circle class="nav-icon-cutout" cx="12" cy="12" r="6.8"/><path d="M11 7h2v5.1l3.1 1.8-1 1.7-4.1-2.4V7Z"/></svg></span><span class="nav-item-label" id="lblNavHistory">\u062A\u0627\u0631\u06CC\u062E\u0686\u0647</span></button>
        <button type="button" class="nav-btn" id="btnOpenSettings" data-act="open-settings" title="\u062A\u0646\u0638\u06CC\u0645\u0627\u062A / Settings"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.2h8.2M18.4 7.2H20M4 12h2.6M12.8 12H20M4 16.8h10.6M18.8 16.8H20"/><circle cx="15.2" cy="7.2" r="2.4"/><circle cx="9.6" cy="12" r="2.4"/><circle cx="15.8" cy="16.8" r="2.4"/></svg></span><span class="nav-item-label" id="lblNavSettings">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A</span></button>
      </div>
    </div>
    <main class="main-content">
      <div class="budget-bar" id="budgetBar">
        <div class="budget-summary" data-act="toggle-date-filter"><div class="budget-stats"><span class="stat-chip spent" id="lblTotalSpent">\u{1F7E2} \u062E\u0631\u062C\u200C\u0634\u062F\u0647: 0</span><span class="stat-chip pending" id="lblTotalPending">\u{1F534} \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F: 0</span></div><span class="filter-toggle-btn" id="lblDateRangeBtn">\u{1F4C5} \u0641\u06CC\u0644\u062A\u0631 \u25BE</span></div>
        <div class="date-filter-panel" id="dateFilterPanel"><div class="quick-date-btns"><button type="button" class="q-btn active" id="qBtnMonth" data-act="quick-date" data-val="month">\u0627\u06CC\u0646 \u0645\u0627\u0647</button><button type="button" class="q-btn" id="qBtnAll" data-act="quick-date" data-val="all">\u0647\u0645\u0647 \u062A\u0627\u0631\u06CC\u062E\u200C\u0647\u0627</button></div><div class="date-row"><span id="lblFromDate">\u0627\u0632:</span><input type="date" id="filterStartDate" /><span id="lblToDate">\u062A\u0627:</span><input type="date" id="filterEndDate" /></div><div class="months-breakdown-title" id="lblMonthsTitle">\u{1F4CA} \u0644\u06CC\u0633\u062A \u0645\u0627\u0647\u200C\u0647\u0627 (\u0645\u062C\u0645\u0648\u0639 \u062E\u0631\u06CC\u062F \u0647\u0631 \u0645\u0627\u0647):</div><div class="months-grid" id="monthsBreakdownGrid"></div></div>
      </div>
      <div class="board-heading">
        <div class="board-heading-title"><span class="board-heading-icon"><svg id="boardHeadingIcon" viewBox="0 0 24 24"><path d="M3 3h18l-1.6 18H4.6L3 3Zm4 4v2h10V7H7Zm0 5v2h7v-2H7Z"/></svg></span><div><h1 id="boardTitle">\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F</h1><span class="board-caption" id="boardCount">0</span></div><div class="brand-actions"><button type="button" class="brand-action" id="btnOpenCatalog" data-act="open-catalog" title="Price database" aria-label="Price database"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 12.1 12 20.8a1.7 1.7 0 0 1-2.4 0L2.5 13.7V3.5h10.2l8 8a.4.4 0 0 1 0 .6Z"/><circle cx="7.4" cy="7.4" r="1.7"/></svg><span id="lblNavCatalog">\u0642\u06CC\u0645\u062A</span></button><a class="brand-action" id="myOwnBotBtn" href="https://t.me/${safeBotUser}?start=welcome" style="display:none;" title="My List" aria-label="My List"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 14 5H10l2-3ZM5 7h14a3 3 0 0 1 3 3v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7a3 3 0 0 1 3-3Z"/><circle cx="8.5" cy="12" r="1.2"/><circle cx="15.5" cy="12" r="1.2"/></svg><span id="lblNavBot">\u0631\u0628\u0627\u062A</span></a></div></div>
      </div>
      <div class="board-layout">
        <section class="compose-column">
          <div class="compose-card"><div class="compose-card-heading"><span id="lblComposeTitle">\u0627\u0641\u0632\u0648\u062F\u0646 \u0645\u0648\u0631\u062F</span><button type="button" class="quick-add-toggle" id="quickAddToggle" data-act="toggle-add-form" aria-expanded="false"><span class="quick-add-plus">+</span><span id="lblQuickAdd">\u0627\u0641\u0632\u0648\u062F\u0646</span></button></div>
            <div class="form-box collapsed" id="addFormBox">
              <div class="form-heading"><strong id="lblFormHeading">\u0645\u0648\u0631\u062F \u062C\u062F\u06CC\u062F</strong><button type="button" class="form-close" data-act="toggle-add-form" aria-label="Close">\u2715</button></div>
              <div class="form-grid-top" id="formTopRow"><input type="text" id="newItem" maxlength="160" autocomplete="off" /><div class="custom-dd" id="dd_newCategory"></div></div>
              <div class="form-grid-meta" id="shopMetaRow"><input type="number" id="newCount" class="center-inp" min="0.01" max="1000000" step="any" placeholder="\u0645\u0642\u062F\u0627\u0631 (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)" /><div class="custom-dd" id="dd_newUnit"></div><input type="number" id="newPrice" min="0" max="1000000000000" step="any" placeholder="\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)" /></div>
              <div class="form-grid-bottom"><input type="text" id="newQty" maxlength="160" autocomplete="off" /><button type="button" class="add-btn" id="btnAdd" data-act="add-item">\u0627\u0641\u0632\u0648\u062F\u0646</button></div>
            </div>
          </div>
        </section>
        <section class="list-column">
          <div class="cat-toolbar" id="catToolbar"><button type="button" class="cat-action-btn" id="btnSortCats" data-act="toggle-sort-box" title="Sort Folders"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm3 5h10v2H7zm3 5h4v2h-4z"/></svg><span id="lblSortBtn">\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u067E\u0648\u0634\u0647\u200C\u0647\u0627</span></button><button type="button" class="cat-action-btn" id="btnSortList" data-act="toggle-item-sort-box"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h10v2H4zm0 5h7v2H4zm13-1 3 3-3 3v-2h-3v-2h3z"/></svg><span id="lblSortList">\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u0644\u06CC\u0633\u062A</span></button><button type="button" class="cat-action-btn dashed" id="btnAddCatTop" data-act="toggle-new-cat-box"><span class="quick-add-plus">+</span><span id="lblNewCatShort">\u067E\u0648\u0634\u0647</span></button></div>
          <div class="sub-bar-box" id="sortCatBox"><div class="sort-options-grid"><button type="button" class="sort-chip" id="sortOpt_updated" data-act="sort-cat" data-val="updated">\u{1F552} \u0622\u062E\u0631\u06CC\u0646 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC</button><button type="button" class="sort-chip" id="sortOpt_name" data-act="sort-cat" data-val="name">\u{1F524} \u0628\u0631 \u0627\u0633\u0627\u0633 \u0646\u0627\u0645</button><button type="button" class="sort-chip" id="sortOpt_count" data-act="sort-cat" data-val="count">\u{1F4CA} \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0645\u062D\u0635\u0648\u0644</button><button type="button" class="sort-chip" id="sortOpt_default" data-act="sort-cat" data-val="default">\u{1F4CC} \u062A\u0631\u062A\u06CC\u0628 \u062F\u0633\u062A\u06CC</button></div></div>
          <div class="sub-bar-box" id="itemSortBox"><div class="sort-options-grid"><button type="button" class="sort-chip" data-act="set-item-sort" data-val="status" id="itemSortStatus">\u062E\u0631\u06CC\u062F\u0646\u0634\u062F\u0647\u200C\u0647\u0627 \u0628\u0627\u0644\u0627\u060C \u0627\u0646\u062C\u0627\u0645\u200C\u0634\u062F\u0647\u200C\u0647\u0627 \u067E\u0627\u06CC\u06CC\u0646</button><button type="button" class="sort-chip" data-act="set-item-sort" data-val="manual" id="itemSortManual">\u0686\u06CC\u0646\u0634 \u0645\u062D\u0641\u0648\u0638\u200C\u0634\u062F\u0647</button></div></div>
          <div class="sub-bar-box" id="newCatBox"><input type="text" id="directCatInput" maxlength="50" autocomplete="off" /><button type="button" class="add-btn" id="btnSaveCat" data-act="create-cat">\u062B\u0628\u062A \u067E\u0648\u0634\u0647</button></div>
          <div id="listContainer" class="list"></div>
        </section>
      </div>
    </main>
  </div>
  <!-- Rename Category Modal -->
  <div class="modal-backdrop" id="renameCatModal">
    <div class="modal" style="max-width:380px;">
      <div class="modal-header">
        <span id="lblRenameCatTitle">\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u0627\u0645 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC</span>
        <button type="button" class="close-btn" data-act="close-rename-cat">\u2715</button>
      </div>
      <div class="settings-card">
        <div class="field-group">
          <label class="field-label" id="lblRenameCatField">\u0646\u0627\u0645 \u062C\u062F\u06CC\u062F \u067E\u0648\u0634\u0647:</label>
          <input type="text" id="renameCatInput" maxlength="50" autocomplete="off" />
        </div>
        <button type="button" class="add-btn" style="width:100%;" id="btnSaveRenameCat" data-act="save-rename-cat">\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A</button>
        <button type="button" class="danger-btn" style="width:100%; height:44px;" id="btnDeleteCat" data-act="remove-cat" data-cat="">\u062D\u0630\u0641 \u067E\u0648\u0634\u0647</button>
      </div>
    </div>
  </div>

  <!-- Activity History Bank Modal -->
  <div class="modal-backdrop" id="historyModal">
    <div class="modal">
      <div class="modal-header">
        <span id="lblHistoryModalTitle">\u{1F4DC} \u0628\u0627\u0646\u06A9 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u0648 \u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627</span>
        <div class="history-modal-actions">
          <button type="button" class="danger-btn" id="btnClearHistory" style="display:none;" data-act="clear-history">\u{1F9F9} \u067E\u0627\u06A9\u0633\u0627\u0632\u06CC</button>
          <button type="button" class="close-btn" data-act="close-history">\u2715</button>
        </div>
      </div>
      <div class="history-toolbar">
        <div class="history-filter-card">
          <label class="history-filter-field full">
            <span id="lblHistorySearch">\u062C\u0633\u062A\u200C\u0648\u062C\u0648</span>
            <input type="search" id="historySearch" maxlength="100" autocomplete="off" placeholder="\u{1F50D} \u0645\u062D\u0635\u0648\u0644\u060C \u067E\u0648\u0634\u0647 \u06CC\u0627 \u0647\u0645\u06A9\u0627\u0631" />
          </label>
          <div class="history-filter-grid">
            <label class="history-filter-field">
              <span id="lblHistoryRange">\u0628\u0627\u0632\u0647 \u062A\u0627\u0631\u06CC\u062E</span>
              <select id="historyRange">
                <option value="all">\u0647\u0645\u0647 \u062A\u0627\u0631\u06CC\u062E\u200C\u0647\u0627</option>
                <option value="today">\u0627\u0645\u0631\u0648\u0632</option>
                <option value="7d">\u06F7 \u0631\u0648\u0632 \u0627\u062E\u06CC\u0631</option>
                <option value="30d">\u06F3\u06F0 \u0631\u0648\u0632 \u0627\u062E\u06CC\u0631</option>
                <option value="custom">\u0628\u0627\u0632\u0647 \u062F\u0644\u062E\u0648\u0627\u0647</option>
              </select>
            </label>
            <label class="history-filter-field">
              <span id="lblHistoryScope">\u0646\u0648\u0639 \u0641\u0647\u0631\u0633\u062A</span>
              <select id="historyScope">
                <option value="all">\u0647\u0645\u0647 \u0641\u0647\u0631\u0633\u062A\u200C\u0647\u0627</option>
                <option value="shopping">\u{1F6D2} \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F</option>
                <option value="tasks">\u{1F4CB} \u06A9\u0627\u0631\u0647\u0627</option>
              </select>
            </label>
            <label class="history-filter-field full">
              <span id="lblHistoryType">\u0646\u0648\u0639 \u0631\u0648\u06CC\u062F\u0627\u062F</span>
              <select id="historyType">
                <option value="all">\u0647\u0645\u0647 \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627</option>
                <option value="bought">\u{1F7E2} \u062E\u0631\u06CC\u062F</option>
                <option value="unbought">\u{1F534} \u0646\u0627\u062A\u0645\u0627\u0645</option>
                <option value="completed">\u2705 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F</option>
                <option value="reopened">\u21A9 \u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0646\u0627\u062A\u0645\u0627\u0645</option>
                <option value="added">\u2795 \u0627\u0641\u0632\u0648\u062F\u0647</option>
                <option value="edited">\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634</option>
                <option value="deleted">\u{1F5D1} \u062D\u0630\u0641\u200C\u0634\u062F\u0647</option>
              </select>
            </label>
          </div>
          <div class="history-date-range" id="historyDateRange">
            <label class="history-date-field"><span id="lblHistoryFrom">\u0627\u0632</span><input type="date" id="historyDateFrom" /></label>
            <label class="history-date-field"><span id="lblHistoryTo">\u062A\u0627</span><input type="date" id="historyDateTo" /></label>
          </div>
          <div class="history-toolbar-footer">
            <span id="historyResultCount"></span>
            <button type="button" class="history-reset-btn" id="btnResetHistoryFilters" data-act="hist-reset">\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u0647\u0627</button>
          </div>
        </div>
      </div>
      <div class="history-list" id="historyListContainer"></div>
    </div>
  </div>

  <!-- Price Database Modal -->
  <div class="modal-backdrop" id="catalogModal">
    <div class="modal">
      <div class="modal-header">
        <span id="lblCatalogModalTitle">\u{1F3F7} \u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A \u0645\u062D\u0635\u0648\u0644\u0627\u062A</span>
        <button type="button" class="close-btn" data-act="close-catalog">\u2715</button>
      </div>

      <div class="seg-group">
        <button type="button" class="seg-btn" id="catCurrIRT" data-act="set-currency" data-val="IRT">\u062A\u0648\u0645\u0627\u0646</button>
        <button type="button" class="seg-btn" id="catCurrIRR" data-act="set-currency" data-val="IRR">\u0631\u06CC\u0627\u0644</button>
        <button type="button" class="seg-btn" id="catCurrUSD" data-act="set-currency" data-val="USD">$</button>
        <button type="button" class="seg-btn" id="catCurrEUR" data-act="set-currency" data-val="EUR">\u20AC</button>
        <button type="button" class="seg-btn" id="catCurrGBP" data-act="set-currency" data-val="GBP">\xA3</button>
      </div>

      <div class="settings-card" style="padding:10px;">
        <div class="form-grid-top">
          <input type="text" id="catProdName" maxlength="160" autocomplete="off" placeholder="\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644" />
          <div class="custom-dd" id="dd_catProdCategory"></div>
        </div>
        <div class="catalog-form-grid">
          <div class="custom-dd" id="dd_catProdUnit"></div>
          <input type="number" id="catProdPrice" min="0" max="1000000000000" step="any" placeholder="\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F" />
          <button type="button" class="add-btn" id="btnSaveCatalog" data-act="save-catalog">\u062B\u0628\u062A</button>
        </div>
      </div>

      <div class="catalog-list" id="catalogListContainer"></div>
    </div>
  </div>

  <!-- Edit Item Modal -->
  <div class="modal-backdrop" id="editModal">
    <div class="modal">
      <div class="modal-header">
        <span id="lblEditTitle">\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0645\u0648\u0631\u062F</span>
        <button type="button" class="close-btn" data-act="close-edit">\u2715</button>
      </div>

      <div class="settings-card">
        <div class="field-group">
          <label class="field-label" id="lblEditFieldTitle">\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644 / \u0639\u0646\u0648\u0627\u0646 \u06A9\u0627\u0631:</label>
          <input type="text" id="editTitleInput" maxlength="160" autocomplete="off" />
        </div>

        <div class="form-grid-meta" id="editShopMetaRow" style="align-items:flex-end;">
          <div class="field-group">
            <label class="field-label" id="lblEditFieldCount">\u0645\u0642\u062F\u0627\u0631:</label>
            <input type="number" id="editCountInput" class="center-inp" min="0.01" max="1000000" step="any" />
          </div>
          <div class="field-group">
            <label class="field-label" id="lblEditFieldUnit">\u0648\u0627\u062D\u062F:</label>
            <div class="custom-dd" id="dd_editUnitSelect"></div>
          </div>
          <div class="field-group" id="editPriceGroup">
            <label class="field-label" id="lblEditFieldPrice">\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F:</label>
            <input type="number" id="editPriceInput" min="0" max="1000000000000" step="any" placeholder="0" />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" id="lblEditFieldNote">\u062A\u0648\u0636\u06CC\u062D\u0627\u062A / \u06CC\u0627\u062F\u062F\u0627\u0634\u062A:</label>
          <input type="text" id="editQtyInput" maxlength="160" autocomplete="off" />
        </div>

        <div class="field-group" id="editCatGroup">
          <label class="field-label" id="lblEditFieldCat">\u067E\u0648\u0634\u0647 (\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC):</label>
          <div class="custom-dd" id="dd_editCatSelect"></div>
        </div>

        <button type="button" class="add-btn" style="width:100%;margin-top:4px;" id="btnSaveEdit" data-act="save-edit">\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A</button>
      </div>
    </div>
  </div>

  <!-- Settings Modal -->
  <div class="modal-backdrop" id="settingsModal">
    <div class="modal">
      <div class="modal-header">
        <span id="lblSettingsTitle">\u2699\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0645\u06CC\u0646\u06CC\u200C\u0627\u067E</span>
        <button type="button" class="close-btn" data-act="close-settings">\u2715</button>
      </div>

      <div class="settings-card">
        <div class="settings-card-header" id="hdrAppearance">\u{1F3A8} \u0638\u0627\u0647\u0631 \u0648 \u0632\u0628\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647</div>
        
        <div class="setting-block">
          <span class="setting-label" id="lblLangSetting">\u0632\u0628\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647 (Language)</span>
          <div class="seg-group">
            <button type="button" class="seg-btn" id="langFa" data-act="set-lang" data-val="fa">\u{1F1EE}\u{1F1F7} \u0641\u0627\u0631\u0633\u06CC</button>
            <button type="button" class="seg-btn" id="langEn" data-act="set-lang" data-val="en">\u{1F1EC}\u{1F1E7} English</button>
          </div>
        </div>

        <div class="setting-block">
          <span class="setting-label" id="lblThemeMode">\u062D\u0627\u0644\u062A \u0646\u0645\u0627\u06CC\u0634 (Theme)</span>
          <div class="seg-group">
            <button type="button" class="seg-btn" id="thmSystem" data-act="set-theme" data-val="system">\u{1F4F1} \u0633\u06CC\u0633\u062A\u0645</button>
            <button type="button" class="seg-btn" id="thmLight" data-act="set-theme" data-val="light">\u2600\uFE0F \u0631\u0648\u0634\u0646</button>
            <button type="button" class="seg-btn" id="thmDark" data-act="set-theme" data-val="dark">\u{1F319} \u062A\u06CC\u0631\u0647</button>
          </div>
        </div>

        <div class="setting-block">
          <span class="setting-label" id="lblAccent">\u0631\u0646\u06AF \u0627\u0635\u0644\u06CC \u0628\u0631\u0646\u0627\u0645\u0647 (Accent Color)</span>
          <div class="color-row" id="colorSwatches"></div>
        </div>
      </div>

      <div class="settings-card" id="settingsListCard" style="display:none;">
        <div class="settings-card-header" id="hdrListAndPrice">\u{1F3F7} \u0645\u062F\u06CC\u0631\u06CC\u062A \u0642\u06CC\u0645\u062A\u060C \u0648\u0627\u062D\u062F\u0647\u0627 \u0648 \u0686\u06CC\u0646\u0634</div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-title" id="lblUseCatalogTitle">\u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A \u0648 \u0645\u062D\u0627\u0633\u0628\u0647 \u0628\u0648\u062F\u062C\u0647</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="chkUseCatalog">
            <span class="slider"></span>
          </label>
        </div>


        <div class="setting-block" id="currencySettingBlock">
          <span class="setting-label" id="lblCurrencyTitle">\u0648\u0627\u062D\u062F \u067E\u0648\u0644 (Currency)</span>
          <div class="seg-group">
            <button type="button" class="seg-btn" id="currIRT" data-act="set-currency" data-val="IRT">\u062A\u0648\u0645\u0627\u0646</button>
            <button type="button" class="seg-btn" id="currIRR" data-act="set-currency" data-val="IRR">\u0631\u06CC\u0627\u0644</button>
            <button type="button" class="seg-btn" id="currUSD" data-act="set-currency" data-val="USD">\u062F\u0644\u0627\u0631 ($)</button>
            <button type="button" class="seg-btn" id="currEUR" data-act="set-currency" data-val="EUR">\u06CC\u0648\u0631\u0648 (\u20AC)</button>
            <button type="button" class="seg-btn" id="currGBP" data-act="set-currency" data-val="GBP">\u067E\u0648\u0646\u062F (\xA3)</button>
          </div>
        </div>

        <div class="setting-block">
          <span class="setting-label" id="lblCatSortSetting">\u062A\u0631\u062A\u06CC\u0628 \u0646\u0645\u0627\u06CC\u0634 \u067E\u0648\u0634\u0647\u200C\u0647\u0627</span>
          <div class="sort-options-grid">
            <button type="button" class="sort-chip" id="setSort_updated" data-act="sort-cat" data-val="updated">\u{1F552} \u0622\u062E\u0631\u06CC\u0646 \u062A\u063A\u06CC\u06CC\u0631</button>
            <button type="button" class="sort-chip" id="setSort_name" data-act="sort-cat" data-val="name">\u{1F524} \u062D\u0631\u0648\u0641 \u0627\u0644\u0641\u0628\u0627</button>
            <button type="button" class="sort-chip" id="setSort_count" data-act="sort-cat" data-val="count">\u{1F4CA} \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0622\u06CC\u062A\u0645</button>
            <button type="button" class="sort-chip" id="setSort_default" data-act="sort-cat" data-val="default">\u{1F4CC} \u0686\u06CC\u0646\u0634 \u062F\u0633\u062A\u06CC</button>
          </div>
        </div>

      </div>

      <div class="settings-card" id="settingsQtyCard" style="display:none;">
        <div class="settings-card-header" id="hdrQtySection">\u{1F522} \u0646\u0645\u0627\u06CC\u0634 \u062A\u0639\u062F\u0627\u062F \u0648 \u0648\u0627\u062D\u062F</div>
        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-title" id="lblShowUnitsTitle">\u0646\u0645\u0627\u06CC\u0634 \u062A\u06AF \u0645\u0642\u062F\u0627\u0631 \u0648 \u0648\u0627\u062D\u062F (\u0645\u062B\u0644 \u06F1 \u06A9\u06CC\u0644\u0648 / \u06F1 \u0639\u062F\u062F)</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="chkShowUnits">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-card" id="ownerSettingsCard" style="display:none;">
        <div class="settings-card-header" id="hdrOwnerSection">\u{1F465} \u0645\u062F\u06CC\u0631\u06CC\u062A \u0686\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u0648 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646</div>


        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-title" id="lblChatBtnsTitle">\u062F\u06A9\u0645\u0647\u200C\u0647\u0627\u06CC \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC \u062F\u0631 \u0686\u062A \u062A\u0644\u06AF\u0631\u0627\u0645</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="chkChatBtns">
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-block">
          <span class="setting-label" id="lblPermTitle">\u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0645\u062A\u0635\u0644 \u0628\u0647 \u0627\u06CC\u0646 \u0644\u06CC\u0633\u062A:</span>
          <div id="partnersListContainer"></div>
          <div id="blockedPartnersContainer"></div>
        </div>

        <button type="button" class="secondary-btn" id="btnRotateInvite" data-act="rotate-invite">
          \u{1F504} \u0633\u0627\u062E\u062A \u0644\u06CC\u0646\u06A9 \u062F\u0639\u0648\u062A \u062C\u062F\u06CC\u062F (\u0627\u0628\u0637\u0627\u0644 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0642\u0628\u0644\u06CC)
        </button>
      </div>

      <div class="settings-card" id="wipeDataSection" style="display:none;">
        <div class="settings-card-header" style="color:var(--danger);" id="lblDangerZone">\u26A0\uFE0F \u0645\u0646\u0637\u0642\u0647 \u062D\u0633\u0627\u0633 \u0648 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC</div>
        <button type="button" class="danger-btn" id="btnWipeData" data-act="wipe-data"></button>
      </div>

      <div class="community-Section">
        <div class="comm-links">
          <a class="comm-link" href="https://github.com/kiaashkan" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
          <a class="comm-link" href="https://t.me/kiaashkan" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M19 8h-1.81c-.45-.78-1.07-1.45-1.82-1.96l1.22-1.22c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.97 1.97C12.82 5.15 12.42 5 12 5s-.82.15-1.21.38L8.82 3.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.22 1.22C7.88 6.55 7.26 7.22 6.81 8H5c-.55 0-1 .45-1 1s.45 1 1 1h1.09c-.05.33-.09.66-.09 1v1H5c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .34.04.67.09 1H5c-.55 0-1 .45-1 1s.45 1 1 1h1.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.09c.05-.33.09-.66.09-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1c0-.34-.04-.67-.09-1H19c.55 0 1-.45 1-1s-.45-1-1-1zm-5 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>
            Report a bug
          </a>
          <button type="button" class="comm-link" id="donateToggleBtn" data-act="toggle-donate">
            <span style="color:#ef4444;">\u2764\uFE0F</span> Donate
          </button>
        </div>

        <div class="donate-card" id="donateCard">
          <div class="qr-box">
            <img src="${walletQrData}" alt="TON Wallet QR for the configured address" referrerpolicy="no-referrer" />
            <div class="ton-badge">
              <svg viewBox="0 0 24 24"><path d="M5 7h14L12 19 5 7z"/><path d="M12 7v12"/></svg>
            </div>
          </div>
          <div class="wallet-addr-box">${safeWalletAddress}</div>
          <button type="button" class="copy-wallet-btn" id="copyWalletBtn" data-act="copy-wallet">
            Copy TON / GRAM wallet address
          </button>
          <p class="ton-note">TON and supported tokens (GRAM) on the TON network only</p>
        </div>
      </div>

      <div class="credits-footer">
        Developed by <b>KiAashkan</b> with guidance from <b>Argon</b><br>
        <span>Merkoo Mini App \u2014 ${appVersion}</span>
      </div>
    </div>
  </div>

  <script nonce="${safeNonce}">
    const tg = window.Telegram.WebApp;
    try {
      if (tg.ready) tg.ready();
      if (tg.expand) tg.expand();
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
      }
    } catch (e) {}

    const WALLET_ADDRESS = ${JSON.stringify(walletAddress)};
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
    const currentUserId = currentUser ? String(currentUser.id) : '';

    const rawStartParam = String((tg.initDataUnsafe && tg.initDataUnsafe.start_param) || urlParams.get('chat_id') || currentUserId || '');
    const paramParts = rawStartParam.split('_');
    const chatId = paramParts[0] || currentUserId;
    const inviteKey = paramParts[1] || '';

    let sessionToken = '';

    const isOwner = Boolean(currentUserId && chatId && String(currentUserId) === String(chatId));
    if (!isOwner) {
      document.getElementById('myOwnBotBtn').style.display = 'inline-flex';
    }

    const catBarEl = document.getElementById('catBar');
    let isMouseDownOnCatBar = false;
    let catBarStartX = 0;
    let catBarScrollStart = 0;
    let catBarDragged = false;

    if (catBarEl) {
    catBarEl.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const dirMultiplier = document.documentElement.dir === 'rtl' ? -1 : 1;
        catBarEl.scrollLeft += (e.deltaY * dirMultiplier);
      }
    }, { passive: false });

    catBarEl.addEventListener('mousedown', (e) => {
      isMouseDownOnCatBar = true;
      catBarDragged = false;
      catBarStartX = e.pageX;
      catBarScrollStart = catBarEl.scrollLeft;
    });
    }

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDownOnCatBar) return;
      const dx = e.pageX - catBarStartX;
      if (Math.abs(dx) > 5) {
        catBarDragged = true;
        catBarEl.classList.add('dragging-scroll');
        catBarEl.scrollLeft = catBarScrollStart - dx;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDownOnCatBar) {
        isMouseDownOnCatBar = false;
        setTimeout(() => {
          catBarDragged = false;
          catBarEl.classList.remove('dragging-scroll');
        }, 30);
      }
    });

    const DEFAULT_ACCENT = 'mono';
    const COLORS = [DEFAULT_ACCENT, '#10b981', '#d9024d', '#2563eb', '#8b5cf6', '#d97706'];
    const UNITS = [
      { id: 'pcs', fa: '\u0639\u062F\u062F', en: 'pcs' },
      { id: 'kg', fa: '\u06A9\u06CC\u0644\u0648', en: 'kg' },
      { id: 'g', fa: '\u06AF\u0631\u0645', en: 'g' },
      { id: 'pack', fa: '\u0628\u0633\u062A\u0647', en: 'pack' },
      { id: 'tray', fa: '\u0634\u0627\u0646\u0647', en: 'tray' },
      { id: 'bottle', fa: '\u0628\u0637\u0631\u06CC', en: 'bottle' },
      { id: 'l', fa: '\u0644\u06CC\u062A\u0631', en: 'L' }
    ];
    const MONTH_NAMES = {
      fa: ["\u0698\u0627\u0646\u0648\u06CC\u0647", "\u0641\u0648\u0631\u06CC\u0647", "\u0645\u0627\u0631\u0633", "\u0622\u0648\u0631\u06CC\u0644", "\u0645\u0647", "\u0698\u0648\u0626\u0646", "\u0698\u0648\u0626\u06CC\u0647", "\u0627\u0648\u062A", "\u0633\u067E\u062A\u0627\u0645\u0628\u0631", "\u0627\u06A9\u062A\u0628\u0631", "\u0646\u0648\u0627\u0645\u0628\u0631", "\u062F\u0633\u0627\u0645\u0628\u0631"],
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    const STRINGS = {
      fa: {
        shop: "\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F", tasks: "\u06A9\u0627\u0631\u0647\u0627",
        navShop: "\u062E\u0631\u06CC\u062F", navTasks: "\u06A9\u0627\u0631\u0647\u0627", navPrices: "\u0642\u06CC\u0645\u062A", navHistory: "\u062A\u0627\u0631\u06CC\u062E\u0686\u0647", navBot: "\u0631\u0628\u0627\u062A", navSettings: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A",
        add: "\u0627\u0641\u0632\u0648\u062F\u0646", itemPh: "\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644", taskPh: "\u0639\u0646\u0648\u0627\u0646 \u06A9\u0627\u0631 \u0627\u0646\u062C\u0627\u0645\u06CC",
        countPh: "\u0645\u0642\u062F\u0627\u0631 (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)", priceAutoPh: "\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)", priceManualPh: "\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)",
        qtyPh: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)", allCats: "\u0647\u0645\u0647 \u067E\u0648\u0634\u0647\u200C\u0647\u0627",
        noCategoryOpt: "\u2795 \u0633\u0627\u062E\u062A \u067E\u0648\u0634\u0647",
        catRequiredAlert: "\u26A0\uFE0F \u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u06CC\u06A9 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC (\u067E\u0648\u0634\u0647) \u0628\u0633\u0627\u0632\u06CC\u062F \u0648 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F!",
        sortBtn: "\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u067E\u0648\u0634\u0647\u200C\u0647\u0627", sortList: "\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u0644\u06CC\u0633\u062A", sortPendingFirst: "\u062E\u0631\u06CC\u062F\u0646\u0634\u062F\u0647\u200C\u0647\u0627 \u0628\u0627\u0644\u0627\u060C \u0627\u0646\u062C\u0627\u0645\u200C\u0634\u062F\u0647\u200C\u0647\u0627 \u067E\u0627\u06CC\u06CC\u0646", sortManual: "\u062A\u0631\u062A\u06CC\u0628 \u0645\u062D\u0641\u0648\u0638\u200C\u0634\u062F\u0647", newCatShort: "\u067E\u0648\u0634\u0647",
        newCatPh: "\u0646\u0627\u0645 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u062C\u062F\u06CC\u062F", saveCat: "\u062B\u0628\u062A \u067E\u0648\u0634\u0647",
        renameCatTitle: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u0627\u0645 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC", deleteCatBtn: "\u062D\u0630\u0641 \u067E\u0648\u0634\u0647", renameCatField: "\u0646\u0627\u0645 \u062C\u062F\u06CC\u062F \u067E\u0648\u0634\u0647:",
        sortUpdated: "\u{1F552} \u0622\u062E\u0631\u06CC\u0646 \u062A\u063A\u06CC\u06CC\u0631", sortName: "\u{1F524} \u062D\u0631\u0648\u0641 \u0627\u0644\u0641\u0628\u0627", sortCount: "\u{1F4CA} \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0622\u06CC\u062A\u0645", sortDefault: "\u{1F4CC} \u0686\u06CC\u0646\u0634 \u062F\u0633\u062A\u06CC",
        catSortSetting: "\u062A\u0631\u062A\u06CC\u0628 \u0646\u0645\u0627\u06CC\u0634 \u067E\u0648\u0634\u0647\u200C\u0647\u0627",
        emptyShop: "\u062F\u0631 \u0627\u06CC\u0646 \u0628\u0627\u0632\u0647 \u0645\u062D\u0635\u0648\u0644\u06CC \u0646\u06CC\u0633\u062A! \u{1F6D2}", emptyTasks: "\u06A9\u0627\u0631\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A! \u{1F4CB}",
        editTitle: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0645\u0648\u0631\u062F",
        editFieldTitle: "\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644 / \u0639\u0646\u0648\u0627\u0646 \u06A9\u0627\u0631:", editFieldCount: "\u0645\u0642\u062F\u0627\u0631:", editFieldUnit: "\u0648\u0627\u062D\u062F:", editFieldPrice: "\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F:", editFieldNote: "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A / \u06CC\u0627\u062F\u062F\u0627\u0634\u062A:", editFieldCat: "\u067E\u0648\u0634\u0647 (\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC):",
        resetItemMetaBtn: "\u{1F504} \u0631\u06CC\u0633\u062A \u0648\u0627\u062D\u062F \u0628\u0647 \xAB\u06F1 \u0639\u062F\u062F\xBB \u0648 \u062D\u0630\u0641 \u0642\u06CC\u0645\u062A \u0627\u06CC\u0646 \u0645\u062D\u0635\u0648\u0644",
        save: "\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A", settings: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0645\u06CC\u0646\u06CC\u200C\u0627\u067E",
        hdrAppearance: "\u{1F3A8} \u0638\u0627\u0647\u0631 \u0648 \u0632\u0628\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647",
        langSetting: "\u0632\u0628\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647 (Language)",
        appearance: "\u062D\u0627\u0644\u062A \u0646\u0645\u0627\u06CC\u0634 (Theme)",
        thmSys: "\u{1F4F1} \u0633\u06CC\u0633\u062A\u0645", thmLight: "\u2600\uFE0F \u0631\u0648\u0634\u0646", thmDark: "\u{1F319} \u062A\u06CC\u0631\u0647",
        accent: "\u0631\u0646\u06AF \u0627\u0635\u0644\u06CC \u0628\u0631\u0646\u0627\u0645\u0647 (Accent Color)",
        hdrListAndPrice: "\u{1F3F7} \u0645\u062F\u06CC\u0631\u06CC\u062A \u0642\u06CC\u0645\u062A\u060C \u0648\u0627\u062D\u062F\u0647\u0627 \u0648 \u0686\u06CC\u0646\u0634",
        hdrQtySection: "\u{1F522} \u0646\u0645\u0627\u06CC\u0634 \u062A\u0639\u062F\u0627\u062F \u0648 \u0648\u0627\u062D\u062F",
        useCatTitle: "\u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A \u0648 \u0645\u062D\u0627\u0633\u0628\u0647 \u0628\u0648\u062F\u062C\u0647",
        showUnitsTitle: "\u0646\u0645\u0627\u06CC\u0634 \u062A\u06AF \u0645\u0642\u062F\u0627\u0631 \u0648 \u0648\u0627\u062D\u062F (\u0645\u062B\u0644 \u06F1 \u06A9\u06CC\u0644\u0648 / \u06F1 \u0639\u062F\u062F)",
        currTitle: "\u0648\u0627\u062D\u062F \u067E\u0648\u0644 (Currency)",
        hdrOwnerSection: "\u{1F465} \u0645\u062F\u06CC\u0631\u06CC\u062A \u0686\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u0648 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646",
        chatBtnsTitle: "\u062F\u06A9\u0645\u0647\u200C\u0647\u0627\u06CC \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC \u062F\u0631 \u0686\u062A \u062A\u0644\u06AF\u0631\u0627\u0645",
        permTitle: "\u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0645\u062A\u0635\u0644 \u0628\u0647 \u0627\u06CC\u0646 \u0644\u06CC\u0633\u062A:",
        rotateInviteBtn: "\u{1F504} \u0633\u0627\u062E\u062A \u0644\u06CC\u0646\u06A9 \u062F\u0639\u0648\u062A \u062C\u062F\u06CC\u062F (\u0627\u0628\u0637\u0627\u0644 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0642\u0628\u0644\u06CC)",
        rotateInviteDone: "\u2705 \u0644\u06CC\u0646\u06A9 \u062F\u0639\u0648\u062A \u062C\u062F\u06CC\u062F \u0633\u0627\u062E\u062A\u0647 \u0634\u062F \u0648 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u067E\u06CC\u0646\u200C\u0634\u062F\u0647 \u0628\u0631\u0648\u0632 \u0634\u062F\u0646\u062F!",
        unblockBtn: "\u{1F513} \u0631\u0641\u0639 \u0645\u0633\u062F\u0648\u062F\u06CC\u062A",
        dangerZone: "\u26A0\uFE0F \u0645\u0646\u0637\u0642\u0647 \u062D\u0633\u0627\u0633 \u0648 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC",
        wipeBtn1: "\u{1F5D1} \u062D\u0630\u0641 \u06A9\u0627\u0645\u0644 \u062A\u0645\u0627\u0645 \u062F\u0627\u062F\u0647\u200C\u0647\u0627 \u0648 \u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A",
        wipeBtn2: "\u26A0\uFE0F \u0645\u0637\u0645\u0626\u0646\u06CC\u061F (\u06A9\u0644\u06CC\u06A9 \u0645\u062C\u062F\u062F = \u062D\u0630\u0641 \u0646\u0647\u0627\u06CC\u06CC \u0647\u0645\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062A)",
        spentPrefix: "\u{1F7E2} \u062E\u0631\u062C\u200C\u0634\u062F\u0647: ", pendingPrefix: "\u{1F534} \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F: ",
        dateRangeBtn: "\u{1F4C5} \u0641\u06CC\u0644\u062A\u0631 \u25BE", thisMonthBtn: "\u0627\u06CC\u0646 \u0645\u0627\u0647", allDatesBtn: "\u0647\u0645\u0647 \u062A\u0627\u0631\u06CC\u062E\u200C\u0647\u0627",
        fromLbl: "\u0627\u0632:", toLbl: "\u062A\u0627:",
        monthsTitle: "\u{1F4CA} \u0644\u06CC\u0633\u062A \u0645\u0627\u0647\u200C\u0647\u0627 (\u0645\u062C\u0645\u0648\u0639 \u062E\u0631\u06CC\u062F \u0647\u0631 \u0645\u0627\u0647):",
        catModalTitle: "\u{1F3F7} \u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A \u0645\u062D\u0635\u0648\u0644\u0627\u062A",
        catNamePh: "\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644", catPricePh: "\u0642\u06CC\u0645\u062A \u0648\u0627\u062D\u062F", catSaveBtn: "\u062B\u0628\u062A",
        catEmpty: "\u0647\u0646\u0648\u0632 \u0645\u062D\u0635\u0648\u0644\u06CC \u062F\u0631 \u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
        histModalTitle: "\u{1F4DC} \u0628\u0627\u0646\u06A9 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u0648 \u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627",
        histAll: "\u0647\u0645\u0647", histBought: "\u{1F7E2} \u062E\u0631\u06CC\u062F\u0647", histUnbought: "\u{1F534} \u0646\u0627\u062A\u0645\u0627\u0645", histCompleted: "\u2705 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F", histReopened: "\u21A9 \u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0646\u0627\u062A\u0645\u0627\u0645", histDeleted: "\u{1F5D1} \u062D\u0630\u0641\u200C\u0634\u062F\u0647", histAdded: "\u2795 \u0627\u0641\u0632\u0648\u062F\u0647", histEdited: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634",
        histSearchLabel: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648", histRangeLabel: "\u0628\u0627\u0632\u0647 \u0632\u0645\u0627\u0646\u06CC", histScopeLabel: "\u0641\u0647\u0631\u0633\u062A", histTypeLabel: "\u0646\u0648\u0639 \u0631\u0648\u06CC\u062F\u0627\u062F", histTypeAll: "\u0647\u0645\u0647 \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627",
        histSearchPh: "\u{1F50D} \u0645\u062D\u0635\u0648\u0644\u060C \u067E\u0648\u0634\u0647 \u06CC\u0627 \u0647\u0645\u06A9\u0627\u0631", histRangeAll: "\u0647\u0645\u0647 \u062A\u0627\u0631\u06CC\u062E\u200C\u0647\u0627", histRangeToday: "\u0627\u0645\u0631\u0648\u0632", histRange7d: "\u06F7 \u0631\u0648\u0632 \u0627\u062E\u06CC\u0631", histRange30d: "\u06F3\u06F0 \u0631\u0648\u0632 \u0627\u062E\u06CC\u0631", histRangeCustom: "\u0628\u0627\u0632\u0647 \u062F\u0644\u062E\u0648\u0627\u0647", histScopeAll: "\u0647\u0645\u0647 \u0641\u0647\u0631\u0633\u062A\u200C\u0647\u0627", histScopeShopping: "\u{1F6D2} \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F", histScopeTasks: "\u{1F4CB} \u06A9\u0627\u0631\u0647\u0627", histFrom: "\u0627\u0632", histTo: "\u062A\u0627", histReset: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u0647\u0627", histResults: "\u0631\u0648\u06CC\u062F\u0627\u062F",
        histEmpty: "\u0647\u0646\u0648\u0632 \u0631\u0648\u06CC\u062F\u0627\u062F\u06CC \u062F\u0631 \u0628\u0627\u0646\u06A9 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.", histNoMatch: "\u0628\u0627 \u0641\u06CC\u0644\u062A\u0631\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u0631\u0648\u06CC\u062F\u0627\u062F\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F.",
        histClearBtn: "\u{1F9F9} \u067E\u0627\u06A9\u0633\u0627\u0632\u06CC", histClearConfirm: "\u062A\u0645\u0627\u0645 \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627\u06CC \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u062D\u0630\u0641 \u0634\u0648\u0646\u062F\u061F \u0627\u06CC\u0646 \u0639\u0645\u0644 \u0628\u0631\u06AF\u0634\u062A\u200C\u067E\u0630\u06CC\u0631 \u0646\u06CC\u0633\u062A.",
        act_added: "\u2795 \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F", act_bought: "\u{1F7E2} \u062E\u0631\u06CC\u062F \u0634\u062F", act_unbought: "\u{1F534} \u0646\u0627\u062A\u0645\u0627\u0645 \u0634\u062F", act_completed: "\u2705 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F", act_reopened: "\u21A9 \u0628\u0647 \u0646\u0627\u062A\u0645\u0627\u0645 \u0628\u0631\u06AF\u0634\u062A", act_deleted: "\u{1F5D1} \u062D\u0630\u0641 \u0634\u062F", act_edited: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F",
        boughtOn: "\u062A\u0627\u0631\u06CC\u062E \u062E\u0631\u06CC\u062F: ", notBoughtYet: "\u062F\u0631 \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F", perUnit: "\u0647\u0631 "
      },
      en: {
        shop: "Shopping", tasks: "Tasks",
        navShop: "Shop", navTasks: "Tasks", navPrices: "Prices", navHistory: "History", navBot: "Bot", navSettings: "Settings",
        add: "Add", itemPh: "Product name", taskPh: "Task title",
        countPh: "Quantity (optional)", priceAutoPh: "Unit Price (optional)", priceManualPh: "Unit Price (optional)",
        qtyPh: "Note / Details (optional)", allCats: "All Folders",
        noCategoryOpt: "\u2795 New Folder",
        catRequiredAlert: "\u26A0\uFE0F Please create and select a category (folder) first!",
        sortBtn: "Sort Folders", sortList: "Sort List", sortPendingFirst: "Pending first, completed last", sortManual: "Keep current order", newCatShort: "Folder",
        newCatPh: "New category name", saveCat: "Save",
        renameCatTitle: "\u270F\uFE0F Rename Category", deleteCatBtn: "Delete folder", renameCatField: "New folder name:",
        sortUpdated: "\u{1F552} Recently Updated", sortName: "\u{1F524} By Name (A-Z)", sortCount: "\u{1F4CA} Most Items", sortDefault: "\u{1F4CC} Custom Order",
        catSortSetting: "Folder Sort Order",
        emptyShop: "No items in this view! \u{1F6D2}", emptyTasks: "No pending tasks! \u{1F4CB}",
        editTitle: "\u270F\uFE0F Edit Entry",
        editFieldTitle: "Item / Task Name:", editFieldCount: "Qty:", editFieldUnit: "Unit:", editFieldPrice: "Unit Price:", editFieldNote: "Note / Description:", editFieldCat: "Folder (Category):",
        resetItemMetaBtn: "\u{1F504} Reset unit to '1 pcs' & clear price",
        save: "Save Changes", settings: "Mini App Settings",
        hdrAppearance: "\u{1F3A8} Appearance & Language",
        langSetting: "App Language",
        appearance: "Theme Mode",
        thmSys: "\u{1F4F1} System", thmLight: "\u2600\uFE0F Light", thmDark: "\u{1F319} Dark",
        accent: "Accent Color",
        hdrListAndPrice: "\u{1F3F7} Pricing, Units & Sorting",
        hdrQtySection: "\u{1F522} Count & Unit Display",
        useCatTitle: "Price DB & Budget Tracking",
        showUnitsTitle: "Show Quantity & Unit Badges (e.g. 1 kg / 1 pcs)",
        currTitle: "Currency Unit",
        hdrOwnerSection: "\u{1F465} Telegram Chat & Partners",
        chatBtnsTitle: "Inline Buttons in Telegram Chat",
        permTitle: "Connected Partners:",
        rotateInviteBtn: "\u{1F504} Generate New Invite Link (Revoke Old Links)",
        rotateInviteDone: "\u2705 New invite link generated and pinned boards updated!",
        unblockBtn: "\u{1F513} Unblock",
        dangerZone: "\u26A0\uFE0F Danger Zone & Reset",
        wipeBtn1: "\u{1F5D1} Wipe All List Data & Price DB",
        wipeBtn2: "\u26A0\uFE0F Are you sure? Tap again to permanently delete!",
        spentPrefix: "\u{1F7E2} Spent: ", pendingPrefix: "\u{1F534} To Buy: ",
        dateRangeBtn: "\u{1F4C5} Filter \u25BE", thisMonthBtn: "This Month", allDatesBtn: "All Dates",
        fromLbl: "From:", toLbl: "To:",
        monthsTitle: "\u{1F4CA} Monthly Breakdown (Tap a month to filter):",
        catModalTitle: "\u{1F3F7} Product Price Database",
        catNamePh: "Product name", catPricePh: "Unit price", catSaveBtn: "Save",
        catEmpty: "No products saved in Price DB yet.",
        histModalTitle: "\u{1F4DC} Activity & History Bank",
        histAll: "All", histBought: "\u{1F7E2} Bought", histUnbought: "\u{1F534} Pending", histCompleted: "\u2705 Completed", histReopened: "\u21A9 Reopened", histDeleted: "\u{1F5D1} Deleted", histAdded: "\u2795 Added", histEdited: "\u270F\uFE0F Edited",
        histSearchLabel: "Search", histRangeLabel: "Date range", histScopeLabel: "List", histTypeLabel: "Activity", histTypeAll: "All activities",
        histSearchPh: "\u{1F50D} Product, folder, or partner", histRangeAll: "All dates", histRangeToday: "Today", histRange7d: "Last 7 days", histRange30d: "Last 30 days", histRangeCustom: "Custom range", histScopeAll: "All lists", histScopeShopping: "\u{1F6D2} Shopping list", histScopeTasks: "\u{1F4CB} Tasks", histFrom: "From", histTo: "To", histReset: "Reset filters", histResults: "events",
        histEmpty: "No activity recorded in history yet.", histNoMatch: "No events match the current filters.",
        histClearBtn: "\u{1F9F9} Clear", histClearConfirm: "Delete all history events? This cannot be undone.",
        act_added: "\u2795 Added", act_bought: "\u{1F7E2} Bought", act_unbought: "\u{1F534} Marked Pending", act_completed: "\u2705 Completed", act_reopened: "\u21A9 Marked Incomplete", act_deleted: "\u{1F5D1} Deleted", act_edited: "\u270F\uFE0F Edited",
        boughtOn: "Bought on: ", notBoughtYet: "In shopping list", perUnit: "per "
      }
    };

    const ddValues = {
      newCategory: '',
      newUnit: 'pcs',
      catProdCategory: '',
      catProdUnit: 'pcs',
      editUnitSelect: 'pcs',
      editCatSelect: ''
    };

    function escapeHtml(str) {
      return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    function safeNum(val, min = 0, max = 1000000000000, fallback = 0) {
      const n = Number(val);
      if (!Number.isFinite(n)) return fallback;
      if (n < min) return min;
      if (n > max) return max;
      return n;
    }

    function safeCount(val) {
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return null;
      return safeNum(val, 0.01, 1000000, null);
    }

    function renderCustomDropdown(ddKey, options, currentVal, iconPrefix = '') {
      const container = document.getElementById('dd_' + ddKey);
      if (!container) return;

      if (!options || options.length === 0) {
        const s = STRINGS[lang] || STRINGS.fa;
        ddValues[ddKey] = '';
        container.innerHTML = \`
          <button type="button" class="custom-dd-trigger empty-cat" data-act="open-new-cat-prompt">
            <span class="custom-dd-label"><span>\${escapeHtml(s.noCategoryOpt)}</span></span>
          </button>
        \`;
        container._ddOptions = [];
        return;
      }

      if (currentVal !== undefined && currentVal !== null && options.some(o => o.value === currentVal)) {
        ddValues[ddKey] = currentVal;
      }
      const val = ddValues[ddKey];
      const activeOpt = options.find(o => o.value === val) || options[0];
      ddValues[ddKey] = activeOpt.value;

      container.innerHTML = \`
        <button type="button" class="custom-dd-trigger" data-act="dd-toggle" data-dd="\${escapeHtml(ddKey)}">
          <span class="custom-dd-label">\${iconPrefix ? \`<span>\${iconPrefix}</span>\` : ''}<span>\${escapeHtml(activeOpt.label)}</span></span>
          <svg class="custom-dd-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="custom-dd-menu">
          \${options.map((o, i) => \`
            <div class="custom-dd-opt \${o.value === activeOpt.value ? 'selected' : ''}" data-act="dd-select" data-dd="\${escapeHtml(ddKey)}" data-idx="\${i}">
              <span>\${iconPrefix ? \`\${iconPrefix} \` : ''}\${escapeHtml(o.label)}</span>
              \${o.value === activeOpt.value ? '<span>\u2713</span>' : ''}
            </div>
          \`).join('')}
        </div>
      \`;
      container._ddOptions = options;
      container._ddIcon = iconPrefix;
    }

    function openNewCatPrompt() {
      const box = document.getElementById('newCatBox');
      if (!box.classList.contains('open')) {
        toggleNewCatBox();
      } else {
        document.getElementById('directCatInput').focus();
      }
    }

    function toggleCustomDropdown(ddKey) {
      const target = document.getElementById('dd_' + ddKey);
      if (!target) return;
      const wasOpen = target.classList.contains('open');
      document.querySelectorAll('.custom-dd.open').forEach(el => el.classList.remove('open'));
      if (!wasOpen) target.classList.add('open');
    }

    function selectCustomDropdownOption(ddKey, idx) {
      const container = document.getElementById('dd_' + ddKey);
      if (!container || !container._ddOptions || !container._ddOptions[idx]) return;
      const chosen = container._ddOptions[idx];
      ddValues[ddKey] = chosen.value;
      container.classList.remove('open');
      renderCustomDropdown(ddKey, container._ddOptions, chosen.value, container._ddIcon);
    }

    function getUnitLabel(unitId) {
      const u = UNITS.find(x => x.id === (unitId || 'pcs')) || UNITS[0];
      return lang === 'en' ? u.en : u.fa;
    }

    function populateUnitSelects() {
      const unitOpts = UNITS.map(u => ({ value: u.id, label: lang === 'en' ? u.en : u.fa }));
      ['newUnit', 'catProdUnit', 'editUnitSelect'].forEach(key => {
        renderCustomDropdown(key, unitOpts, ddValues[key] || 'pcs', '');
      });
    }

    function getTodayIso() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return \`\${y}-\${m}-\${day}\`;
    }

    function getMonthBoundsFor(year, monthIndex0) {
      const m = String(monthIndex0 + 1).padStart(2, '0');
      const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();
      return {
        start: \`\${year}-\${m}-01\`,
        end: \`\${year}-\${m}-\${String(lastDay).padStart(2, '0')}\`
      };
    }

    function getMonthBounds() {
      const d = new Date();
      return getMonthBoundsFor(d.getFullYear(), d.getMonth());
    }

    function normalizeKey(str) {
      return String(str || '').trim().toLowerCase().replace(/\u064A/g, '\u06CC').replace(/\u0643/g, '\u06A9').replace(/\\s+/g, ' ');
    }

    let activeTab = 'shopping';
    let currentView = 'shopping';
    let selectedCategoryFilter = 'ALL';
    let lang = localStorage.getItem('merkoo_lang') || 'fa';
    let themeMode = localStorage.getItem('merkoo_theme') || 'system';
    if (localStorage.getItem('merkoo_theme_revision') !== 'merkoo-v5') {
      localStorage.setItem('merkoo_accent_v24', DEFAULT_ACCENT);
      localStorage.setItem('merkoo_theme_revision', 'merkoo-v5');
    }
    const rawSavedAccent = localStorage.getItem('merkoo_accent_v24');
    let accentColor = COLORS.includes(rawSavedAccent) ? rawSavedAccent : DEFAULT_ACCENT;
    let currency = 'IRT';
    let useCatalog = false;
    let showUnitBadge = false;
    let catSort = 'count';
    let itemSortMode = 'status';
    let itemSortables = [];
    let catUpdatedAt = {};

    const defaultBounds = getMonthBounds();
    let dateFilterMode = 'month';
    let selectedMonthKey = defaultBounds.start.slice(0, 7);
    let filterStart = defaultBounds.start;
    let filterEnd = defaultBounds.end;

    document.getElementById('filterStartDate').value = filterStart;
    document.getElementById('filterEndDate').value = filterEnd;

    let shoppingItems = [];
    let todoTasks = [];
    let categories = [];
    let catalog = [];
    let historyLogs = [];
    let historyFilter = 'all';
    let historyScope = 'all';
    let activePartners = {};
    let blockedPartners = [];
    let viewerCanEdit = false;
    let openLocalFolders = [];
    let showChatButtons = false;
    let expandedKey = null;
    let editingItemId = null;
    let editingListType = null;
    let renamingOldCatName = null;
    let wipeConfirmStep = 0;

    let foldersSortable = null;

    function isRTLText(str) {
      return /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/.test(String(str || ''));
    }

    function formatMoney(amount) {
      const numStr = safeNum(amount, 0, 100000000000000, 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
      if (currency === 'USD') return '$' + numStr;
      if (currency === 'EUR') return '\u20AC' + numStr;
      if (currency === 'GBP') return '\xA3' + numStr;
      if (currency === 'IRT') return lang === 'en' ? (numStr + ' Toman') : (numStr + ' \u062A\u0648\u0645\u0627\u0646');
      return lang === 'en' ? (numStr + ' Rial') : (numStr + ' \u0631\u06CC\u0627\u0644');
    }

    function formatDateTime(ts) {
      if (!ts) return '';
      const d = new Date(Number(ts));
      if (isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return \`\${y}-\${m}-\${day} | \${hh}:\${mm}\`;
    }

    function findInCatalog(title) {
      if (!useCatalog) return null;
      const k = normalizeKey(title);
      if (!k) return null;
      return catalog.find(c => normalizeKey(c.title) === k) || null;
    }

    function getItemUnitPrice(item) {
      if (!useCatalog) return 0;
      const p = safeNum(item.price, 0, 1000000000000, 0);
      if (p > 0) return p;
      const match = findInCatalog(item.title);
      return match ? safeNum(match.price, 0, 1000000000000, 0) : 0;
    }

    function getItemUnit(item) {
      if (item.unit && item.unit !== 'pcs') return item.unit;
      if (useCatalog) {
        const match = findInCatalog(item.title);
        if (match && match.unit) return match.unit;
      }
      return item.unit || 'pcs';
    }

    function getSortedCategories() {
      const counts = Object.create(null);
      shoppingItems.forEach(item => {
        const c = item.category || '';
        if (c) counts[c] = (counts[c] || 0) + 1;
      });

      const list = [...categories];
      if (catSort === 'name') {
        list.sort((a, b) => String(a).localeCompare(String(b), lang === 'fa' ? 'fa' : 'en'));
      } else if (catSort === 'updated') {
        list.sort((a, b) => (Number(catUpdatedAt[b]) || 0) - (Number(catUpdatedAt[a]) || 0));
      } else if (catSort === 'count') {
        list.sort((a, b) => (Number(counts[b]) || 0) - (Number(counts[a]) || 0));
      }
      return list;
    }

    function initCategorySortables(canEdit) {
      if (typeof Sortable === 'undefined') return;

      const listEl = document.getElementById('listContainer');
      if (foldersSortable) {
        foldersSortable.destroy();
        foldersSortable = null;
      }
      if (canEdit && activeTab === 'shopping' && listEl) {
        foldersSortable = new Sortable(listEl, {
          animation: 200,
          handle: '.folder-drag-handle',
          draggable: '.folder-box',
          delay: 150,
          delayOnTouchOnly: true,
          touchStartThreshold: 8,
          fallbackTolerance: 5,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: () => {
            const movedOrder = Array.from(listEl.querySelectorAll('.folder-box'))
              .map(el => el.getAttribute('data-cat'))
              .filter(Boolean);
            const fullOrder = [...movedOrder];
            categories.forEach(c => {
              if (!fullOrder.includes(c)) fullOrder.push(c);
            });
            if (fullOrder.length > 0) {
              categories = fullOrder;
              catSort = 'default';
              apiCall('reorder_cats', { categories: fullOrder });
            }
          }
        });
      }
      initItemSortables(canEdit);
    }

    function initItemSortables(canEdit) {
      itemSortables.forEach(sortable => sortable.destroy());
      itemSortables = [];
      if (typeof Sortable === 'undefined' || !canEdit || itemSortMode !== 'manual') return;
      const containers = activeTab === 'shopping'
        ? Array.from(document.querySelectorAll('#listContainer .folder-items'))
        : [document.getElementById('listContainer')].filter(Boolean);
      containers.forEach(container => {
        const folder = container.closest('.folder-box');
        const category = folder ? folder.getAttribute('data-cat') || '' : '';
        itemSortables.push(new Sortable(container, {
          animation: 180,
          handle: '.title-wrap',
          draggable: '.item',
          delay: 150,
          delayOnTouchOnly: true,
          touchStartThreshold: 8,
          fallbackTolerance: 5,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: () => {
            const itemIds = Array.from(container.querySelectorAll(':scope > .item')).map(el => el.getAttribute('data-id')).filter(Boolean);
            apiCall('reorder_items', { listType: activeTab === 'tasks' ? 'tasks' : 'shopping', category, item_ids: itemIds });
          }
        }));
      });
    }

    function toggleSortBox() {
      const sortBox = document.getElementById('sortCatBox');
      const newBox = document.getElementById('newCatBox');
      document.getElementById('itemSortBox').classList.remove('open');
      document.getElementById('btnSortList').classList.remove('active-panel');
      newBox.classList.remove('open');
      document.getElementById('btnAddCatTop').classList.remove('active-panel');
      sortBox.classList.toggle('open');
      document.getElementById('btnSortCats').classList.toggle('active-panel', sortBox.classList.contains('open'));
    }

    function changeCategorySort(mode) {
      catSort = mode;
      document.getElementById('sortCatBox').classList.remove('open');
      document.getElementById('btnSortCats').classList.remove('active-panel');
      apiCall('set_cat_sort', { cat_sort: mode });
    }

    function toggleItemSortBox() {
      const box = document.getElementById('itemSortBox');
      document.getElementById('sortCatBox').classList.remove('open');
      document.getElementById('newCatBox').classList.remove('open');
      document.getElementById('btnSortCats').classList.remove('active-panel');
      document.getElementById('btnAddCatTop').classList.remove('active-panel');
      box.classList.toggle('open');
      document.getElementById('btnSortList').classList.toggle('active-panel', box.classList.contains('open'));
    }

    function setItemSortMode(mode) {
      if (!['status', 'manual'].includes(mode)) return;
      itemSortMode = mode;
      document.getElementById('itemSortBox').classList.remove('open');
      document.getElementById('btnSortList').classList.remove('active-panel');
      applyLanguageUI();
      render();
      apiCall('set_item_sort_mode', { item_sort_mode: mode });
    }

    function toggleDateFilterPanel() {
      document.getElementById('dateFilterPanel').classList.toggle('open');
    }

    function setQuickDateRange(mode) {
      dateFilterMode = mode;
      document.getElementById('qBtnMonth').classList.toggle('active', mode === 'month');
      document.getElementById('qBtnAll').classList.toggle('active', mode === 'all');
      if (mode === 'month') {
        const b = getMonthBounds();
        filterStart = b.start;
        filterEnd = b.end;
        selectedMonthKey = b.start.slice(0, 7);
        document.getElementById('filterStartDate').value = filterStart;
        document.getElementById('filterEndDate').value = filterEnd;
      } else {
        filterStart = '';
        filterEnd = '';
        selectedMonthKey = '';
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
      }
      render();
    }

    function selectSpecificMonth(year, monthIndex0) {
      dateFilterMode = 'specific_month';
      document.getElementById('qBtnMonth').classList.remove('active');
      document.getElementById('qBtnAll').classList.remove('active');
      const b = getMonthBoundsFor(year, monthIndex0);
      filterStart = b.start;
      filterEnd = b.end;
      selectedMonthKey = b.start.slice(0, 7);
      document.getElementById('filterStartDate').value = filterStart;
      document.getElementById('filterEndDate').value = filterEnd;
      render();
    }

    function onCustomDateChange() {
      dateFilterMode = 'custom';
      selectedMonthKey = '';
      document.getElementById('qBtnMonth').classList.remove('active');
      document.getElementById('qBtnAll').classList.remove('active');
      filterStart = document.getElementById('filterStartDate').value;
      filterEnd = document.getElementById('filterEndDate').value;
      render();
    }

    function isBoughtInDateRange(item) {
      if (!item.done) return false;
      if (!filterStart && !filterEnd) return true;
      const bDate = String(item.bought_date || item.date || getTodayIso());
      if (filterStart && bDate < filterStart) return false;
      if (filterEnd && bDate > filterEnd) return false;
      return true;
    }

    function shouldDisplayShoppingItem(item) {
      if (!item.done) return true;
      return isBoughtInDateRange(item);
    }

    function renderMonthsBreakdown() {
      const grid = document.getElementById('monthsBreakdownGrid');
      const currentYear = new Date().getFullYear();
      const mNames = MONTH_NAMES[lang] || MONTH_NAMES.fa;

      const monthlyTotals = new Array(12).fill(0);
      shoppingItems.forEach(item => {
        if (!item.done) return;
        const bDate = String(item.bought_date || item.date || '');
        if (bDate.startsWith(String(currentYear) + '-')) {
          const mIdx = parseInt(bDate.slice(5, 7), 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            monthlyTotals[mIdx] += safeCount(item.count) * getItemUnitPrice(item);
          }
        }
      });

      grid.innerHTML = mNames.map((mName, idx) => {
        const mKey = \`\${currentYear}-\${String(idx + 1).padStart(2, '0')}\`;
        const isActive = selectedMonthKey === mKey;
        return \`
          <div class="month-card \${isActive ? 'active' : ''}" data-act="select-month" data-year="\${currentYear}" data-month="\${idx}">
            <span class="month-name">\${mName}</span>
            <span class="month-val">\${formatMoney(monthlyTotals[idx])}</span>
          </div>
        \`;
      }).join('');
    }

    function applyThemeAndColor() {
      let useDark = false;
      if (themeMode === 'dark') useDark = true;
      else if (themeMode === 'light') useDark = false;
      else {
        useDark = (tg.colorScheme === 'dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      document.documentElement.classList.toggle('dark', useDark);
      document.body.classList.toggle('dark', useDark);

      const isMonochrome = accentColor === 'mono' || !COLORS.includes(accentColor);
      const monoPrimary = useDark ? '#f5f5f5' : '#111111';
      const monoFg = useDark ? '#111318' : '#ffffff';
      const selectedAccent = isMonochrome ? (useDark ? '#303030' : monoPrimary) : accentColor;
      const accentRgb = selectedAccent.match(/^#([0-9a-f]{6})$/i);
      const accentChannels = accentRgb ? [0, 2, 4].map((offset) => parseInt(accentRgb[1].slice(offset, offset + 2), 16) / 255) : [0.2, 0.35, 0.85];
      const accentLuminance = accentChannels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const accentForeground = isMonochrome
        ? (useDark ? '#f5f5f5' : monoFg)
        : (accentLuminance > 0.42 ? '#111318' : '#ffffff');
      document.documentElement.classList.toggle('monochrome-theme', isMonochrome);
      document.body.classList.toggle('monochrome-theme', isMonochrome);
      document.documentElement.style.setProperty('--primary', monoPrimary);
      document.documentElement.style.setProperty('--primary-fg', monoFg);
      document.documentElement.style.setProperty('--accent', selectedAccent);
      document.documentElement.style.setProperty('--accent-fg', accentForeground);

      const bgHex = useDark ? '#0a0a0c' : '#f4f4f6';
      try {
        if (tg.setBackgroundColor) tg.setBackgroundColor(bgHex);
        if (tg.setHeaderColor) tg.setHeaderColor(bgHex);
      } catch (e) {}

      ['system', 'light', 'dark'].forEach(m => {
        const el = document.getElementById('thm' + m.charAt(0).toUpperCase() + m.slice(1));
        if (el) el.classList.toggle('active', themeMode === m);
      });
      renderColorSwatches();
    }

    function setThemeMode(mode) {
      themeMode = mode;
      localStorage.setItem('merkoo_theme', mode);
      applyThemeAndColor();
    }

    function setAccentColor(color) {
      if (!COLORS.includes(color)) return;
      accentColor = color;
      localStorage.setItem('merkoo_accent_v24', color);
      applyThemeAndColor();
    }

    function setCurrency(curr) {
      currency = curr;
      apiCall('set_currency', { currency: curr });
    }

    function setUseCatalog(enabled) {
      useCatalog = Boolean(enabled);
      apiCall('set_use_catalog', { use_catalog: useCatalog });
    }

    function setShowUnitBadge(enabled) {
      showUnitBadge = Boolean(enabled);
      apiCall('set_show_unit_badge', { show_unit_badge: showUnitBadge });
    }


    function renderColorSwatches() {
      const box = document.getElementById('colorSwatches');
      box.innerHTML = COLORS.map(c => {
        if (c === 'mono') {
          return \`<div class="color-swatch mono-swatch \${accentColor === 'mono' ? 'active' : ''}" title="Black & White (Auto)" data-act="set-accent" data-val="mono"></div>\`;
        }
        return \`<div class="color-swatch \${c === accentColor ? 'active' : ''}" style="background:\${c}" data-act="set-accent" data-val="\${c}"></div>\`;
      }).join('');
    }

    function toggleDonateCard() {
      const card = document.getElementById('donateCard');
      const btn = document.getElementById('donateToggleBtn');
      card.classList.toggle('open');
      btn.classList.toggle('active-tab', card.classList.contains('open'));
    }

    function copyWalletAddress() {
      const btn = document.getElementById('copyWalletBtn');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(WALLET_ADDRESS);
      } else {
        const temp = document.createElement('textarea');
        temp.value = WALLET_ADDRESS;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      const orig = btn.innerText;
      btn.innerText = "\u2705 Copied to clipboard!";
      setTimeout(() => { btn.innerText = orig; }, 2000);
    }

    function applyLanguageUI() {
      const s = STRINGS[lang] || STRINGS.fa;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      populateUnitSelects();

      document.getElementById('lblNavShop').innerText = s.navShop;
      document.getElementById('lblNavTasks').innerText = s.navTasks;
      document.getElementById('lblNavCatalog').innerText = s.navPrices;
      document.getElementById('lblNavHistory').innerText = s.navHistory;
      document.getElementById('lblNavBot').innerText = s.navBot;
      document.getElementById('lblNavSettings').innerText = s.navSettings;
      document.getElementById('btnAdd').innerText = s.add;
      document.getElementById('lblQuickAdd').innerText = s.add;
      document.getElementById('lblComposeTitle').innerText = s.add;
      document.getElementById('lblFormHeading').innerText = s.add;
      document.getElementById('newItem').placeholder = activeTab === 'shopping' ? s.itemPh : s.taskPh;
      document.getElementById('newCount').placeholder = s.countPh;
      document.getElementById('editCountInput').placeholder = s.countPh;
      document.getElementById('newPrice').placeholder = useCatalog ? s.priceAutoPh : s.priceManualPh;
      document.getElementById('newQty').placeholder = s.qtyPh;
      document.getElementById('lblSortBtn').innerText = s.sortBtn;
      document.getElementById('lblSortList').innerText = s.sortList;
      document.getElementById('itemSortStatus').innerText = s.sortPendingFirst;
      document.getElementById('itemSortManual').innerText = s.sortManual;
      document.getElementById('itemSortStatus').classList.toggle('active', itemSortMode === 'status');
      document.getElementById('itemSortManual').classList.toggle('active', itemSortMode === 'manual');
      document.getElementById('lblNewCatShort').innerText = s.newCatShort;
      document.getElementById('directCatInput').placeholder = s.newCatPh;
      document.getElementById('btnSaveCat').innerText = s.saveCat;

      document.getElementById('lblRenameCatTitle').innerText = s.renameCatTitle;
      document.getElementById('lblRenameCatField').innerText = s.renameCatField;
      document.getElementById('btnSaveRenameCat').innerText = s.save;
      document.getElementById('btnDeleteCat').innerText = s.deleteCatBtn;

      document.getElementById('lblHistoryModalTitle').innerText = s.histModalTitle;
      document.getElementById('lblHistorySearch').innerText = s.histSearchLabel;
      document.getElementById('lblHistoryRange').innerText = s.histRangeLabel;
      document.getElementById('lblHistoryScope').innerText = s.histScopeLabel;
      document.getElementById('lblHistoryType').innerText = s.histTypeLabel;
      document.getElementById('historySearch').placeholder = s.histSearchPh;
      const historyRangeLabels = { all: s.histRangeAll, today: s.histRangeToday, '7d': s.histRange7d, '30d': s.histRange30d, custom: s.histRangeCustom };
      Array.from(document.getElementById('historyRange').options).forEach(o => { o.textContent = historyRangeLabels[o.value] || o.textContent; });
      const historyScopeLabels = { all: s.histScopeAll, shopping: s.histScopeShopping, tasks: s.histScopeTasks };
      Array.from(document.getElementById('historyScope').options).forEach(o => { o.textContent = historyScopeLabels[o.value] || o.textContent; });
      const historyTypeLabels = { all: s.histTypeAll, bought: s.histBought, unbought: s.histUnbought, completed: s.histCompleted, reopened: s.histReopened, added: s.histAdded, edited: s.histEdited, deleted: s.histDeleted };
      Array.from(document.getElementById('historyType').options).forEach(o => { o.textContent = historyTypeLabels[o.value] || o.textContent; });
      document.getElementById('lblHistoryFrom').innerText = s.histFrom;
      document.getElementById('lblHistoryTo').innerText = s.histTo;
      document.getElementById('btnResetHistoryFilters').innerText = s.histReset;
      document.getElementById('btnClearHistory').innerText = s.histClearBtn;

      document.getElementById('lblCatSortSetting').innerText = s.catSortSetting;
      ['updated', 'name', 'count', 'default'].forEach(k => {
        const keyMap = { updated: s.sortUpdated, name: s.sortName, count: s.sortCount, default: s.sortDefault };
        const b1 = document.getElementById('sortOpt_' + k);
        const b2 = document.getElementById('setSort_' + k);
        if (b1) { b1.innerText = keyMap[k]; b1.classList.toggle('active', catSort === k); }
        if (b2) { b2.innerText = keyMap[k]; b2.classList.toggle('active', catSort === k); }
      });

      document.getElementById('lblEditTitle').innerText = s.editTitle;
      document.getElementById('lblEditFieldTitle').innerText = s.editFieldTitle;
      document.getElementById('lblEditFieldCount').innerText = s.editFieldCount;
      document.getElementById('lblEditFieldUnit').innerText = s.editFieldUnit;
      document.getElementById('lblEditFieldPrice').innerText = s.editFieldPrice;
      document.getElementById('lblEditFieldNote').innerText = s.editFieldNote;
      document.getElementById('lblEditFieldCat').innerText = s.editFieldCat;
      document.getElementById('btnSaveEdit').innerText = s.save;

      document.getElementById('lblSettingsTitle').innerText = "\u2699\uFE0F " + s.settings;
      document.getElementById('hdrAppearance').innerText = s.hdrAppearance;
      document.getElementById('lblLangSetting').innerText = s.langSetting;
      document.getElementById('lblThemeMode').innerText = s.appearance;
      document.getElementById('thmSystem').innerText = s.thmSys;
      document.getElementById('thmLight').innerText = s.thmLight;
      document.getElementById('thmDark').innerText = s.thmDark;
      document.getElementById('lblAccent').innerText = s.accent;

      document.getElementById('hdrListAndPrice').innerText = s.hdrListAndPrice;
      document.getElementById('hdrQtySection').innerText = s.hdrQtySection;
      document.getElementById('lblUseCatalogTitle').innerText = s.useCatTitle;
      document.getElementById('chkUseCatalog').checked = useCatalog === true;

      document.getElementById('lblShowUnitsTitle').innerText = s.showUnitsTitle;
      document.getElementById('chkShowUnits').checked = showUnitBadge === true;

      document.getElementById('lblCurrencyTitle').innerText = s.currTitle;

      document.getElementById('hdrOwnerSection').innerText = s.hdrOwnerSection;

      document.getElementById('lblChatBtnsTitle').innerText = s.chatBtnsTitle;
      document.getElementById('chkChatBtns').checked = showChatButtons === true;

      document.getElementById('lblPermTitle').innerText = s.permTitle;
      document.getElementById('btnRotateInvite').innerText = s.rotateInviteBtn;
      document.getElementById('lblDangerZone').innerText = s.dangerZone;
      document.getElementById('lblDateRangeBtn').innerText = s.dateRangeBtn;
      document.getElementById('qBtnMonth').innerText = s.thisMonthBtn;
      document.getElementById('qBtnAll').innerText = s.allDatesBtn;
      document.getElementById('lblFromDate').innerText = s.fromLbl;
      document.getElementById('lblToDate').innerText = s.toLbl;
      document.getElementById('lblMonthsTitle').innerText = s.monthsTitle;
      document.getElementById('lblCatalogModalTitle').innerText = s.catModalTitle;
      document.getElementById('catProdName').placeholder = s.catNamePh;
      document.getElementById('catProdPrice').placeholder = s.catPricePh;
      document.getElementById('btnSaveCatalog').innerText = s.catSaveBtn;
      document.getElementById('langFa').classList.toggle('active', lang === 'fa');
      document.getElementById('langEn').classList.toggle('active', lang === 'en');

      ['IRT', 'IRR', 'USD', 'EUR', 'GBP'].forEach(c => {
        const b1 = document.getElementById('curr' + c);
        const b2 = document.getElementById('catCurr' + c);
        if (b1) b1.classList.toggle('active', currency === c);
        if (b2) b2.classList.toggle('active', currency === c);
      });
      resetWipeButton();
    }

    function setLanguage(newLang) {
      lang = newLang;
      localStorage.setItem('merkoo_lang', newLang);
      applyLanguageUI();
      if (isOwner) apiCall('set_lang', { lang: newLang });
      else render();
    }

    function switchTab(view) {
      const validViews = ['shopping', 'tasks', 'history', 'catalog', 'settings'];
      if (!validViews.includes(view)) view = 'shopping';
      currentView = view;
      if (view === 'shopping' || view === 'tasks') activeTab = view;
      const isShopping = activeTab === 'shopping';
      document.body.classList.toggle('page-view-active', !['shopping', 'tasks'].includes(view));
      document.getElementById('tabShopping').classList.toggle('active', view === 'shopping');
      document.getElementById('tabTasks').classList.toggle('active', view === 'tasks');
      document.getElementById('btnOpenCatalog').classList.toggle('active', view === 'catalog');
      document.getElementById('btnOpenHistory').classList.toggle('active', view === 'history');
      document.getElementById('btnOpenSettings').classList.toggle('active', view === 'settings');
      document.getElementById('formTopRow').classList.toggle('tasks-mode', !isShopping);
      document.getElementById('dd_newCategory').style.display = isShopping ? 'block' : 'none';
      ['historyModal', 'catalogModal', 'settingsModal'].forEach(id => {
        const page = document.getElementById(id);
        page.classList.remove('open', 'page-view');
      });
      const pageId = { history: 'historyModal', catalog: 'catalogModal', settings: 'settingsModal' }[view];
      if (pageId) document.getElementById(pageId).classList.add('page-view');
      if (!isShopping) {
        document.getElementById('newCatBox').classList.remove('open');
        document.getElementById('sortCatBox').classList.remove('open');
        document.getElementById('itemSortBox').classList.remove('open');
      }
      applyLanguageUI();
      render();
      if (view === 'history') renderHistoryModalList();
      if (view === 'catalog') renderCatalogModalList();
    }

    async function apiCall(action, payload = {}) {
      if (!chatId) return;
      const targetTab = payload.listType || activeTab;
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': (tg && tg.initData) ? tg.initData : '',
          'X-Merkoo-Session': sessionToken || ''
        },
        body: JSON.stringify({
          action,
          chatId,
          inviteKey,
          listType: targetTab,
          ...payload
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      if (data.session_token) {
        sessionToken = data.session_token;
      }
      shoppingItems = data.items || [];
      todoTasks = data.tasks || [];
      categories = Array.isArray(data.categories) ? data.categories : [];
      catalog = data.catalog || [];
      historyLogs = data.history || [];
      activePartners = data.active_partners || {};
      blockedPartners = data.blocked_partners || [];
      viewerCanEdit = Boolean(data.viewer_can_edit);
      catUpdatedAt = data.cat_updated_at || {};
      if (data.cat_sort) catSort = data.cat_sort;
      if (['status', 'manual'].includes(data.item_sort_mode)) itemSortMode = data.item_sort_mode;
      if (data.currency) currency = data.currency;
      if (typeof data.use_catalog === 'boolean') useCatalog = data.use_catalog;
      if (typeof data.show_unit_badge === 'boolean') showUnitBadge = data.show_unit_badge;
      showChatButtons = Boolean(data.show_chat_buttons);
      applyLanguageUI();
      render();
      renderCatalogModalList();
      renderHistoryModalList();
    }

    function toggleExpand(key) {
      expandedKey = (expandedKey === key) ? null : key;
      render();
    }

    function toggleLocalFolder(catName) {
      if (openLocalFolders.includes(catName)) {
        openLocalFolders = openLocalFolders.filter(c => c !== catName);
      } else {
        openLocalFolders.push(catName);
      }
      render();
    }

    function toggleNewCatBox() {
      const box = document.getElementById('newCatBox');
      const sortBox = document.getElementById('sortCatBox');
      document.getElementById('itemSortBox').classList.remove('open');
      document.getElementById('btnSortList').classList.remove('active-panel');
      sortBox.classList.remove('open');
      document.getElementById('btnSortCats').classList.remove('active-panel');
      box.classList.toggle('open');
      document.getElementById('btnAddCatTop').classList.toggle('active-panel', box.classList.contains('open'));
      if (box.classList.contains('open')) {
        document.getElementById('directCatInput').focus();
      }
    }

    function toggleAddForm() {
      const form = document.getElementById('addFormBox');
      const button = document.getElementById('quickAddToggle');
      const isOpen = form.classList.toggle('collapsed') === false;
      button.classList.toggle('active', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) setTimeout(() => document.getElementById('newItem').focus(), 40);
    }

    function createDirectCategory() {
      const inp = document.getElementById('directCatInput');
      const name = inp.value.trim();
      if (!name) return;
      inp.value = '';
      document.getElementById('newCatBox').classList.remove('open');
      document.getElementById('btnAddCatTop').classList.remove('active-panel');
      selectedCategoryFilter = name;
      ddValues.newCategory = name;
      apiCall('add_cat', { category: name });
    }

    function openRenameCatModal(oldName) {
      if (!oldName) return;
      renamingOldCatName = oldName;
      document.getElementById('btnDeleteCat').setAttribute('data-cat', oldName);
      const inp = document.getElementById('renameCatInput');
      inp.value = oldName;
      document.getElementById('renameCatModal').classList.add('open');
      setTimeout(() => inp.focus(), 60);
    }

    function closeRenameCatModal() {
      document.getElementById('renameCatModal').classList.remove('open');
      renamingOldCatName = null;
    }

    async function saveCategoryRename() {
      if (!renamingOldCatName) return;
      const newName = document.getElementById('renameCatInput').value.trim();
      if (!newName || newName === renamingOldCatName) {
        closeRenameCatModal();
        return;
      }
      const oldName = renamingOldCatName;
      closeRenameCatModal();

      if (selectedCategoryFilter === oldName) selectedCategoryFilter = newName;
      if (ddValues.newCategory === oldName) ddValues.newCategory = newName;
      if (openLocalFolders.includes(oldName)) {
        openLocalFolders = openLocalFolders.map(c => c === oldName ? newName : c);
      }
      await apiCall('rename_cat', { oldCategory: oldName, newCategory: newName });
    }

    function renderCategories(canEdit) {
      const s = STRINGS[lang] || STRINGS.fa;
      const orderedCats = getSortedCategories();
      const catOpts = orderedCats.map(c => ({ value: c, label: c }));

      const desiredNewCat = (selectedCategoryFilter !== 'ALL' && orderedCats.includes(selectedCategoryFilter))
        ? selectedCategoryFilter
        : (orderedCats.includes(ddValues.newCategory) ? ddValues.newCategory : (orderedCats[0] || ''));

      renderCustomDropdown('newCategory', catOpts, desiredNewCat, '\u{1F4C2}');
      renderCustomDropdown('editCatSelect', catOpts, orderedCats.includes(ddValues.editCatSelect) ? ddValues.editCatSelect : (orderedCats[0] || ''), '\u{1F4C2}');
      renderCustomDropdown('catProdCategory', catOpts, orderedCats.includes(ddValues.catProdCategory) ? ddValues.catProdCategory : (orderedCats[0] || ''), '\u{1F4C2}');

      document.getElementById('btnAddCatTop').style.display = canEdit ? 'inline-flex' : 'none';
      document.getElementById('btnSortCats').style.display = canEdit ? 'inline-flex' : 'none';

      const bar = document.getElementById('catBar');
      if (!bar) return;
      let pills = \`<button type="button" class="cat-pill \${selectedCategoryFilter === 'ALL' ? 'active' : ''}" data-act="filter-cat" data-cat="ALL">\${s.allCats}</button>\`;
      orderedCats.forEach(c => {
        const editIcon = canEdit
          ? \`<span class="cat-mini-icon" data-act="rename-cat-modal" data-cat="\${escapeHtml(c)}" title="Edit">\u270E</span>\`
          : '';
        const delIcon = canEdit
          ? \`<span class="cat-mini-icon" data-act="remove-cat" data-cat="\${escapeHtml(c)}" title="Delete">\u2715</span>\`
          : '';
        pills += \`<button type="button" class="cat-pill \${selectedCategoryFilter === c ? 'active' : ''}" data-act="filter-cat" data-cat="\${escapeHtml(c)}">\u{1F4C2} \${escapeHtml(c)} \${editIcon}\${delIcon}</button>\`;
      });
      bar.innerHTML = pills;
    }

    function filterCat(cat) {
      if (catBarDragged) return;
      selectedCategoryFilter = cat;
      if (cat !== 'ALL') {
        ddValues.newCategory = cat;
        if (!openLocalFolders.includes(cat)) openLocalFolders.push(cat);
      }
      render();
    }

    function renderPartnersList() {
      const s = STRINGS[lang] || STRINGS.fa;
      const container = document.getElementById('partnersListContainer');
      const blockedBox = document.getElementById('blockedPartnersContainer');
      const uids = Object.keys(activePartners);

      if (uids.length === 0) {
        container.innerHTML = '<div style="font-size:0.76rem;color:var(--muted);padding:4px 0;">\u0647\u0646\u0648\u0632 \u0647\u0645\u06A9\u0627\u0631\u06CC \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0627\u06CC\u0646 \u0686\u062A \u0648\u0627\u0631\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.</div>';
      } else {
        container.innerHTML = uids.map(uid => {
          const p = activePartners[uid];
          const isAllowed = p.can_edit === true;
          return \`
            <div class="partner-row">
              <span>\u{1F464} \${escapeHtml(p.name || 'User')}</span>
              <div class="partner-actions">
                <button type="button" class="seg-btn \${isAllowed ? 'active' : ''}" style="min-width:90px;height:30px;border:1px solid var(--border);" data-act="toggle-partner" data-uid="\${escapeHtml(uid)}" data-allow="\${!isAllowed}">
                  \${isAllowed ? '\u{1F513} \u0648\u06CC\u0631\u0627\u06CC\u0634' : '\u{1F441} \u0645\u0634\u0627\u0647\u062F\u0647'}
                </button>
                <button type="button" class="act-btn" style="color:var(--danger);" data-act="remove-partner" data-uid="\${escapeHtml(uid)}" title="Block & Remove">\u{1F5D1}</button>
              </div>
            </div>
          \`;
        }).join('');
      }

      if (blockedBox) {
        if (!blockedPartners || blockedPartners.length === 0) {
          blockedBox.innerHTML = '';
        } else {
          blockedBox.innerHTML = blockedPartners.map(bUid => \`
            <div class="partner-row" style="opacity:0.75;margin-top:4px;">
              <span>\u{1F6AB} ID: \${escapeHtml(bUid)}</span>
              <button type="button" class="seg-btn" style="max-width:110px;height:30px;border:1px solid var(--border);" data-act="unblock-partner" data-uid="\${escapeHtml(bUid)}">\${s.unblockBtn}</button>
            </div>
          \`).join('');
        }
      }
    }

    function togglePartnerAccess(uid, allow) {
      if (!isOwner) return;
      apiCall('set_partner_access', { targetUid: uid, allowed: allow });
    }

    function removePartner(uid) {
      if (!isOwner) return;
      apiCall('remove_partner', { targetUid: uid });
    }

    function unblockPartner(uid) {
      if (!isOwner) return;
      apiCall('unblock_partner', { targetUid: uid });
    }

    async function rotateInviteLink() {
      if (!isOwner) return;
      const s = STRINGS[lang] || STRINGS.fa;
      await apiCall('rotate_invite');
      alert(s.rotateInviteDone);
    }

    function render() {
      const s = STRINGS[lang] || STRINGS.fa;
      document.getElementById('countShopping').innerText = shoppingItems.length;
      document.getElementById('countTasks').innerText = todoTasks.length;
      const activeCount = activeTab === 'shopping' ? shoppingItems.length : todoTasks.length;
      document.getElementById('boardTitle').innerText = activeTab === 'shopping' ? s.shop : s.tasks;
      document.getElementById('boardCount').innerText = String(activeCount) + (lang === 'fa' ? ' مورد' : (activeCount === 1 ? ' item' : ' items'));
      document.getElementById('boardHeadingIcon').innerHTML = activeTab === 'shopping'
        ? '<path d="M3 3h18l-1.6 18H4.6L3 3Zm4 4v2h10V7H7Zm0 5v2h7v-2H7Z"/>'
        : '<path d="M8 3H6.5A2.5 2.5 0 0 0 4 5.5v14A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5v-14A2.5 2.5 0 0 0 17.5 3H16v2h1.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-14a.5.5 0 0 1 .5-.5H8V3Zm1-1h6a1 1 0 0 1 1 1v4H8V3a1 1 0 0 1 1-1Zm1.2 11.8 1.4-1.4 1.4 1.4 2.8-2.8 1.4 1.4-4.2 4.2-2.8-2.8Z"/>';

      const canEdit = isOwner || viewerCanEdit;
      document.getElementById('quickAddToggle').style.display = canEdit ? 'inline-flex' : 'none';
      document.getElementById('addFormBox').style.display = canEdit ? 'flex' : 'none';
      document.getElementById('btnOpenCatalog').style.display = (canEdit && useCatalog) ? 'inline-flex' : 'none';
      document.getElementById('btnOpenHistory').style.display = canEdit ? 'inline-flex' : 'none';

      document.getElementById('settingsListCard').style.display = canEdit ? 'flex' : 'none';
      document.getElementById('settingsQtyCard').style.display = canEdit ? 'flex' : 'none';
      document.getElementById('ownerSettingsCard').style.display = isOwner ? 'flex' : 'none';
      document.getElementById('wipeDataSection').style.display = isOwner ? 'flex' : 'none';

      const shopMetaEl = document.getElementById('shopMetaRow');
      const newPriceInp = document.getElementById('newPrice');
      const budgetBarEl = document.getElementById('budgetBar');

      if (activeTab === 'shopping') {
        shopMetaEl.style.display = 'grid';
        shopMetaEl.classList.toggle('no-price-mode', !useCatalog);
        newPriceInp.style.display = useCatalog ? 'block' : 'none';
        budgetBarEl.style.display = useCatalog ? 'flex' : 'none';
        document.getElementById('catToolbar').style.display = 'flex';
      } else {
        shopMetaEl.style.display = 'none';
        budgetBarEl.style.display = 'none';
        document.getElementById('catToolbar').style.display = 'none';
      }

      if (isOwner) {
        document.getElementById('chkChatBtns').checked = showChatButtons === true;
        renderPartnersList();
      }

      let spentSum = 0, pendingSum = 0;
      if (useCatalog) {
        shoppingItems.forEach(item => {
          const lineTotal = safeCount(item.count) * getItemUnitPrice(item);
          if (item.done) {
            if (isBoughtInDateRange(item)) spentSum += lineTotal;
          } else {
            pendingSum += lineTotal;
          }
        });
      }
      document.getElementById('lblTotalSpent').innerText = s.spentPrefix + formatMoney(spentSum);
      document.getElementById('lblTotalPending').innerText = s.pendingPrefix + formatMoney(pendingSum);

      renderMonthsBreakdown();
      renderCategories(canEdit);

      const container = document.getElementById('listContainer');
      const rawList = activeTab === 'shopping' ? shoppingItems : todoTasks;

      const filteredList = rawList.filter(item => {
        if (activeTab === 'shopping') {
          if (!shouldDisplayShoppingItem(item)) return false;
          if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
            return false;
          }
        }
        return true;
      });

      if (activeTab === 'tasks' && itemSortMode === 'status') {
        filteredList.sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)));
      }

      if (filteredList.length === 0) {
        container.innerHTML = \`<div class="empty">\${activeTab === 'shopping' ? s.emptyShop : s.emptyTasks}</div>\`;
        initCategorySortables(canEdit);
        return;
      }

      if (activeTab === 'shopping') {
        const grouped = Object.create(null);
        filteredList.forEach(item => {
          const c = item.category || categories[0] || '\u2014';
          if (!grouped[c]) grouped[c] = [];
          grouped[c].push(item);
        });

        const orderedCats = getSortedCategories();
        Object.keys(grouped).forEach(c => {
          if (!orderedCats.includes(c)) orderedCats.push(c);
        });

        let html = '';
        orderedCats.forEach(c => {
          if (!grouped[c] || grouped[c].length === 0) return;
          // Keep each folder's pending items first and move purchased items to its end.
          if (itemSortMode === 'status') grouped[c].sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)));
          const doneCount = grouped[c].filter(x => x.done).length;
          const folderSpent = useCatalog
            ? grouped[c].reduce((acc, x) => acc + (safeCount(x.count) * getItemUnitPrice(x)), 0)
            : 0;
          const folderCostBadge = (useCatalog && folderSpent > 0) ? \`<span class="folder-cost-sub">\u2022 \${formatMoney(folderSpent)}</span>\` : '';
          const isFolded = !openLocalFolders.includes(c);
          const dragHandleHtml = canEdit
            ? \`<span class="folder-drag-handle" data-act="noop-stop" title="Drag to reorder">\u283F</span>\`
            : '';
          const editBtnHtml = canEdit
            ? \`<button type="button" class="folder-edit-btn" data-act="rename-cat-modal" data-cat="\${escapeHtml(c)}" title="Rename">\u270E</button>\`
            : '';
          html += \`
            <div class="folder-box \${isFolded ? 'collapsed' : ''}" data-cat="\${escapeHtml(c)}">
              <div class="folder-header" data-act="toggle-folder" data-cat="\${escapeHtml(c)}">
                \${dragHandleHtml}
                <span class="folder-tile">\u{1F4C2}</span>
                <div class="folder-head-text">
                  <span class="folder-name">\${escapeHtml(c)}</span>
                  <span class="folder-sub">\${doneCount} / \${grouped[c].length} \${folderCostBadge}</span>
                </div>
                \${editBtnHtml}
                <span class="folder-count"><span class="chevron-icon">\u25BE</span></span>
              </div>
              <div class="folder-items">
                \${grouped[c].map(item => renderItemCard(item, canEdit)).join('')}
              </div>
            </div>
          \`;
        });
        container.innerHTML = html;
      } else {
        container.innerHTML = filteredList.map(item => renderItemCard(item, canEdit)).join('');
      }

      initCategorySortables(canEdit);
    }

    function renderItemCard(item, canEdit) {
      const s = STRINGS[lang] || STRINGS.fa;
      const rtlClass = isRTLText(item.title) ? 'rtl-item' : 'ltr-item';
      const itemId = String(item.id);
      const markDoneLabel = activeTab === 'tasks' ? s.act_completed : s.act_bought;
      const undoDoneLabel = activeTab === 'tasks' ? s.act_reopened : s.act_unbought;
      const key = activeTab + '_' + itemId;
      const isExpanded = expandedKey === key;
      const count = safeCount(item.count);
      const unitId = activeTab === 'shopping' ? getItemUnit(item) : 'pcs';
      const unitLbl = getUnitLabel(unitId);
      const price = (activeTab === 'shopping' && useCatalog) ? getItemUnitPrice(item) : 0;
      const total = (count || 0) * price;

      let metaHtml = '';
      if (activeTab === 'shopping' && showUnitBadge && count !== null) {
        metaHtml += \`<span class="meta-badge">\${count} \${escapeHtml(unitLbl)}</span>\`;
      }
      if (item.qty && item.qty.trim()) {
        metaHtml += '<span class="note-indicator">\u{1F4AC}</span>';
      }
      const priceHtml = (activeTab === 'shopping' && useCatalog && total > 0)
        ? \`<span class="item-price">\${formatMoney(total)}</span>\` : '';

      let detailsLines = [];
      if (activeTab === 'shopping') {
        if (count !== null) detailsLines.push(\`\u{1F4E6} \${count} \${escapeHtml(unitLbl)}\`);
        if (useCatalog && price > 0) {
          detailsLines.push(\`\u{1F4B0} \${formatMoney(price)} = <b>\${formatMoney(total)}</b>\`);
        }
        if (item.done && item.bought_date) {
          detailsLines.push(\`\u2705 \${s.boughtOn}<b>\${escapeHtml(item.bought_date)}</b>\`);
        } else {
          detailsLines.push(\`\u23F3 \${s.notBoughtYet}\`);
        }
      }
      if (item.qty && item.qty.trim()) {
        detailsLines.push(\`\u{1F4CC} \${escapeHtml(item.qty)}\`);
      }

      return \`
        <div class="item \${rtlClass} \${item.done ? 'done' : ''} \${isExpanded ? 'expanded' : ''}" data-id="\${escapeHtml(itemId)}" data-act="toggle-expand" data-key="\${escapeHtml(key)}">
          <div class="item-main">
            \${canEdit ? \`
              <button type="button" class="status-toggle-btn" data-act="toggle-item" data-id="\${escapeHtml(itemId)}" title="\${item.done ? undoDoneLabel : markDoneLabel}" aria-label="\${item.done ? undoDoneLabel : markDoneLabel}">\${item.done ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>' : ''}</button>
            \` : \`
              <span class="status-toggle-btn" aria-label="\${item.done ? markDoneLabel : undoDoneLabel}">\${item.done ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>' : ''}</span>
            \`}
            <div class="item-body title-wrap">
              <span class="title">\${escapeHtml(item.title)}</span>
              \${metaHtml ? \`<span class="item-meta">\${metaHtml}</span>\` : ''}
            </div>
            <div class="item-side">
              \${priceHtml}
              <svg class="item-chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          \${detailsLines.length > 0 ? \`<div class="item-details-panel">\${detailsLines.join(' &nbsp;|&nbsp; ')}</div>\` : ''}
          \${canEdit ? \`
          <div class="item-actions">
            <button type="button" class="mini-btn" data-act="edit-item" data-id="\${escapeHtml(itemId)}" title="Edit" aria-label="Edit">
              <svg viewBox="0 0 24 24"><path d="m3 17.25 11.6-11.6 3.75 3.75L6.75 21H3v-3.75ZM20.7 7.05a1 1 0 0 0 0-1.4l-2.35-2.36a1 1 0 0 0-1.42 0l-1.3 1.3 3.76 3.76 1.31-1.3Z"/></svg>
            </button>
            <button type="button" class="mini-btn danger" data-act="delete-item" data-id="\${escapeHtml(itemId)}" title="Delete" aria-label="Delete">
              <svg viewBox="0 0 24 24"><path d="M8 4V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a1 1 0 1 1 0 2h-1v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6H4a1 1 0 1 1 0-2h4Zm2 0h4V3h-4v1Zm-3 2v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6H7Z"/><path d="M9 8h2v9H9zm4 0h2v9h-2z"/></svg>
            </button>
          </div>\` : ''}
        </div>
      \`;
    }

    function addItem() {
      const s = STRINGS[lang] || STRINGS.fa;
      const titleInput = document.getElementById('newItem');
      const qtyInput = document.getElementById('newQty');
      const countInput = document.getElementById('newCount');
      const priceInput = document.getElementById('newPrice');

      const title = titleInput.value.trim();
      const qty = qtyInput.value.trim();
      const count = safeCount(countInput.value);
      const unit = ddValues.newUnit || 'pcs';
      const price = useCatalog ? safeNum(priceInput.value, 0, 1000000000000, 0) : 0;
      const category = (ddValues.newCategory || '').trim();

      if (!title) return;

      if (activeTab === 'shopping' && (!categories.length || !category || !categories.includes(category))) {
        alert(s.catRequiredAlert);
        openNewCatPrompt();
        return;
      }

      titleInput.value = '';
      qtyInput.value = '';
      countInput.value = '';
      priceInput.value = '';
      ddValues.newUnit = 'pcs';
      populateUnitSelects();
      apiCall('add', { title, qty, count, unit, price, category });
    }

    function toggleItem(itemId) {
      apiCall('toggle', { itemId, clientDate: getTodayIso() });
    }
    function deleteItem(itemId) {
      apiCall('delete', { itemId });
    }

    function openHistoryModal() {
      switchTab('history');
    }
    function closeHistoryModal() {
      switchTab(activeTab);
    }
    function setHistoryFilter(f) {
      historyFilter = f;
      document.getElementById('historyType').value = f;
      renderHistoryModalList();
    }
    function setHistoryScope(scope) {
      historyScope = scope;
      document.getElementById('historyScope').value = scope;
      renderHistoryModalList();
    }
    function resetHistoryFilters() {
      historyFilter = 'all';
      historyScope = 'all';
      document.getElementById('historySearch').value = '';
      document.getElementById('historyRange').value = 'all';
      document.getElementById('historyType').value = 'all';
      document.getElementById('historyScope').value = 'all';
      document.getElementById('historyDateFrom').value = '';
      document.getElementById('historyDateTo').value = '';
      document.getElementById('historyDateRange').classList.remove('open');
      setHistoryFilter('all');
      setHistoryScope('all');
    }
    function renderHistoryModalList() {
      const s = STRINGS[lang] || STRINGS.fa;
      const box = document.getElementById('historyListContainer');
      const clearBtn = document.getElementById('btnClearHistory');
      if (!box) return;

      const search = normalizeKey(document.getElementById('historySearch').value);
      const range = document.getElementById('historyRange').value;
      const fromValue = document.getElementById('historyDateFrom').value;
      const toValue = document.getElementById('historyDateTo').value;
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      let minTs = null;
      let maxTs = null;
      if (range === 'today') {
        minTs = todayStart;
        maxTs = todayStart + 86400000;
      } else if (range === '7d' || range === '30d') {
        const days = range === '7d' ? 7 : 30;
        minTs = todayStart - ((days - 1) * 86400000);
        maxTs = todayStart + 86400000;
      } else if (range === 'custom') {
        if (fromValue) minTs = new Date(fromValue + 'T00:00:00').getTime();
        if (toValue) maxTs = new Date(toValue + 'T23:59:59.999').getTime() + 1;
      }
      const allLogs = Array.isArray(historyLogs) ? historyLogs : [];
      const filtered = allLogs.filter(h => {
        const eventType = h.listType === 'tasks' ? ({ bought: 'completed', unbought: 'reopened' }[h.type] || h.type) : h.type;
        if (historyFilter !== 'all' && eventType !== historyFilter) return false;
        if (historyScope !== 'all' && h.listType !== historyScope) return false;
        const ts = Number(h.ts);
        if ((minTs !== null || maxTs !== null) && (!Number.isFinite(ts) || (minTs !== null && ts < minTs) || (maxTs !== null && ts >= maxTs))) return false;
        if (search) {
          const searchable = normalizeKey([h.title, h.category, h.user, h.type, h.listType].join(' '));
          if (!searchable.includes(search)) return false;
        }
        return true;
      });
      filtered.sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
      const countEl = document.getElementById('historyResultCount');
      if (countEl) countEl.textContent = \`\${filtered.length} / \${allLogs.length} \${s.histResults}\`;

      if (clearBtn) {
        clearBtn.style.display = (isOwner && allLogs.length > 0) ? 'block' : 'none';
      }

      if (filtered.length === 0) {
        const emptyMessage = allLogs.length === 0 ? s.histEmpty : s.histNoMatch;
        box.innerHTML = \`<div class="history-empty">\${escapeHtml(emptyMessage)}</div>\`;
        return;
      }

      box.innerHTML = filtered.map(h => {
        const eventType = h.listType === 'tasks' ? ({ bought: 'completed', unbought: 'reopened' }[h.type] || h.type) : h.type;
        const badgeLabel = s['act_' + eventType] || escapeHtml(eventType);
        const unitLbl = getUnitLabel(h.unit || 'pcs');
        const itemCount = safeCount(h.count);
        const safePrice = safeNum(h.price, 0, 1000000000000, 0);
        const total = itemCount * safePrice;
        const metaParts = [];
        if (h.category) metaParts.push(\`\u{1F4C2} \${escapeHtml(h.category)}\`);
        if (h.listType !== 'tasks' && itemCount !== null) {
          metaParts.push(\`\u{1F522} \${itemCount} \${escapeHtml(unitLbl)}\`);
        }
        if (useCatalog && total > 0) metaParts.push(\`\u{1F4B0} \${formatMoney(total)}\`);
        if (h.user) metaParts.push(\`\u{1F464} \${escapeHtml(h.user)}\`);

        return \`
          <div class="history-card">
            <div class="history-top">
              <span class="history-badge \${escapeHtml(h.type)}">\${badgeLabel}</span>
              <span class="history-time">\u{1F552} \${escapeHtml(formatDateTime(h.ts))}</span>
            </div>
            <div class="history-title">\${escapeHtml(h.title)}</div>
            \${metaParts.length > 0 ? \`<div class="history-meta">\${metaParts.join(' \u2022 ')}</div>\` : ''}
          </div>
        \`;
      }).join('');
    }
    function clearHistoryLogs() {
      if (!isOwner) return;
      const s = STRINGS[lang] || STRINGS.fa;
      if (!window.confirm(s.histClearConfirm)) return;
      apiCall('clear_history');
    }

    function openCatalogModal() {
      switchTab('catalog');
    }
    function closeCatalogModal() {
      switchTab(activeTab);
    }
    function renderCatalogModalList() {
      const s = STRINGS[lang] || STRINGS.fa;
      const box = document.getElementById('catalogListContainer');
      if (!catalog || catalog.length === 0) {
        box.innerHTML = \`<div class="empty" style="padding:16px 0;">\${s.catEmpty}</div>\`;
        return;
      }
      box.innerHTML = catalog.map(c => {
        const uLabel = getUnitLabel(c.unit || 'pcs');
        const cid = String(c.id);
        return \`
          <div class="catalog-row">
            <div class="catalog-info">
              <span class="catalog-title">\${escapeHtml(c.title)}</span>
              <span class="catalog-sub">\u{1F4C2} \${escapeHtml(c.category || '\u2014')} \u2022 \${s.perUnit}\${escapeHtml(uLabel)}</span>
            </div>
            <span class="catalog-price-tag">\${formatMoney(c.price)}</span>
            <div class="actions">
              <button type="button" class="act-btn" data-act="fill-catalog" data-id="\${escapeHtml(cid)}">
                <svg viewBox="0 0 24 24"><path d="m3 17.25 11.6-11.6 3.75 3.75L6.75 21H3v-3.75ZM20.7 7.05a1 1 0 0 0 0-1.4l-2.35-2.36a1 1 0 0 0-1.42 0l-1.3 1.3 3.76 3.76 1.31-1.3Z"/></svg>
              </button>
              <button type="button" class="act-btn" data-act="del-catalog" data-id="\${escapeHtml(cid)}">
                <svg viewBox="0 0 24 24"><path d="M8 4V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a1 1 0 1 1 0 2h-1v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6H4a1 1 0 1 1 0-2h4Zm2 0h4V3h-4v1Zm-3 2v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6H7Z"/><path d="M9 8h2v9H9zm4 0h2v9h-2z"/></svg>
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }
    function fillCatalogForm(cid) {
      const c = catalog.find(x => String(x.id) === String(cid));
      if (!c) return;
      document.getElementById('catProdName').value = c.title;
      document.getElementById('catProdPrice').value = c.price;
      ddValues.catProdUnit = c.unit || 'pcs';
      if (c.category && categories.includes(c.category)) {
        ddValues.catProdCategory = c.category;
      }
      populateUnitSelects();
      renderCategories(isOwner || viewerCanEdit);
      document.getElementById('catProdPrice').focus();
    }
    function saveCatalogItem() {
      const s = STRINGS[lang] || STRINGS.fa;
      const nameInp = document.getElementById('catProdName');
      const priceInp = document.getElementById('catProdPrice');
      const title = nameInp.value.trim();
      const price = safeNum(priceInp.value, 0, 1000000000000, 0);
      const unit = ddValues.catProdUnit || 'pcs';
      const category = (ddValues.catProdCategory || '').trim();
      if (!title) return;
      if (!categories.length || !category) {
        alert(s.catRequiredAlert);
        closeCatalogModal();
        openNewCatPrompt();
        return;
      }
      nameInp.value = '';
      priceInp.value = '';
      ddValues.catProdUnit = 'pcs';
      populateUnitSelects();
      apiCall('save_catalog', { title, price, unit, category });
    }
    function deleteCatalogItem(catalogId) {
      apiCall('del_catalog', { catalogId });
    }

    function openEditModal(itemId) {
      editingItemId = String(itemId);
      editingListType = activeTab;
      const list = editingListType === 'shopping' ? shoppingItems : todoTasks;
      const item = list.find(x => String(x.id) === editingItemId);
      if (!item) return;

      const orderedCats = getSortedCategories();
      document.getElementById('editTitleInput').value = item.title || '';
      document.getElementById('editQtyInput').value = item.qty || '';
      document.getElementById('editCountInput').value = safeCount(item.count) ?? '';
      const currentPrice = getItemUnitPrice(item);
      document.getElementById('editPriceInput').value = currentPrice > 0 ? currentPrice : '';

      ddValues.editUnitSelect = getItemUnit(item) || 'pcs';
      ddValues.editCatSelect = (item.category && orderedCats.includes(item.category)) ? item.category : (orderedCats[0] || '');
      populateUnitSelects();
      renderCustomDropdown('editCatSelect', orderedCats.map(c => ({ value: c, label: c })), ddValues.editCatSelect, '\u{1F4C2}');

      const metaRow = document.getElementById('editShopMetaRow');
      const catGroup = document.getElementById('editCatGroup');
      const editPriceGrp = document.getElementById('editPriceGroup');

      if (editingListType === 'shopping') {
        metaRow.style.display = 'grid';
        metaRow.classList.toggle('no-price-mode', !useCatalog);
        editPriceGrp.style.display = useCatalog ? 'flex' : 'none';
        catGroup.style.display = 'flex';
      } else {
        metaRow.style.display = 'none';
        catGroup.style.display = 'none';
      }

      document.getElementById('editModal').classList.add('open');
      setTimeout(() => document.getElementById('editTitleInput').focus(), 60);
    }

    function closeEditModal() {
      document.getElementById('editModal').classList.remove('open');
      editingItemId = null;
      editingListType = null;
    }

    async function saveEdit(clearCatalogLink = false) {
      if (!editingItemId || !editingListType) return;
      const s = STRINGS[lang] || STRINGS.fa;
      const title = document.getElementById('editTitleInput').value.trim();
      const qty = document.getElementById('editQtyInput').value.trim();
      const count = safeCount(document.getElementById('editCountInput').value);
      const unit = ddValues.editUnitSelect || 'pcs';
      const rawPriceStr = document.getElementById('editPriceInput').value.trim();
      const price = rawPriceStr === '' ? 0 : safeNum(rawPriceStr, 0, 1000000000000, 0);
      const category = (ddValues.editCatSelect || '').trim();
      if (!title) return;
      if (editingListType === 'shopping' && (!categories.length || !category)) {
        alert(s.catRequiredAlert);
        return;
      }

      const idToSave = editingItemId;
      const tabToSave = editingListType;
      const saveBtn = document.getElementById('btnSaveEdit');
      saveBtn.disabled = true;
      closeEditModal();

      try {
        await apiCall('edit', {
          itemId: idToSave,
          listType: tabToSave,
          title,
          qty,
          count,
          unit,
          price,
          category,
          clearCatalog: Boolean(clearCatalogLink || rawPriceStr === '' || price === 0)
        });
      } finally {
        saveBtn.disabled = false;
      }
    }

    function openSettings() {
      const canEdit = isOwner || viewerCanEdit;
      document.getElementById('settingsListCard').style.display = canEdit ? 'flex' : 'none';
      document.getElementById('settingsQtyCard').style.display = canEdit ? 'flex' : 'none';
      document.getElementById('ownerSettingsCard').style.display = isOwner ? 'flex' : 'none';
      document.getElementById('wipeDataSection').style.display = isOwner ? 'flex' : 'none';
      resetWipeButton();
      switchTab('settings');
    }
    function closeSettings() {
      switchTab(activeTab);
    }

    function removeCategory(name) {
      if (selectedCategoryFilter === name) selectedCategoryFilter = 'ALL';
      apiCall('del_cat', { category: name });
    }

    function setChatButtons(show) {
      if (!isOwner) return;
      apiCall('set_chat_buttons', { show: Boolean(show) });
    }

    function resetWipeButton() {
      wipeConfirmStep = 0;
      const s = STRINGS[lang] || STRINGS.fa;
      const btn = document.getElementById('btnWipeData');
      if (btn) {
        btn.classList.remove('confirming');
        btn.innerText = s.wipeBtn1;
      }
    }

    function handleWipeClick() {
      const s = STRINGS[lang] || STRINGS.fa;
      const btn = document.getElementById('btnWipeData');
      if (wipeConfirmStep === 0) {
        wipeConfirmStep = 1;
        btn.classList.add('confirming');
        btn.innerText = s.wipeBtn2;
      } else {
        resetWipeButton();
        closeSettings();
        selectedCategoryFilter = 'ALL';
        apiCall('wipe_all');
      }
    }

    document.addEventListener('click', (e) => {
      const actEl = e.target.closest('[data-act]');
      if (!actEl) {
        document.querySelectorAll('.custom-dd.open').forEach(el => el.classList.remove('open'));
        return;
      }
      const act = actEl.getAttribute('data-act');
      if (act !== 'dd-toggle' && act !== 'dd-select') {
        document.querySelectorAll('.custom-dd.open').forEach(el => el.classList.remove('open'));
      }

      switch (act) {
        case 'noop-stop':
          e.stopPropagation();
          break;
        case 'switch-tab':
          switchTab(actEl.getAttribute('data-val'));
          break;
        case 'open-catalog':
          openCatalogModal();
          break;
        case 'close-catalog':
          closeCatalogModal();
          break;
        case 'open-history':
          openHistoryModal();
          break;
        case 'close-history':
          closeHistoryModal();
          break;
        case 'open-settings':
          openSettings();
          break;
        case 'close-settings':
          closeSettings();
          break;
        case 'toggle-date-filter':
          toggleDateFilterPanel();
          break;
        case 'toggle-add-form':
          toggleAddForm();
          break;
        case 'quick-date':
          setQuickDateRange(actEl.getAttribute('data-val'));
          break;
        case 'select-month':
          selectSpecificMonth(Number(actEl.getAttribute('data-year')), Number(actEl.getAttribute('data-month')));
          break;
        case 'toggle-sort-box':
          toggleSortBox();
          break;
        case 'toggle-item-sort-box':
          toggleItemSortBox();
          break;
        case 'set-item-sort':
          setItemSortMode(actEl.getAttribute('data-val'));
          break;
        case 'toggle-new-cat-box':
          toggleNewCatBox();
          break;
        case 'open-new-cat-prompt':
          openNewCatPrompt();
          break;
        case 'sort-cat':
          changeCategorySort(actEl.getAttribute('data-val'));
          break;
        case 'create-cat':
          createDirectCategory();
          break;
        case 'add-item':
          addItem();
          break;
        case 'close-rename-cat':
          closeRenameCatModal();
          break;
        case 'save-rename-cat':
          saveCategoryRename();
          break;
        case 'hist-filter':
          setHistoryFilter(actEl.getAttribute('data-val'));
          break;
        case 'hist-scope':
          setHistoryScope(actEl.getAttribute('data-val'));
          break;
        case 'hist-reset':
          resetHistoryFilters();
          break;
        case 'clear-history':
          clearHistoryLogs();
          break;
        case 'set-currency':
          setCurrency(actEl.getAttribute('data-val'));
          break;
        case 'save-catalog':
          saveCatalogItem();
          break;
        case 'fill-catalog':
          fillCatalogForm(actEl.getAttribute('data-id'));
          break;
        case 'del-catalog':
          deleteCatalogItem(actEl.getAttribute('data-id'));
          break;
        case 'close-edit':
          closeEditModal();
          break;
        case 'save-edit':
          saveEdit(false);
          break;
        case 'set-lang':
          setLanguage(actEl.getAttribute('data-val'));
          break;
        case 'set-theme':
          setThemeMode(actEl.getAttribute('data-val'));
          break;
        case 'set-accent':
          setAccentColor(actEl.getAttribute('data-val'));
          break;
        case 'rotate-invite':
          rotateInviteLink();
          break;
        case 'wipe-data':
          handleWipeClick();
          break;
        case 'toggle-donate':
          toggleDonateCard();
          break;
        case 'copy-wallet':
          copyWalletAddress();
          break;
        case 'dd-toggle':
          e.stopPropagation();
          toggleCustomDropdown(actEl.getAttribute('data-dd'));
          break;
        case 'dd-select':
          e.stopPropagation();
          selectCustomDropdownOption(actEl.getAttribute('data-dd'), Number(actEl.getAttribute('data-idx')));
          break;
        case 'filter-cat':
          filterCat(actEl.getAttribute('data-cat'));
          break;
        case 'rename-cat-modal':
          e.stopPropagation();
          openRenameCatModal(actEl.getAttribute('data-cat'));
          break;
        case 'remove-cat':
          e.stopPropagation();
          removeCategory(actEl.getAttribute('data-cat'));
          document.getElementById('renameCatModal').classList.remove('open');
          break;
        case 'toggle-folder':
          toggleLocalFolder(actEl.getAttribute('data-cat'));
          break;
        case 'toggle-expand':
          toggleExpand(actEl.getAttribute('data-key'));
          break;
        case 'toggle-item':
          e.stopPropagation();
          toggleItem(actEl.getAttribute('data-id'));
          break;
        case 'edit-item':
          e.stopPropagation();
          openEditModal(actEl.getAttribute('data-id'));
          break;
        case 'delete-item':
          e.stopPropagation();
          deleteItem(actEl.getAttribute('data-id'));
          break;
        case 'toggle-partner':
          togglePartnerAccess(actEl.getAttribute('data-uid'), actEl.getAttribute('data-allow') === 'true');
          break;
        case 'remove-partner':
          removePartner(actEl.getAttribute('data-uid'));
          break;
        case 'unblock-partner':
          unblockPartner(actEl.getAttribute('data-uid'));
          break;
      }
    });

    document.getElementById('filterStartDate').addEventListener('change', onCustomDateChange);
    document.getElementById('filterEndDate').addEventListener('change', onCustomDateChange);
    document.getElementById('historySearch').addEventListener('input', renderHistoryModalList);
    document.getElementById('historyType').addEventListener('change', (e) => setHistoryFilter(e.target.value));
    document.getElementById('historyScope').addEventListener('change', (e) => setHistoryScope(e.target.value));
    document.getElementById('historyRange').addEventListener('change', (e) => {
      document.getElementById('historyDateRange').classList.toggle('open', e.target.value === 'custom');
      renderHistoryModalList();
    });
    document.getElementById('historyDateFrom').addEventListener('change', renderHistoryModalList);
    document.getElementById('historyDateTo').addEventListener('change', renderHistoryModalList);
    document.getElementById('chkUseCatalog').addEventListener('change', (e) => setUseCatalog(e.target.checked));
    document.getElementById('chkShowUnits').addEventListener('change', (e) => setShowUnitBadge(e.target.checked));
    document.getElementById('chkChatBtns').addEventListener('change', (e) => setChatButtons(e.target.checked));

    document.getElementById('directCatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') createDirectCategory(); });
    ['newItem', 'newCount', 'newPrice', 'newQty'].forEach(id => {
      document.getElementById(id).addEventListener('keypress', (e) => { if (e.key === 'Enter') addItem(); });
    });
    document.getElementById('renameCatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') saveCategoryRename(); });
    ['catProdName', 'catProdPrice'].forEach(id => {
      document.getElementById(id).addEventListener('keypress', (e) => { if (e.key === 'Enter') saveCatalogItem(); });
    });
    ['editTitleInput', 'editQtyInput'].forEach(id => {
      document.getElementById(id).addEventListener('keypress', (e) => { if (e.key === 'Enter') saveEdit(false); });
    });

    applyThemeAndColor();
    applyLanguageUI();
    if (chatId) apiCall('get');
  <\/script>
</body>
</html>`;
}

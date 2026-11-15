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
    :root {
      --primary: #111827;
      --primary-fg: #ffffff;
      --bg: #f1f5f9;
      --card: #ffffff;
      --folder-bg: #e8eef5;
      --item-bg: #ffffff;
      --item-border: #dbe3ec;
      --text: #0f172a;
      --muted: #64748b;
      --border: #dbe3ec;
      --btn-bg: #f1f5f9;
      --tab-bg: #ffffff;
      --danger: #ef4444;
      --success: #10b981;
      --warning: #f59e0b;
      --info: #3b82f6;
      --shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
      --menu-shadow: 0 12px 32px rgba(15, 23, 42, 0.16);
    }
    html.dark, body.dark {
      --bg: #0b0f17;
      --card: #151e2e;
      --folder-bg: #101724;
      --item-bg: #1c273b;
      --item-border: #2e3d56;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #25334a;
      --btn-bg: #243247;
      --tab-bg: #171b22;
      --danger: #fb7185;
      --success: #34d399;
      --warning: #fbbf24;
      --info: #60a5fa;
      --shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      --menu-shadow: 0 14px 36px rgba(0, 0, 0, 0.78);
    }
    * {
      box-sizing: border-box;
      font-family: "Vazir", "Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-tap-highlight-color: transparent;
      font-variant-emoji: text;
    }
    html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      background-color: var(--bg) !important;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      overflow-x: hidden;
      overflow-y: visible;
      background-color: var(--bg) !important;
      color: var(--text);
      transition: background-color 0.2s ease, color 0.2s ease;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      touch-action: pan-y;
    }
    .app-container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      padding: calc(12px + env(safe-area-inset-top, 0px)) 12px calc(112px + env(safe-area-inset-bottom, 0px));
      background-color: var(--bg);
      touch-action: pan-y;
    }

    .top-nav {
      position: fixed;
      z-index: 250;
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(8px + env(safe-area-inset-bottom, 0px));
      width: min(calc(100vw - 16px), 520px);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
      align-items: stretch;
      gap: 2px;
      padding: 5px;
      background: var(--tab-bg);
      border: 1px solid var(--border);
      border-radius: 28px;
      box-shadow: var(--menu-shadow);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }
    .tabs, .nav-actions { display: contents; }
    .tabs {
      min-width: 0;
    }
    .tab {
      border: none;
      border-radius: 18px;
      background: transparent;
      color: var(--muted);
      font-weight: 700;
      font-size: 0.63rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      transition: all 0.15s ease;
      white-space: nowrap;
      padding: 5px 1px 4px;
      min-width: 0;
      width: 100%;
      height: 58px;
      position: relative;
    }
    .tab span.tab-lbl {
      display: inline-block;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tab.active {
      background: var(--card);
      color: var(--primary);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }
    .tab > span:first-child { font-size: 1.15rem; line-height: 1; }
    .badge {
      background: var(--primary);
      color: var(--primary-fg);
      font-size: 0.57rem;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 99px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: absolute;
      top: 2px;
      inset-inline-end: calc(50% - 26px);
    }
    .tab.active .badge { background: var(--primary); color: var(--primary-fg); }
    .nav-actions {
      min-width: 0;
    }
    .nav-btn {
      width: 100%;
      min-width: 0;
      height: 58px;
      padding: 5px 1px 4px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--muted);
      border-radius: 18px;
      cursor: pointer;
      font-size: 0.63rem;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      box-shadow: none;
      transition: transform 0.1s ease, color 0.15s ease, background 0.15s ease;
    }
    .nav-item-icon { font-size: 1.15rem; line-height: 1; }
    .nav-item-label { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nav-btn:hover, .nav-btn:focus-visible { background: var(--card); color: var(--primary); border-color: var(--border); outline: none; }
    .nav-btn:active { transform: scale(0.94); }

    .budget-bar {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 10px 12px;
      margin-bottom: 10px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .budget-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      flex-wrap: wrap;
    }
    .budget-stats {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    }
    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 9px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 800;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stat-chip.spent {
      background: color-mix(in srgb, var(--success) 12%, var(--card));
      color: var(--success);
    }
    .stat-chip.pending {
      background: var(--btn-bg);
      color: var(--text);
      border: 1px solid var(--border);
      font-weight: 700;
    }
    .filter-toggle-btn {
      background: var(--btn-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 5px 9px;
      border-radius: 10px;
      font-size: 0.74rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .date-filter-panel {
      display: none;
      flex-direction: column;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
    }
    .date-filter-panel.open { display: flex; }
    .date-row {
      display: grid;
      grid-template-columns: auto 1fr auto 1fr;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--muted);
    }
    @media (max-width: 380px) {
      .date-row { grid-template-columns: auto 1fr; }
    }
    .date-row input[type="date"] {
      height: 36px;
      padding: 4px 8px;
      font-size: 0.76rem;
      border-radius: 9px;
    }
    .quick-date-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .q-btn {
      height: 36px;
      font-size: 0.76rem;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--btn-bg);
      color: var(--text);
      font-weight: 700;
      cursor: pointer;
    }
    .q-btn.active {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }
    .months-breakdown-title { font-size: 0.75rem; font-weight: 700; color: var(--muted); }
    .months-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      max-height: 170px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .months-grid::-webkit-scrollbar { display: none; }
    .month-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 7px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.76rem;
      cursor: pointer;
      transition: 0.15s;
      gap: 4px;
    }
    .month-card.active {
      border-color: var(--primary);
      background: var(--btn-bg);
      font-weight: 700;
    }
    .month-name { color: var(--text); font-weight: 600; }
    .month-val { color: var(--success); font-weight: 800; font-size: 0.73rem; }

    .cat-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      width: 100%;
      min-width: 0;
    }
    .cat-bar {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-wrap: nowrap;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 3px 2px;
      scrollbar-width: none;
      -ms-overflow-style: none;
      align-items: center;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y;
      cursor: grab;
    }
    .cat-bar.dragging-scroll {
      cursor: grabbing;
      scroll-behavior: auto;
    }
    .cat-bar::-webkit-scrollbar { display: none; width: 0; height: 0; }
    
    .cat-pill {
      height: 36px;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 0 11px;
      border-radius: 11px;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex: 0 0 auto;
      touch-action: pan-x pan-y;
      user-select: none;
      box-shadow: var(--shadow);
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .cat-pill.active {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }
    .cat-mini-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 0.68rem;
      opacity: 0.75;
    }
    .cat-mini-icon:hover { opacity: 1; background: rgba(128,128,128,0.2); }

    .sortable-ghost {
      opacity: 0.35 !important;
      border: 1.5px dashed var(--primary) !important;
    }
    .sortable-drag {
      transform: scale(1.02);
      box-shadow: var(--menu-shadow) !important;
      z-index: 50;
    }
    .folder-drag-handle {
      cursor: grab;
      color: var(--muted);
      font-size: 1.05rem;
      padding: 4px 6px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      opacity: 0.75;
    }
    .folder-drag-handle:active { cursor: grabbing; opacity: 1; }

    .cat-action-btn {
      height: 36px;
      padding: 0 10px;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 11px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      box-shadow: var(--shadow);
    }
    .cat-action-btn.dashed { border: 1.5px dashed var(--muted); }
    .cat-action-btn.active-panel {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }

    .sub-bar-box {
      display: none;
      gap: 6px;
      margin-bottom: 10px;
      background: var(--card);
      padding: 9px 10px;
      border-radius: 13px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      align-items: center;
    }
    .sub-bar-box.open { display: flex; }
    .sort-options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      width: 100%;
    }
    .sort-chip {
      height: 35px;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sort-chip.active {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }

    .form-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      background: var(--card);
      padding: 11px;
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      width: 100%;
    }
    .form-grid-top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(115px, 38%);
      gap: 8px;
      width: 100%;
    }
    .form-grid-top.tasks-mode {
      grid-template-columns: 1fr;
    }
    .form-grid-meta {
      display: grid;
      grid-template-columns: minmax(64px, 22%) minmax(84px, 28%) minmax(0, 1fr);
      gap: 8px;
      width: 100%;
    }
    .form-grid-meta.no-price-mode {
      grid-template-columns: minmax(80px, 35%) minmax(0, 1fr);
    }
    .form-grid-bottom {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      width: 100%;
    }
    input {
      width: 100%;
      height: 42px;
      padding: 0 11px;
      border-radius: 11px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.86rem;
      font-weight: 600;
      outline: none;
      min-width: 0;
      transition: border-color 0.15s ease;
    }
    @supports (-webkit-touch-callout: none) {
      input { font-size: 16px; }
    }
    html[dir="rtl"] input:not(.center-inp) { direction: rtl; text-align: right; }
    html[dir="ltr"] input:not(.center-inp) { direction: ltr; text-align: left; }
    input::placeholder {
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 500;
      opacity: 0.85;
    }
    input:focus { border-color: var(--primary); }
    .center-inp {
      text-align: center !important;
      padding: 0 4px;
      font-weight: 700;
    }

    .custom-dd {
      position: relative;
      width: 100%;
      min-width: 0;
      user-select: none;
    }
    /* Keep an open picker above neighboring fields and rows. */
    .custom-dd.open { z-index: 1200; }
    .custom-dd.open .custom-dd-menu { z-index: 1201; max-height: min(280px, 45vh); }
    .custom-dd-trigger {
      width: 100%;
      height: 42px;
      padding: 0 10px;
      border-radius: 11px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      min-width: 0;
    }
    .custom-dd-trigger.empty-cat {
      border: 1.5px dashed var(--danger);
      color: var(--danger);
    }
    .custom-dd.open .custom-dd-trigger {
      border-color: var(--primary);
      background: var(--card);
    }
    .custom-dd-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .custom-dd-arrow {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      stroke: var(--muted);
      stroke-width: 2.3;
      fill: none;
      transition: transform 0.2s ease;
    }
    .custom-dd.open .custom-dd-arrow {
      transform: rotate(180deg);
      stroke: var(--primary);
    }
    .custom-dd-menu {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      min-width: 135px;
      background: var(--card);
      border: 1px solid var(--item-border);
      border-radius: 13px;
      padding: 5px;
      box-shadow: var(--menu-shadow);
      z-index: 280;
      max-height: 210px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-6px) scale(0.98);
      transition: opacity 0.16s ease, transform 0.18s ease, visibility 0.16s;
    }
    .custom-dd.open .custom-dd-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .custom-dd-opt {
      padding: 8px 10px;
      border-radius: 9px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .custom-dd-opt + .custom-dd-opt { margin-top: 2px; }
    .custom-dd-opt:hover { background: var(--btn-bg); }
    .custom-dd-opt.selected {
      background: var(--primary);
      color: var(--primary-fg);
      font-weight: 800;
    }

    .add-btn {
      height: 42px;
      background: var(--primary);
      color: var(--primary-fg);
      border: none;
      padding: 0 18px;
      border-radius: 11px;
      font-weight: 800;
      cursor: pointer;
      font-size: 0.85rem;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      flex-shrink: 0;
      transition: transform 0.1s ease, opacity 0.15s ease;
    }
    .add-btn:active { transform: scale(0.97); opacity: 0.9; }

    .field-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
    .field-label { font-size: 0.75rem; font-weight: 700; color: var(--muted); padding: 0 2px; }

    .list {
      display: flex;
      flex-direction: column;
      gap: 11px;
      touch-action: pan-y;
    }
    .folder-box {
      background: var(--folder-bg);
      border: 1px solid var(--border);
      border-right: 4px solid var(--primary);
      border-radius: 16px;
      padding: 10px 11px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--shadow);
      touch-action: pan-y;
    }
    html[dir="ltr"] .folder-box {
      border-right: 1px solid var(--border);
      border-left: 4px solid var(--primary);
    }
    .folder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 2px 8px;
      border-bottom: 1px solid var(--border);
      font-weight: 800;
      font-size: 0.86rem;
      color: var(--primary);
      cursor: pointer;
      user-select: none;
      gap: 8px;
      touch-action: pan-y;
    }
    .folder-box.collapsed .folder-header {
      border-bottom: none;
      padding-bottom: 2px;
    }
    .folder-title-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
      flex-wrap: wrap;
    }
    .folder-edit-btn {
      background: var(--btn-bg);
      border: 1px solid var(--border);
      color: var(--muted);
      border-radius: 7px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
    }
    .folder-cost-sub {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--muted);
    }
    .folder-count {
      font-size: 0.74rem;
      color: var(--primary-fg);
      background: var(--primary);
      padding: 3px 9px;
      border-radius: 99px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      direction: ltr;
      flex-shrink: 0;
    }
    .chevron-icon {
      font-size: 0.7rem;
      transition: transform 0.2s ease;
      display: inline-block;
    }
    .folder-box.collapsed .chevron-icon { transform: rotate(90deg); }
    .folder-items {
      display: flex;
      flex-direction: column;
      gap: 7px;
      touch-action: pan-y;
    }
    .folder-box.collapsed .folder-items { display: none; }

    .item {
      display: flex;
      flex-direction: column;
      padding: 10px 11px;
      background: var(--item-bg);
      border: 1px solid var(--item-border);
      border-radius: 12px;
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: border-color 0.15s ease;
      touch-action: pan-y;
    }
    .item.rtl-item { direction: rtl; text-align: right; }
    .item.ltr-item { direction: ltr; text-align: left; }
    .item-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
    }
    .title-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .title {
      font-weight: 700;
      font-size: 0.9rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .item.done .title {
      text-decoration: line-through;
      color: var(--muted);
      font-weight: 500;
    }
    .meta-badge {
      font-size: 0.71rem;
      font-weight: 700;
      color: var(--primary);
      background: var(--btn-bg);
      padding: 2px 7px;
      border-radius: 7px;
      border: 1px solid var(--border);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
    }
    .meta-badge.price-tag {
      color: var(--success);
      border-color: color-mix(in srgb, var(--success) 28%, var(--border));
      background: color-mix(in srgb, var(--success) 8%, var(--card));
    }
    .note-indicator {
      font-size: 0.71rem;
      color: var(--muted);
      background: var(--btn-bg);
      padding: 2px 6px;
      border-radius: 7px;
      flex-shrink: 0;
    }
    .item-details-panel {
      display: none;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
      font-size: 0.78rem;
      color: var(--muted);
      word-break: break-word;
      line-height: 1.5;
    }
    .item.expanded .item-details-panel { display: block; }

    .actions {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      direction: ltr;
    }
    .act-btn {
      background: var(--btn-bg);
      border: 1px solid var(--item-border);
      color: var(--text);
      border-radius: 9px;
      width: 31px;
      height: 31px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      cursor: pointer;
      transition: transform 0.1s ease;
    }
    .act-btn:active { transform: scale(0.92); }
    .act-btn svg { width: 14px; height: 14px; fill: currentColor; stroke: none; pointer-events: none; }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: none;
      align-items: flex-end;
      justify-content: center;
      padding: 0;
      z-index: 300;
    }
    @media (min-width: 500px) {
      .modal-backdrop { align-items: center; padding: 14px; }
    }
    .modal-backdrop.open { display: flex; }
    .modal {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 22px 22px 0 0;
      width: 100%;
      max-width: 470px;
      max-height: 90dvh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      padding: 16px 14px calc(28px + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--menu-shadow);
    }
    @media (min-width: 500px) {
      .modal { border-radius: 20px; max-height: 88vh; padding: 18px; }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 1rem;
      padding: 0 2px 4px;
    }
    .close-btn {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      width: 34px;
      height: 34px;
      color: var(--muted);
      font-size: 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .settings-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      box-shadow: var(--shadow);
    }
    .settings-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--primary);
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
    }
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .setting-row-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }
    .setting-row-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text);
    }
    .setting-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .setting-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--muted);
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 26px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--tab-bg);
      border: 1px solid var(--border);
      transition: 0.22s;
      border-radius: 99px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: #ffffff;
      transition: 0.22s;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .switch input:checked + .slider {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    .switch input:checked + .slider:before {
      transform: translateX(20px);
    }

    .seg-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 5px;
      background: var(--bg);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .seg-btn {
      height: 33px;
      padding: 0 6px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--muted);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.15s ease;
    }
    .seg-btn.active {
      background: var(--primary);
      color: var(--primary-fg);
      box-shadow: var(--shadow);
    }

    .color-row {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      padding: 4px 2px;
    }
    .color-swatch {
      width: 34px;
      height: 34px;
      border-radius: 99px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: transform 0.15s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      flex-shrink: 0;
    }
    .color-swatch.active {
      border-color: var(--text);
      transform: scale(1.14);
    }
    .color-swatch.mono-swatch {
      background: linear-gradient(135deg, #111111 50%, #ffffff 50%);
      border: 2px solid var(--border);
    }
    .color-swatch.mono-swatch.active { border: 3px solid var(--text); }

    .catalog-form-grid {
      display: grid;
      grid-template-columns: minmax(85px, 32%) minmax(0, 1fr) auto;
      gap: 7px;
      width: 100%;
    }
    .catalog-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 260px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .catalog-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 11px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      font-size: 0.83rem;
      gap: 8px;
    }
    .catalog-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .catalog-title { font-weight: 700; word-break: break-word; }
    .catalog-sub { font-size: 0.72rem; color: var(--muted); }
    .catalog-price-tag { font-weight: 800; color: var(--success); font-size: 0.8rem; white-space: nowrap; }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 340px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .history-toolbar { display: flex; flex-direction: column; gap: 8px; }
    .history-filter-card {
      display: flex;
      flex-direction: column;
      gap: 9px;
      padding: 10px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
    }
    .history-filter-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .history-filter-field {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
      color: var(--muted);
      font-size: 0.7rem;
      font-weight: 800;
    }
    .history-filter-field.full { grid-column: 1 / -1; }
    .history-filter-field input,
    .history-filter-field select,
    .history-date-field input {
      width: 100%;
      min-width: 0;
      height: 38px;
      padding: 0 9px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--card);
      color: var(--text);
      font: inherit;
      font-size: 0.78rem;
      outline: none;
    }
    .history-filter-field input:focus,
    .history-filter-field select:focus,
    .history-date-field input:focus { border-color: var(--primary); }
    .history-date-range { display: none; grid-template-columns: 1fr 1fr; gap: 7px; }
    .history-date-range.open { display: grid; }
    .history-date-field { min-width: 0; display: flex; flex-direction: column; gap: 4px; color: var(--muted); font-size: 0.69rem; font-weight: 700; }
    .history-toolbar-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--muted); font-size: 0.72rem; }
    .history-reset-btn { padding: 5px 9px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font: inherit; font-size: 0.7rem; cursor: pointer; }
    .history-empty { padding: 22px 12px; text-align: center; color: var(--muted); font-size: 0.82rem; }
    .history-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.8rem;
    }
    .history-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
    .history-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 7px;
      font-size: 0.71rem;
      font-weight: 800;
    }
    .history-badge.bought, .history-badge.completed { background: color-mix(in srgb, var(--success) 13%, var(--card)); color: var(--success); }
    .history-badge.deleted { background: color-mix(in srgb, var(--danger) 13%, var(--card)); color: var(--danger); }
    .history-badge.added { background: color-mix(in srgb, var(--info) 13%, var(--card)); color: var(--info); }
    .history-badge.edited, .history-badge.unbought, .history-badge.reopened { background: color-mix(in srgb, var(--warning) 13%, var(--card)); color: var(--warning); }
    .history-time { font-size: 0.71rem; color: var(--muted); font-weight: 600; direction: ltr; }
    .history-title { font-weight: 800; font-size: 0.86rem; color: var(--text); word-break: break-word; }
    .history-meta { font-size: 0.73rem; color: var(--muted); display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

    .secondary-btn {
      width: 100%;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-weight: 700;
      font-size: 0.78rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .danger-btn {
      width: 100%;
      height: 40px;
      border-radius: 11px;
      border: 1px solid var(--danger);
      background: color-mix(in srgb, var(--danger) 6%, var(--card));
      color: var(--danger);
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      transition: 0.2s;
    }
    .danger-btn.confirming { background: var(--danger); color: var(--primary-fg); }

    .partner-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 0.8rem;
      gap: 8px;
    }
    .partner-actions { display: flex; align-items: center; gap: 6px; }

    .community-Section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      direction: ltr;
    }
    .comm-links { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }
    .comm-link {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.78rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      text-decoration: none;
      padding: 6px 11px;
      border-radius: 10px;
    }
    .comm-link.active-tab { border-color: var(--primary); }
    .comm-link svg { width: 15px; height: 15px; fill: currentColor; flex-shrink: 0; }
    
    .donate-card {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background: var(--bg);
      color: var(--text);
      padding: 14px;
      border-radius: 14px;
      border: 1px solid var(--border);
      text-align: left;
      direction: ltr;
    }
    .donate-card.open { display: flex; }
    .qr-box {
      background: #ffffff; padding: 8px; border-radius: 14px; width: 112px; height: 112px;
      position: relative; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--border);
    }
    .qr-box img { width: 100%; height: 100%; display: block; border-radius: 6px; }
    .ton-badge {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 26px; height: 26px; background: #0098EA; border-radius: 50%;
      border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;
    }
    .ton-badge svg { width: 14px; height: 14px; fill: none; stroke: #ffffff; stroke-width: 2.2; }
    .wallet-addr-box {
      width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 10px;
      padding: 9px 10px; text-align: center; font-family: ui-monospace, monospace;
      font-size: 0.74rem; font-weight: 700; color: var(--text); word-break: break-all;
    }
    .copy-wallet-btn {
      width: 100%; height: 38px; background: var(--primary); color: var(--primary-fg); border: none;
      border-radius: 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
    }
    .ton-note { font-size: 0.7rem; color: var(--muted); width: 100%; text-align: center; margin: 0; }
    .credits-footer {
      text-align: center; font-size: 0.73rem; color: var(--muted); padding-top: 4px;
      line-height: 1.5; direction: ltr;
    }
    .credits-footer b { color: var(--text); }
    .empty { text-align: center; color: var(--muted); padding: 26px 0; font-size: 0.86rem; }

    /* Merkoo visual refresh: calm One UI inspired surfaces, clear layers and touch targets. */
    :root {
      --primary: #111827;
      --primary-fg: #ffffff;
      --bg: #f4f6f9;
      --card: #ffffff;
      --folder-bg: #e8edf3;
      --item-bg: #f8f9fb;
      --item-border: #dce3eb;
      --text: #17212f;
      --muted: #68778b;
      --border: #dfe5ed;
      --btn-bg: #f0f3f7;
      --tab-bg: rgba(255,255,255,.97);
      --shadow: 0 3px 12px rgba(25, 42, 65, .055);
      --menu-shadow: 0 12px 34px rgba(20, 33, 52, .18);
    }
    html.dark, body.dark {
      --primary: #f5f6f8;
      --primary-fg: #111318;
      --bg: #101318;
      --card: #1a1e25;
      --folder-bg: #202630;
      --item-bg: #191e26;
      --item-border: #303946;
      --text: #f0f3f8;
      --muted: #a1adbd;
      --border: #303946;
      --btn-bg: #252c36;
      --tab-bg: rgba(34, 40, 49, .97);
      --shadow: 0 4px 16px rgba(0, 0, 0, .22);
      --menu-shadow: 0 14px 38px rgba(0, 0, 0, .48);
    }
    html.monochrome-theme, body.monochrome-theme {
      --success: var(--primary);
      --danger: var(--primary);
      --warning: var(--primary);
      --info: var(--primary);
    }
    body { line-height: 1.45; }
    .app-container { padding-left: 14px; padding-right: 14px; }
    .top-nav {
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding: 6px;
      gap: 3px;
      background: var(--tab-bg);
      border-color: color-mix(in srgb, var(--border) 78%, transparent);
      border-radius: 25px;
      box-shadow: 0 9px 28px rgba(17, 31, 48, .17), 0 2px 6px rgba(17, 31, 48, .07);
      backdrop-filter: blur(24px) saturate(1.35);
      -webkit-backdrop-filter: blur(24px) saturate(1.35);
    }
    html.dark .top-nav, body.dark .top-nav { box-shadow: 0 12px 30px rgba(0,0,0,.48); }
    .tab, .nav-btn { height: 60px; border-radius: 19px; font-size: .68rem; font-weight: 700; }
    .tab { color: var(--primary); }
    .tab.active {
      background: color-mix(in srgb, var(--primary) 11%, var(--card));
      border-color: color-mix(in srgb, var(--primary) 18%, var(--border));
      color: var(--primary);
      box-shadow: none;
    }
    .nav-item-icon { display: inline-flex; align-items: center; justify-content: center; width: 25px; height: 25px; }
    .nav-item-icon svg { display: block; width: 22px; height: 22px; fill: currentColor; stroke: none; }
    .nav-item-icon svg .nav-icon-cutout { fill: var(--tab-bg); }
    .tab > .nav-item-icon { font-size: inherit; }
    .nav-btn { color: var(--primary); }
    .nav-btn:hover, .nav-btn:focus-visible { background: color-mix(in srgb, var(--primary) 9%, var(--card)); color: var(--primary); border-color: transparent; }
    .badge { top: 1px; inset-inline-end: calc(50% - 25px); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .budget-bar, .form-box, .folder-box, .settings-card, .community-Section {
      border-radius: 22px;
      box-shadow: var(--shadow);
    }
    .budget-bar { padding: 13px; gap: 12px; }
    .folder-box { background: var(--folder-bg); border-color: var(--item-border); }
    .folder-header { min-height: 62px; }
    .folder-items { padding-top: 8px; }
    .item { background: var(--item-bg); border-color: var(--item-border); border-radius: 19px; }
    /* Shopping status uses fixed colors across themes and operating systems. */
    .act-btn.status-toggle-btn {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      background: #dc2626 !important;
      border: 2px solid #dc2626 !important;
      color: #fff !important;
      opacity: 1 !important;
      box-shadow: 0 2px 7px rgba(220, 38, 38, .28);
    }
    .item.done .act-btn.status-toggle-btn {
      background: #16a34a !important;
      border-color: #16a34a !important;
      box-shadow: 0 2px 7px rgba(22, 163, 74, .28);
    }
    .act-btn.status-toggle-btn svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .form-box { padding: 13px; border-color: var(--border); }
    input, .custom-dd-trigger, .history-filter-field input, .history-filter-field select,
    .history-date-field input { border-radius: 14px; border-color: var(--border); }
    input:focus, .custom-dd.open .custom-dd-trigger, .history-filter-field input:focus,
    .history-filter-field select:focus, .history-date-field input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent);
    }
    .add-btn, .secondary-btn, .danger-btn, .act-btn, .cat-action-btn, .q-btn, .sort-chip,
    .cat-pill, .history-reset-btn, .comm-link, .copy-wallet-btn { border-radius: 14px; }
    .cat-toolbar { gap: 8px; }
    .cat-bar { gap: 7px; }
    .cat-pill { min-height: 42px; padding-inline: 12px; }
    .modal-backdrop { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
    .modal { border-radius: 27px 27px 20px 20px; border-color: var(--border); box-shadow: 0 18px 54px rgba(10, 18, 30, .24); }
    .modal-header { margin-bottom: 12px; }
    .close-btn { border-radius: 15px; }
    .history-filter-card { padding: 13px; gap: 11px; border-radius: 19px; background: var(--bg); }
    .history-filter-field { gap: 6px; font-size: .73rem; color: var(--text); }
    .history-filter-field > span { padding-inline: 3px; }
    .history-filter-field input, .history-filter-field select, .history-date-field input {
      height: 44px;
      padding: 0 12px;
      background-color: var(--card);
      color: var(--text);
      font-size: .82rem;
      font-weight: 700;
      color-scheme: light;
    }
    html.dark .history-filter-field input, html.dark .history-filter-field select,
    html.dark .history-date-field input, body.dark .history-filter-field input,
    body.dark .history-filter-field select, body.dark .history-date-field input { color-scheme: dark; }
    .history-filter-field select { appearance: auto; -webkit-appearance: menulist; }
    .history-filter-field select option { background: #ffffff; color: #17212f; font-weight: 600; }
    html.dark .history-filter-field select option, body.dark .history-filter-field select option { background: #1a1e25; color: #f0f3f8; }
    .history-filter-field select optgroup { background: var(--card); color: var(--text); }
    .history-filter-grid { gap: 10px; }
    .history-date-field { color: var(--text); font-size: .72rem; }
    .history-toolbar-footer { min-height: 38px; }
    .history-reset-btn { min-height: 38px; padding: 7px 12px; background: var(--btn-bg); font-weight: 700; }
    .history-card { padding: 13px; border-radius: 17px; box-shadow: var(--shadow); }
    .history-badge { border-radius: 999px; padding: 4px 10px; font-weight: 800; }
    .history-title { font-size: .9rem; }
    .history-meta { gap: 6px; }
    .credits-footer { padding-top: 8px; }
    @media (max-width: 380px) {
      .top-nav { width: calc(100vw - 12px); gap: 1px; padding: 5px; }
      .tab, .nav-btn { font-size: .61rem; }
      .nav-item-icon svg { width: 20px; height: 20px; }
      .history-filter-grid { grid-template-columns: 1fr; }
      .history-filter-field.full { grid-column: auto; }
    }
    /* Keep the activity feed visible inside the history sheet. */
    #historyModal .modal {
      height: 88dvh;
      max-height: 88dvh;
      min-height: 0;
      overflow: hidden;
      gap: 8px;
      padding: 13px 13px calc(12px + env(safe-area-inset-bottom, 0px));
    }
    #historyModal .modal-header { flex: 0 0 auto; gap: 8px; margin: 0; padding-bottom: 0; }
    #historyModal #lblHistoryModalTitle { flex: 1 1 auto; min-width: 0; }
    #historyModal .history-toolbar { flex: 0 0 auto; min-height: 0; }
    #historyModal .history-filter-card { gap: 7px; padding: 9px; }
    #historyModal .history-filter-field { gap: 3px; }
    #historyModal .history-filter-field input,
    #historyModal .history-filter-field select,
    #historyModal .history-date-field input { height: 39px; }
    #historyModal .history-filter-grid { gap: 7px; }
    #historyModal .history-toolbar-footer { min-height: 32px; }
    #historyModal .history-reset-btn { min-height: 32px; padding: 5px 10px; }
    #historyModal .history-list {
      flex: 1 1 auto;
      min-height: 120px;
      max-height: none;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 1px 2px 4px;
    }
    #historyModal .history-card { flex: 0 0 auto; }
    #historyModal .history-modal-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
    #historyModal #btnClearHistory {
      width: auto;
      height: 34px;
      min-height: 34px;
      padding: 0 10px;
      border-radius: 12px;
      font-size: .66rem;
      white-space: nowrap;
    }
    @media (min-width: 500px) {
      #historyModal .modal { height: min(86vh, 820px); max-height: 86vh; }
    }
    /* Primary text stays monochrome; the chosen accent only colors surfaces. */
    .tab.active {
      background: transparent;
      border-color: transparent;
      color: var(--primary);
      box-shadow: none;
    }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon { color: var(--accent, var(--primary)); }
    .tab.active .badge { background: var(--accent, var(--primary)); color: var(--primary-fg); }
    .nav-btn:hover, .nav-btn:focus-visible { color: var(--primary); }
    .nav-btn.active {
      background: transparent;
      border-color: transparent;
      color: var(--primary);
      box-shadow: none;
    }
    @keyframes nav-icon-select {
      0% { transform: translateY(2px) scale(.78); }
      58% { transform: translateY(-3px) scale(1.16); }
      100% { transform: translateY(0) scale(1); }
    }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon { animation: nav-icon-select .36s cubic-bezier(.2,.8,.25,1.25); }
    @media (prefers-reduced-motion: reduce) {
      .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon { animation: none; }
    }
    /* Main destinations render as views in the same mini app, under the same bottom bar. */
    body.page-view-active .app-container { height: 0; min-height: 0; margin: 0; padding: 0 !important; }
    body.page-view-active .app-container > :not(.top-nav) { display: none !important; }
    .modal-backdrop.page-view {
      display: block !important;
      position: relative;
      inset: auto;
      z-index: 1;
      width: 100%;
      min-height: calc(100dvh - 78px - env(safe-area-inset-top, 0px));
      padding: calc(12px + env(safe-area-inset-top, 0px)) 14px calc(108px + env(safe-area-inset-bottom, 0px));
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .modal-backdrop.page-view .modal {
      width: 100%;
      max-width: 492px;
      height: auto;
      min-height: 0;
      max-height: none;
      margin: 0 auto;
      overflow: visible;
      border: 0;
      border-radius: 22px;
      padding: 12px 0 18px;
      background: transparent;
      box-shadow: none;
    }
    .modal-backdrop.page-view .modal-header .close-btn { display: none; }
    .modal-backdrop.page-view .modal-header { justify-content: flex-start; margin-bottom: 10px; }
    /* Accents decorate controls and selected elements; copy remains monochrome. */
    .add-btn, .copy-wallet-btn, .q-btn.active, .cat-pill.active, .cat-action-btn.active-panel,
    .sort-chip.active, .custom-dd-opt.selected, .seg-btn.active,
    .switch input:checked + .slider, .folder-count {
      background-color: var(--accent, var(--primary));
      border-color: var(--accent, var(--primary));
      color: var(--primary-fg);
    }
    .folder-box { border-inline-start-color: var(--accent, var(--primary)); }
    .folder-count, .badge { background: var(--accent, var(--primary)); }
    .custom-dd.open .custom-dd-trigger, .custom-dd.open .custom-dd-arrow,
    input:focus, .history-filter-field input:focus, .history-filter-field select:focus,
    .history-date-field input:focus { border-color: var(--accent, var(--primary)); }
    .custom-dd.open .custom-dd-arrow { stroke: var(--accent, var(--primary)); }
    .meta-badge { border-color: color-mix(in srgb, var(--accent, var(--primary)) 35%, var(--border)); }
    .month-card.active { border-color: var(--accent, var(--primary)); }
    #historyModal.page-view .modal { height: auto; max-height: none; gap: 10px; overflow: visible; }
    #historyModal.page-view .history-list {
      flex: 0 0 auto;
      min-height: 180px;
      max-height: calc(100dvh - 430px);
      overflow-y: auto;
      border-radius: 18px;
      padding: 4px 2px 12px;
    }
    #historyModal.page-view .history-card { margin-bottom: 9px; }
    #historyModal.page-view .history-modal-actions #btnClearHistory { position: static; }
    @media (max-width: 380px) {
      .modal-backdrop.page-view { padding-inline: 10px; }
      #historyModal.page-view .history-list { max-height: calc(100dvh - 455px); }
    }
    /* Refined light/dark surfaces, semantic colors and tactile motion. */
    :root {
      color-scheme: light;
      --bg: #f4f7f3;
      --card: #ffffff;
      --folder-bg: #ffffff;
      --item-bg: #f8faf7;
      --item-border: #e5ebe4;
      --text: #141814;
      --muted: #6b756c;
      --border: #e2e9e1;
      --btn-bg: #eef3ed;
      --tab-bg: rgba(255,255,255,.96);
      --accent-fg: #ffffff;
      --success: #16834a;
      --danger: #d92d20;
      --warning: #a15c07;
      --info: #315fbd;
      --shadow: 0 6px 20px rgba(25,46,29,.065);
      --menu-shadow: 0 14px 36px rgba(25,46,29,.14);
    }
    html.dark, body.dark {
      color-scheme: dark;
      --bg: #090909;
      --card: #171717;
      --folder-bg: #222222;
      --item-bg: rgba(255,255,255,.075);
      --item-border: rgba(255,255,255,.10);
      --text: #f5f5f5;
      --muted: rgba(235,235,235,.64);
      --border: rgba(255,255,255,.10);
      --btn-bg: rgba(255,255,255,.075);
      --tab-bg: rgba(23,23,23,.98);
      --accent-fg: #f5f5f5;
      --success: #43c477;
      --danger: #ff6b68;
      --warning: rgba(235,235,235,.64);
      --info: rgba(235,235,235,.78);
      --shadow: 0 6px 20px rgba(0,0,0,.34);
      --menu-shadow: 0 14px 36px rgba(0,0,0,.62);
    }
    html.monochrome-theme, body.monochrome-theme {
      --success: #16834a;
      --danger: #d92d20;
      --warning: #a15c07;
      --info: #315fbd;
    }
    html.dark.monochrome-theme, body.dark.monochrome-theme {
      --success: #43c477;
      --danger: #ff6b68;
      --warning: rgba(235,235,235,.64);
      --info: rgba(235,235,235,.78);
    }
    body { color: var(--text); background: var(--bg); }
    .top-nav {
      border-color: var(--border);
      box-shadow: 0 10px 32px rgba(16,24,40,.13), 0 2px 7px rgba(16,24,40,.055);
    }
    html.dark .top-nav, body.dark .top-nav {
      box-shadow: 0 12px 34px rgba(0,0,0,.46), 0 2px 8px rgba(0,0,0,.2);
    }
    .tab.active, .nav-btn.active {
      background: color-mix(in srgb, var(--accent) 8%, var(--tab-bg));
      border-color: color-mix(in srgb, var(--accent) 16%, var(--border));
      color: var(--text);
      box-shadow: none;
    }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon {
      width: 35px;
      height: 35px;
      border-radius: 12px;
      background: var(--accent);
      color: var(--accent-fg);
      box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .tab.active .nav-item-icon svg, .nav-btn.active .nav-item-icon svg { width: 21px; height: 21px; }
    .tab.active .nav-icon-cutout, .nav-btn.active .nav-icon-cutout { fill: var(--accent); }
    .tab.active .badge, .nav-btn.active .badge { background: var(--accent); color: var(--accent-fg); }
    .tab:not(.active) .nav-item-icon, .nav-btn:not(.active) .nav-item-icon { color: var(--muted); }
    .budget-bar, .form-box, .folder-box, .settings-card, .history-filter-card {
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }
    .budget-bar {
      background: var(--card);
      border-radius: 18px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .form-box {
      background: var(--card);
      border-radius: 20px;
      padding: 14px;
      margin-block: 10px;
    }
    .folder-box {
      background: var(--folder-bg);
      border-inline-start: 3px solid var(--border);
      border-radius: 20px;
      margin-block: 11px;
      overflow: hidden;
    }
    .folder-header { min-height: 62px; padding: 12px 14px; }
    .folder-items { padding: 0 8px 9px; gap: 8px; }
    .item { border-radius: 15px; padding: 12px; min-height: 56px; }
    .top-nav { padding: 6px; gap: 3px; border-radius: 23px; }
    .tab, .nav-btn { min-height: 60px; border-radius: 17px; }
    .nav-item-icon { width: 29px; height: 29px; }
    .nav-item-icon svg { width: 24px; height: 24px; }
    .form-box, .settings-card, .history-filter-card, .history-card, .month-card {
      border-color: var(--border);
      box-shadow: var(--shadow);
    }
    input, select, textarea, .custom-dd-trigger {
      color: var(--text);
      background-color: var(--card);
      border-color: var(--border);
      color-scheme: inherit;
    }
    .item { transition: background-color .2s ease, border-color .2s ease, transform .18s ease, box-shadow .2s ease; }
    .item.done {
      background: color-mix(in srgb, #16a34a 4%, var(--item-bg));
      border-color: color-mix(in srgb, #16a34a 24%, var(--item-border));
    }
    .tab, .nav-btn, .act-btn, .add-btn, .secondary-btn, .q-btn, .cat-pill, .cat-action-btn,
    .sort-chip, .custom-dd-trigger, .seg-btn, .switch, .folder-header {
      -webkit-tap-highlight-color: transparent;
    }
    .tab, .nav-btn, .nav-item-icon, .nav-item-icon svg, .act-btn, .add-btn, .secondary-btn,
    .q-btn, .cat-pill, .cat-action-btn, .sort-chip {
      transition: transform .18s cubic-bezier(.2,.75,.25,1.2), color .2s ease, background-color .2s ease, border-color .2s ease, box-shadow .2s ease;
    }
    .tab:active, .nav-btn:active, .act-btn:active, .add-btn:active, .secondary-btn:active,
    .q-btn:active, .cat-pill:active, .cat-action-btn:active, .sort-chip:active { transform: scale(.95); }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon {
      animation: nav-icon-select .42s cubic-bezier(.2,.8,.25,1.25);
      filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--accent, var(--primary)) 25%, transparent));
    }
    @keyframes nav-icon-select {
      0% { transform: translateY(5px) scale(.68) rotate(-14deg); }
      55% { transform: translateY(-4px) scale(1.24) rotate(7deg); }
      78% { transform: translateY(1px) scale(.96) rotate(-2deg); }
      100% { transform: translateY(0) scale(1) rotate(0); }
    }
    @keyframes press-pop {
      0% { transform: scale(.92); }
      65% { transform: scale(1.035); }
      100% { transform: scale(1); }
    }
    .folder-header:active .chevron-icon { transform: scale(1.18) rotate(-8deg); }
    .item.done .status-toggle-btn { animation: press-pop .26s ease-out; }
    /* Dark mode uses ink-black canvas, slate-charcoal surfaces and a vivid cobalt accent. */
    html.dark body, body.dark { background: var(--bg) !important; color: var(--text); }
    html.dark .app-container, body.dark .app-container { background: var(--bg); }
    html.dark .top-nav, body.dark .top-nav { background: var(--tab-bg); border-color: var(--border); }
    html.dark .budget-bar, body.dark .budget-bar,
    html.dark .form-box, body.dark .form-box,
    html.dark .settings-card, body.dark .settings-card,
    html.dark .history-filter-card, body.dark .history-filter-card,
    html.dark .history-card, body.dark .history-card,
    html.dark .month-card, body.dark .month-card { background-color: var(--card); }
    html.dark .folder-box, body.dark .folder-box { background: var(--folder-bg); border-color: var(--border); }
    html:not(.dark) body, body:not(.dark) { background: var(--bg); color: var(--text); }
    html:not(.dark) .app-container, body:not(.dark) .app-container { background: var(--bg); }
    html:not(.dark) .top-nav, body:not(.dark) .top-nav {
      background: #ffffff;
      border: 1px solid var(--border);
      box-shadow: 0 10px 28px rgba(25,46,29,.08), 0 2px 5px rgba(25,46,29,.035);
    }
    html:not(.dark) .budget-bar, body:not(.dark) .budget-bar {
      color: #f7faf7;
      background: linear-gradient(145deg, #111a14, #1a291e);
      border-color: #28392d;
      box-shadow: 0 10px 24px rgba(17,38,22,.16);
    }
    html:not(.dark) .budget-bar .stat-chip.spent, body:not(.dark) .budget-bar .stat-chip.spent {
      color: #c8f0ce;
      background: rgba(69,156,88,.22);
    }
    html:not(.dark) .budget-bar .stat-chip.pending, body:not(.dark) .budget-bar .stat-chip.pending,
    html:not(.dark) .budget-bar .filter-toggle-btn, body:not(.dark) .budget-bar .filter-toggle-btn {
      color: #f5f8f5;
      background: rgba(255,255,255,.075);
      border-color: rgba(255,255,255,.12);
    }
    html:not(.dark) .budget-bar .date-filter-panel, body:not(.dark) .budget-bar .date-filter-panel {
      color: #f5f8f5;
      background: #18231b;
      border-color: rgba(255,255,255,.12);
    }
    html:not(.dark) .budget-bar .q-btn, body:not(.dark) .budget-bar .q-btn { color: #f5f8f5; }
    html:not(.dark) .budget-bar .q-btn.active, body:not(.dark) .budget-bar .q-btn.active {
      color: #111711;
      background: #f4f7f3;
      border-color: #f4f7f3;
    }
    html:not(.dark) .form-box, body:not(.dark) .form-box,
    html:not(.dark) .settings-card, body:not(.dark) .settings-card,
    html:not(.dark) .history-filter-card, body:not(.dark) .history-filter-card,
    html:not(.dark) .history-card, body:not(.dark) .history-card,
    html:not(.dark) .month-card, body:not(.dark) .month-card { background: #ffffff; }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background: #ffffff;
      border-color: #e1e8e0;
      border-inline-start-color: var(--accent);
      box-shadow: 0 7px 20px rgba(25,46,29,.075);
    }
    html:not(.dark) .folder-header, body:not(.dark) .folder-header { color: var(--text); border-bottom-color: var(--border); }
    html:not(.dark) .item, body:not(.dark) .item { background: var(--item-bg); border-color: var(--item-border); }
    html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea,
    html:not(.dark) .custom-dd-trigger, body:not(.dark) input, body:not(.dark) select,
    body:not(.dark) textarea, body:not(.dark) .custom-dd-trigger {
      color: var(--text);
      background-color: #ffffff;
      border-color: var(--border);
    }
    html:not(.dark) input:focus, html:not(.dark) textarea:focus,
    html:not(.dark) .custom-dd.open .custom-dd-trigger,
    body:not(.dark) input:focus, body:not(.dark) textarea:focus,
    body:not(.dark) .custom-dd.open .custom-dd-trigger {
      border-color: #252c26;
      box-shadow: 0 0 0 3px rgba(20,30,21,.08);
    }
    #listContainer { gap: 9px; }
    #listContainer > .folder-box { margin-block: 0 !important; }
    html.dark .item, body.dark .item { background: var(--item-bg); border-color: var(--item-border); }
    html.dark .item.done, body.dark .item.done { background: color-mix(in srgb, var(--success) 7%, var(--item-bg)); border-color: color-mix(in srgb, var(--success) 27%, var(--item-border)); }
    html.dark input, html.dark select, html.dark textarea, html.dark .custom-dd-trigger,
    body.dark input, body.dark select, body.dark textarea, body.dark .custom-dd-trigger { background: var(--item-bg); border-color: var(--item-border); color: var(--text); }
    .add-btn, .copy-wallet-btn, .q-btn.active, .cat-pill.active, .cat-action-btn.active-panel,
    .sort-chip.active, .custom-dd-opt.selected, .seg-btn.active, .folder-count, .badge {
      background-color: var(--accent);
      border-color: var(--accent);
      color: var(--accent-fg);
    }
    .switch input:checked + .slider { background-color: var(--accent); }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon { animation: nav-icon-select .46s cubic-bezier(.2,.8,.25,1.25); }
    .folder-box { border-inline-start-color: var(--border); }
    .mono-swatch { background: linear-gradient(135deg, #111111 50%, #ffffff 50%); }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }

    /* Merkoo product design system: clear hierarchy, calm contrast, native-feeling controls. */
    :root {
      --bg: #f7f6f2;
      --card: #ffffff;
      --folder-bg: #ffffff;
      --item-bg: #f5f3ed;
      --item-border: #e7e3d9;
      --text: #151713;
      --muted: #71746d;
      --border: #e7e4dc;
      --btn-bg: #f0eee8;
      --tab-bg: rgba(255,255,255,.97);
      --shadow: 0 3px 12px rgba(30,32,25,.045);
      --menu-shadow: 0 12px 34px rgba(25,29,22,.14);
    }
    html.dark, body.dark {
      --bg: #090909;
      --card: #171717;
      --folder-bg: #171717;
      --item-bg: #222222;
      --item-border: rgba(255,255,255,.10);
      --text: #f5f5f5;
      --muted: rgba(235,235,235,.64);
      --border: rgba(255,255,255,.10);
      --btn-bg: rgba(255,255,255,.075);
      --tab-bg: rgba(23,23,23,.98);
      --shadow: 0 5px 18px rgba(0,0,0,.24);
      --menu-shadow: 0 14px 36px rgba(0,0,0,.58);
    }
    html, body { background: var(--bg) !important; color: var(--text); }
    body { line-height: 1.5; }
    .app-container {
      max-width: 640px;
      padding: calc(16px + env(safe-area-inset-top, 0px)) 16px calc(112px + env(safe-area-inset-bottom, 0px));
    }
    .budget-bar, .form-box, .folder-box, .settings-card, .history-filter-card,
    .history-card, .month-card, .community-Section {
      border-radius: 22px;
      border-color: var(--border);
      box-shadow: var(--shadow);
    }
    .budget-bar {
      padding: 15px;
      gap: 12px;
      margin-bottom: 12px;
    }
    html:not(.dark) .budget-bar, body:not(.dark) .budget-bar {
      color: #f6f8f4;
      background: linear-gradient(145deg, #111813 0%, #202a21 100%);
      border-color: #303a31;
      box-shadow: 0 10px 24px rgba(18,31,20,.14);
    }
    .budget-summary { gap: 10px; }
    .stat-chip { min-height: 34px; border-radius: 11px; padding: 6px 10px; }
    .filter-toggle-btn { min-height: 36px; border-radius: 11px; padding: 7px 10px; }
    .date-filter-panel { border-radius: 16px; padding: 12px; }
    .form-box { padding: 15px; margin-block: 12px; gap: 10px; }
    .cat-toolbar { gap: 8px; }
    .cat-pill, .cat-action-btn, .sort-chip { min-height: 44px; border-radius: 14px; font-weight: 750; }
    .cat-action-btn { padding-inline: 13px; }
    .form-grid-top, .form-grid-meta, .form-grid-bottom { gap: 9px; }
    input, select, textarea, .custom-dd-trigger,
    .history-filter-field input, .history-filter-field select, .history-date-field input {
      min-height: 46px;
      border-radius: 14px;
      border-color: var(--border);
      background: var(--card);
      color: var(--text);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.24);
    }
    input:focus, textarea:focus, .custom-dd.open .custom-dd-trigger,
    .history-filter-field input:focus, .history-filter-field select:focus,
    .history-date-field input:focus {
      border-color: var(--accent, var(--primary));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, var(--primary)) 13%, transparent);
      outline: none;
    }
    .add-btn, .secondary-btn, .danger-btn, .copy-wallet-btn {
      min-height: 46px;
      border-radius: 14px;
      padding-inline: 16px;
      font-weight: 800;
      letter-spacing: -.01em;
      box-shadow: none;
    }
    .folder-box {
      background: var(--folder-bg);
      border: 1px solid var(--border);
      border-inline-start: 3px solid var(--accent, var(--border));
      border-radius: 22px;
      padding: 10px;
      overflow: hidden;
      transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
    }
    .folder-header {
      min-height: 56px;
      padding: 9px 9px 11px;
      border-bottom-color: var(--border);
      color: var(--text);
      font-size: .91rem;
    }
    .folder-title-wrap { gap: 8px; }
    .folder-count, .badge { min-height: 28px; padding: 4px 10px; font-size: .72rem; }
    .folder-items { padding: 8px 2px 2px; }
    .item {
      min-height: 58px;
      padding: 11px 12px;
      background: var(--item-bg);
      border: 1px solid var(--item-border);
      border-radius: 16px;
      box-shadow: none;
    }
    .title { font-size: .91rem; font-weight: 750; }
    .meta-badge { min-height: 27px; padding: 3px 9px; border-radius: 9px; }
    .act-btn { width: 38px; height: 38px; border-radius: 12px; }
    .act-btn.status-toggle-btn { width: 38px; height: 38px; }
    .item.done { background: color-mix(in srgb, var(--success) 7%, var(--item-bg)); }
    .top-nav {
      width: min(calc(100vw - 20px), 620px);
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      gap: 4px;
      padding: 6px;
      border-radius: 22px;
      background: var(--tab-bg);
      border-color: var(--border);
      box-shadow: 0 9px 28px rgba(20,24,18,.14), 0 2px 6px rgba(20,24,18,.05);
    }
    html.dark .top-nav, body.dark .top-nav { box-shadow: 0 10px 30px rgba(0,0,0,.48); }
    .tab, .nav-btn { min-height: 58px; height: 58px; border-radius: 16px; color: var(--muted); }
    .tab.active, .nav-btn.active {
      background: transparent;
      border-color: transparent;
      color: var(--text);
      box-shadow: none;
    }
    .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon {
      width: 33px;
      height: 33px;
      color: var(--accent, var(--primary));
      background: transparent;
      box-shadow: none;
      filter: none;
    }
    .tab.active .nav-item-icon svg, .nav-btn.active .nav-item-icon svg { width: 25px; height: 25px; }
    .tab.active .nav-icon-cutout, .nav-btn.active .nav-icon-cutout { fill: var(--tab-bg); }
    .tab.active .badge, .nav-btn.active .badge { color: var(--accent-fg); background: var(--accent, var(--primary)); }
    .nav-btn:hover, .nav-btn:focus-visible { background: color-mix(in srgb, var(--accent, var(--primary)) 7%, var(--tab-bg)); }
    .modal-backdrop { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
    .modal {
      max-width: 560px;
      border-radius: 26px 26px 0 0;
      padding: 18px 16px calc(26px + env(safe-area-inset-bottom, 0px));
      gap: 14px;
    }
    @media (min-width: 500px) {
      .modal { border-radius: 24px; padding: 20px; }
      .modal-backdrop.page-view .modal { max-width: 560px; }
    }
    .modal-header { min-height: 42px; font-size: 1.04rem; }
    .modal-header > span:first-child { letter-spacing: -.02em; }
    .close-btn { width: 40px; height: 40px; border-radius: 13px; }
    .settings-card { padding: 15px; gap: 13px; }
    .settings-card-header { padding-bottom: 10px; color: var(--text); font-size: .87rem; }
    .setting-row { min-height: 46px; }
    .setting-row-title { font-size: .85rem; }
    .setting-label { color: var(--muted); font-size: .78rem; }
    .seg-group { gap: 5px; padding: 4px; border-radius: 14px; }
    .seg-btn { min-height: 39px; height: auto; border-radius: 11px; padding-inline: 9px; }
    .seg-btn.active { background: var(--accent, var(--primary)); color: var(--accent-fg); }
    .sort-chip { padding: 8px 11px; }
    .history-filter-card { padding: 14px; gap: 10px; background: color-mix(in srgb, var(--item-bg) 60%, var(--card)); }
    .history-filter-field { gap: 5px; }
    .history-filter-field input, .history-filter-field select, .history-date-field input { height: 44px; min-height: 44px; }
    .history-card { padding: 14px; border-radius: 17px; }
    .history-top { margin-bottom: 5px; }
    .history-title { font-size: .93rem; line-height: 1.5; }
    .history-meta { line-height: 1.5; }
    .history-list { gap: 9px; }
    .history-badge { min-height: 28px; padding: 5px 10px; }
    .history-reset-btn { min-height: 40px; border-radius: 12px; }
    .credits-footer { color: var(--muted); }
    @media (max-width: 380px) {
      .app-container { padding-inline: 11px; }
      .top-nav { width: calc(100vw - 14px); gap: 1px; padding: 5px; }
      .tab, .nav-btn { min-height: 55px; height: 55px; font-size: .62rem; }
      .tab.active .nav-item-icon, .nav-btn.active .nav-item-icon { width: 30px; height: 30px; }
      .folder-box { padding: 8px; }
      .form-box { padding: 12px; }
      .history-filter-card { padding: 10px; }
    }
    @media (prefers-reduced-motion: no-preference) {
      .folder-box:hover { box-shadow: 0 7px 20px rgba(30,32,25,.065); }
      .item:hover { border-color: color-mix(in srgb, var(--accent, var(--primary)) 22%, var(--item-border)); }
    }
    /* Screen architecture: branded header, focused compose action, real desktop workspace. */
    .app-container { max-width: 980px; padding: calc(14px + env(safe-area-inset-top, 0px)) 22px calc(112px + env(safe-area-inset-bottom, 0px)); }
    .app-brandbar { display:flex; align-items:center; justify-content:space-between; min-height:48px; margin-bottom:14px; }
    .brand-lockup { display:flex; align-items:center; gap:10px; }
    .brand-mark { width:36px; height:36px; display:grid; place-items:center; border-radius:12px; background:var(--text); color:var(--bg); }
    .brand-mark svg { width:20px; height:20px; fill:currentColor; }
    .brand-name { font-size:1.06rem; font-weight:850; letter-spacing:-.035em; }
    .brand-actions { display:flex; align-items:center; gap:8px; }
    .brand-action { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:0 12px; border:1px solid var(--border); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font:inherit; font-size:.75rem; font-weight:750; cursor:pointer; }
    .brand-action svg { width:17px; height:17px; fill:currentColor; }
    .brand-action.active { color:var(--accent); border-color:color-mix(in srgb,var(--accent) 35%,var(--border)); }
    .main-content { min-width:0; }
    .budget-bar { width:100%; }
    .board-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:18px 0 14px; }
    .board-heading-title { min-width:0; display:flex; align-items:center; gap:12px; }
    .board-heading-icon { width:44px; height:44px; display:grid; place-items:center; flex:0 0 auto; border-radius:15px; background:var(--card); border:1px solid var(--border); color:var(--accent,var(--text)); box-shadow:var(--shadow); }
    .board-heading-icon svg { width:23px; height:23px; fill:currentColor; }
    .board-heading h1 { margin:0; font-size:1.2rem; line-height:1.25; font-weight:850; letter-spacing:-.035em; color:var(--text); }
    .board-caption { display:block; margin-top:3px; font-size:.72rem; line-height:1.2; color:var(--muted); }
    .quick-add-toggle { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:44px; padding:0 16px; border:0; border-radius:14px; background:var(--accent,var(--text)); color:var(--accent-fg,var(--bg)); font:inherit; font-size:.82rem; font-weight:800; cursor:pointer; box-shadow:0 5px 14px rgba(20,22,18,.12); transition:transform .18s ease,background .18s ease; }
    .quick-add-toggle:active { transform:scale(.96); }
    .quick-add-toggle.active { background:color-mix(in srgb,var(--accent) 84%,var(--text)); color:var(--accent-fg); }
    .quick-add-plus { display:inline-grid; width:19px; height:19px; place-items:center; border-radius:50%; background:currentColor; color:var(--bg); font-size:1.05rem; line-height:1; }
    .quick-add-toggle .quick-add-plus { background:rgba(255,255,255,.18); color:inherit; }
    .board-layout { display:grid; grid-template-columns:minmax(260px,.72fr) minmax(0,1.28fr); gap:20px; align-items:start; }
    .compose-column, .list-column { min-width:0; }
    .compose-card { overflow:visible; border:1px solid var(--border); border-radius:20px; background:var(--card); box-shadow:var(--shadow); }
    .compose-card-heading { display:flex; align-items:center; justify-content:space-between; min-height:54px; padding:0 15px; font-size:.86rem; font-weight:800; color:var(--text); }
    .compose-card-mark { width:26px; height:26px; display:grid; place-items:center; border-radius:9px; background:var(--btn-bg); color:var(--accent,var(--text)); font-size:1rem; font-weight:800; }
    .compose-card .form-box { border:0; border-top:1px solid var(--border); border-radius:0; box-shadow:none; margin:0; padding:14px; }
    .compose-card .form-box.collapsed { display:none !important; }
    .form-heading { display:flex; align-items:center; justify-content:space-between; min-height:32px; color:var(--muted); font-size:.78rem; }
    .form-close { width:30px; height:30px; display:grid; place-items:center; border:0; border-radius:10px; background:var(--btn-bg); color:var(--muted); font-size:.9rem; cursor:pointer; }
    .list-column { display:flex; flex-direction:column; gap:11px; }
    .cat-toolbar { display:flex; align-items:center; gap:7px; padding:3px 0; }
    .cat-bar { min-width:0; flex:1 1 auto; gap:7px; }
    .cat-pill { background:var(--card); border:1px solid var(--border); box-shadow:none; }
    .cat-pill.active { background:var(--accent,var(--text)); color:var(--accent-fg,var(--bg)); border-color:var(--accent,var(--text)); }
    .cat-action-btn { flex:0 0 auto; min-height:40px; min-width:40px; padding:0 10px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); }
    .cat-action-btn svg { width:17px; height:17px; fill:currentColor; }
    .cat-action-btn.dashed { border-style:solid; }
    .cat-action-btn .quick-add-plus { width:17px; height:17px; background:var(--btn-bg); color:var(--text); }
    .sub-bar-box { border-radius:16px; background:var(--card); border:1px solid var(--border); }
    #listContainer { gap:9px; }
    .empty { border:1px dashed var(--border); border-radius:18px; background:var(--card); }
    .top-nav { width:min(calc(100vw - 28px),620px); grid-template-columns:repeat(auto-fit,minmax(48px,1fr)); }
    .tabs, .nav-actions { display:contents; }
    @media (min-width: 760px) {
      .app-container { padding-inline:30px; }
      .board-heading { margin-top:22px; }
      .board-layout { gap:24px; }
      .compose-card { position:sticky; top:18px; }
      .top-nav { width:min(calc(100vw - 40px),620px); }
    }
    @media (max-width: 759px) {
      .app-container { max-width:640px; padding-inline:14px; }
      .board-layout { grid-template-columns:minmax(0,1fr); gap:14px; }
      .compose-column { order:0; }
      .list-column { order:1; }
      .board-heading { margin:16px 1px 12px; }
      .board-heading-icon { width:40px; height:40px; border-radius:13px; }
      .board-heading h1 { font-size:1.08rem; }
      .compose-card-heading { min-height:48px; }
    }
    @media (max-width: 400px) {
      .app-container { padding-inline:11px; }
      .app-brandbar { min-height:42px; margin-bottom:10px; }
      .brand-mark { width:32px; height:32px; border-radius:11px; }
      .brand-name { font-size:1rem; }
      .brand-actions { gap:5px; }
      .brand-action { min-height:36px; padding-inline:9px; }
      .quick-add-toggle { min-height:41px; padding-inline:12px; }
      .cat-action-btn span:not(.quick-add-plus) { display:none; }
      .top-nav { width:calc(100vw - 14px); }
    }
    /* Light theme refresh: crisp SaaS surfaces with clear card hierarchy. */
    :root {
      --bg: #f6f7f5;
      --card: #ffffff;
      --folder-bg: #ffffff;
      --item-bg: #f3f4f2;
      --item-border: #e3e5e1;
      --text: #171916;
      --muted: #71766f;
      --border: #e5e7e3;
      --btn-bg: #f0f1ee;
      --tab-bg: rgba(255,255,255,.97);
      --shadow: 0 5px 18px rgba(24,29,22,.055);
      --menu-shadow: 0 16px 38px rgba(24,29,22,.16);
    }
    html:not(.dark) body, body:not(.dark) { background: var(--bg) !important; color: var(--text); }
    html:not(.dark) .top-nav, body:not(.dark) .top-nav {
      background: var(--tab-bg);
      border-color: #e8e9e6;
      box-shadow: 0 8px 28px rgba(24,29,22,.09);
    }
    html:not(.dark) .budget-bar, body:not(.dark) .budget-bar {
      color: var(--text);
      background: var(--card);
      border-color: var(--border);
      box-shadow: var(--shadow);
    }
    html:not(.dark) .budget-bar .stat-chip, body:not(.dark) .budget-bar .stat-chip,
    html:not(.dark) .budget-bar .filter-toggle-btn, body:not(.dark) .budget-bar .filter-toggle-btn {
      color: var(--text);
      background: #f3f4f1;
      border: 1px solid #e7e9e5;
    }
    html:not(.dark) .budget-bar .stat-chip.spent, body:not(.dark) .budget-bar .stat-chip.spent {
      background: #e9f5ed;
      border-color: #d7ebdd;
      color: #176b3a;
    }
    html:not(.dark) .budget-bar .stat-chip.pending, body:not(.dark) .budget-bar .stat-chip.pending {
      background: #fff0ef;
      border-color: #f5d9d6;
      color: #a62d27;
    }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background: var(--folder-bg);
      border-color: #e3e5e1;
      border-inline-start-color: var(--accent);
      box-shadow: 0 7px 22px rgba(24,29,22,.065);
    }
    html:not(.dark) .folder-header, body:not(.dark) .folder-header { background: transparent; }
    html:not(.dark) .item, body:not(.dark) .item {
      background: var(--item-bg);
      border-color: var(--item-border);
      box-shadow: 0 1px 2px rgba(24,29,22,.025);
    }
    html:not(.dark) .item.done, body:not(.dark) .item.done {
      background: #edf7f0;
      border-color: #d7eadc;
    }
    html:not(.dark) .brand-action, body:not(.dark) .brand-action,
    html:not(.dark) .cat-pill, body:not(.dark) .cat-pill,
    html:not(.dark) .cat-action-btn, body:not(.dark) .cat-action-btn,
    html:not(.dark) .sort-chip, body:not(.dark) .sort-chip,
    html:not(.dark) .secondary-btn, body:not(.dark) .secondary-btn {
      background: var(--card);
      border-color: var(--border);
      color: var(--text);
    }
    html:not(.dark) .cat-pill.active, body:not(.dark) .cat-pill.active,
    html:not(.dark) .sort-chip.active, body:not(.dark) .sort-chip.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-fg);
    }
    html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea,
    html:not(.dark) .custom-dd-trigger, body:not(.dark) input, body:not(.dark) select,
    body:not(.dark) textarea, body:not(.dark) .custom-dd-trigger {
      background: #ffffff;
      border-color: #e1e4df;
      color: var(--text);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.85);
    }
    html:not(.dark) .custom-dd-menu, body:not(.dark) .custom-dd-menu {
      background: #ffffff;
      border-color: #e1e4df;
    }
    html:not(.dark) .nav-btn.active, html:not(.dark) .tab.active,
    body:not(.dark) .nav-btn.active, body:not(.dark) .tab.active {
      color: var(--text);
    }
    html:not(.dark) .nav-btn.active .nav-item-icon, html:not(.dark) .tab.active .nav-item-icon,
    body:not(.dark) .nav-btn.active .nav-item-icon, body:not(.dark) .tab.active .nav-item-icon {
      color: var(--accent);
    }
    /* Stronger light-mode direction: warm porcelain canvas, white cards,
       cool inset rows and a charcoal summary panel. */
    :root {
      --bg: #f3f0e8;
      --card: #fffefa;
      --folder-bg: #fffefa;
      --item-bg: #f0f2f5;
      --item-border: #dfe3e8;
      --text: #17191c;
      --muted: #69717d;
      --border: #dedfdc;
      --btn-bg: #ecece8;
      --tab-bg: rgba(255,254,250,.98);
      --shadow: 0 8px 24px rgba(32,34,31,.075);
      --menu-shadow: 0 18px 42px rgba(22,25,29,.18);
    }
    html:not(.dark) .budget-bar, body:not(.dark) .budget-bar {
      color: #f7f7f5;
      background: #17191c;
      border-color: #17191c;
      box-shadow: 0 12px 28px rgba(23,25,28,.18);
    }
    html:not(.dark) .budget-bar .stat-chip, body:not(.dark) .budget-bar .stat-chip,
    html:not(.dark) .budget-bar .filter-toggle-btn, body:not(.dark) .budget-bar .filter-toggle-btn {
      color: #f7f7f5;
      background: #282b30;
      border-color: #373b42;
    }
    html:not(.dark) .budget-bar .stat-chip.spent, body:not(.dark) .budget-bar .stat-chip.spent {
      color: #baf0c9;
      background: rgba(39,155,82,.18);
      border-color: rgba(93,205,129,.25);
    }
    html:not(.dark) .budget-bar .stat-chip.pending, body:not(.dark) .budget-bar .stat-chip.pending {
      color: #ffc5bf;
      background: rgba(213,65,55,.17);
      border-color: rgba(255,130,118,.22);
    }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background: #fffefa;
      border-color: #ddded9;
      box-shadow: 0 9px 24px rgba(34,35,31,.09);
    }
    html:not(.dark) .folder-header, body:not(.dark) .folder-header {
      border-bottom-color: #e9e8e2;
    }
    html:not(.dark) .item, body:not(.dark) .item {
      background: #f0f2f5;
      border-color: #dfe3e8;
      box-shadow: 0 2px 5px rgba(28,32,39,.045);
    }
    html:not(.dark) .item.done, body:not(.dark) .item.done {
      background: #e8f4eb;
      border-color: #cde5d3;
    }
    html:not(.dark) .settings-card, html:not(.dark) .history-filter-card,
    html:not(.dark) .history-card, html:not(.dark) .month-card,
    body:not(.dark) .settings-card, body:not(.dark) .history-filter-card,
    body:not(.dark) .history-card, body:not(.dark) .month-card {
      background: #fffefa;
      border-color: #e0e0db;
    }
    html:not(.dark) .compose-card, body:not(.dark) .compose-card {
      background: #fffefa;
      border-color: #dedfdc;
      box-shadow: 0 8px 24px rgba(32,34,31,.075);
    }
    html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea,
    html:not(.dark) .custom-dd-trigger, body:not(.dark) input, body:not(.dark) select,
    body:not(.dark) textarea, body:not(.dark) .custom-dd-trigger {
      background: #fffefa;
      border-color: #d9dcd9;
    }
    html:not(.dark) .top-nav, body:not(.dark) .top-nav {
      border-color: #e3e1db;
      box-shadow: 0 10px 30px rgba(35,36,32,.12);
    }
    /* Reference-led light palette: periwinkle atmosphere, glass-white cards,
       ink-black controls and a dark floating dock. */
    :root {
      --bg: #eef0fa;
      --card: rgba(255,255,255,.86);
      --folder-bg: rgba(255,255,255,.88);
      --item-bg: rgba(255,255,255,.68);
      --item-border: rgba(255,255,255,.82);
      --text: #111318;
      --muted: #737987;
      --border: rgba(255,255,255,.82);
      --btn-bg: rgba(255,255,255,.72);
      --tab-bg: #111216;
      --shadow: 0 10px 30px rgba(57,65,117,.09);
      --menu-shadow: 0 18px 46px rgba(40,48,91,.2);
    }
    html:not(.dark), body:not(.dark) { background-color:#eef0fa !important; }
    html:not(.dark) body, body:not(.dark) {
      background:
        radial-gradient(ellipse at 92% 7%, rgba(156,169,255,.58), transparent 39%),
        radial-gradient(ellipse at 8% 68%, rgba(199,205,255,.55), transparent 42%),
        linear-gradient(145deg,#f8f9ff 0%,#eef0fb 48%,#e5e9ff 100%) !important;
      background-attachment: fixed !important;
      color: #111318;
    }
    html:not(.dark) .app-container, body:not(.dark) .app-container { background:transparent !important; }
    html:not(.dark) .top-nav, body:not(.dark) .top-nav {
      background: rgba(15,16,20,.97);
      border: 1px solid rgba(255,255,255,.14);
      box-shadow: 0 14px 36px rgba(17,19,35,.24);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
    }
    html:not(.dark) .tab, html:not(.dark) .nav-btn,
    body:not(.dark) .tab, body:not(.dark) .nav-btn { color:rgba(255,255,255,.72); }
    html:not(.dark) .tab.active, html:not(.dark) .nav-btn.active,
    body:not(.dark) .tab.active, body:not(.dark) .nav-btn.active {
      color:#111318;
      background:#ffffff;
      border-color:#ffffff;
      border-radius:18px;
      box-shadow:0 4px 14px rgba(0,0,0,.18);
    }
    html:not(.dark) .tab.active .nav-item-icon, html:not(.dark) .nav-btn.active .nav-item-icon,
    body:not(.dark) .tab.active .nav-item-icon, body:not(.dark) .nav-btn.active .nav-item-icon { color:#111318; }
    html:not(.dark) .tab.active .badge, html:not(.dark) .nav-btn.active .badge,
    body:not(.dark) .tab.active .badge, body:not(.dark) .nav-btn.active .badge {
      background:#111318;
      color:#ffffff;
    }
    html:not(.dark) .budget-bar, body:not(.dark) .budget-bar {
      color:#111318;
      background:rgba(255,255,255,.76);
      border:1px solid rgba(255,255,255,.9);
      box-shadow:0 10px 32px rgba(57,65,117,.11);
      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);
    }
    html:not(.dark) .budget-bar .stat-chip, html:not(.dark) .budget-bar .filter-toggle-btn,
    body:not(.dark) .budget-bar .stat-chip, body:not(.dark) .budget-bar .filter-toggle-btn {
      color:#20232b;
      background:rgba(244,246,255,.88);
      border:1px solid rgba(215,220,243,.92);
    }
    html:not(.dark) .budget-bar .stat-chip.spent, body:not(.dark) .budget-bar .stat-chip.spent {
      color:#16804a; background:#e8f8ef; border-color:#ccefd9;
    }
    html:not(.dark) .budget-bar .stat-chip.pending, body:not(.dark) .budget-bar .stat-chip.pending {
      color:#c13e43; background:#fff0f0; border-color:#f5d7d9;
    }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background:rgba(255,255,255,.86);
      border:1px solid rgba(255,255,255,.95);
      border-inline-start:3px solid var(--accent);
      box-shadow:0 10px 30px rgba(57,65,117,.095);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
    }
    html:not(.dark) .folder-header, body:not(.dark) .folder-header {
      background:transparent;
      border-bottom-color:rgba(91,101,145,.12);
    }
    html:not(.dark) .item, body:not(.dark) .item {
      background:rgba(255,255,255,.76);
      border-color:rgba(255,255,255,.96);
      box-shadow:0 3px 12px rgba(44,51,90,.055);
    }
    html:not(.dark) .item.done, body:not(.dark) .item.done {
      background:rgba(232,248,238,.9);
      border-color:#c9ebd4;
    }
    html:not(.dark) .compose-card, html:not(.dark) .settings-card,
    html:not(.dark) .history-filter-card, html:not(.dark) .history-card,
    html:not(.dark) .month-card, body:not(.dark) .compose-card,
    body:not(.dark) .settings-card, body:not(.dark) .history-filter-card,
    body:not(.dark) .history-card, body:not(.dark) .month-card {
      background:rgba(255,255,255,.84);
      border-color:rgba(255,255,255,.95);
      box-shadow:0 10px 30px rgba(57,65,117,.09);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
    }
    html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea,
    html:not(.dark) .custom-dd-trigger, body:not(.dark) input, body:not(.dark) select,
    body:not(.dark) textarea, body:not(.dark) .custom-dd-trigger {
      background:rgba(255,255,255,.88);
      border-color:rgba(203,210,234,.9);
      color:#111318;
    }
    html:not(.dark) .custom-dd-menu, body:not(.dark) .custom-dd-menu {
      background:rgba(255,255,255,.98);
      border-color:#dfe3f4;
      backdrop-filter:blur(18px);
    }
    html:not(.dark) .brand-mark, body:not(.dark) .brand-mark { background:#111318; color:#ffffff; }
    html:not(.dark) .brand-action, html:not(.dark) .cat-action-btn,
    body:not(.dark) .brand-action, body:not(.dark) .cat-action-btn {
      background:rgba(255,255,255,.82);
      border-color:rgba(211,216,237,.95);
      color:#17191e;
    }
    html:not(.dark) .quick-add-toggle, html:not(.dark) .add-btn,
    body:not(.dark) .quick-add-toggle, body:not(.dark) .add-btn {
      background:#111318;
      color:#ffffff;
      box-shadow:0 7px 18px rgba(17,19,24,.18);
    }
    /* Final light navigation and folder/item separation refinements. */
    html:not(.dark) .app-brandbar, body:not(.dark) .app-brandbar { display:none !important; }
    #countShopping, #countTasks { display:none !important; }
    html:not(.dark) .top-nav, body:not(.dark) .top-nav {
      background:rgba(255,255,255,.96);
      border:1px solid rgba(255,255,255,.98);
      box-shadow:0 12px 34px rgba(45,53,96,.17);
      backdrop-filter:blur(22px);
      -webkit-backdrop-filter:blur(22px);
    }
    html:not(.dark) .tab, html:not(.dark) .nav-btn,
    body:not(.dark) .tab, body:not(.dark) .nav-btn { color:#747b89; }
    html:not(.dark) .tab.active, html:not(.dark) .nav-btn.active,
    body:not(.dark) .tab.active, body:not(.dark) .nav-btn.active {
      color:#ffffff;
      background:#111318;
      border-color:#111318;
      border-radius:18px;
      box-shadow:0 5px 14px rgba(17,19,24,.17);
    }
    html:not(.dark) .tab.active .nav-item-icon, html:not(.dark) .nav-btn.active .nav-item-icon,
    body:not(.dark) .tab.active .nav-item-icon, body:not(.dark) .nav-btn.active .nav-item-icon { color:#ffffff; }
    html:not(.dark) .tab.active .nav-icon-cutout, html:not(.dark) .nav-btn.active .nav-icon-cutout,
    body:not(.dark) .tab.active .nav-icon-cutout, body:not(.dark) .nav-btn.active .nav-icon-cutout { fill:#111318; }
    html:not(.dark) .tab.active .badge, html:not(.dark) .nav-btn.active .badge,
    body:not(.dark) .tab.active .badge, body:not(.dark) .nav-btn.active .badge { display:none !important; }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background:linear-gradient(145deg,rgba(209,218,255,.88),rgba(225,229,255,.78));
      border:1px solid #c6cef1;
      border-inline-start:3px solid var(--accent);
      box-shadow:0 11px 30px rgba(77,91,166,.14);
    }
    html:not(.dark) .folder-header, body:not(.dark) .folder-header {
      border-bottom-color:rgba(89,101,165,.18);
    }
    html:not(.dark) .item, body:not(.dark) .item {
      background:#ffffff;
      border:1px solid rgba(255,255,255,.98);
      box-shadow:0 4px 13px rgba(62,71,125,.09);
    }
    html:not(.dark) .item.done, body:not(.dark) .item.done {
      background:#e9f8ef;
      border-color:#c7ecd4;
    }
    /* Keep the quick-entry fields visible and ready at all times. */
    .app-brandbar { display:none !important; }
    .compose-card .quick-add-toggle { display:none !important; }
    .compose-card .form-box.collapsed { display:flex !important; }
    .compose-card .form-close { display:none !important; }
    .compose-card-heading, .form-heading { display:none !important; }
    html:not(.dark) .folder-box, body:not(.dark) .folder-box {
      background:#fcfcfd;
      border-color:#dedaf5;
      border-inline-start-color:var(--accent);
    }
    body.page-view-active .app-container > :not(.top-nav) { display:none !important; }
  </style>
</head>
<body>
<div class="app-container">
    <header class="app-brandbar">
      <div class="brand-lockup"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5 7.2 3l3.2 2.5-3.2 2.6L4 5.5Zm9.6 0L16.8 3 20 5.5l-3.2 2.6-3.2-2.6ZM4 18.5 7.2 16l3.2 2.5-3.2 2.6L4 18.5Zm9.6 0 3.2-2.5 3.2 2.5-3.2 2.6-3.2-2.6Z"/></svg></span><span class="brand-name">Merkoo</span></div>
      <div class="brand-actions">
        <button type="button" class="brand-action" id="btnOpenCatalog" data-act="open-catalog" title="Price database" aria-label="Price database"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 12.1 12 20.8a1.7 1.7 0 0 1-2.4 0L2.5 13.7V3.5h10.2l8 8a.4.4 0 0 1 0 .6Z"/><circle cx="7.4" cy="7.4" r="1.7"/></svg><span id="lblNavCatalog">\u0642\u06CC\u0645\u062A</span></button>
        <a class="brand-action" id="myOwnBotBtn" href="https://t.me/${safeBotUser}?start=welcome" style="display:none;" title="My List" aria-label="My List"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 14 5H10l2-3ZM5 7h14a3 3 0 0 1 3 3v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7a3 3 0 0 1 3-3Z"/><circle cx="8.5" cy="12" r="1.2"/><circle cx="15.5" cy="12" r="1.2"/></svg><span id="lblNavBot">\u0631\u0628\u0627\u062A</span></a>
      </div>
    </header>
    <div class="top-nav">
      <div class="tabs">
        <button type="button" class="tab active" id="tabShopping" data-act="switch-tab" data-val="shopping"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.6 3.4h2.1c.6 0 1.1.4 1.2 1l.5 2.1h14a1 1 0 0 1 1 1.3l-2.2 7.5a2 2 0 0 1-1.9 1.4H8a2 2 0 0 1-2-1.6L4.5 5.4H2.6a1 1 0 1 1 0-2Z"/><path d="M8.3 11h9.4l-.8 2.7H8.8L8.3 11Z" fill="var(--tab-bg)"/><circle cx="9" cy="20" r="1.7"/><circle cx="18" cy="20" r="1.7"/></svg></span><span class="tab-lbl" id="lblNavShop">\u062E\u0631\u06CC\u062F</span><span class="badge" id="countShopping">0</span></button>
        <button type="button" class="tab" id="tabTasks" data-act="switch-tab" data-val="tasks"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H6.7A2.7 2.7 0 0 0 4 5.7v13.6A2.7 2.7 0 0 0 6.7 22h10.6a2.7 2.7 0 0 0 2.7-2.7V5.7A2.7 2.7 0 0 0 17.3 3H16v2H8V3Z"/><path d="M9 2h6a1 1 0 0 1 1 1v3H8V3a1 1 0 0 1 1-1Z"/><path class="nav-icon-cutout" d="M8 10h8v1.5H8zm0 4h8v1.5H8zm0 4h5v1.5H8z"/></svg></span><span class="tab-lbl" id="lblNavTasks">\u06A9\u0627\u0631\u0647\u0627</span><span class="badge" id="countTasks">0</span></button>
      </div>
      <div class="nav-actions">
        <button type="button" class="nav-btn" id="btnOpenHistory" data-act="open-history" title="\u062A\u0627\u0631\u06CC\u062E\u0686\u0647 / History"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1-9.1 5.8L1 6h5v5L4.6 9.6A7.5 7.5 0 1 0 12 4.5V2Z"/><circle class="nav-icon-cutout" cx="12" cy="12" r="6.8"/><path d="M11 7h2v5.1l3.1 1.8-1 1.7-4.1-2.4V7Z"/></svg></span><span class="nav-item-label" id="lblNavHistory">\u062A\u0627\u0631\u06CC\u062E\u0686\u0647</span></button>
        <button type="button" class="nav-btn" id="btnOpenSettings" data-act="open-settings" title="\u062A\u0646\u0638\u06CC\u0645\u0627\u062A / Settings"><span class="nav-item-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h4l.6 2.5 1.8 1.1 2.4-.9 2 3.5-1.8 1.9v2l1.8 1.9-2 3.5-2.4-.9-1.8 1.1L14 22h-4l-.6-2.5-1.8-1.1-2.4.9-2-3.5L5 13.9v-2l-1.8-1.9 2-3.5 2.4.9 1.8-1.1L10 2Z"/><circle class="nav-icon-cutout" cx="12" cy="12" r="3.2"/></svg></span><span class="nav-item-label" id="lblNavSettings">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A</span></button>
      </div>
    </div>
    <main class="main-content">
      <div class="budget-bar" id="budgetBar">
        <div class="budget-summary" data-act="toggle-date-filter"><div class="budget-stats"><span class="stat-chip spent" id="lblTotalSpent">\u{1F7E2} \u062E\u0631\u062C\u200C\u0634\u062F\u0647: 0</span><span class="stat-chip pending" id="lblTotalPending">\u{1F534} \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F: 0</span></div><span class="filter-toggle-btn" id="lblDateRangeBtn">\u{1F4C5} \u0641\u06CC\u0644\u062A\u0631 \u25BE</span></div>
        <div class="date-filter-panel" id="dateFilterPanel"><div class="quick-date-btns"><button type="button" class="q-btn active" id="qBtnMonth" data-act="quick-date" data-val="month">\u0627\u06CC\u0646 \u0645\u0627\u0647</button><button type="button" class="q-btn" id="qBtnAll" data-act="quick-date" data-val="all">\u0647\u0645\u0647 \u062A\u0627\u0631\u06CC\u062E\u200C\u0647\u0627</button></div><div class="date-row"><span id="lblFromDate">\u0627\u0632:</span><input type="date" id="filterStartDate" /><span id="lblToDate">\u062A\u0627:</span><input type="date" id="filterEndDate" /></div><div class="months-breakdown-title" id="lblMonthsTitle">\u{1F4CA} \u0644\u06CC\u0633\u062A \u0645\u0627\u0647\u200C\u0647\u0627 (\u0645\u062C\u0645\u0648\u0639 \u062E\u0631\u06CC\u062F \u0647\u0631 \u0645\u0627\u0647):</div><div class="months-grid" id="monthsBreakdownGrid"></div></div>
      </div>
      <div class="board-heading">
        <div class="board-heading-title"><span class="board-heading-icon"><svg id="boardHeadingIcon" viewBox="0 0 24 24"><path d="M3 3h18l-1.6 18H4.6L3 3Zm4 4v2h10V7H7Zm0 5v2h7v-2H7Z"/></svg></span><div><h1 id="boardTitle">\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F</h1><span class="board-caption" id="boardCount">0</span></div></div>
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
          <div class="cat-toolbar" id="catToolbar"><div class="cat-bar" id="catBar"></div><button type="button" class="cat-action-btn" id="btnSortCats" data-act="toggle-sort-box" title="Sort Folders"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm3 5h10v2H7zm3 5h4v2h-4z"/></svg><span id="lblSortBtn">\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u067E\u0648\u0634\u0647\u200C\u0647\u0627</span></button><button type="button" class="cat-action-btn" id="btnSortList" data-act="toggle-item-sort-box"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h10v2H4zm0 5h7v2H4zm13-1 3 3-3 3v-2h-3v-2h3z"/></svg><span id="lblSortList">\u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u0644\u06CC\u0633\u062A</span></button><button type="button" class="cat-action-btn dashed" id="btnAddCatTop" data-act="toggle-new-cat-box"><span class="quick-add-plus">+</span><span id="lblNewCatShort">\u067E\u0648\u0634\u0647</span></button></div>
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

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-title" id="lblShowUnitsTitle">\u0646\u0645\u0627\u06CC\u0634 \u062A\u06AF \u0645\u0642\u062F\u0627\u0631 \u0648 \u0648\u0627\u062D\u062F (\u0645\u062B\u0644 \u06F1 \u06A9\u06CC\u0644\u0648 / \u06F1 \u0639\u062F\u062F)</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="chkShowUnits">
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
        renameCatTitle: "\u270F\uFE0F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u0627\u0645 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC", renameCatField: "\u0646\u0627\u0645 \u062C\u062F\u06CC\u062F \u067E\u0648\u0634\u0647:",
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
        renameCatTitle: "\u270F\uFE0F Rename Category", renameCatField: "New folder name:",
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
    if (localStorage.getItem('merkoo_theme_revision') !== 'premium-v4') {
      localStorage.setItem('merkoo_accent_v24', DEFAULT_ACCENT);
      localStorage.setItem('merkoo_theme_revision', 'premium-v4');
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

      const bgHex = useDark ? '#090909' : '#eef0fa';
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
                <div class="folder-title-wrap">
                  \${dragHandleHtml}
                  <span>\u{1F4C2} \${escapeHtml(c)}</span>
                  \${editBtnHtml}
                  \${folderCostBadge}
                </div>
                <span class="folder-count">\${doneCount} / \${grouped[c].length} <span class="chevron-icon">\u25BE</span></span>
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

      let badgesHtml = '';
      if (activeTab === 'shopping') {
        if (showUnitBadge && count !== null) {
          badgesHtml += \`<span class="meta-badge">\${count} \${escapeHtml(unitLbl)}</span>\`;
        }
        if (useCatalog && total > 0) {
          badgesHtml += \`<span class="meta-badge price-tag">\${formatMoney(total)}</span>\`;
        }
      }
      if (item.qty && item.qty.trim()) {
        badgesHtml += '<span class="note-indicator">\u{1F4AC}</span>';
      }

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
            <div class="title-wrap">
              <span class="title">\${escapeHtml(item.title)}</span>
              \${badgesHtml}
            </div>
            <div class="actions">
              \${canEdit ? \`
                <button type="button" class="act-btn status-toggle-btn" data-act="toggle-item" data-id="\${escapeHtml(itemId)}" title="\${item.done ? undoDoneLabel : markDoneLabel}" aria-label="\${item.done ? undoDoneLabel : markDoneLabel}"><svg viewBox="0 0 24 24" aria-hidden="true">\${item.done ? '<path d="m5 12 4.5 4.5L19 7"/>' : '<circle cx="12" cy="12" r="7.5"/><path d="M8.5 12h7"/>'}</svg></button>
                <button type="button" class="act-btn" data-act="edit-item" data-id="\${escapeHtml(itemId)}" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="m3 17.25 11.6-11.6 3.75 3.75L6.75 21H3v-3.75ZM20.7 7.05a1 1 0 0 0 0-1.4l-2.35-2.36a1 1 0 0 0-1.42 0l-1.3 1.3 3.76 3.76 1.31-1.3Z"/></svg>
                </button>
                <button type="button" class="act-btn" data-act="delete-item" data-id="\${escapeHtml(itemId)}" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M8 4V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a1 1 0 1 1 0 2h-1v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6H4a1 1 0 1 1 0-2h4Zm2 0h4V3h-4v1Zm-3 2v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6H7Z"/><path d="M9 8h2v9H9zm4 0h2v9h-2z"/></svg>
                </button>
              \` : \`
                <span class="act-btn status-toggle-btn" aria-label="\${item.done ? markDoneLabel : undoDoneLabel}"><svg viewBox="0 0 24 24" aria-hidden="true">\${item.done ? '<path d="m5 12 4.5 4.5L19 7"/>' : '<circle cx="12" cy="12" r="7.5"/><path d="M8.5 12h7"/>'}</svg></span>
              \`}
            </div>
          </div>
          \${detailsLines.length > 0 ? \`<div class="item-details-panel">\${detailsLines.join(' &nbsp;|&nbsp; ')}</div>\` : ''}
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

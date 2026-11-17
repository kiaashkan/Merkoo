var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
import { DurableObject } from "cloudflare:workers";
import { getMiniAppHtml } from "./miniapp.js";
var APP_VERSION = "v3.29.0";
var TRUSTED_WEBHOOK_ORIGIN = "https://merkoo.kiaashkan.workers.dev";
var WALLET_ADDRESS = "UQB6Wphj-CHN1kSwU5fzgMUval6SdJljEhX-52q5qP-yKbTg";
var ALLOWED_UNITS = ["pcs", "kg", "g", "pack", "tray", "bottle", "l"];
var ALLOWED_CURRENCIES = ["IRR", "IRT", "USD", "EUR", "GBP"];
var ALLOWED_SORTS = ["default", "name", "updated", "count"];
var ALLOWED_ITEM_SORT_MODES = ["status", "manual"];
var FORBIDDEN_KEYS = ["__proto__", "prototype", "constructor", "tostring", "valueof", "hasownproperty"];
var MAX_BODY_BYTES = 32768;
var MAX_COUNT_VAL = 1e6;
var MAX_PRICE_VAL = 1e12;
var ipRateLimitMap = /* @__PURE__ */ new Map();
var userRateLimitMap = /* @__PURE__ */ new Map();
var boardRateLimitMap = /* @__PURE__ */ new Map();
// Durable Object storage and permission enforcement.
var MerkooBoardDO = class extends DurableObject {
  static {
    __name(this, "MerkooBoardDO");
  }
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const body = await request.json();
    if (url.pathname === "/do/sys-version-get") {
      const ver = await this.ctx.storage.get("system_last_synced_version");
      return new Response(JSON.stringify({ version: ver || null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/do/sys-version-set") {
      await this.ctx.storage.put("system_last_synced_version", String(body.version || APP_VERSION));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const chatId = String(body.chatId || "");
    if (url.pathname === "/do/get") {
      const data = await this.ctx.storage.get("board_data");
      const permBlocked = await this.ctx.storage.get("perm_blocked_map");
      if (data && permBlocked && typeof permBlocked === "object") {
        data._perm_blocked_map = permBlocked;
      }
      return new Response(JSON.stringify({ data: data || null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/do/save") {
      const incoming = body.chatData;
      const isOwnerSecurityAction = Boolean(body.isOwnerSecurityAction);
      const actorId = String(body.actorId || "");
      const current = await this.ctx.storage.get("board_data");
      let permBlocked = await this.ctx.storage.get("perm_blocked_map") || {};
      const isActorOwner = actorId === chatId;
      const existingPartner = Boolean(current && current.active_partners && Object.hasOwn(current.active_partners, actorId));
      const joiningWithInvite = Boolean(
        current && !isActorOwner && !existingPartner && body.isJoiningWithInvite && body.inviteKey &&
        timingSafeEqualStr(String(body.inviteKey), String(current.invite_token || "")) &&
        permBlocked[actorId] !== 1 &&
        !(Array.isArray(current.blocked_partners) && current.blocked_partners.includes(actorId)) &&
        Object.keys(current.active_partners || {}).length < 100
      );
      if (isOwnerSecurityAction && !isActorOwner) {
        return new Response(JSON.stringify({ ok: false, revoked: true }), { status: 403 });
      }
      if (isOwnerSecurityAction && String(actorId) === chatId) {
        if (body.blockUid) {
          permBlocked[String(body.blockUid)] = 1;
          await this.ctx.storage.put("perm_blocked_map", permBlocked);
        }
        if (body.unblockUid) {
          delete permBlocked[String(body.unblockUid)];
          await this.ctx.storage.put("perm_blocked_map", permBlocked);
        }
      }
      if (current && !isOwnerSecurityAction && !isActorOwner) {
        const isBlocked = permBlocked[actorId] === 1 || Array.isArray(current.blocked_partners) && current.blocked_partners.includes(actorId);
        if (isBlocked || !existingPartner && !joiningWithInvite || body.requireEditAccess && (!existingPartner || current.active_partners[actorId].can_edit !== true)) {
          return new Response(JSON.stringify({ ok: false, revoked: true }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      if (current && !isActorOwner) {
        const needsDefaultsMigration = sanitizeNumber(current.defaults_version, 0, 2, 0) < 2;
        incoming.chat_id = chatId;
        incoming.defaults_version = 2;
        incoming.use_catalog = needsDefaultsMigration ? false : current.use_catalog === true;
        incoming.show_unit_badge = needsDefaultsMigration ? false : current.show_unit_badge === true;
        incoming.cat_sort = needsDefaultsMigration || !ALLOWED_SORTS.includes(current.cat_sort) ? "count" : current.cat_sort;
        incoming.item_sort_mode = ALLOWED_ITEM_SORT_MODES.includes(current.item_sort_mode) ? current.item_sort_mode : "status";
        incoming.invite_token = current.invite_token;
        incoming.auth_epoch = current.auth_epoch;
        incoming.partner_can_edit = needsDefaultsMigration ? false : current.partner_can_edit === true;
        incoming.blocked_partners = current.blocked_partners || [];
        const safePartners = JSON.parse(JSON.stringify(current.active_partners || {}));
        if (existingPartner && incoming.active_partners && incoming.active_partners[actorId]) {
          safePartners[actorId].name = sanitizeText(incoming.active_partners[actorId].name || "User", 60);
        } else if (joiningWithInvite && incoming.active_partners && incoming.active_partners[actorId]) {
          safePartners[actorId] = {
            name: sanitizeText(incoming.active_partners[actorId].name || "User", 60),
            can_edit: false,
            auth_epoch: typeof incoming.active_partners[actorId].auth_epoch === "string" ? incoming.active_partners[actorId].auth_epoch : genRandom128BitHex()
          };
        }
        incoming.active_partners = safePartners;
      }
      const savedAnalytics = current && current.analytics && typeof current.analytics === "object"
        ? current.analytics
        : incoming.analytics || { opens_total: 0, unique_visitors: [], last_visit_at: 0 };
      if (body.recordVisit) {
        const visitors = Array.isArray(savedAnalytics.unique_visitors) ? [...new Set(savedAnalytics.unique_visitors.map(String).filter(isValidTelegramId))] : [];
        if (isValidTelegramId(actorId) && !visitors.includes(actorId) && visitors.length < 2e3) visitors.push(actorId);
        incoming.analytics = {
          opens_total: Math.min(1e12, sanitizeNumber(savedAnalytics.opens_total, 0, 1e12, 0) + 1),
          unique_visitors: visitors,
          last_visit_at: Date.now()
        };
      } else {
        incoming.analytics = savedAnalytics;
      }
      delete incoming._perm_blocked_map;
      incoming.doc_rev = (current && Number(current.doc_rev) || 0) + 1;
      await this.ctx.storage.put("board_data", incoming);
      return new Response(JSON.stringify({ ok: true, data: incoming }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Not Found", { status: 404 });
  }
};
// Shared persistence and Telegram API helpers.
function getBoardStub(env, name) {
  if (!env || !env.BOARD_DO) {
    throw new Error("CRITICAL: BOARD_DO Durable Object binding is not configured.");
  }
  const id = env.BOARD_DO.idFromName(name);
  return env.BOARD_DO.get(id);
}
__name(getBoardStub, "getBoardStub");
async function loadBoardState(env, chatId) {
  const stub = getBoardStub(env, `board_${chatId}`);
  const res = await stub.fetch("https://do.internal/do/get", {
    method: "POST",
    body: JSON.stringify({ chatId: String(chatId) })
  });
  if (!res.ok) return null;
  const parsed = await res.json();
  return parsed.data || null;
}
__name(loadBoardState, "loadBoardState");
async function saveBoardState(env, chatData, actorId, options = {}) {
  const cid = String(chatData.chat_id);
  const stub = getBoardStub(env, `board_${cid}`);
  const res = await stub.fetch("https://do.internal/do/save", {
    method: "POST",
    body: JSON.stringify({
      chatId: cid,
      chatData,
      actorId: String(actorId),
      recordVisit: Boolean(options.recordVisit),
      isOwnerSecurityAction: Boolean(options.isOwnerSecurityAction),
      requireEditAccess: options.requireEditAccess !== false,
      isJoiningWithInvite: Boolean(options.isJoiningWithInvite),
      inviteKey: options.inviteKey || "",
      blockUid: options.blockUid || null,
      unblockUid: options.unblockUid || null
    })
  });
  if (!res.ok) return false;
  const out = await res.json();
  return Boolean(out && out.ok && !out.revoked);
}
__name(saveBoardState, "saveBoardState");
// Bounded request controls and Telegram authentication primitives.
function checkBoundedRateLimit(store, maxKeys, key, maxReqs = 60, windowMs = 6e4) {
  const now = Date.now();
  const entry = store.get(key);
  if (entry) {
    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + windowMs;
      return true;
    }
    entry.count++;
    return entry.count <= maxReqs;
  }
  if (store.size >= maxKeys) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
    if (store.size >= maxKeys) {
      return false;
    }
  }
  store.set(key, { count: 1, resetAt: now + windowMs });
  return true;
}
__name(checkBoundedRateLimit, "checkBoundedRateLimit");
function hasConfiguredBotToken(env) {
  return Boolean(env && typeof env.BOT_TOKEN === "string" && env.BOT_TOKEN.trim().length >= 20);
}
__name(hasConfiguredBotToken, "hasConfiguredBotToken");
async function tgApi(method, payload, env) {
  if (!hasConfiguredBotToken(env)) return { ok: false };
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) {
    return { ok: false };
  }
}
__name(tgApi, "tgApi");
function genShortId() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 8);
}
__name(genShortId, "genShortId");
function genRandom128BitHex() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(genRandom128BitHex, "genRandom128BitHex");
async function hmacSha256Hex(secretSeed, message) {
  if (!secretSeed || typeof secretSeed !== "string" || secretSeed.trim().length < 20) {
    throw new Error("CRITICAL: Missing or invalid cryptographic secret seed.");
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretSeed),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex, "hmacSha256Hex");
async function getWebhookSecret(botToken) {
  return await hmacSha256Hex(botToken, "merkoo_webhook_secret_v1");
}
__name(getWebhookSecret, "getWebhookSecret");
function timingSafeEqualStr(a, b) {
  const strA = String(a || "");
  const strB = String(b || "");
  if (strA.length !== strB.length) return false;
  let diff = 0;
  for (let i = 0; i < strA.length; i++) {
    diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return diff === 0;
}
__name(timingSafeEqualStr, "timingSafeEqualStr");
function sanitizeNumber(val, min = 0, max = MAX_PRICE_VAL, fallback = 0) {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
__name(sanitizeNumber, "sanitizeNumber");
function sanitizeCount(val) {
  if (val === null || val === void 0 || typeof val === "string" && val.trim() === "") return null;
  return sanitizeNumber(val, 0.01, MAX_COUNT_VAL, null);
}
__name(sanitizeCount, "sanitizeCount");
async function createSessionToken(userObj, authDateSec, chatId, userEpoch, botToken) {
  const nowSec = Math.floor(Date.now() / 1e3);
  const baseAuthSec = sanitizeNumber(authDateSec, 1, nowSec + 60, nowSec);
  const exp = baseAuthSec + 7200;
  const payload = JSON.stringify({
    id: String(userObj.id),
    name: sanitizeText(userObj.first_name || userObj.username || "User", 60),
    cid: String(chatId),
    ep: String(userEpoch),
    iat: baseAuthSec,
    exp
  });
  const b64 = btoa(encodeURIComponent(payload));
  const sig = await hmacSha256Hex(botToken, `merkoo_sess_v3_${b64}`);
  return `${b64}.${sig}`;
}
__name(createSessionToken, "createSessionToken");
function getExpectedUserEpoch(chatData, userId) {
  const uid = String(userId);
  if (uid === String(chatData.chat_id)) {
    return String(chatData.auth_epoch || "");
  }
  if (Object.hasOwn(chatData.active_partners, uid) && chatData.active_partners[uid].auth_epoch) {
    return String(chatData.active_partners[uid].auth_epoch);
  }
  return "";
}
__name(getExpectedUserEpoch, "getExpectedUserEpoch");
async function verifySessionToken(token, expectedChatId, chatData, botToken) {
  try {
    if (!token || !botToken || token.length > 1024) return null;
    const parts = String(token).split(".");
    if (parts.length !== 2) return null;
    const [b64, sig] = parts;
    const expectedSig = await hmacSha256Hex(botToken, `merkoo_sess_v3_${b64}`);
    if (!timingSafeEqualStr(sig, expectedSig)) return null;
    const data = JSON.parse(decodeURIComponent(atob(b64)));
    const nowSec = Math.floor(Date.now() / 1e3);
    if (!data || !isValidTelegramId(data.id) || !data.exp || nowSec > Number(data.exp)) {
      return null;
    }
    if (String(data.cid) !== String(expectedChatId)) {
      return null;
    }
    const expectedEpoch = getExpectedUserEpoch(chatData, data.id);
    if (!expectedEpoch || !timingSafeEqualStr(String(data.ep), expectedEpoch)) {
      return null;
    }
    return {
      user: { id: String(data.id), first_name: sanitizeText(data.name || "User", 60) },
      authDate: sanitizeNumber(data.iat, 1, nowSec + 60, nowSec)
    };
  } catch (e) {
    return null;
  }
}
__name(verifySessionToken, "verifySessionToken");
async function verifyTelegramInitData(initData, botToken, maxAgeSec = 1800) {
  try {
    if (!initData || !botToken || botToken.trim().length < 20 || initData.length > 4096) return null;
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDateStr = params.get("auth_date");
    if (!hash || !authDateStr || !/^\d+$/.test(authDateStr)) return null;
    const authDate = Number(authDateStr);
    const nowSec = Math.floor(Date.now() / 1e3);
    if (!Number.isFinite(authDate) || authDate <= 0 || authDate > nowSec + 60 || nowSec - authDate > maxAgeSec) {
      return null;
    }
    params.delete("hash");
    const dataCheckString = [...params.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${k}=${v}`).join("\n");
    const enc = new TextEncoder();
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      enc.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretBuf = await crypto.subtle.sign("HMAC", hmacKey, enc.encode(botToken));
    const signKey = await crypto.subtle.importKey(
      "raw",
      secretBuf,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", signKey, enc.encode(dataCheckString));
    const hexSig = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (!timingSafeEqualStr(hexSig, hash)) return null;
    const userRaw = params.get("user");
    if (!userRaw) return null;
    const userObj = JSON.parse(userRaw);
    if (!userObj || !isValidTelegramId(userObj.id)) return null;
    return { user: userObj, authDate };
  } catch (e) {
    return null;
  }
}
__name(verifyTelegramInitData, "verifyTelegramInitData");
async function readBoundedJsonStream(request, maxBytes = MAX_BODY_BYTES) {
  try {
    const contentLen = Number(request.headers.get("content-length") || 0);
    if (contentLen > maxBytes) return null;
    if (!request.body) return null;
    const reader = request.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
    }
    if (totalBytes === 0) return null;
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const rawText = new TextDecoder("utf-8").decode(combined);
    const parsed = JSON.parse(rawText);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
}
__name(readBoundedJsonStream, "readBoundedJsonStream");
function isValidTelegramId(id) {
  return /^-?\d{1,16}$/.test(String(id || ""));
}
__name(isValidTelegramId, "isValidTelegramId");
function isSafeStringKey(str) {
  const s = String(str || "").trim();
  return Boolean(s) && !FORBIDDEN_KEYS.includes(s.toLowerCase());
}
__name(isSafeStringKey, "isSafeStringKey");
function sanitizeText(str, maxLen = 160) {
  return String(str || "").trim().slice(0, maxLen);
}
__name(sanitizeText, "sanitizeText");
function sanitizeIsoDate(str) {
  const s = String(str || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
__name(sanitizeIsoDate, "sanitizeIsoDate");
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}
__name(escapeHtml, "escapeHtml");
function isRTL(str) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(String(str || ""));
}
__name(isRTL, "isRTL");
function normalizeTitleKey(str) {
  return String(str || "").trim().toLowerCase().replace(/ي/g, "\u06CC").replace(/ك/g, "\u06A9").replace(/\s+/g, " ");
}
__name(normalizeTitleKey, "normalizeTitleKey");
var RLM = "\u200F";
var LRM = "\u200E";
var FULL_WIDTH_LINE = "\u200F" + "\u2800".repeat(28) + "\u200F";
var UNIT_LABELS = {
  fa: { pcs: "\u0639\u062F\u062F", kg: "\u06A9\u06CC\u0644\u0648", g: "\u06AF\u0631\u0645", pack: "\u0628\u0633\u062A\u0647", tray: "\u0634\u0627\u0646\u0647", bottle: "\u0628\u0637\u0631\u06CC", l: "\u0644\u06CC\u062A\u0631" },
  en: { pcs: "pcs", kg: "kg", g: "g", pack: "pack", tray: "tray", bottle: "bottle", l: "L" }
};
var I18N = {
  en: {
    boardHeader: "\u{1F6D2} <b>Shopping List (Live) \u2014 Merkoo</b>",
    emptyShop: "<i>Shopping list is currently empty \u2728</i>",
    emptyTasks: "<i>No pending tasks on your to-do list \u2728</i>",
    tabShop: "\u{1F6D2} SHOPPING LIST",
    tabTasks: "\u{1F4CB} TO-DO TASKS",
    openApp: "Open Merkoo",
    permDenied: "\u{1F512} Access is restricted by the board owner.",
    catRequiredErr: "\u26A0\uFE0F Please create and select a category (folder) first.",
    btnCheck: "\u{1F7E2} Mark Bought",
    btnUncheck: "\u{1F534} Mark Pending",
    btnDelete: "\u{1F5D1} Delete",
    btnClose: "\u{1F53C} Close"
  },
  fa: {
    boardHeader: `${RLM}<b>\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F (\u0632\u0646\u062F\u0647) \u2014 Merkoo \u{1F6D2}</b>`,
    emptyShop: `${RLM}<i>\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F \u0641\u0639\u0644\u0627\u064B \u062E\u0627\u0644\u06CC \u0627\u0633\u062A \u2728</i>`,
    emptyTasks: `${RLM}<i>\u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0647\u0627\u06CC \u0627\u0646\u062C\u0627\u0645\u06CC \u0641\u0639\u0644\u0627\u064B \u062E\u0627\u0644\u06CC \u0627\u0633\u062A \u2728</i>`,
    tabShop: "\u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F \u{1F6D2}",
    tabTasks: "\u06A9\u0627\u0631\u0647\u0627\u06CC \u0627\u0646\u062C\u0627\u0645\u06CC \u{1F4CB}",
    openApp: "Open Merkoo",
    permDenied: "\u{1F512} \u062F\u0633\u062A\u0631\u0633\u06CC \u0648\u06CC\u0631\u0627\u06CC\u0634 \u062A\u0648\u0633\u0637 \u0633\u0627\u0632\u0646\u062F\u0647 \u0644\u06CC\u0633\u062A \u0628\u0633\u062A\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A.",
    catRequiredErr: "\u26A0\uFE0F \u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u06CC\u06A9 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC (\u067E\u0648\u0634\u0647) \u0628\u0633\u0627\u0632\u06CC\u062F \u0648 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.",
    btnCheck: "\u{1F7E2} \u062E\u0631\u06CC\u062F \u0634\u062F",
    btnUncheck: "\u{1F534} \u0646\u0627\u062A\u0645\u0627\u0645",
    btnDelete: "\u{1F5D1} \u062D\u0630\u0641",
    btnClose: "\u{1F53C} \u0628\u0633\u062A\u0646"
  }
};
// Board schema normalization and list-domain helpers.
function normalizeChatData(chatData, chatId) {
  const cidStr = String(chatId);
  const def = {
    chat_id: cidStr,
    doc_rev: 1,
    invite_token: genRandom128BitHex(),
    auth_epoch: genRandom128BitHex(),
    inline_message_id: null,
    inline_message_ids: [],
    lang: "fa",
    currency: "IRT",
    defaults_version: 2,
    use_catalog: false,
    show_unit_badge: false,
    cat_sort: "count",
    item_sort_mode: "status",
    cat_updated_at: {},
    show_chat_buttons: false,
    chat_tab: "shop",
    active_partners: {},
    blocked_partners: [],
    partner_can_edit: false,
    selected_item: null,
    categories: [],
    catalog: [],
    items: [],
    tasks: [],
    history: [],
    analytics: { opens_total: 0, unique_visitors: [], last_visit_at: 0 }
  };
  if (!chatData || typeof chatData !== "object") return def;
  const defaultsVersion = sanitizeNumber(chatData.defaults_version, 0, 2, 0);
  if (defaultsVersion < 2) {
    chatData.defaults_version = 2;
    chatData.use_catalog = false;
    chatData.show_unit_badge = false;
    chatData.cat_sort = "count";
    chatData.partner_can_edit = false;
  }
  chatData.chat_id = String(chatData.chat_id || cidStr);
  chatData.doc_rev = sanitizeNumber(chatData.doc_rev, 1, 1e9, 1);
  if (!chatData.invite_token || typeof chatData.invite_token !== "string" || chatData.invite_token.length < 32) {
    chatData.invite_token = genRandom128BitHex();
  }
  if (!chatData.auth_epoch || typeof chatData.auth_epoch !== "string" || chatData.auth_epoch.length < 32) {
    chatData.auth_epoch = genRandom128BitHex();
  }
  if (!Array.isArray(chatData.inline_message_ids)) {
    chatData.inline_message_ids = [];
  } else {
    chatData.inline_message_ids = chatData.inline_message_ids.filter((id) => typeof id === "string" && id.length > 0 && id.length <= 128).slice(-40);
  }
  if (chatData.inline_message_id && typeof chatData.inline_message_id === "string" && !chatData.inline_message_ids.includes(chatData.inline_message_id)) {
    chatData.inline_message_ids.push(chatData.inline_message_id);
  }
  if (!["en", "fa"].includes(chatData.lang)) chatData.lang = "fa";
  if (!ALLOWED_CURRENCIES.includes(chatData.currency)) chatData.currency = "IRT";
  if (typeof chatData.use_catalog !== "boolean") chatData.use_catalog = false;
  if (typeof chatData.show_unit_badge !== "boolean") chatData.show_unit_badge = false;
  if (typeof chatData.partner_can_edit !== "boolean") chatData.partner_can_edit = false;
  if (!ALLOWED_SORTS.includes(chatData.cat_sort)) chatData.cat_sort = "count";
  if (!ALLOWED_ITEM_SORT_MODES.includes(chatData.item_sort_mode)) chatData.item_sort_mode = "status";
  if (typeof chatData.show_chat_buttons !== "boolean") chatData.show_chat_buttons = false;
  if (!["shop", "tasks"].includes(chatData.chat_tab)) chatData.chat_tab = "shop";
  const safePartners = {};
  if (chatData.active_partners && typeof chatData.active_partners === "object") {
    for (const [k, v] of Object.entries(chatData.active_partners)) {
      if (isValidTelegramId(k) && v && typeof v === "object") {
        safePartners[k] = {
          name: sanitizeText(v.name || "User", 60),
          can_edit: v.can_edit === true,
          auth_epoch: typeof v.auth_epoch === "string" && v.auth_epoch.length >= 32 ? v.auth_epoch : genRandom128BitHex()
        };
      }
    }
  }
  chatData.active_partners = safePartners;
  const savedAnalytics = chatData.analytics && typeof chatData.analytics === "object" ? chatData.analytics : {};
  chatData.analytics = {
    opens_total: sanitizeNumber(savedAnalytics.opens_total, 0, 1e12, 0),
    unique_visitors: [...new Set((Array.isArray(savedAnalytics.unique_visitors) ? savedAnalytics.unique_visitors : []).map(String).filter(isValidTelegramId))].slice(-2000),
    last_visit_at: sanitizeNumber(savedAnalytics.last_visit_at, 0, Date.now() + 864e5, 0)
  };
  if (!Array.isArray(chatData.blocked_partners)) {
    chatData.blocked_partners = [];
  } else {
    chatData.blocked_partners = [...new Set(chatData.blocked_partners.map(String).filter(isValidTelegramId))].slice(-100);
  }
  if (!Array.isArray(chatData.categories)) {
    chatData.categories = [];
  } else {
    chatData.categories = [...new Set(
      chatData.categories.map((c) => sanitizeText(c, 50)).filter(isSafeStringKey)
    )].slice(0, 50);
  }
  const safeCatUpdated = {};
  if (chatData.cat_updated_at && typeof chatData.cat_updated_at === "object") {
    for (const [k, v] of Object.entries(chatData.cat_updated_at)) {
      if (isSafeStringKey(k) && chatData.categories.includes(k)) {
        safeCatUpdated[k] = sanitizeNumber(v, 0, Date.now() + 864e5, 0);
      }
    }
  }
  chatData.cat_updated_at = safeCatUpdated;
  if (!Array.isArray(chatData.catalog)) chatData.catalog = [];
  chatData.catalog.forEach((c) => {
    if (!c.id) c.id = genShortId();
    c.price = sanitizeNumber(c.price, 0, MAX_PRICE_VAL, 0);
    c.unit = ALLOWED_UNITS.includes(c.unit) ? c.unit : "pcs";
  });
  if (!Array.isArray(chatData.items)) chatData.items = [];
  chatData.items.forEach((it) => {
    if (!it.id) it.id = genShortId();
    it.count = sanitizeCount(it.count);
    it.price = sanitizeNumber(it.price, 0, MAX_PRICE_VAL, 0);
    it.unit = ALLOWED_UNITS.includes(it.unit) ? it.unit : "pcs";
  });
  if (!Array.isArray(chatData.tasks)) chatData.tasks = [];
  chatData.tasks.forEach((tk) => {
    if (!tk.id) tk.id = genShortId();
  });
  if (!Array.isArray(chatData.history)) {
    chatData.history = [];
  } else {
    chatData.history = chatData.history.slice(0, 400).map((h) => ({
      id: h && h.id ? String(h.id) : genShortId(),
      ts: sanitizeNumber(h && h.ts, 0, Date.now() + 864e5, Date.now()),
      type: sanitizeText(h && h.type || "info", 20),
      listType: h && h.listType === "tasks" ? "tasks" : "shopping",
      title: sanitizeText(h && h.title || "", 160),
      category: sanitizeText(h && h.category || "", 50),
      count: sanitizeCount(h && h.count),
      qty: sanitizeText(h && h.qty || "", 160),
      unit: h && ALLOWED_UNITS.includes(h.unit) ? h.unit : "pcs",
      price: sanitizeNumber(h && h.price, 0, MAX_PRICE_VAL, 0),
      user: sanitizeText(h && h.user || "", 60),
      userId: /^\d{1,16}$/.test(String(h && h.userId || "")) ? String(h.userId) : ""
    }));
  }
  return chatData;
}
__name(normalizeChatData, "normalizeChatData");
function isUserBlocked(chatData, userId) {
  const uid = String(userId || "");
  if (!isValidTelegramId(uid)) return true;
  if (uid === String(chatData.chat_id)) return false;
  if (Array.isArray(chatData.blocked_partners) && chatData.blocked_partners.includes(uid)) {
    return true;
  }
  if (chatData._perm_blocked_map && chatData._perm_blocked_map[uid] === 1) {
    return true;
  }
  return false;
}
__name(isUserBlocked, "isUserBlocked");
function findEntryIndex(list, idOrIndex) {
  if (!Array.isArray(list)) return -1;
  const targetStr = String(idOrIndex ?? "");
  if (!targetStr) return -1;
  const byId = list.findIndex((x) => x && String(x.id) === targetStr);
  if (byId >= 0) return byId;
  if (/^\d+$/.test(targetStr)) {
    const idx = parseInt(targetStr, 10);
    if (idx >= 0 && idx < list.length) return idx;
  }
  return -1;
}
__name(findEntryIndex, "findEntryIndex");
function recordHistory(chatData, eventObj) {
  if (!Array.isArray(chatData.history)) chatData.history = [];
  chatData.history.unshift({
    id: genShortId(),
    ts: Date.now(),
    type: sanitizeText(eventObj.type || "info", 20),
    listType: eventObj.listType === "tasks" ? "tasks" : "shopping",
    title: sanitizeText(eventObj.title || "", 160),
    category: sanitizeText(eventObj.category || "", 50),
    count: sanitizeCount(eventObj.count),
    qty: sanitizeText(eventObj.qty || "", 160),
    unit: ALLOWED_UNITS.includes(eventObj.unit) ? eventObj.unit : "pcs",
    price: sanitizeNumber(eventObj.price, 0, MAX_PRICE_VAL, 0),
    user: sanitizeText(eventObj.user || "", 60),
    userId: /^\d{1,16}$/.test(String(eventObj.userId || "")) ? String(eventObj.userId) : ""
  });
  if (chatData.history.length > 400) {
    chatData.history = chatData.history.slice(0, 400);
  }
}
__name(recordHistory, "recordHistory");
function registerInlineMessageId(chatData, inlineMsgId) {
  if (!inlineMsgId || typeof inlineMsgId !== "string" || inlineMsgId.length > 128) return false;
  if (!Array.isArray(chatData.inline_message_ids)) {
    chatData.inline_message_ids = [];
  }
  let changed = false;
  if (chatData.inline_message_id !== inlineMsgId) {
    chatData.inline_message_id = inlineMsgId;
    changed = true;
  }
  if (!chatData.inline_message_ids.includes(inlineMsgId)) {
    chatData.inline_message_ids.push(inlineMsgId);
    if (chatData.inline_message_ids.length > 40) {
      chatData.inline_message_ids = chatData.inline_message_ids.slice(-40);
    }
    changed = true;
  }
  return changed;
}
__name(registerInlineMessageId, "registerInlineMessageId");
function getSortedCategoryList(chatData, itemCountsMap = {}) {
  const list = [...chatData.categories || []];
  const mode = chatData.cat_sort || "default";
  const updatedMap = chatData.cat_updated_at || {};
  if (mode === "name") {
    list.sort((a, b) => String(a).localeCompare(String(b), chatData.lang === "fa" ? "fa" : "en"));
  } else if (mode === "updated") {
    list.sort((a, b) => (Object.hasOwn(updatedMap, b) ? Number(updatedMap[b]) : 0) - (Object.hasOwn(updatedMap, a) ? Number(updatedMap[a]) : 0));
  } else if (mode === "count") {
    list.sort((a, b) => (Number(itemCountsMap[b]) || 0) - (Number(itemCountsMap[a]) || 0));
  }
  return list;
}
__name(getSortedCategoryList, "getSortedCategoryList");
function findCatalogMatch(catalog, title) {
  const key = normalizeTitleKey(title);
  if (!key) return null;
  return (catalog || []).find((c) => normalizeTitleKey(c.title) === key) || null;
}
__name(findCatalogMatch, "findCatalogMatch");
function hasEditAccess(chatData, userId) {
  if (!isValidTelegramId(userId)) return false;
  const uid = String(userId);
  const ownerId = String(chatData.chat_id);
  if (uid === ownerId) return true;
  if (isUserBlocked(chatData, uid)) return false;
  if (!Object.hasOwn(chatData.active_partners, uid)) {
    return false;
  }
  return chatData.active_partners[uid].can_edit === true;
}
__name(hasEditAccess, "hasEditAccess");
// Telegram message formatting and synchronization.
function appendItemWithActions(keyboard, entry, typePrefix, chatData, t) {
  const entryId = String(entry.id);
  const key = `${typePrefix}_${entryId}`;
  const isSelected = chatData.selected_item === key;
  const statusIcon = entry.done ? "\u{1F7E2}" : "\u{1F534}";
  const titleText = entry.done ? `~ ${entry.title} ~` : `${entry.title}`;
  keyboard.push([{
    text: `${statusIcon} ${titleText}`,
    callback_data: `sel_${typePrefix}_${chatData.chat_id}_${entryId}`
  }]);
  if (isSelected) {
    keyboard.push([
      { text: t.btnDelete, callback_data: `del_${typePrefix}_${chatData.chat_id}_${entryId}` },
      { text: entry.done ? t.btnUncheck : t.btnCheck, callback_data: `tog_${typePrefix}_${chatData.chat_id}_${entryId}` },
      { text: t.btnClose, callback_data: `unsel_${chatData.chat_id}` }
    ]);
  }
}
__name(appendItemWithActions, "appendItemWithActions");
function formatItemLine(entry, lang = "fa", isShop = true, showUnitBadge = true, chatData = null) {
  const icon = entry.done ? "\u{1F7E2}" : "\u{1F534}";
  const rtl = isRTL(entry.title);
  const mark = rtl ? RLM : LRM;
  const nameHtml = entry.done ? `<s>${escapeHtml(entry.title)}</s>` : `<b>${escapeHtml(entry.title)}</b>`;
  let unitHtml = "";
  if (isShop && showUnitBadge && entry.count !== null && entry.count !== void 0 && entry.count !== "") {
    const cnt = sanitizeCount(entry.count);
    let uKey = ALLOWED_UNITS.includes(entry.unit) ? entry.unit : "pcs";
    if (uKey === "pcs" && chatData && chatData.use_catalog) {
      const catMatch = findCatalogMatch(chatData.catalog, entry.title);
      if (catMatch && ALLOWED_UNITS.includes(catMatch.unit)) {
        uKey = catMatch.unit;
      }
    }
    const uLbl = (UNIT_LABELS[lang] || UNIT_LABELS.fa)[uKey] || uKey;
    unitHtml = ` <code>[${cnt} ${escapeHtml(uLbl)}]</code>`;
  }
  const noteHtml = entry.qty && entry.qty.trim() ? ` <code>(${escapeHtml(entry.qty.trim())})</code>` : "";
  return `${mark}${icon} ${nameHtml}${unitHtml}${noteHtml}`;
}
__name(formatItemLine, "formatItemLine");
async function renderTelegramMessage(chatData, env) {
  const lang = chatData.lang || "fa";
  const t = I18N[lang] || I18N.fa;
  const isFa = lang === "fa";
  const dir = isFa ? RLM : LRM;
  const items = chatData.items || [];
  const tasks = chatData.tasks || [];
  const shopDone = items.filter((i) => i.done).length;
  const taskDone = tasks.filter((i) => i.done).length;
  let html = `${t.boardHeader}
${dir}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  if (items.length > 0) {
    const grouped = /* @__PURE__ */ Object.create(null);
    const counts = /* @__PURE__ */ Object.create(null);
    items.forEach((item) => {
      const cat = item.category || chatData.categories[0] || "\u2014";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const orderedCats = getSortedCategoryList(chatData, counts);
    Object.keys(grouped).forEach((c) => {
      if (!orderedCats.includes(c)) orderedCats.push(c);
    });
    html += `
${dir}<b>${escapeHtml(t.tabShop)} (${shopDone}/${items.length})</b>
`;
    orderedCats.forEach((cat) => {
      if (!grouped[cat] || grouped[cat].length === 0) return;
      const catRtl = isRTL(cat);
      const catMark = catRtl ? RLM : LRM;
      let boxLines = [];
      boxLines.push(`${catMark}\u{1F4C2} <b>${escapeHtml(cat)} :</b>`);
      sortShoppingItems(grouped[cat], chatData).forEach((item) => {
        boxLines.push(formatItemLine(item, lang, true, chatData.show_unit_badge, chatData));
      });
      if (!isFa && catRtl) {
        boxLines.push(FULL_WIDTH_LINE);
      }
      html += isFa ? `${boxLines.join("\n")}\n\n` : `<blockquote>${boxLines.join("\n")}</blockquote>\n`;
    });
  }
  if (tasks.length > 0) {
    if (items.length > 0) {
      html += `${dir}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
    }
    html += `${dir}<b>${escapeHtml(t.tabTasks)} (${taskDone}/${tasks.length})</b>
`;
    let taskLines = [];
    sortShoppingItems(tasks, chatData).forEach((task) => {
      taskLines.push(formatItemLine(task, lang, false, false, chatData));
    });
    if (!isFa && tasks.some((x) => isRTL(x.title))) {
      taskLines.push(FULL_WIDTH_LINE);
    }
    html += isFa ? `${taskLines.join("\n")}\n` : `<blockquote>${taskLines.join("\n")}</blockquote>\n`;
  }
  if (items.length === 0 && tasks.length === 0) {
    let emptyLines = [t.emptyShop, t.emptyTasks];
    html += isFa ? `\n${emptyLines.join("\n")}\n` : `\n<blockquote>${emptyLines.join("\n")}</blockquote>\n`;
  }
  const keyboard = [];
  if (chatData.show_chat_buttons) {
    const activeTab = chatData.chat_tab || "shop";
    const effectiveTab = activeTab === "shop" && items.length === 0 && tasks.length > 0 ? "tasks" : activeTab === "tasks" && tasks.length === 0 && items.length > 0 ? "shop" : activeTab;
    const shopTabLabel = effectiveTab === "shop" ? `\u{1F7E2} ${t.tabShop} (${shopDone}/${items.length})` : `${t.tabShop} (${shopDone}/${items.length})`;
    const taskTabLabel = effectiveTab === "tasks" ? `\u{1F7E2} ${t.tabTasks} (${taskDone}/${tasks.length})` : `${t.tabTasks} (${taskDone}/${tasks.length})`;
    keyboard.push([
      { text: taskTabLabel, callback_data: `tab_tasks_${chatData.chat_id}` },
      { text: shopTabLabel, callback_data: `tab_shop_${chatData.chat_id}` }
    ]);
    if (effectiveTab === "shop" && items.length > 0) {
      const grouped = /* @__PURE__ */ Object.create(null);
      const counts = /* @__PURE__ */ Object.create(null);
      items.forEach((item) => {
        const cat = item.category || chatData.categories[0] || "\u2014";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
        counts[cat] = (counts[cat] || 0) + 1;
      });
      const orderedCats = getSortedCategoryList(chatData, counts);
      Object.keys(grouped).forEach((c) => {
        if (!orderedCats.includes(c)) orderedCats.push(c);
      });
      orderedCats.forEach((cat) => {
        if (!grouped[cat] || grouped[cat].length === 0) return;
        const catDoneCount = grouped[cat].filter((x) => x.done).length;
        const catTotalCount = grouped[cat].length;
        keyboard.push([{
          text: `\u{1F4C2} ${cat} (${catDoneCount}/${catTotalCount})`,
          callback_data: `noop_${chatData.chat_id}`
        }]);
        sortShoppingItems(grouped[cat], chatData).forEach((item) => {
          appendItemWithActions(keyboard, item, "s", chatData, t);
        });
      });
    } else if (effectiveTab === "tasks" && tasks.length > 0) {
      sortShoppingItems(tasks, chatData).forEach((task) => {
        appendItemWithActions(keyboard, task, "t", chatData, t);
      });
    }
  }
  const botUsername = env.BOT_USERNAME || "Merkoobot";
  const appShortName = env.APP_SHORT_NAME || "app";
  const inviteToken = chatData.invite_token;
  const miniAppUrl = `https://t.me/${botUsername}/${appShortName}?startapp=${chatData.chat_id}_${inviteToken}`;
  keyboard.push([{ text: t.openApp, url: miniAppUrl }]);
  return { text: html, reply_markup: { inline_keyboard: keyboard } };
}
// Preserve the user's manual order within each status group while keeping pending purchases first.
function sortShoppingItems(items, chatData) {
  const list = [...items];
  return chatData && chatData.item_sort_mode === "manual" ? list : list.sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)));
}
__name(renderTelegramMessage, "renderTelegramMessage");
async function syncPinnedMessage(chatData, env) {
  const ids = new Set(Array.isArray(chatData.inline_message_ids) ? chatData.inline_message_ids : []);
  if (chatData.inline_message_id) ids.add(chatData.inline_message_id);
  const allIds = [...ids].filter(Boolean);
  if (allIds.length === 0) return;
  const view = await renderTelegramMessage(chatData, env);
  const deadIds = [];
  await Promise.all(allIds.map(async (msgId) => {
    try {
      const res = await tgApi("editMessageText", {
        inline_message_id: msgId,
        text: view.text,
        parse_mode: "HTML",
        reply_markup: view.reply_markup
      }, env);
      if (res && res.ok === false && res.description) {
        const desc = String(res.description);
        if (desc.includes("MESSAGE_ID_INVALID") || desc.includes("message to edit not found")) {
          deadIds.push(msgId);
        }
      }
    } catch (e) {
    }
  }));
  if (deadIds.length > 0) {
    chatData.inline_message_ids = allIds.filter((id) => !deadIds.includes(id));
    chatData.inline_message_id = chatData.inline_message_ids[chatData.inline_message_ids.length - 1] || null;
    await saveBoardState(env, chatData, chatData.chat_id, { requireEditAccess: false });
  }
}
__name(syncPinnedMessage, "syncPinnedMessage");
var memorySyncedVersion = null;
async function autoMaintenanceIfNeeded(env) {
  try {
    if (!hasConfiguredBotToken(env) || !env.BOARD_DO) return;
    if (memorySyncedVersion === APP_VERSION) return;
    const sysStub = getBoardStub(env, "system_meta");
    const verRes = await sysStub.fetch("https://do.internal/do/sys-version-get", {
      method: "POST",
      body: JSON.stringify({})
    });
    if (verRes.ok) {
      const { version } = await verRes.json();
      if (version === APP_VERSION) {
        memorySyncedVersion = APP_VERSION;
        return;
      }
    }
    const secretToken = await getWebhookSecret(env.BOT_TOKEN);
    const hookRes = await tgApi("setWebhook", {
      url: `${TRUSTED_WEBHOOK_ORIGIN}/webhook`,
      secret_token: secretToken
    }, env);
    if (!hookRes || !hookRes.ok) {
      return;
    }
    await tgApi("setMyCommands", {
      commands: [
        { command: "start", description: "\u{1F680} Start / \u0633\u0627\u062E\u062A \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0644\u06CC\u0633\u062A" },
        { command: "lang", description: "\u{1F310} \u062A\u063A\u06CC\u06CC\u0631 \u0632\u0628\u0627\u0646 (\u0641\u0627\u0631\u0633\u06CC / English)" }
      ]
    }, env);
    await sysStub.fetch("https://do.internal/do/sys-version-set", {
      method: "POST",
      body: JSON.stringify({ version: APP_VERSION })
    });
    memorySyncedVersion = APP_VERSION;
  } catch (err) {
  }
}
__name(autoMaintenanceIfNeeded, "autoMaintenanceIfNeeded");
// Safe data shaping for the Mini App client.
function buildClientPayload(chatData, viewerId, sessionToken = null) {
  const isOwner = String(viewerId) === String(chatData.chat_id);
  const canEdit = hasEditAccess(chatData, viewerId);
  const safePartnersForOwner = {};
  if (isOwner) {
    for (const [k, v] of Object.entries(chatData.active_partners)) {
      safePartnersForOwner[k] = { name: v.name, can_edit: v.can_edit };
    }
  }
  const res = {
    chat_id: chatData.chat_id,
    lang: chatData.lang,
    currency: chatData.currency,
    use_catalog: chatData.use_catalog,
    show_unit_badge: chatData.show_unit_badge,
    partner_can_edit: chatData.partner_can_edit,
    cat_sort: chatData.cat_sort,
    item_sort_mode: chatData.item_sort_mode,
    cat_updated_at: chatData.cat_updated_at,
    show_chat_buttons: chatData.show_chat_buttons,
    viewer_can_edit: canEdit,
    active_partners: safePartnersForOwner,
    blocked_partners: isOwner ? chatData.blocked_partners : [],
    categories: chatData.categories,
    catalog: canEdit ? chatData.catalog : [],
    items: chatData.items,
    tasks: chatData.tasks,
    history: canEdit ? chatData.history.map(({ userId, ...event }) => event) : [],
  };
  if (sessionToken) {
    res.session_token = sessionToken;
  }
  return res;
}
__name(buildClientPayload, "buildClientPayload");
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    }
  });
}
__name(jsonResponse, "jsonResponse");

// Main HTTP routes for the Mini App, API, and Telegram webhook.
var worker_default = {
  async fetch(request, env, ctx) {
    if (!hasConfiguredBotToken(env)) {
      return jsonResponse({ error: "Service unavailable: BOT_TOKEN secret is not configured." }, 503);
    }
    if (!env.BOARD_DO) {
      return jsonResponse({ error: "Service unavailable: BOARD_DO Durable Object is not bound." }, 503);
    }
    const url = new URL(request.url);
    const botUsername = env.BOT_USERNAME || "Merkoobot";
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(autoMaintenanceIfNeeded(env));
    }
    if (url.pathname === "/app") {
      const cspNonce = genRandom128BitHex();
      const walletQrData = "https://api.qrserver.com/v1/create-qr-code/?size=243x243&format=png&ecc=H&qzone=4&data=" + encodeURIComponent(WALLET_ADDRESS);
      return new Response(getMiniAppHtml({ safeBotUser: escapeHtml(botUsername), safeNonce: escapeHtml(cspNonce), walletQrData, walletAddress: WALLET_ADDRESS, safeWalletAddress: escapeHtml(WALLET_ADDRESS), appVersion: APP_VERSION }), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": `default-src 'self' https://telegram.org https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; script-src 'self' 'nonce-${cspNonce}' https://telegram.org https://cdn.jsdelivr.net; img-src 'self' data: https://api.qrserver.com; connect-src 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org;`
        }
      });
    }
    if (url.pathname === "/api/list" && request.method === "POST") {
      const reqOrigin = request.headers.get("Origin");
      if (reqOrigin && reqOrigin !== url.origin && reqOrigin !== TRUSTED_WEBHOOK_ORIGIN) {
        return jsonResponse({ error: "Forbidden origin" }, 403);
      }
      const initHeader = request.headers.get("X-Telegram-Init-Data") || "";
      const sessHeader = request.headers.get("X-Merkoo-Session") || "";
      const initVerification = await verifyTelegramInitData(initHeader, env.BOT_TOKEN, 1800);
      if (!initVerification) {
        const clientIp = request.headers.get("CF-Connecting-IP") || "anon";
        if (!checkBoundedRateLimit(ipRateLimitMap, 8e3, `ip_${clientIp}`, 90, 6e4)) {
          return jsonResponse({ error: "Too many unauthenticated requests from this IP." }, 429);
        }
      }
      const body = await readBoundedJsonStream(request, MAX_BODY_BYTES);
      if (!body) {
        return jsonResponse({ error: "Invalid or oversized JSON payload" }, 400);
      }
      const chatId = String(body.chatId || "");
      if (!isValidTelegramId(chatId)) {
        return jsonResponse({ error: "Invalid chatId" }, 400);
      }
      if (!checkBoundedRateLimit(boardRateLimitMap, 1e4, `brd_${chatId}`, 120, 6e4)) {
        return jsonResponse({ error: "This board is receiving too many requests. Please wait a moment." }, 429);
      }
      const rawStored = await loadBoardState(env, chatId);
      const chatData = normalizeChatData(rawStored, chatId);
      let verifiedUser = initVerification ? initVerification.user : null;
      let authDateSec = initVerification ? initVerification.authDate : 0;
      let authenticatedViaFreshInitData = Boolean(initVerification);
      if (!verifiedUser && sessHeader && rawStored) {
        const sessResult = await verifySessionToken(sessHeader, chatId, chatData, env.BOT_TOKEN);
        if (sessResult) {
          verifiedUser = sessResult.user;
          authDateSec = sessResult.authDate;
        }
      }
      if (!verifiedUser) {
        return jsonResponse({ error: "Unauthorized: Session expired or revoked. Please reopen Merkoo from Telegram." }, 401);
      }
      const userId = String(verifiedUser.id);
      const userName = sanitizeText([verifiedUser.first_name, verifiedUser.last_name].filter(Boolean).join(" ") || verifiedUser.username || "User", 120);
      if (!checkBoundedRateLimit(userRateLimitMap, 1e4, `usr_${userId}`, 60, 6e4)) {
        return jsonResponse({ error: "Too many requests. Please wait a moment." }, 429);
      }
      const t = I18N[chatData.lang] || I18N.fa;
      if (!rawStored && userId !== chatId) {
        return jsonResponse({ error: t.permDenied }, 403);
      }
      let needsDoWrite = Boolean(rawStored && sanitizeNumber(rawStored.defaults_version, 0, 2, 0) < 2);
      let isJoiningWithInvite = false;
      let joiningInviteKey = "";
      if (userId === chatId) {
        const hadFullToken = Boolean(
          rawStored && rawStored.invite_token && String(rawStored.invite_token).length >= 32 && rawStored.auth_epoch && String(rawStored.auth_epoch).length >= 32
        );
        if (!hadFullToken) needsDoWrite = true;
      }
      if (userId !== chatId) {
        if (isUserBlocked(chatData, userId)) {
          return jsonResponse({ error: t.permDenied }, 403);
        }
        if (!Object.hasOwn(chatData.active_partners, userId)) {
          const providedInviteKey = String(body.inviteKey || "");
          if (!providedInviteKey || !timingSafeEqualStr(providedInviteKey, chatData.invite_token)) {
            return jsonResponse({ error: t.permDenied }, 403);
          }
          if (Object.keys(chatData.active_partners).length >= 100) {
            return jsonResponse({ error: t.permDenied }, 403);
          }
          chatData.active_partners[userId] = {
            name: userName,
            can_edit: false,
            auth_epoch: genRandom128BitHex()
          };
          isJoiningWithInvite = true;
          joiningInviteKey = providedInviteKey;
          needsDoWrite = true;
        } else if (userName && userName !== "User" && chatData.active_partners[userId].name !== userName) {
          chatData.active_partners[userId].name = userName;
          needsDoWrite = true;
        }
      }
      const currentUserEpoch = getExpectedUserEpoch(chatData, userId);
      const issuedSessionToken = authenticatedViaFreshInitData && !sessHeader && currentUserEpoch ? await createSessionToken(verifiedUser, authDateSec, chatId, currentUserEpoch, env.BOT_TOKEN) : null;
      if (body.action === "get") {
        needsDoWrite = true;
        if (needsDoWrite) {
          const saved = await saveBoardState(env, chatData, userId, {
            requireEditAccess: false,
            isJoiningWithInvite,
            inviteKey: joiningInviteKey,
            recordVisit: true
          });
          if (!saved && isJoiningWithInvite) {
            return jsonResponse({ error: t.permDenied }, 403);
          }
        }
        const analytics = chatData.analytics;
        analytics.opens_total = Math.min(1e12, analytics.opens_total + 1);
        if (!analytics.unique_visitors.includes(userId) && analytics.unique_visitors.length < 2000) {
          analytics.unique_visitors.push(userId);
        }
        analytics.last_visit_at = Date.now();
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (["set_partner_access", "remove_partner", "unblock_partner", "rotate_invite", "set_chat_buttons", "set_lang", "wipe_all", "clear_history"].includes(body.action)) {
        if (userId !== chatId) {
          return jsonResponse({ error: t.permDenied }, 403);
        }
        let blockUid = null;
        let unblockUid = null;
        if (body.action === "set_partner_access") {
          const targetUid = String(body.targetUid || "");
          if (isValidTelegramId(targetUid) && Object.hasOwn(chatData.active_partners, targetUid)) {
            chatData.active_partners[targetUid].can_edit = Boolean(body.allowed);
            chatData.active_partners[targetUid].auth_epoch = genRandom128BitHex();
          }
        } else if (body.action === "remove_partner") {
          const targetUid = String(body.targetUid || "");
          if (isValidTelegramId(targetUid)) {
            blockUid = targetUid;
            delete chatData.active_partners[targetUid];
            if (!chatData.blocked_partners.includes(targetUid)) {
              chatData.blocked_partners.push(targetUid);
              if (chatData.blocked_partners.length > 100) {
                chatData.blocked_partners = chatData.blocked_partners.slice(-100);
              }
            }
            chatData.invite_token = genRandom128BitHex();
          }
        } else if (body.action === "unblock_partner") {
          const targetUid = String(body.targetUid || "");
          if (isValidTelegramId(targetUid)) {
            unblockUid = targetUid;
            chatData.blocked_partners = chatData.blocked_partners.filter((id) => id !== targetUid);
          }
        } else if (body.action === "rotate_invite") {
          chatData.invite_token = genRandom128BitHex();
        } else if (body.action === "set_chat_buttons") {
          chatData.show_chat_buttons = Boolean(body.show);
          chatData.selected_item = null;
        } else if (body.action === "set_lang" && ["en", "fa"].includes(body.lang)) {
          chatData.lang = body.lang;
        } else if (body.action === "clear_history") {
          chatData.history = [];
        } else if (body.action === "wipe_all") {
          chatData.items = [];
          chatData.tasks = [];
          chatData.catalog = [];
          chatData.categories = [];
          chatData.history = [];
          chatData.cat_updated_at = {};
          chatData.selected_item = null;
        }
        await saveBoardState(env, chatData, userId, {
          isOwnerSecurityAction: true,
          blockUid,
          unblockUid
        });
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (!hasEditAccess(chatData, userId)) {
        return jsonResponse({ error: t.permDenied }, 403);
      }
      if (body.action === "set_currency" && ALLOWED_CURRENCIES.includes(body.currency)) {
        chatData.currency = body.currency;
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "set_use_catalog") {
        chatData.use_catalog = Boolean(body.use_catalog);
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "set_show_unit_badge") {
        chatData.show_unit_badge = Boolean(body.show_unit_badge);
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "set_cat_sort" && ALLOWED_SORTS.includes(body.cat_sort)) {
        chatData.cat_sort = body.cat_sort;
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "set_item_sort_mode" && ALLOWED_ITEM_SORT_MODES.includes(body.item_sort_mode)) {
        chatData.item_sort_mode = body.item_sort_mode;
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "reorder_items" && Array.isArray(body.item_ids)) {
        const targetKey = body.listType === "tasks" ? "tasks" : "items";
        const targetList = chatData[targetKey];
        const category = targetKey === "items" ? sanitizeText(body.category, 50) : "";
        const group = targetKey === "items" ? targetList.filter((item) => item.category === category) : [...targetList];
        const requested = [...new Set(body.item_ids.map((id) => String(id)).filter((id) => group.some((item) => item.id === id)))];
        group.forEach((item) => { if (!requested.includes(item.id)) requested.push(item.id); });
        const byId = new Map(group.map((item) => [item.id, item]));
        const orderedGroup = requested.map((id) => byId.get(id)).filter(Boolean);
        if (targetKey === "tasks") {
          chatData.tasks = orderedGroup;
        } else {
          let next = 0;
          chatData.items = targetList.map((item) => item.category === category ? orderedGroup[next++] : item);
        }
        chatData.item_sort_mode = "manual";
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "reorder_cats" && Array.isArray(body.categories)) {
        const existingSet = new Set(chatData.categories);
        const cleaned = body.categories.map((c) => sanitizeText(c, 50)).filter((c) => isSafeStringKey(c) && existingSet.has(c));
        const unique = [...new Set(cleaned)];
        chatData.categories.forEach((oldCat) => {
          if (!unique.includes(oldCat)) unique.push(oldCat);
        });
        if (unique.length > 0) {
          chatData.categories = unique.slice(0, 50);
          chatData.cat_sort = "default";
          const ok = await saveBoardState(env, chatData, userId);
          if (!ok) return jsonResponse({ error: t.permDenied }, 403);
          await syncPinnedMessage(chatData, env);
        }
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "rename_cat" && body.oldCategory && body.newCategory) {
        const oldCat = sanitizeText(body.oldCategory, 50);
        const newCat = sanitizeText(body.newCategory, 50);
        if (isSafeStringKey(oldCat) && isSafeStringKey(newCat) && oldCat !== newCat && chatData.categories.includes(oldCat)) {
          chatData.categories = chatData.categories.map((c) => c === oldCat ? newCat : c);
          chatData.categories = [...new Set(chatData.categories)];
          chatData.items.forEach((item) => {
            if (item.category === oldCat) item.category = newCat;
          });
          chatData.catalog.forEach((c) => {
            if (c.category === oldCat) c.category = newCat;
          });
          if (Object.hasOwn(chatData.cat_updated_at, oldCat)) {
            chatData.cat_updated_at[newCat] = Date.now();
            delete chatData.cat_updated_at[oldCat];
          }
          const ok = await saveBoardState(env, chatData, userId);
          if (!ok) return jsonResponse({ error: t.permDenied }, 403);
          await syncPinnedMessage(chatData, env);
        }
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "save_catalog" && body.title) {
        const cleanTitle = sanitizeText(body.title, 160);
        const price = sanitizeNumber(body.price, 0, MAX_PRICE_VAL, 0);
        const unit = ALLOWED_UNITS.includes(body.unit) ? body.unit : "pcs";
        const category = sanitizeText(body.category, 50);
        if (!isSafeStringKey(category) || !chatData.categories.includes(category)) {
          return jsonResponse({ error: t.catRequiredErr }, 400);
        }
        const key = normalizeTitleKey(cleanTitle);
        const existingIdx = chatData.catalog.findIndex((c) => normalizeTitleKey(c.title) === key);
        if (existingIdx >= 0) {
          chatData.catalog[existingIdx].title = cleanTitle;
          chatData.catalog[existingIdx].price = price;
          chatData.catalog[existingIdx].unit = unit;
          chatData.catalog[existingIdx].category = category;
        } else if (chatData.catalog.length < 500) {
          chatData.catalog.push({ id: genShortId(), title: cleanTitle, price, unit, category });
        }
        chatData.cat_updated_at[category] = Date.now();
        const ok = await saveBoardState(env, chatData, userId);
        if (!ok) return jsonResponse({ error: t.permDenied }, 403);
        await syncPinnedMessage(chatData, env);
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      if (body.action === "del_catalog") {
        const cIdx = findEntryIndex(chatData.catalog, body.catalogId ?? body.index);
        if (cIdx >= 0) {
          const removedCatItem = chatData.catalog.splice(cIdx, 1)[0];
          const removedKey = normalizeTitleKey(removedCatItem.title);
          chatData.items.forEach((item) => {
            if (normalizeTitleKey(item.title) === removedKey) {
              item.price = 0;
            }
          });
          const ok = await saveBoardState(env, chatData, userId);
          if (!ok) return jsonResponse({ error: t.permDenied }, 403);
          await syncPinnedMessage(chatData, env);
        }
        return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
      }
      const targetKey = body.listType === "tasks" ? "tasks" : "items";
      chatData.chat_tab = body.listType === "tasks" ? "tasks" : "shop";
      const idx = findEntryIndex(chatData[targetKey], body.itemId ?? body.index);
      const todayIso = sanitizeIsoDate(body.clientDate);
      if (body.action === "add" && body.title) {
        if (chatData[targetKey].length >= 500) {
          return jsonResponse({ error: "List limit reached (500 items)." }, 400);
        }
        const cleanTitle = sanitizeText(body.title, 160);
        let finalPrice = sanitizeNumber(body.price, 0, MAX_PRICE_VAL, 0);
        let finalUnit = ALLOWED_UNITS.includes(body.unit) ? body.unit : "pcs";
        let finalCat = sanitizeText(body.category, 50);
        if (targetKey === "items") {
          if (!chatData.categories.length || !isSafeStringKey(finalCat) || !chatData.categories.includes(finalCat)) {
            return jsonResponse({ error: t.catRequiredErr }, 400);
          }
          if (chatData.use_catalog) {
            const match = findCatalogMatch(chatData.catalog, cleanTitle);
            if (match) {
              if (!finalPrice) finalPrice = sanitizeNumber(match.price, 0, MAX_PRICE_VAL, 0);
              if ((!body.unit || body.unit === "pcs") && ALLOWED_UNITS.includes(match.unit)) finalUnit = match.unit;
            }
          }
          chatData.cat_updated_at[finalCat] = Date.now();
        }
        const newCount = sanitizeCount(body.count);
        chatData[targetKey].push({
          id: genShortId(),
          title: cleanTitle,
          qty: sanitizeText(body.qty || "", 160),
          count: newCount,
          unit: finalUnit,
          price: finalPrice,
          category: finalCat,
          done: false,
          bought_date: null
        });
        recordHistory(chatData, {
          type: "added",
          listType: body.listType,
          title: cleanTitle,
          category: finalCat,
          count: newCount,
          qty: body.qty || "",
          unit: finalUnit,
          price: finalPrice,
          user: userName,
          userId: userId
        });
      } else if (body.action === "edit" && idx >= 0) {
        const cleanTitle = sanitizeText(body.title, 160);
        const editedPrice = sanitizeNumber(body.price, 0, MAX_PRICE_VAL, 0);
        const editedUnit = ALLOWED_UNITS.includes(body.unit) ? body.unit : chatData[targetKey][idx].unit || "pcs";
        const editedCount = sanitizeCount(body.count);
        if (targetKey === "items") {
          const reqCat = sanitizeText(body.category, 50);
          if (!chatData.categories.length || !isSafeStringKey(reqCat) || !chatData.categories.includes(reqCat)) {
            return jsonResponse({ error: t.catRequiredErr }, 400);
          }
          chatData[targetKey][idx].category = reqCat;
          chatData.cat_updated_at[reqCat] = Date.now();
        }
        chatData[targetKey][idx].title = cleanTitle;
        chatData[targetKey][idx].qty = sanitizeText(body.qty || "", 160);
        chatData[targetKey][idx].count = editedCount;
        chatData[targetKey][idx].unit = editedUnit;
        chatData[targetKey][idx].price = editedPrice;
        if (targetKey === "items") {
          const key = normalizeTitleKey(cleanTitle);
          const cIdx = chatData.catalog.findIndex((c) => normalizeTitleKey(c.title) === key);
          if (body.clearCatalog || editedPrice === 0) {
            if (cIdx >= 0) {
              chatData.catalog.splice(cIdx, 1);
            }
          } else if (chatData.use_catalog && editedPrice > 0) {
            if (cIdx >= 0) {
              chatData.catalog[cIdx].price = editedPrice;
              chatData.catalog[cIdx].unit = editedUnit;
            } else if (chatData.catalog.length < 500) {
              chatData.catalog.push({
                id: genShortId(),
                title: cleanTitle,
                price: editedPrice,
                unit: editedUnit,
                category: chatData[targetKey][idx].category
              });
            }
          }
        }
        recordHistory(chatData, {
          type: "edited",
          listType: body.listType,
          title: cleanTitle,
          category: chatData[targetKey][idx].category || "",
          count: editedCount,
          qty: body.qty || "",
          unit: editedUnit,
          price: editedPrice,
          user: userName,
          userId: userId
        });
      } else if (body.action === "toggle" && idx >= 0) {
        const item = chatData[targetKey][idx];
        item.done = !item.done;
        item.bought_date = item.done ? todayIso : null;
        if (targetKey === "items" && item.category && chatData.categories.includes(item.category)) {
          chatData.cat_updated_at[item.category] = Date.now();
        }
        recordHistory(chatData, {
          type: targetKey === "tasks" ? (item.done ? "completed" : "reopened") : (item.done ? "bought" : "unbought"),
          listType: body.listType,
          title: item.title,
          category: item.category || "",
          count: item.count,
          qty: item.qty || "",
          unit: item.unit || "pcs",
          price: item.price || 0,
          user: userName,
          userId: userId
        });
      } else if (body.action === "delete" && idx >= 0) {
        const removed = chatData[targetKey].splice(idx, 1)[0];
        chatData.selected_item = null;
        recordHistory(chatData, {
          type: "deleted",
          listType: body.listType,
          title: removed.title,
          category: removed.category || "",
          count: removed.count,
          qty: removed.qty || "",
          unit: removed.unit || "pcs",
          price: removed.price || 0,
          user: userName,
          userId: userId
        });
      } else if (body.action === "add_cat" && body.category) {
        const cleanCat = sanitizeText(body.category, 50);
        if (isSafeStringKey(cleanCat) && !chatData.categories.includes(cleanCat) && chatData.categories.length < 50) {
          chatData.categories.push(cleanCat);
          chatData.cat_updated_at[cleanCat] = Date.now();
          recordHistory(chatData, { type: "category_added", title: cleanCat, category: cleanCat, user: userName, userId });
        }
      } else if (body.action === "del_cat" && body.category) {
        const delCat = sanitizeText(body.category, 50);
        chatData.categories = chatData.categories.filter((c) => c !== delCat);
        recordHistory(chatData, { type: "category_deleted", title: delCat, category: delCat, user: userName, userId });
        if (Object.hasOwn(chatData.cat_updated_at, delCat)) {
          delete chatData.cat_updated_at[delCat];
        }
      }
      const saved = await saveBoardState(env, chatData, userId);
      if (!saved) {
        return jsonResponse({ error: t.permDenied }, 403);
      }
      await syncPinnedMessage(chatData, env);
      return jsonResponse(buildClientPayload(chatData, userId, issuedSessionToken));
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      const expectedSecret = await getWebhookSecret(env.BOT_TOKEN);
      const incomingSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
      if (!incomingSecret || !timingSafeEqualStr(incomingSecret, expectedSecret)) {
        return new Response("Forbidden", { status: 403 });
      }
      const update = await readBoundedJsonStream(request, MAX_BODY_BYTES);
      if (!update) {
        return new Response("Bad Request", { status: 400 });
      }
      if (update.inline_query) {
        const q = update.inline_query;
        const chatId = String(q.from.id);
        if (!isValidTelegramId(chatId)) return new Response("OK");
        const rawStored = await loadBoardState(env, chatId);
        const hadFullToken = Boolean(
          rawStored && rawStored.invite_token && String(rawStored.invite_token).length >= 32 && rawStored.auth_epoch && String(rawStored.auth_epoch).length >= 32
        );
        let chatData = normalizeChatData(rawStored, chatId);
        if (!hadFullToken) {
          await saveBoardState(env, chatData, chatId, { requireEditAccess: false });
        }
        const view = await renderTelegramMessage(chatData, env);
        const title = chatData.lang === "fa" ? "\u{1F6D2} \u0627\u0631\u0633\u0627\u0644 \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F (\u0632\u0646\u062F\u0647) \u2014 Merkoo" : "\u{1F6D2} Send Merkoo Shopping List (Live)";
        const desc = chatData.lang === "fa" ? "\u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u0648 \u067E\u06CC\u0646 \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0633\u062A \u062F\u0631 \u0627\u06CC\u0646 \u0686\u062A \u06A9\u0644\u06CC\u06A9 \u06A9\u0646\u06CC\u062F" : "Tap to send your interactive board and pin it here";
        await tgApi("answerInlineQuery", {
          inline_query_id: q.id,
          results: [{
            type: "article",
            id: `merkoo_${chatId}_${Date.now()}`,
            title,
            description: desc,
            input_message_content: { message_text: view.text, parse_mode: "HTML" },
            reply_markup: view.reply_markup
          }],
          cache_time: 1
        }, env);
        return new Response("OK");
      }
      if (update.chosen_inline_result) {
        const cir = update.chosen_inline_result;
        if (cir.inline_message_id && cir.from && isValidTelegramId(cir.from.id)) {
          const chatId = String(cir.from.id);
          let chatData = normalizeChatData(await loadBoardState(env, chatId), chatId);
          registerInlineMessageId(chatData, cir.inline_message_id);
          await saveBoardState(env, chatData, chatId, { requireEditAccess: false });
        }
        return new Response("OK");
      }
      if (update.callback_query) {
        const cb = update.callback_query;
        const clickerId = String(cb.from.id);
        if (!isValidTelegramId(clickerId)) return new Response("OK");
        const clickerName = sanitizeText(cb.from.first_name || cb.from.username || "Partner", 60);
        if (cb.data === "botlang_fa" || cb.data === "botlang_en") {
          const newLang = cb.data === "botlang_fa" ? "fa" : "en";
          let chatData2 = normalizeChatData(await loadBoardState(env, clickerId), clickerId);
          chatData2.lang = newLang;
          await saveBoardState(env, chatData2, clickerId);
          await syncPinnedMessage(chatData2, env);
          await tgApi("answerCallbackQuery", {
            callback_query_id: cb.id,
            text: newLang === "fa" ? "\u2705 \u0632\u0628\u0627\u0646 \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F" : "\u2705 Language switched to English"
          }, env);
          return new Response("OK");
        }
        const parts = String(cb.data || "").split("_");
        const actionType = parts[0];
        if (actionType === "noop") {
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id }, env);
          return new Response("OK");
        }
        if (actionType === "tab") {
          const targetTab = parts[1];
          const chatId2 = parts[2];
          if (!isValidTelegramId(chatId2)) return new Response("OK");
          const rawStored2 = await loadBoardState(env, chatId2);
          if (!rawStored2) return new Response("OK");
          let chatData2 = normalizeChatData(rawStored2, chatId2);
          if (isUserBlocked(chatData2, clickerId) || !hasEditAccess(chatData2, clickerId)) {
            const t2 = I18N[chatData2.lang] || I18N.fa;
            await tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: t2.permDenied, show_alert: true }, env);
            return new Response("OK");
          }
          if (cb.inline_message_id && clickerId === chatId2) {
            registerInlineMessageId(chatData2, cb.inline_message_id);
          }
          chatData2.chat_tab = targetTab === "tasks" ? "tasks" : "shop";
          chatData2.selected_item = null;
          await saveBoardState(env, chatData2, clickerId);
          await syncPinnedMessage(chatData2, env);
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id }, env);
          return new Response("OK");
        }
        if (actionType === "unsel") {
          const chatId2 = parts[1];
          if (!isValidTelegramId(chatId2)) return new Response("OK");
          const rawStored2 = await loadBoardState(env, chatId2);
          if (!rawStored2) return new Response("OK");
          let chatData2 = normalizeChatData(rawStored2, chatId2);
          if (isUserBlocked(chatData2, clickerId) || !hasEditAccess(chatData2, clickerId)) return new Response("OK");
          if (cb.inline_message_id && clickerId === chatId2) {
            registerInlineMessageId(chatData2, cb.inline_message_id);
          }
          chatData2.selected_item = null;
          await saveBoardState(env, chatData2, clickerId);
          await syncPinnedMessage(chatData2, env);
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id }, env);
          return new Response("OK");
        }
        const listPrefix = parts[1];
        const chatId = parts[2];
        const itemToken = parts[3];
        if (!isValidTelegramId(chatId) || !itemToken) return new Response("OK");
        const targetKey = listPrefix === "t" ? "tasks" : "items";
        const rawStored = await loadBoardState(env, chatId);
        if (!rawStored) return new Response("OK");
        let chatData = normalizeChatData(rawStored, chatId);
        const t = I18N[chatData.lang] || I18N.fa;
        if (isUserBlocked(chatData, clickerId) || !hasEditAccess(chatData, clickerId)) {
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: t.permDenied, show_alert: true }, env);
          return new Response("OK");
        }
        if (cb.inline_message_id && clickerId === chatId) {
          registerInlineMessageId(chatData, cb.inline_message_id);
        }
        const targetList = chatData[targetKey];
        const idx = findEntryIndex(targetList, itemToken);
        const entry = idx >= 0 ? targetList[idx] : null;
        if (!entry) {
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id }, env);
          return new Response("OK");
        }
        if (actionType === "sel") {
          const itemKey = `${listPrefix}_${entry.id}`;
          chatData.selected_item = chatData.selected_item === itemKey ? null : itemKey;
          await saveBoardState(env, chatData, clickerId);
          await syncPinnedMessage(chatData, env);
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id }, env);
          return new Response("OK");
        }
        if (actionType === "tog") {
          entry.done = !entry.done;
          entry.bought_date = entry.done ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null;
          if (listPrefix === "s" && entry.category && chatData.categories.includes(entry.category)) {
            chatData.cat_updated_at[entry.category] = Date.now();
          }
          recordHistory(chatData, {
            type: listPrefix === "t" ? (entry.done ? "completed" : "reopened") : (entry.done ? "bought" : "unbought"),
            listType: listPrefix === "t" ? "tasks" : "shopping",
            title: entry.title,
            category: entry.category || "",
            count: entry.count,
            qty: entry.qty || "",
            unit: entry.unit || "pcs",
            price: entry.price || 0,
            user: clickerName,
            userId: clickerId
          });
          chatData.selected_item = null;
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: entry.title }, env);
        } else if (actionType === "del") {
          const removed = targetList.splice(idx, 1)[0];
          recordHistory(chatData, {
            type: "deleted",
            listType: listPrefix === "t" ? "tasks" : "shopping",
            title: removed.title,
            category: removed.category || "",
            count: removed.count,
            qty: removed.qty || "",
            unit: removed.unit || "pcs",
            price: removed.price || 0,
            user: clickerName,
            userId: clickerId
          });
          chatData.selected_item = null;
          await tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: `\u{1F5D1} ${removed.title}` }, env);
        }
        await saveBoardState(env, chatData, clickerId);
        await syncPinnedMessage(chatData, env);
        return new Response("OK");
      }
      if (update.message) {
        const msg = update.message;
        const chatId = String(msg.chat.id);
        const senderId = String(msg.from && msg.from.id || chatId);
        if (!isValidTelegramId(chatId) || !isValidTelegramId(senderId)) return new Response("OK");
        const senderName = sanitizeText(msg.from && (msg.from.first_name || msg.from.username) || "Owner", 60);
        const text = (msg.text || "").trim();
        if (!text) return new Response("OK");
        const appShortName = env.APP_SHORT_NAME || "app";
        const rawStored = await loadBoardState(env, chatId);
        if (!rawStored && senderId !== chatId) {
          return new Response("OK");
        }
        const hadFullToken = Boolean(
          rawStored && rawStored.invite_token && String(rawStored.invite_token).length >= 32 && rawStored.auth_epoch && String(rawStored.auth_epoch).length >= 32
        );
        let chatData = normalizeChatData(rawStored, chatId);
        if (!hadFullToken && senderId === chatId) {
          await saveBoardState(env, chatData, senderId, { requireEditAccess: false });
        }
        if (isUserBlocked(chatData, senderId) || !hasEditAccess(chatData, senderId)) {
          return new Response("OK");
        }
        const t = I18N[chatData.lang] || I18N.fa;
        if (text.startsWith("/lang")) {
          if (senderId !== chatId) return new Response("OK");
          chatData.lang = chatData.lang === "fa" ? "en" : "fa";
          await saveBoardState(env, chatData, senderId);
          await syncPinnedMessage(chatData, env);
        }
        if (text.startsWith("/start") || text.startsWith("/lang")) {
          if (senderId !== chatId) return new Response("OK");
          const welcomeText = `\u{1F44B} *\u0628\u0647 Merkoo \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F!* | *Welcome to Merkoo!*

\u{1F1EE}\u{1F1F7} *\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0633\u0627\u062E\u062A \u0648 \u067E\u06CC\u0646 \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0633\u062A \u062E\u0631\u06CC\u062F (\u0632\u0646\u062F\u0647):*
\u06F1. \u0631\u0648\u06CC \u062F\u06A9\u0645\u0647 *\u{1F4CC} \u0627\u0631\u0633\u0627\u0644 \u0644\u06CC\u0633\u062A \u0628\u0647 \u0686\u062A* \u0628\u0632\u0646\u06CC\u062F \u0648 \u0686\u062A \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.
\u06F2. \u067E\u06CC\u0627\u0645 \u0627\u0631\u0633\u0627\u0644\u200C\u0634\u062F\u0647 \u0631\u0627 \u062F\u0631 \u0622\u0646 \u0686\u062A *\u067E\u06CC\u0646 (Pin)* \u06A9\u0646\u06CC\u062F.
\u06F3. \u0631\u0648\u06CC *Open Merkoo* \u0628\u0632\u0646\u06CC\u062F \u062A\u0627 \u0628\u0627\u0646\u06A9 \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u060C \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0648 \u06A9\u0627\u0631\u0647\u0627\u06CC \u0627\u0646\u062C\u0627\u0645\u06CC \u0631\u0627 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0646\u06CC\u062F!

\u{1F1EC}\u{1F1E7} *How to create & pin your shared list:*
1\uFE0F\u20E3 Tap *\u{1F4CC} Share Board to a Chat* and choose your chat.
2\uFE0F\u20E3 *Pin* the sent message in that chat.
3\uFE0F\u20E3 Tap *Open Merkoo* to manage your Price DB, shopping items, and tasks!`;
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "Open Merkoo", url: `https://t.me/${botUsername}/${appShortName}?startapp=${chatId}_${chatData.invite_token}` }],
                [{ text: "\u{1F4CC} \u0627\u0631\u0633\u0627\u0644 \u0644\u06CC\u0633\u062A \u0628\u0647 \u0686\u062A / Share Board to a Chat", switch_inline_query: "list" }],
                [
                  { text: "\u{1F1EE}\u{1F1F7} \u0641\u0627\u0631\u0633\u06CC", callback_data: "botlang_fa" },
                  { text: "\u{1F1EC}\u{1F1E7} English", callback_data: "botlang_en" }
                ]
              ]
            }
          }, env);
          return new Response("OK");
        }
        const lines = text.split("\n").map((s) => sanitizeText(s, 160)).filter(Boolean).slice(0, 30);
        let needsCategoryWarning = false;
        lines.forEach((line) => {
          if (line.startsWith("!") || /^task:/i.test(line)) {
            const cleanTask = sanitizeText(line.replace(/^(!|task:\s*)/i, ""), 160);
            if (cleanTask && chatData.tasks.length < 500) {
              chatData.tasks.push({ id: genShortId(), title: cleanTask, qty: "", done: false, bought_date: null });
              recordHistory(chatData, {
                type: "added",
                listType: "tasks",
                title: cleanTask,
                user: senderName,
                userId: senderId
              });
            }
          } else if (chatData.items.length < 500) {
            const match = chatData.use_catalog ? findCatalogMatch(chatData.catalog, line) : null;
            const cat = match && match.category && chatData.categories.includes(match.category) ? match.category : chatData.categories[0] || "";
            if (!cat) {
              needsCategoryWarning = true;
              return;
            }
            const itemPrice = match ? sanitizeNumber(match.price, 0, MAX_PRICE_VAL, 0) : 0;
            const itemUnit = match && ALLOWED_UNITS.includes(match.unit) ? match.unit : "pcs";
            chatData.cat_updated_at[cat] = Date.now();
            chatData.items.push({
              id: genShortId(),
              title: line,
              qty: "",
              count: 1,
              unit: itemUnit,
              price: itemPrice,
              category: cat,
              done: false,
              bought_date: null
            });
            recordHistory(chatData, {
              type: "added",
              listType: "shopping",
              title: line,
              category: cat,
              count: 1,
              unit: itemUnit,
              price: itemPrice,
              user: senderName,
              userId: senderId
            });
          }
        });
        if (needsCategoryWarning) {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: t.catRequiredErr
          }, env);
          return new Response("OK");
        }
        await saveBoardState(env, chatData, senderId);
        await syncPinnedMessage(chatData, env);
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: chatData.lang === "fa" ? "\u2705 \u0628\u0647 \u0644\u06CC\u0633\u062A \u0627\u0636\u0627\u0641\u0647 \u0634\u062F!" : "\u2705 Added to your board!"
        }, env);
        return new Response("OK");
      }
      return new Response("OK");
    }
    return new Response(`Merkoo SaaS Bot & Mini App (${APP_VERSION} \u2014 Pure Durable Object Engine) is active! \u{1F680}`);
  }
};
export {
  MerkooBoardDO,
  worker_default as default
};

# Merkoo — Telegram Shopping List Bot & Mini App

> **فارسی:** [README.fa.md](README.fa.md)

**Merkoo** is a Telegram bot and Mini App for shared shopping lists, to-do tasks, and a personal price bank. It runs on Cloudflare Workers with Durable Objects (SQLite) storage — no external database, no runtime dependencies. Bilingual out of the box: **English and Persian (فارسی)**.

🤖 **Live bot:** [@MerkooBot](https://t.me/MerkooBot)

## Features

- **Live shared board** — build a shopping list in the Mini App, send it into any chat with inline mode, and pin it. The pinned message stays in sync in real time as items are added, bought, edited, or removed.
- **Shopping + tasks in one board** — two list types (shopping items and to-do tasks), organized by categories (folders), with counts, units, quantities, and prices.
- **Price bank (catalog)** — save the price of products once and reuse them automatically whenever the same item is added again.
- **Partners & permissions** — share a board through an invite link. The owner decides who can edit, can remove or block partners, and can rotate the invite token at any time. Every change is kept in a visible history.
- **Quick add from chat** — send plain lines in the bot chat to add items; start a line with `!` or `task:` to add a task instead.
- **Donations** — the Mini App shows a TON wallet QR code for voluntary support.

## Security

- Telegram `initData` verified with HMAC per Telegram's specification (timing-safe comparison, 30-minute freshness window).
- Signed session tokens bound to the chat and to a per-user epoch, so access can be revoked instantly.
- Webhook protected by a secret token derived from the bot token.
- The Durable Object re-checks owner / partner / invite / edit rights on every save — the API layer is never trusted alone.
- Bounded rate limits per IP, per user, and per board; bounded request size and list sizes.
- Strict Content-Security-Policy with per-request nonces; all rendered output is escaped.
- **No secrets in this repository** — the bot token exists only as a Cloudflare secret.

## Architecture

| File | Role |
| --- | --- |
| `worker.js` | Main Worker: Telegram webhook, Mini App API, and the `MerkooBoardDO` Durable Object class (one board per chat, plus a `system_meta` instance). |
| `miniapp.js` | The self-contained Mini App document (HTML/CSS/JS), served by the main Worker at `/app`. |
| `wrangler.toml` | Main Worker configuration (vars + Durable Object binding). |

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) and register a Mini App short name for it (the default in the code is `app` — the `APP_SHORT_NAME` var).
2. Deploy the main Worker and set the bot token:

   ```bash
   npx wrangler deploy
   npx wrangler secret put BOT_TOKEN
   ```

   Set `BOT_USERNAME` in `wrangler.toml` to your bot's username. The webhook URL and bot commands are configured automatically on the first request.

## License

MIT

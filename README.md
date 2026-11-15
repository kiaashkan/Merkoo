# Merkoo — Telegram Shopping List Bot & Mini App

**Merkoo** is a Telegram bot and Mini App for shared shopping lists, to-do tasks, and a personal price bank — built on Cloudflare Workers with Durable Objects (SQLite) storage. Bilingual out of the box: **Persian (فارسی) and English**.

🤖 Bot: [@MerkooBot](https://t.me/MerkooBot)

## Features

- **Live shared board** — create a shopping list in the Mini App, send it to any chat with inline mode, and pin it. The pinned message stays in sync in real time as items are added, bought, or removed.
- **Shopping lists + to-do tasks** in one board, organized by categories (folders), with counts, units, quantities, and prices.
- **Price bank (catalog)** — remember prices per product and reuse them automatically when adding items.
- **Partners** — share a board with an invite link; the owner controls who can edit, can remove/block partners, and can rotate the invite token. Every change is recorded in a visible history.
- **Quick add from chat** — send plain lines in the bot chat to add items; prefix with `!` or `task:` to add a task.
- **Separate admin panel** — a second, independent Worker (`merkoo-admin`) with its own login shows app-wide stats, users, and board activity in read-only mode.
- **Security first** — Telegram `initData` HMAC verification, signed session tokens with per-user revocation epochs, webhook secret token, bounded rate limits on IP / user / board, strict CSP, and full output escaping. No secrets in the codebase: the bot token and admin credentials are Cloudflare secrets only.

## Architecture

| Part | What it does |
| --- | --- |
| `worker.js` | Main Worker: Telegram webhook, Mini App API, and the `MerkooBoardDO` Durable Object class (one board per chat, plus `system_meta` and `app_analytics` instances). |
| `miniapp.js` | The self-contained Mini App document (HTML/CSS/JS) served by the main Worker at `/app`. |
| `merkoo-admin/` | Independent admin-panel Worker. It reads the main Worker's Durable Objects through an external binding — it never writes board data. See its own `README.fa.md`. |

State lives entirely in Durable Object storage; there is no external database and there are no runtime npm dependencies.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) and register a Mini App short name (the code expects `app` by default — `APP_SHORT_NAME`).
2. Deploy the main Worker:

   ```bash
   npx wrangler deploy
   npx wrangler secret put BOT_TOKEN
   ```

   Set `BOT_USERNAME` in `wrangler.toml` to your bot's username. The webhook and bot commands are configured automatically on the first request.
3. (Optional) Deploy the admin panel from `merkoo-admin/` and set its `ADMIN_USERNAME` / `ADMIN_PASSWORD` secrets — see `merkoo-admin/README.fa.md`.

## فارسی

مرکو (Merkoo) یک بات تلگرام و مینی‌اپ برای لیست خرید اشتراکی، کارهای انجامی و بانک قیمت است که روی Cloudflare Workers اجرا می‌شود. لیست را در مینی‌اپ بسازید، به هر چتی بفرستید و پین کنید؛ پیام پین‌شده زنده و هم‌گام با لیست به‌روز می‌شود. امکان اشتراک‌گذاری لیست با لینک دعوت و کنترل دسترسی همکاران، بانک قیمت محصولات، و یک پنل مدیریت جداگانه و فقط‌خواندنی هم دارد.

## License

MIT

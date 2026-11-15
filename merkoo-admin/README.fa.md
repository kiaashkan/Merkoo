# Worker مستقل پنل مدیریت Merkoo

این Worker فقط صفحه و API پنل مدیریت را ارائه می‌کند. داده‌ها را به‌صورت فقط‌خواندنی از Durable Object متعلق به Worker اصلی `merkoo` می‌خواند.

## راه‌اندازی

1. در داشبورد Cloudflare یک Worker با نام `merkoo-admin` بساز.
2. در بخش Settings → Variables and Secrets همین Worker، دو Secret با نام‌های `ADMIN_USERNAME` و `ADMIN_PASSWORD` تعریف کن. نام کاربری حداقل ۳ حرف و رمز حداقل ۱۶ نویسه باشد. این دو Secret باید روی Worker جدید هم جداگانه تعریف شوند.
3. از پوشه این پروژه اجرا کن: `npx wrangler deploy`.
4. پنل از `https://merkoo-admin.kiaashkan.workers.dev/admin` در دسترس می‌شود.

`BOARD_DO` یک binding خارجی به کلاس موجود `MerkooBoardDO` در Worker `merkoo` است؛ این تنظیم namespace یا داده جدید نمی‌سازد و migration جدیدی ندارد.

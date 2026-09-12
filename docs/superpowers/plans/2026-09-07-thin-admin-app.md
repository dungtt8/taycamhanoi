# Thin Admin App (Plan B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution note — this plan creates a brand-new git repository**, not a
> branch in the existing `taycamhanoi` repo. The normal "isolated worktree
> off the current repo" setup does not apply: Task 1 itself runs `git init`
> at the new project path. Whoever executes this plan should skip the
> worktree-creation step and just work directly in the new directory (there
> is no existing branch state to protect).

**Goal:** Build the thin-admin Next.js app — a separate project that lets
non-technical staff manage orders, products, a small dashboard, and one
site setting, by calling the WooCommerce/WordPress REST API directly with
a WordPress Application Password, without touching wp-admin.

**Architecture:** New, independent Next.js App Router project at
`/Users/dung_tt/Desktop/Freelances/tamvd/taycamhanoi-admin` (sibling to the
`taycamhanoi` repo, its own git history). No database, no middle API layer:
Server Components and Server Actions call `wc/v3`/`wp/v2`/`taycamhanoi/v1`
REST endpoints directly over HTTP Basic Auth, using credentials pulled from
an encrypted session cookie. Every GET uses `cache: "no-store"` — this is
an operations tool, not a cached storefront.

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
CSS 3 — same major versions as the `taycamhanoi` repo. No ORM, no auth
library, no state-management library. Node's built-in `crypto` module for
session encryption.

**Spec:** [docs/superpowers/specs/2026-09-06-thin-admin-site-design.md](../specs/2026-09-06-thin-admin-site-design.md)
— this plan implements that spec's admin-site design. Two points resolved
during planning that the spec had left open or slightly wrong:

1. **Auth mechanism — empirically verified, not assumed.** The spec's Auth
   section said the login screen should "thử password thường trước" (try
   the regular account password first) and only fall back to an
   Application Password if that failed. Tested directly against a live
   local WordPress 6.x + WooCommerce 11.0.1 instance during planning:
   `curl -u admin:<regular password> .../wp-json/wp/v2/users/me` → `401`;
   `curl -u admin:<Application Password> .../wp-json/wp/v2/users/me` →
   `200`. Stock WordPress only supports Basic Auth over the REST API via
   Application Passwords (a core feature since WP 5.6) — the account login
   password never works this way, with or without spaces removed (WordPress
   strips internal whitespace from the supplied password before comparing,
   confirmed by testing the human-readable "xxxx xxxx xxxx xxxx xxxx xxxx"
   format WP's own UI displays). This plan's login screen therefore asks
   for an Application Password from the start — no "try the regular
   password first" branch. Also verified: the same Application Password
   authenticates equally against `wc/v3/*` endpoints (products, orders,
   reports) — one credential covers everything this app calls.
2. **Settings endpoint** — the spec's later revision (after Plan A) already
   corrected this to `taycamhanoi/v1/settings` (public GET, `manage_options`
   POST) instead of the generic `wp/v2/settings`. This plan uses that
   corrected endpoint, added by Plan A's `docs/wp-mu-plugins/site-settings.php`
   mu-plugin (already implemented and reviewed on branch
   `plan-a-main-repo-changes` in the `taycamhanoi` repo, not yet merged to
   `main` — this app assumes that endpoint exists on whatever WordPress
   instance it points at).

## Global Constraints

- Repo location: new, independent git repo at
  `/Users/dung_tt/Desktop/Freelances/tamvd/taycamhanoi-admin` (from the
  spec's resolved "Việc cần xác nhận" item — user chose a separate sibling
  directory, not a subfolder of `taycamhanoi`).
- Dev server port: `3001` (the main `taycamhanoi` site's dev server already
  uses `3000` — both may need to run at once).
- No database, no middle API-route layer: Server Actions/Components call
  WooCommerce/WordPress REST endpoints directly (from the spec's
  "Kiến trúc" section).
- Auth: WordPress Application Password only (see point 1 above). Session
  stored as an `AES-256-GCM`-encrypted `httpOnly` cookie
  (`sameSite: "lax"`, `secure` only when `NODE_ENV === "production"`,
  7-day expiry), key derived from the `ADMIN_SESSION_SECRET` env var via
  SHA-256 (so the secret can be any length) — from the spec's "Xác thực"
  section.
- Always implement simply — no abstractions beyond what each task needs.
- Always skip test files — no automated tests in this project (same
  convention as `taycamhanoi`'s `CLAUDE.md`: "Alway skip test file"). This
  plan's own `CLAUDE.md` (created in Task 1) carries the same 3 rules
  forward. Verification per task uses `npx tsc --noEmit`, and — because a
  real local WooCommerce/WordPress backend is reachable during this
  session (unlike the fully offline sandbox Plan A's tasks ran in) — direct
  `curl` checks against both the Next.js dev server and the WordPress REST
  API where that's a faster, more concrete proof than reading code.
- Scope (from the spec's "Phạm vi", plus one addition made after the spec
  was written — see below): Đơn hàng (list/detail/change status/"Duyệt
  đơn" on-hold→processing), Sản phẩm (list/edit price+stock+box_contents,
  add new), **Danh mục & Thương hiệu (list/create/edit, with an image —
  added to scope after the original spec; the spec's "Ngoài phạm vi" list
  still says wp-admin handles these, which this plan now supersedes)**,
  Dashboard (WooCommerce Reports API only, no manual aggregation), Cài đặt
  chung (one field: secondhand group URL).
- Out of scope (unchanged from spec, category/brand management removed —
  see above): multi-role permissions, audit log, real-time notifications,
  managing Posts/Pages (still wp-admin), a custom media library UI (a
  single plain file upload is as far as this goes — no image cropping,
  no media browser), Nhanh.vn integration (a future, separate spec).

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `CLAUDE.md`
- Create: `README.md`
- Create: `.claude/launch.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/format.ts`

**Interfaces:**
- Produces: `formatPrice(value: number): string` — used by every later
  task that displays money (dashboard, orders, products).

- [ ] **Step 1: Create the project directory and package manifest**

```bash
mkdir -p /Users/dung_tt/Desktop/Freelances/tamvd/taycamhanoi-admin
cd /Users/dung_tt/Desktop/Freelances/tamvd/taycamhanoi-admin
```

Create `package.json`:

```json
{
  "name": "taycamhanoi-admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^22.10.7",
    "@types/react": "^19.0.7",
    "@types/react-dom": "^19.0.3",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.6",
    "@eslint/eslintrc": "^3.2.0"
  }
}
```

- [ ] **Step 2: Add TypeScript, Tailwind, PostCSS, Next config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const wooUrl = process.env.WOOCOMMERCE_URL;
const wooHost = wooUrl ? new URL(wooUrl) : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: wooHost
      ? [
          {
            protocol: wooHost.protocol === "https:" ? "https" : "http",
            hostname: wooHost.hostname,
            port: wooHost.port || undefined,
          },
        ]
      : [],
  },
};

export default nextConfig;
```

Create `eslint.config.mjs` (flat config with the Next.js compat shim — this
avoids the gap the main `taycamhanoi` repo currently has, where no
`eslint.config.js` exists at all and `npm run lint` cannot run):

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript")];

export default eslintConfig;
```

- [ ] **Step 3: Add .gitignore, CLAUDE.md, README.md, launch.json**

Create `.gitignore`:

```
node_modules/
.next/
out/
build/
.env
.env.*
!.env.example
*.tsbuildinfo
next-env.d.ts
.DS_Store
npm-debug.log*
```

Create `CLAUDE.md`:

```
Alway simple implement
Alway skip test file
Alway keep coding convention and coding structure
```

Create `README.md`:

```markdown
# taycamhanoi-admin

Thin admin app for TAYCAMHANOI — calls the WooCommerce/WordPress REST API
directly with a WordPress Application Password. No database, no separate
backend.

## Setup

1. Copy the values below into a new `.env.local` file at the project root
   (this file is git-ignored and must be created by hand — it is never
   committed):

   ```
   WOOCOMMERCE_URL=http://localhost:8080
   ADMIN_SESSION_SECRET=<any long random string>
   ```

   `WOOCOMMERCE_URL` must point at the same WordPress/WooCommerce instance
   the `taycamhanoi` storefront uses. `ADMIN_SESSION_SECRET` encrypts the
   login session cookie — any string works (it's hashed into a 32-byte key
   internally), but keep it secret and stable (rotating it logs everyone
   out).

2. Create a WordPress Application Password for the account you'll log in
   with: wp-admin → Users → Profile → Application Passwords → give it a
   name (e.g. "Admin app") → Add New Application Password. Copy the
   generated password (spaces and all — WordPress accepts it either way).

3. `npm install`

4. `npm run dev` — opens on `http://localhost:3001` (not 3000, so it can
   run alongside the main `taycamhanoi` site's dev server).

5. Log in with your WordPress username and the Application Password from
   step 2 — **not** your regular WordPress login password (WordPress's
   REST API only accepts Application Passwords over Basic Auth).
```

Create `.claude/launch.json`:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "taycamhanoi-admin-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3001
    }
  ]
}
```

- [ ] **Step 4: Add the root layout, global styles, and the shared price formatter**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAYCAMHANOI Admin",
  description: "Trang quản trị nội bộ TAYCAMHANOI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
```

Create `src/lib/format.ts`:

```ts
export function formatPrice(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}
```

- [ ] **Step 5: Install dependencies and verify the scaffold boots**

```bash
npm install
npx tsc --noEmit
```

Expected: `tsc` prints nothing (no errors) — there's no page yet, so there's
nothing to type-check beyond the layout and format helper, but this
confirms the toolchain (Next/React/Tailwind types) installed correctly.

```bash
npm run dev &
DEV_PID=$!
sleep 5
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001
kill $DEV_PID
```

Expected: `HTTP 404` (there's no route yet — a 404 from a running Next.js
server, not a connection error, proves the app boots correctly; Task 3
adds the first real routes).

- [ ] **Step 6: Initialize git and commit**

```bash
git init
git add -A
git commit -m "$(cat <<'EOF'
Scaffold taycamhanoi-admin: Next.js + TypeScript + Tailwind project

New, independent project (sibling to taycamhanoi) for the thin admin
app described in taycamhanoi's docs/superpowers/specs/2026-09-06-thin-admin-site-design.md.
No app logic yet — just the toolchain, dev-server config, and this
repo's own CLAUDE.md carrying forward taycamhanoi's "simple implement,
skip tests, keep convention" rules.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Session and WordPress fetch core

**Files:**
- Create: `src/lib/session.ts`
- Create: `src/lib/wp-fetch.ts`

**Interfaces:**
- Produces: `interface Session { username: string; password: string }`,
  `createSession(session: Session): Promise<void>`,
  `getSession(): Promise<Session | null>`,
  `requireSession(): Promise<Session>` (redirects to `/login` if absent),
  `destroySession(): Promise<void>` — all from `session.ts`.
- Produces: `wpFetch<T>(path: string, credentials: Session, init?: RequestInit): Promise<T>`,
  `class WpApiError extends Error` — from `wp-fetch.ts`. `path` is a
  root-relative path like `/wp-json/wp/v2/users/me` — it's resolved against
  the `WOOCOMMERCE_URL` env var.
- Consumes: `WOOCOMMERCE_URL`, `ADMIN_SESSION_SECRET` env vars (read from
  `process.env` — no `.env.local` is created by this task; see Task 1's
  README for how a human sets that up).

- [ ] **Step 1: Write the session cookie module**

Create `src/lib/session.ts`:

```ts
import { cookies } from "next/headers";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";

export interface Session {
  username: string;
  password: string;
}

function getKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET env var");
  return createHash("sha256").update(secret).digest();
}

function encrypt(value: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decrypt(payload: string): string | null {
  try {
    const key = getKey();
    const buf = Buffer.from(payload, "base64url");
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export async function createSession(session: Session): Promise<void> {
  const value = encrypt(JSON.stringify(session));
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const decrypted = decrypt(raw);
  if (!decrypted) return null;
  try {
    return JSON.parse(decrypted) as Session;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
```

- [ ] **Step 2: Write the WordPress/WooCommerce fetch wrapper**

Create `src/lib/wp-fetch.ts`:

```ts
import type { Session } from "./session";

export class WpApiError extends Error {}

export async function wpFetch<T>(
  path: string,
  credentials: Session,
  init?: RequestInit
): Promise<T> {
  const wooUrl = process.env.WOOCOMMERCE_URL;
  if (!wooUrl) throw new Error("Missing WOOCOMMERCE_URL env var");
  const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString(
    "base64"
  );
  const res = await fetch(new URL(path, wooUrl), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new WpApiError(`WP API error ${res.status}: ${body}`);
  }
  return res.json();
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors. There's no route calling these yet — Task 3 exercises
`wpFetch` for real via the login flow.

- [ ] **Step 4: Commit**

```bash
git add src/lib/session.ts src/lib/wp-fetch.ts
git commit -m "$(cat <<'EOF'
Add session cookie encryption and the WordPress REST fetch wrapper

AES-256-GCM cookie (key derived from ADMIN_SESSION_SECRET via SHA-256),
httpOnly/sameSite=lax, 7-day expiry. wpFetch is a thin Basic-Auth fetch
wrapper shared by every later task that calls wp/v2, wc/v3, or
taycamhanoi/v1 endpoints.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Login and admin shell

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/components/LoginForm.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/page.tsx`

**Interfaces:**
- Consumes: `Session`, `createSession`, `requireSession`, `destroySession`
  (Task 2's `session.ts`); `wpFetch` (Task 2's `wp-fetch.ts`)
- Produces: `loginAction(username: string, password: string): Promise<{ success: boolean; error?: string }>`,
  `logoutAction(): Promise<void>` — from `auth.ts`. Every later task that
  needs "am I logged in, and as whom" relies on the `(admin)/layout.tsx`
  this task creates (it wraps every admin route and calls `requireSession`).

- [ ] **Step 1: Write the login server action**

Create `src/lib/auth.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { wpFetch } from "./wp-fetch";
import { createSession, destroySession } from "./session";

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginAction(username: string, password: string): Promise<LoginResult> {
  if (!username.trim() || !password.trim()) {
    return { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập và Application Password." };
  }
  try {
    await wpFetch("/wp-json/wp/v2/users/me", { username, password });
  } catch {
    return { success: false, error: "Sai tên đăng nhập hoặc Application Password." };
  }
  await createSession({ username, password });
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
```

- [ ] **Step 2: Write the login form (Client Component)**

Create `src/components/LoginForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await loginAction(username, password);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error ?? "Đăng nhập thất bại.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Đăng nhập quản trị</h1>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập WordPress</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Application Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Tạo tại wp-admin → Users → Profile → Application Passwords. Không dùng mật khẩu đăng nhập thường.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
      >
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the login page**

Create `src/app/login/page.tsx`:

```tsx
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 4: Write the admin shell layout (nav + session guard)**

Create `src/app/(admin)/layout.tsx`:

```tsx
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { logoutAction } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/don-hang", label: "Đơn hàng" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/cai-dat", label: "Cài đặt chung" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 font-black text-gray-900 border-b border-gray-100">
          TAYCAMHANOI Admin
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 px-3 mb-2">{session.username}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Write a placeholder dashboard page**

Create `src/app/(admin)/page.tsx` (Task 4 replaces the body with real
stats — this placeholder only exists so `/` resolves to something once a
session exists):

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Dashboard</h1>
      <p className="text-sm text-gray-500">Đang tải thống kê...</p>
    </div>
  );
}
```

- [ ] **Step 6: Verify with the compiler and the dev server**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
npm run dev &
DEV_PID=$!
sleep 5
echo "--- / without a session cookie should redirect to /login ---"
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" http://localhost:3001/
echo "--- /login should render the form ---"
curl -s http://localhost:3001/login | grep -o "Đăng nhập quản trị"
curl -s http://localhost:3001/login | grep -o "Application Password"
kill $DEV_PID
```

Expected: the first `curl` shows a redirect status (`307`) with
`redirect_url` ending in `/login`; the second and third greps both print a
match, confirming the login page renders its heading and the Application
Password field label.

- [ ] **Step 7: Manually verify the actual login submission (cannot be scripted with curl)**

Next.js Server Actions use an internal RSC POST protocol that isn't
practical to replicate with plain `curl` — this one check needs a real
browser. If you have interactive browser access to `http://localhost:3001`
in this environment: create a throwaway Application Password
(`wp user application-password create <your-admin-username> "manual-test" --porcelain`
via the `wordpress:cli` Docker image, same pattern used during planning),
log in with it, confirm you land on the dashboard placeholder, then revoke
it (`wp user application-password delete <username> <uuid>`). If you do
not have interactive browser access in this environment, note this as a
concern in your report for the human to verify — do not skip reporting it.

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/components/LoginForm.tsx src/app/login/page.tsx src/app/\(admin\)/layout.tsx src/app/\(admin\)/page.tsx
git commit -m "$(cat <<'EOF'
Add login flow and the admin shell layout

Login asks for a WordPress Application Password (verified during
planning that the regular account password does not authenticate over
the REST API). (admin)/layout.tsx guards every admin route behind
requireSession() and renders the shared nav + logout button.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Dashboard

**Files:**
- Create: `src/lib/reports.ts`
- Modify: `src/app/(admin)/page.tsx` (replace Task 3's placeholder body)

**Interfaces:**
- Consumes: `requireSession`, `wpFetch`, `formatPrice`
- Produces: `getDashboardStats(): Promise<DashboardStats>` where
  `DashboardStats = { todaySales: SalesReport; weekSales: SalesReport; topSellers: TopSeller[]; orderStatusTotals: OrderStatusTotal[] }`

- [ ] **Step 1: Write the reports data module**

Create `src/lib/reports.ts`:

```ts
import { requireSession } from "./session";
import { wpFetch } from "./wp-fetch";

export interface SalesReport {
  total_sales: string;
  total_orders: number;
}

export interface TopSeller {
  product_id: number;
  name: string;
  quantity: number;
}

export interface OrderStatusTotal {
  slug: string;
  name: string;
  total: number;
}

export interface DashboardStats {
  todaySales: SalesReport;
  weekSales: SalesReport;
  topSellers: TopSeller[];
  orderStatusTotals: OrderStatusTotal[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireSession();
  const today = todayISO();
  const weekAgo = daysAgoISO(7);

  const [todaySalesList, weekSalesList, topSellers, orderStatusTotals] = await Promise.all([
    wpFetch<SalesReport[]>(
      `/wp-json/wc/v3/reports/sales?date_min=${today}&date_max=${today}`,
      session
    ),
    wpFetch<SalesReport[]>(
      `/wp-json/wc/v3/reports/sales?date_min=${weekAgo}&date_max=${today}`,
      session
    ),
    wpFetch<TopSeller[]>(
      `/wp-json/wc/v3/reports/top_sellers?date_min=${weekAgo}&date_max=${today}`,
      session
    ),
    wpFetch<OrderStatusTotal[]>("/wp-json/wc/v3/reports/orders/totals", session),
  ]);

  return {
    todaySales: todaySalesList[0] ?? { total_sales: "0.00", total_orders: 0 },
    weekSales: weekSalesList[0] ?? { total_sales: "0.00", total_orders: 0 },
    topSellers,
    orderStatusTotals,
  };
}
```

- [ ] **Step 2: Replace the dashboard placeholder with real content**

In `src/app/(admin)/page.tsx`, replace the entire file with:

```tsx
import { getDashboardStats } from "@/lib/reports";
import { formatPrice } from "@/lib/format";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Đơn hôm nay</p>
          <p className="text-2xl font-black text-gray-900">{stats.todaySales.total_orders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Doanh thu hôm nay</p>
          <p className="text-2xl font-black text-gray-900">
            {formatPrice(Number(stats.todaySales.total_sales))}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Đơn 7 ngày qua</p>
          <p className="text-2xl font-black text-gray-900">{stats.weekSales.total_orders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Doanh thu 7 ngày qua</p>
          <p className="text-2xl font-black text-gray-900">
            {formatPrice(Number(stats.weekSales.total_sales))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3">Sản phẩm bán chạy (7 ngày)</h2>
          {stats.topSellers.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.topSellers.map((p) => (
                <li key={p.product_id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-semibold text-gray-900">{p.quantity} đã bán</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3">Đơn hàng theo trạng thái</h2>
          <ul className="divide-y divide-gray-100">
            {stats.orderStatusTotals.map((s) => (
              <li key={s.slug} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">{s.name}</span>
                <span className="font-semibold text-gray-900">{s.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Create a throwaway Application Password and hit the reports endpoints
directly to confirm the shapes `reports.ts` expects actually match the
live WooCommerce instance (this is the same live instance used throughout
planning):

```bash
PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task4-verify" --porcelain --path=/var/www/html --allow-root)
curl -s -u "admin:$PW" "http://localhost:8080/wp-json/wc/v3/reports/orders/totals" | head -c 300
echo ""
UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

Expected: a JSON array of `{slug, name, total}` objects (this exact shape
was confirmed live during planning) — confirms `OrderStatusTotal` matches
reality. (If this Docker network/container setup isn't present in your
environment, skip this live check and rely on `tsc` plus a code read —
note that in your report.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/reports.ts src/app/\(admin\)/page.tsx
git commit -m "$(cat <<'EOF'
Add dashboard: today/week sales, top sellers, orders by status

All three numbers come straight from WooCommerce's own Reports API
(sales, top_sellers, orders/totals) — no manual aggregation from the
order list.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Orders — list, detail, status change, approve

**Files:**
- Create: `src/lib/orders.ts`
- Create: `src/app/(admin)/don-hang/page.tsx`
- Create: `src/app/(admin)/don-hang/[id]/page.tsx`

**Interfaces:**
- Produces: `WooOrderAddress`, `WooOrderLineItem`, `WooOrderSummary`,
  `WooOrderDetail`, `OrderStatus` (`"on-hold" | "processing" | "completed" | "cancelled" | "refunded"`),
  `listOrders(status?: string): Promise<WooOrderSummary[]>`,
  `getOrder(id: number): Promise<WooOrderDetail>`,
  `updateOrderStatusAction(id: number, status: OrderStatus): Promise<void>`,
  `approveOrderAction(id: number): Promise<void>` (moves `on-hold` →
  `processing` — this is Plan A's "Duyệt đơn" step).

- [ ] **Step 1: Write the orders data/actions module**

Create `src/lib/orders.ts`:

```ts
"use server";

import { requireSession } from "./session";
import { wpFetch } from "./wp-fetch";

export interface WooOrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  email?: string;
  phone?: string;
}

export interface WooOrderLineItem {
  name: string;
  quantity: number;
  total: string;
}

export interface WooOrderSummary {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  billing: WooOrderAddress;
}

export interface WooOrderDetail extends WooOrderSummary {
  shipping: WooOrderAddress;
  line_items: WooOrderLineItem[];
  customer_note: string;
}

export const ORDER_STATUSES = [
  "on-hold",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export async function listOrders(status?: string): Promise<WooOrderSummary[]> {
  const session = await requireSession();
  const params = new URLSearchParams({ per_page: "50", orderby: "date", order: "desc" });
  if (status) params.set("status", status);
  return wpFetch<WooOrderSummary[]>(`/wp-json/wc/v3/orders?${params.toString()}`, session);
}

export async function getOrder(id: number): Promise<WooOrderDetail> {
  const session = await requireSession();
  return wpFetch<WooOrderDetail>(`/wp-json/wc/v3/orders/${id}`, session);
}

export async function updateOrderStatusAction(id: number, status: OrderStatus): Promise<void> {
  const session = await requireSession();
  await wpFetch(`/wp-json/wc/v3/orders/${id}`, session, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function approveOrderAction(id: number): Promise<void> {
  await updateOrderStatusAction(id, "processing");
}
```

- [ ] **Step 2: Write the orders list page**

Create `src/app/(admin)/don-hang/page.tsx`:

```tsx
import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  "on-hold": "Chờ duyệt",
  processing: "Đã duyệt",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Đã hoàn tiền",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await listOrders(status);

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Đơn hàng</h1>

      <div className="flex gap-2 mb-4 text-sm flex-wrap">
        <Link
          href="/don-hang"
          className={`px-3 py-1.5 rounded-full ${
            !status ? "bg-blue-700 text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Tất cả
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/don-hang?status=${key}`}
            className={`px-3 py-1.5 rounded-full ${
              status === key ? "bg-blue-700 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Mã đơn</th>
              <th className="px-4 py-2.5">Khách hàng</th>
              <th className="px-4 py-2.5">Ngày</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5 text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link href={`/don-hang/${order.id}`} className="text-blue-700 font-semibold hover:underline">
                    #{order.number}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  {order.billing.first_name} {order.billing.last_name}
                </td>
                <td className="px-4 py-2.5 text-gray-500">
                  {new Date(order.date_created).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-2.5">{STATUS_LABELS[order.status] ?? order.status}</td>
                <td className="px-4 py-2.5 text-right font-semibold">{formatPrice(Number(order.total))}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the order detail page**

Create `src/app/(admin)/don-hang/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getOrder,
  updateOrderStatusAction,
  approveOrderAction,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  "on-hold": "Chờ duyệt",
  processing: "Đã duyệt",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Đã hoàn tiền",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  let order;
  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  async function changeStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as OrderStatus;
    await updateOrderStatusAction(orderId, status);
  }

  async function approve() {
    "use server";
    await approveOrderAction(orderId);
  }

  return (
    <div className="max-w-3xl">
      <Link href="/don-hang" className="text-sm text-blue-700 hover:underline">
        ← Quay lại danh sách
      </Link>
      <h1 className="text-xl font-black text-gray-900 mt-2 mb-4">Đơn hàng #{order.number}</h1>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Trạng thái: {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {order.status === "on-hold" && (
            <form action={approve}>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Duyệt đơn
              </button>
            </form>
          )}
        </div>

        <form action={changeStatus} className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-500">Đổi trạng thái:</label>
          <select
            name="status"
            defaultValue={order.status}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="text-sm font-semibold text-blue-700 hover:underline">
            Lưu
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Khách hàng</h2>
        <p className="text-sm text-gray-700">
          {order.billing.first_name} {order.billing.last_name}
        </p>
        <p className="text-sm text-gray-500">{order.billing.phone}</p>
        <p className="text-sm text-gray-500">{order.billing.email}</p>
        <p className="text-sm text-gray-500">
          {order.shipping.address_1}, {order.shipping.city}
        </p>
        {order.customer_note && <p className="text-sm text-gray-500 mt-2">Ghi chú: {order.customer_note}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3">Sản phẩm</h2>
        <ul className="divide-y divide-gray-100">
          {order.line_items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-2 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold">{formatPrice(Number(item.total))}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 font-bold">
          <span>Tổng cộng</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Create a throwaway order directly against the live WooCommerce instance to
verify the whole page renders real data and the approve action actually
changes status:

```bash
PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task5-verify" --porcelain --path=/var/www/html --allow-root)

ORDER_ID=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wc/v3/orders \
  -H "Content-Type: application/json" \
  -d '{"status":"on-hold","billing":{"first_name":"Test","last_name":"Buyer","address_1":"123 Test St","city":"Hà Nội"},"line_items":[]}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created test order $ORDER_ID"

npm run dev &
DEV_PID=$!
sleep 5
echo "--- order detail page should render the test order's status ---"
curl -s -u "admin:$PW" http://localhost:8080/wp-json/wc/v3/orders/$ORDER_ID | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])"
kill $DEV_PID

curl -s -u "admin:$PW" -X PUT http://localhost:8080/wp-json/wc/v3/orders/$ORDER_ID \
  -H "Content-Type: application/json" -d '{"status":"cancelled"}' > /dev/null
echo "Cleaned up: set test order back to cancelled"
UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

Expected: `status` prints `on-hold`, confirming the order was created in
the right starting state (matching Plan A's `createOrderAction` default)
and that `wc/v3/orders/{id}` returns the fields `WooOrderDetail` expects.
The actual admin page rendering and the "Duyệt đơn" button click need a
real browser to fully exercise (same limitation as Task 3's login form) —
note in your report whether you had interactive browser access to confirm
the rendered page visually; if not, the REST-level check above plus `tsc`
is what you have.

- [ ] **Step 5: Commit**

```bash
git add src/lib/orders.ts src/app/\(admin\)/don-hang/
git commit -m "$(cat <<'EOF'
Add orders: list (filterable by status), detail, status change, approve

"Duyệt đơn" is a one-click on-hold -> processing transition on top of
the same generic status-change form — matches Plan A's order-approval
design in the main taycamhanoi repo.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Products — list and inline edit

**Files:**
- Create: `src/lib/products.ts`
- Create: `src/app/(admin)/san-pham/page.tsx`

**Interfaces:**
- Produces: `WooProductSummary`,
  `listProducts(search?: string): Promise<WooProductSummary[]>`,
  `updateProductAction(id: number, formData: FormData): Promise<void>`.
  Task 7 adds more exports to this same file (`listCategories`,
  `listBrands`, `createProductAction`) — don't restructure the file's
  existing exports when that happens.

- [ ] **Step 1: Write the products data/actions module**

Create `src/lib/products.ts`:

```ts
"use server";

import { requireSession } from "./session";
import { wpFetch } from "./wp-fetch";

export interface WooProductSummary {
  id: number;
  name: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  images: { src: string }[];
  meta_data: { key: string; value: unknown }[];
}

export async function listProducts(search?: string): Promise<WooProductSummary[]> {
  const session = await requireSession();
  const params = new URLSearchParams({ per_page: "50", orderby: "date", order: "desc" });
  if (search) params.set("search", search);
  return wpFetch<WooProductSummary[]>(`/wp-json/wc/v3/products?${params.toString()}`, session);
}

export async function updateProductAction(id: number, formData: FormData): Promise<void> {
  const session = await requireSession();
  const boxContents = String(formData.get("box_contents") ?? "");
  await wpFetch(`/wp-json/wc/v3/products/${id}`, session, {
    method: "PUT",
    body: JSON.stringify({
      regular_price: String(formData.get("regular_price") ?? ""),
      sale_price: String(formData.get("sale_price") ?? ""),
      stock_quantity: Number(formData.get("stock_quantity") ?? 0),
      stock_status: String(formData.get("stock_status") ?? "instock"),
      meta_data: [{ key: "box_contents", value: boxContents }],
    }),
  });
}
```

- [ ] **Step 2: Write the products list page with inline edit**

Create `src/app/(admin)/san-pham/page.tsx`:

```tsx
import Image from "next/image";
import { listProducts, updateProductAction } from "@/lib/products";

function getMetaValue(product: { meta_data: { key: string; value: unknown }[] }, key: string): string {
  const match = product.meta_data.find((m) => m.key === key);
  return typeof match?.value === "string" ? match.value : "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await listProducts(q);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Sản phẩm</h1>
        <a
          href="/san-pham/moi"
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Thêm sản phẩm
        </a>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Tìm theo tên sản phẩm..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full max-w-sm"
        />
      </form>

      <div className="space-y-3">
        {products.map((product) => {
          async function save(formData: FormData) {
            "use server";
            await updateProductAction(product.id, formData);
          }

          return (
            <form
              key={product.id}
              action={save}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                {product.images[0] && (
                  <Image src={product.images[0].src} alt={product.name} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <span className="font-semibold text-sm text-gray-800 min-w-[160px]">{product.name}</span>
              <label className="text-xs text-gray-500">
                Giá gốc
                <input
                  name="regular_price"
                  defaultValue={product.regular_price}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-28"
                />
              </label>
              <label className="text-xs text-gray-500">
                Giá khuyến mãi
                <input
                  name="sale_price"
                  defaultValue={product.sale_price}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-28"
                />
              </label>
              <label className="text-xs text-gray-500">
                Tồn kho
                <input
                  name="stock_quantity"
                  type="number"
                  defaultValue={product.stock_quantity ?? 0}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-20"
                />
              </label>
              <label className="text-xs text-gray-500">
                Trạng thái
                <select
                  name="stock_status"
                  defaultValue={product.stock_status}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="instock">Còn hàng</option>
                  <option value="outofstock">Hết hàng</option>
                  <option value="onbackorder">Đặt hàng trước</option>
                </select>
              </label>
              <label className="text-xs text-gray-500 flex-1 min-w-[200px]">
                Trong hộp có gì
                <textarea
                  name="box_contents"
                  defaultValue={getMetaValue(product, "box_contents")}
                  rows={1}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full"
                />
              </label>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Lưu
              </button>
            </form>
          );
        })}
        {products.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Không có sản phẩm nào.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Create a throwaway product directly against the live WooCommerce instance
and confirm an update via the same REST call `updateProductAction` makes:

```bash
PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task6-verify" --porcelain --path=/var/www/html --allow-root)

PRODUCT_ID=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wc/v3/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product Task 6","regular_price":"100000"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created test product $PRODUCT_ID"

curl -s -u "admin:$PW" -X PUT http://localhost:8080/wp-json/wc/v3/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"regular_price":"120000","stock_quantity":5,"stock_status":"instock","meta_data":[{"key":"box_contents","value":"Tay cầm\nCáp sạc"}]}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['regular_price'], d['stock_quantity'], [m for m in d['meta_data'] if m['key']=='box_contents'])"

curl -s -u "admin:$PW" -X DELETE "http://localhost:8080/wp-json/wc/v3/products/$PRODUCT_ID?force=true" > /dev/null
echo "Deleted test product"
UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

Expected: prints `120000 5 [{'id': ..., 'key': 'box_contents', 'value': 'Tay cầm\nCáp sạc'}]`
(exact `id` will vary) — confirms the update payload shape
`updateProductAction` sends is accepted and persisted correctly, including
the `box_contents` meta key added by Plan A's `product-fields.php`
mu-plugin. If your environment doesn't have this Docker network, rely on
`tsc` plus a careful read instead and note that in your report.

- [ ] **Step 4: Commit**

```bash
git add src/lib/products.ts src/app/\(admin\)/san-pham/page.tsx
git commit -m "$(cat <<'EOF'
Add products list with inline edit (price, stock, box_contents)

Each row is its own form/server-action pair — no client-side state,
no modal. Matches the "quick edit on the list" design from the spec
rather than a separate detail page.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Category and brand management

**Files:**
- Create: `src/lib/media.ts` (shared file-upload helper — extracted here
  because both this task and Task 8 need it)
- Create: `src/lib/taxonomy.ts`
- Create: `src/components/TaxonomyCreateForm.tsx`
- Create: `src/app/(admin)/danh-muc/page.tsx`
- Create: `src/app/(admin)/thuong-hieu/page.tsx`
- Modify: `src/app/(admin)/layout.tsx` (add 2 nav links)

**Interfaces:**
- Consumes: `requireSession`, `wpFetch` (Task 2)
- Produces: `uploadMedia(file: File, session: Session): Promise<UploadedMedia>`
  where `UploadedMedia = { id: number; source_url: string }` — from
  `media.ts`. `WooTaxonomyTerm { id: number; name: string; description: string; image: { id: number; src: string } | null }`,
  `TaxonomyActionResult { success: boolean; error?: string }`,
  `listCategories(): Promise<WooTaxonomyTerm[]>`,
  `listBrands(): Promise<WooTaxonomyTerm[]>`,
  `createCategoryAction(formData: FormData): Promise<TaxonomyActionResult>`,
  `updateCategoryAction(id: number, formData: FormData): Promise<TaxonomyActionResult>`,
  `createBrandAction(formData: FormData): Promise<TaxonomyActionResult>`,
  `updateBrandAction(id: number, formData: FormData): Promise<TaxonomyActionResult>`
  — all from `taxonomy.ts`. Task 8 (add new product) consumes
  `listCategories`/`listBrands`/`WooTaxonomyTerm` from here, and
  `uploadMedia` from `media.ts` — it does not define its own copies.

- [ ] **Step 1: Extract the shared media-upload helper**

Create `src/lib/media.ts`:

```ts
import type { Session } from "./session";

export interface UploadedMedia {
  id: number;
  source_url: string;
}

export async function uploadMedia(file: File, session: Session): Promise<UploadedMedia> {
  const wooUrl = process.env.WOOCOMMERCE_URL;
  if (!wooUrl) throw new Error("Missing WOOCOMMERCE_URL env var");
  const auth = Buffer.from(`${session.username}:${session.password}`).toString("base64");
  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await fetch(new URL("/wp-json/wp/v2/media", wooUrl), {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: buffer,
  });
  if (!res.ok) {
    throw new Error(`Tải ảnh lên thất bại: ${res.status}`);
  }
  return res.json();
}
```

- [ ] **Step 2: Write the shared category/brand data module**

WooCommerce exposes categories and brands as two REST collections
(`wc/v3/products/categories`, `wc/v3/products/brands`) with an identical
shape (name, description, image) — this module shares the REST logic
between them via a private `endpoint` parameter, while each taxonomy still
gets its own named, exported functions.

Create `src/lib/taxonomy.ts`:

```ts
"use server";

import { requireSession } from "./session";
import { wpFetch } from "./wp-fetch";
import { uploadMedia } from "./media";

export interface WooTaxonomyTerm {
  id: number;
  name: string;
  description: string;
  image: { id: number; src: string } | null;
}

export interface TaxonomyActionResult {
  success: boolean;
  error?: string;
}

type TaxonomyEndpoint = "categories" | "brands";

async function listTerms(endpoint: TaxonomyEndpoint): Promise<WooTaxonomyTerm[]> {
  const session = await requireSession();
  return wpFetch<WooTaxonomyTerm[]>(`/wp-json/wc/v3/products/${endpoint}?per_page=100`, session);
}

async function createTerm(endpoint: TaxonomyEndpoint, formData: FormData): Promise<TaxonomyActionResult> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { success: false, error: "Vui lòng nhập tên." };
  }

  const data: Record<string, unknown> = {
    name,
    description: String(formData.get("description") ?? ""),
  };
  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const media = await uploadMedia(image, session);
    data.image = { id: media.id };
  }

  try {
    await wpFetch(`/wp-json/wc/v3/products/${endpoint}`, session, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return { success: false, error: "Không tạo được. Vui lòng thử lại." };
  }
  return { success: true };
}

async function updateTerm(
  endpoint: TaxonomyEndpoint,
  id: number,
  formData: FormData
): Promise<TaxonomyActionResult> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { success: false, error: "Vui lòng nhập tên." };
  }

  const data: Record<string, unknown> = {
    name,
    description: String(formData.get("description") ?? ""),
  };
  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const media = await uploadMedia(image, session);
    data.image = { id: media.id };
  }

  try {
    await wpFetch(`/wp-json/wc/v3/products/${endpoint}/${id}`, session, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    return { success: false, error: "Không lưu được. Vui lòng thử lại." };
  }
  return { success: true };
}

export async function listCategories(): Promise<WooTaxonomyTerm[]> {
  return listTerms("categories");
}

export async function listBrands(): Promise<WooTaxonomyTerm[]> {
  return listTerms("brands");
}

export async function createCategoryAction(formData: FormData): Promise<TaxonomyActionResult> {
  return createTerm("categories", formData);
}

export async function updateCategoryAction(id: number, formData: FormData): Promise<TaxonomyActionResult> {
  return updateTerm("categories", id, formData);
}

export async function createBrandAction(formData: FormData): Promise<TaxonomyActionResult> {
  return createTerm("brands", formData);
}

export async function updateBrandAction(id: number, formData: FormData): Promise<TaxonomyActionResult> {
  return updateTerm("brands", id, formData);
}
```

- [ ] **Step 3: Write the shared "create new" form (Client Component)**

Categories and brands need the exact same create-form fields (name,
description, image) — unlike products (which have distinct price/stock
fields per taxonomy), so this one form is reused by both pages via props,
rather than writing two near-identical components.

Create `src/components/TaxonomyCreateForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaxonomyActionResult } from "@/lib/taxonomy";

export default function TaxonomyCreateForm({
  title,
  action,
}: {
  title: string;
  action: (formData: FormData) => Promise<TaxonomyActionResult>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Không thực hiện được.");
    }
    setSubmitting(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg mb-4"
      >
        + {title}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4 mb-4 max-w-lg">
      <h2 className="font-bold text-gray-900">{title}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
        <input name="name" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea name="description" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh minh hoạ</label>
        <input name="image" type="file" accept="image/*" className="w-full text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
        >
          {submitting ? "Đang lưu..." : "Tạo mới"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-500 text-sm font-semibold px-4 py-2">
          Huỷ
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Write the categories page (list + inline edit + create)**

Create `src/app/(admin)/danh-muc/page.tsx`:

```tsx
import Image from "next/image";
import { listCategories, updateCategoryAction, createCategoryAction } from "@/lib/taxonomy";
import TaxonomyCreateForm from "@/components/TaxonomyCreateForm";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Danh mục</h1>

      <TaxonomyCreateForm title="Thêm danh mục mới" action={createCategoryAction} />

      <div className="space-y-3">
        {categories.map((category) => {
          async function save(formData: FormData) {
            "use server";
            await updateCategoryAction(category.id, formData);
          }

          return (
            <form
              key={category.id}
              action={save}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                {category.image && (
                  <Image src={category.image.src} alt={category.name} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <label className="text-xs text-gray-500">
                Tên
                <input
                  name="name"
                  defaultValue={category.name}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-40"
                />
              </label>
              <label className="text-xs text-gray-500 flex-1 min-w-[200px]">
                Mô tả
                <input
                  name="description"
                  defaultValue={category.description}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full"
                />
              </label>
              <label className="text-xs text-gray-500">
                Đổi ảnh
                <input name="image" type="file" accept="image/*" className="block text-sm" />
              </label>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Lưu
              </button>
            </form>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Chưa có danh mục nào.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write the brands page (identical structure, brands endpoint)**

Create `src/app/(admin)/thuong-hieu/page.tsx`:

```tsx
import Image from "next/image";
import { listBrands, updateBrandAction, createBrandAction } from "@/lib/taxonomy";
import TaxonomyCreateForm from "@/components/TaxonomyCreateForm";

export default async function BrandsPage() {
  const brands = await listBrands();

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Thương hiệu</h1>

      <TaxonomyCreateForm title="Thêm thương hiệu mới" action={createBrandAction} />

      <div className="space-y-3">
        {brands.map((brand) => {
          async function save(formData: FormData) {
            "use server";
            await updateBrandAction(brand.id, formData);
          }

          return (
            <form
              key={brand.id}
              action={save}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                {brand.image && (
                  <Image src={brand.image.src} alt={brand.name} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <label className="text-xs text-gray-500">
                Tên
                <input
                  name="name"
                  defaultValue={brand.name}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-40"
                />
              </label>
              <label className="text-xs text-gray-500 flex-1 min-w-[200px]">
                Mô tả
                <input
                  name="description"
                  defaultValue={brand.description}
                  className="block border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full"
                />
              </label>
              <label className="text-xs text-gray-500">
                Đổi ảnh
                <input name="image" type="file" accept="image/*" className="block text-sm" />
              </label>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Lưu
              </button>
            </form>
          );
        })}
        {brands.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Chưa có thương hiệu nào.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Add nav links for the 2 new pages**

In `src/app/(admin)/layout.tsx`, find:

```tsx
const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/don-hang", label: "Đơn hàng" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/cai-dat", label: "Cài đặt chung" },
];
```

Replace with:

```tsx
const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/don-hang", label: "Đơn hàng" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/danh-muc", label: "Danh mục" },
  { href: "/thuong-hieu", label: "Thương hiệu" },
  { href: "/cai-dat", label: "Cài đặt chung" },
];
```

- [ ] **Step 7: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Confirm the categories/brands endpoints accept the create/update payload
shape this module sends, directly against the live instance:

```bash
PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task7-verify" --porcelain --path=/var/www/html --allow-root)

echo "--- create a category ---"
CATEGORY_ID=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wc/v3/products/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category Task 7","description":"mo ta test"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created category $CATEGORY_ID"

echo "--- update it ---"
curl -s -u "admin:$PW" -X PUT "http://localhost:8080/wp-json/wc/v3/products/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category Task 7 (updated)","description":"mo ta moi"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['name'], d['description'])"

curl -s -u "admin:$PW" -X DELETE "http://localhost:8080/wp-json/wc/v3/products/categories/$CATEGORY_ID?force=true" > /dev/null
echo "Deleted test category"

echo "--- same round-trip for a brand ---"
BRAND_ID=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wc/v3/products/brands \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Brand Task 7","description":"mo ta test"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created brand $BRAND_ID"
curl -s -u "admin:$PW" -X DELETE "http://localhost:8080/wp-json/wc/v3/products/brands/$BRAND_ID?force=true" > /dev/null
echo "Deleted test brand"

UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

Expected: category create/update/delete round-trip cleanly, the update
response prints the new name and description; the brand create/delete
round-trips cleanly too — confirms `wc/v3/products/categories` and
`wc/v3/products/brands` accept the exact same request shape, which is
what lets `taxonomy.ts` share one implementation between them. If this
Docker setup isn't present in your environment, rely on `tsc` plus a
careful read and note that in your report.

- [ ] **Step 8: Commit**

```bash
git add src/lib/media.ts src/lib/taxonomy.ts src/components/TaxonomyCreateForm.tsx src/app/\(admin\)/danh-muc/ src/app/\(admin\)/thuong-hieu/ src/app/\(admin\)/layout.tsx
git commit -m "$(cat <<'EOF'
Add category and brand management (list, create, edit, image)

Categories and brands are two WooCommerce REST collections with an
identical shape, so taxonomy.ts shares the list/create/update logic
between them via an internal endpoint parameter, while still exposing
separate named functions per taxonomy. uploadMedia moves to its own
media.ts module so this task and the next (add new product) can both
use it without duplication.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Add new product (with image upload)

**Files:**
- Modify: `src/lib/products.ts` (add `createProductAction`, after Task 6's
  existing exports — do not touch those; category/brand listing and image
  upload now live in Task 7's `taxonomy.ts`/`media.ts` instead of being
  redefined here)
- Create: `src/components/NewProductForm.tsx`
- Create: `src/app/(admin)/san-pham/moi/page.tsx`

**Interfaces:**
- Consumes: `requireSession`, `wpFetch` (Task 2); `WooProductSummary`
  (Task 6, unchanged); `uploadMedia` (Task 7's `media.ts`);
  `listCategories`, `listBrands`, `WooTaxonomyTerm` (Task 7's `taxonomy.ts`)
- Produces: `CreateProductResult { success: boolean; error?: string }`,
  `createProductAction(formData: FormData): Promise<CreateProductResult>`

- [ ] **Step 1: Add product creation to products.ts**

In `src/lib/products.ts`, add this content at the end of the file (after
the existing `updateProductAction` function from Task 6 — do not modify
anything above it):

```ts

import { uploadMedia } from "./media";

export interface CreateProductResult {
  success: boolean;
  error?: string;
}

export async function createProductAction(formData: FormData): Promise<CreateProductResult> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const regularPrice = String(formData.get("regular_price") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  if (!name || !regularPrice || !categoryId) {
    return { success: false, error: "Vui lòng nhập tên, giá và chọn danh mục." };
  }

  const productData: Record<string, unknown> = {
    name,
    regular_price: regularPrice,
    description: String(formData.get("description") ?? ""),
    categories: [{ id: Number(categoryId) }],
  };

  const brandId = String(formData.get("brand_id") ?? "");
  if (brandId) {
    productData.brands = [{ id: Number(brandId) }];
  }

  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const media = await uploadMedia(image, session);
    productData.images = [{ id: media.id }];
  }

  try {
    await wpFetch("/wp-json/wc/v3/products", session, {
      method: "POST",
      body: JSON.stringify(productData),
    });
  } catch {
    return { success: false, error: "Không tạo được sản phẩm. Vui lòng thử lại." };
  }

  return { success: true };
}
```

Note: the `import { uploadMedia } from "./media";` line above must actually
go at the *top* of `products.ts` with the file's other imports (JavaScript
doesn't have a "verify this doesn't matter for imports" — `import`
statements are hoisted, but keep it at the top with the existing
`requireSession`/`wpFetch` imports for readability, not literally
mid-file).

- [ ] **Step 2: Write the new-product form (Client Component)**

Create `src/components/NewProductForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/lib/products";
import type { WooTaxonomyTerm } from "@/lib/taxonomy";

export default function NewProductForm({
  categories,
  brands,
}: {
  categories: WooTaxonomyTerm[];
  brands: WooTaxonomyTerm[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);
    if (result.success) {
      router.push("/san-pham");
      router.refresh();
    } else {
      setError(result.error ?? "Không tạo được sản phẩm.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
        <input name="name" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
        <input
          name="regular_price"
          required
          type="number"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea name="description" rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
        <select name="category_id" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu (không bắt buộc)</label>
        <select name="brand_id" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">-- Không chọn --</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
        <input name="image" type="file" accept="image/*" className="w-full text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg"
      >
        {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the new-product page**

Create `src/app/(admin)/san-pham/moi/page.tsx`:

```tsx
import { listCategories, listBrands } from "@/lib/taxonomy";
import NewProductForm from "@/components/NewProductForm";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Thêm sản phẩm mới</h1>
      <NewProductForm categories={categories} brands={brands} />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Confirm the product-creation payload shape against the live instance (the
categories/brands endpoints themselves were already verified in Task 7):

```bash
PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task8-verify" --porcelain --path=/var/www/html --allow-root)

echo "--- create product without image ---"
PRODUCT_ID=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wc/v3/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product Task 8","regular_price":"50000","categories":[]}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created $PRODUCT_ID"
curl -s -u "admin:$PW" -X DELETE "http://localhost:8080/wp-json/wc/v3/products/$PRODUCT_ID?force=true" > /dev/null

echo "--- media upload endpoint (1x1 px transparent PNG) ---"
printf '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0aIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\x0d\x0a\x2d\xb4\x00\x00\x00\x00IEND\xaeB\x60\x82' > "$TMPDIR/test-pixel.png"
MEDIA_RESPONSE=$(curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/wp/v2/media \
  -H 'Content-Disposition: attachment; filename="test-pixel.png"' \
  -H "Content-Type: image/png" \
  --data-binary "@$TMPDIR/test-pixel.png")
MEDIA_ID=$(echo "$MEDIA_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Uploaded media id $MEDIA_ID"
curl -s -u "admin:$PW" -X DELETE "http://localhost:8080/wp-json/wp/v2/media/$MEDIA_ID?force=true" > /dev/null

UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

Expected: product creation returns an id that gets deleted cleanly; the
media upload returns a numeric id (proving the
`Content-Disposition`/binary-body upload pattern `uploadMedia` uses
actually works against this WordPress version), and is deleted cleanly
too. If this Docker setup isn't present in your environment, rely on `tsc`
plus a careful read and note that in your report.

- [ ] **Step 5: Commit**

```bash
git add src/lib/products.ts src/components/NewProductForm.tsx src/app/\(admin\)/san-pham/moi/
git commit -m "$(cat <<'EOF'
Add "add new product" form: name, price, description, category, brand, image

Reuses Task 7's taxonomy.ts (category/brand dropdowns) and media.ts
(image upload) rather than redefining them. Image upload posts the raw
file to wp/v2/media first (WordPress's Content-Disposition upload
convention), then references the returned media id in the product's
images array — no custom media library UI.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Cài đặt chung (settings)

**Files:**
- Create: `src/lib/settings.ts`
- Create: `src/components/SettingsForm.tsx`
- Create: `src/app/(admin)/cai-dat/page.tsx`

**Interfaces:**
- Consumes: `requireSession`, `wpFetch` (Task 2); Plan A's
  `taycamhanoi/v1/settings` REST route (public GET, `manage_options` POST)
- Produces: `SiteSettings { secondhand_group_url: string }`,
  `getSettings(): Promise<SiteSettings>`,
  `updateSettingsAction(formData: FormData): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Write the settings data/actions module**

Create `src/lib/settings.ts`:

```ts
"use server";

import { requireSession } from "./session";
import { wpFetch } from "./wp-fetch";

export interface SiteSettings {
  secondhand_group_url: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const session = await requireSession();
  return wpFetch<SiteSettings>("/wp-json/taycamhanoi/v1/settings", session);
}

export interface UpdateSettingsResult {
  success: boolean;
  error?: string;
}

export async function updateSettingsAction(formData: FormData): Promise<UpdateSettingsResult> {
  const session = await requireSession();
  const secondhandGroupUrl = String(formData.get("secondhand_group_url") ?? "").trim();
  try {
    await wpFetch("/wp-json/taycamhanoi/v1/settings", session, {
      method: "POST",
      body: JSON.stringify({ secondhand_group_url: secondhandGroupUrl }),
    });
  } catch {
    return { success: false, error: "Không lưu được cài đặt. Vui lòng thử lại." };
  }
  return { success: true };
}
```

- [ ] **Step 2: Write the settings form (Client Component)**

Create `src/components/SettingsForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { updateSettingsAction } from "@/lib/settings";

export default function SettingsForm({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    const formData = new FormData();
    formData.set("secondhand_group_url", url);
    const result = await updateSettingsAction(formData);
    if (result.success) {
      setMessage("Đã lưu.");
    } else {
      setError(result.error ?? "Không lưu được.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link nhóm trao đổi (trang Hàng cũ)
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg"
      >
        {submitting ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the settings page**

Create `src/app/(admin)/cai-dat/page.tsx`:

```tsx
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-4">Cài đặt chung</h1>
      <SettingsForm initialUrl={settings.secondhand_group_url} />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

Confirm the settings endpoint round-trips correctly (this exercises the
exact same public-GET/authenticated-POST route Plan A built):

```bash
echo "--- public GET, no auth needed ---"
curl -s http://localhost:8080/wp-json/taycamhanoi/v1/settings

PW=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password create admin "task8-verify" --porcelain --path=/var/www/html --allow-root)

echo "--- authenticated POST changes it ---"
curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/taycamhanoi/v1/settings \
  -H "Content-Type: application/json" \
  -d '{"secondhand_group_url":"https://facebook.com/groups/test-verify"}'

echo "--- restore the original default ---"
curl -s -u "admin:$PW" -X POST http://localhost:8080/wp-json/taycamhanoi/v1/settings \
  -H "Content-Type: application/json" \
  -d '{"secondhand_group_url":"https://facebook.com/groups/taycamhanoi"}'

UUID=$(docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password list admin --path=/var/www/html --allow-root --format=csv | tail -1 | cut -d, -f1)
docker run --rm --network taycamhanoi-net \
  -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_USER=wordpress -e WORDPRESS_DB_PASSWORD=wordpress -e WORDPRESS_DB_NAME=wordpress \
  -v taycamhanoi_wp_content:/var/www/html --user root \
  wordpress:cli wp user application-password delete admin "$UUID" --path=/var/www/html --allow-root
```

**Important:** if `docs/wp-mu-plugins/site-settings.php` from Plan A
hasn't actually been deployed into this WordPress container yet (copied
via `docker cp` into `wp-content/mu-plugins/`, per Plan A's updated
`docs/woocommerce-local-dev.md`), the first `curl` will 404. That's an
environment/deployment gap, not a bug in this task's code — if it 404s,
deploy the mu-plugin first (see that doc), then re-run this verification.

Expected (once deployed): the GET returns
`{"secondhand_group_url":"https://facebook.com/groups/taycamhanoi"}` (or
whatever was last set); the POST calls each return the updated value; the
restore call leaves the setting back at its original default so this
verification doesn't leave the live instance altered.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings.ts src/components/SettingsForm.tsx src/app/\(admin\)/cai-dat/page.tsx
git commit -m "$(cat <<'EOF'
Add "Cài đặt chung" screen for the secondhand group URL

Reads/writes Plan A's taycamhanoi/v1/settings route — the first (and,
for now, only) field in a settings screen designed to hold more fields
later without needing a new screen per field.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

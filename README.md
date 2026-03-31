# The Creativity Shoppe

This is my little storefront project: a Next.js + Supabase shop with a customer flow (browse → cart → checkout) plus an admin area for managing products/orders/users.

I’m keeping the README practical — basically the notes I use when I’m setting this up on a new machine.

<details>
  <summary><strong>Quick Start</strong></summary>

  **Prereqs**
  - Node.js (recent LTS)
  - npm

  **Install + run**
  ```bash
  npm install
  npm run dev
  ```

  Open http://localhost:3000

</details>

<details>
  <summary><strong>What’s In Here</strong></summary>

  - Storefront pages (home, shop listing, product detail)
  - Cart + checkout flow
  - Account pages (profile, addresses, orders, security)
  - Admin dashboard (`/admin`) with product management + order/user views

</details>

<details>
  <summary><strong>Tech Stack</strong></summary>

  - Next.js (App Router)
  - React + TypeScript
  - Tailwind CSS
  - Supabase:
    - Auth
    - Postgres tables
    - Storage (for product images)
    - Edge Functions (used for a few “server-ish” operations)

</details>

<details>
  <summary><strong>Environment Variables</strong></summary>

  Create a `.env.local` in the repo root.

  ```bash
  # Public (safe to ship to the browser)
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

  # Server-only (DO NOT expose this client-side)
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  ```

  Notes:
  - `NEXT_PUBLIC_SITE_URL` is used for auth redirect links (signup confirmation + password reset).
  - `SUPABASE_SERVICE_ROLE_KEY` is used by server code for admin/server actions; don’t put it anywhere that ends up in the browser.

</details>

<details>
  <summary><strong>Supabase Expectations (Tables / Storage / Functions)</strong></summary>

  This app expects these Supabase pieces to exist:

  **Tables (at least referenced in code)**
  - `profiles` (includes a `role` column used for admin checks)
  - `products`
  - `product_images`
  - `cart_items`
  - `orders`
  - `order_items`
  - `addresses`

  **Storage bucket**
  - `product-images` (this is where product images get uploaded)

  **Edge Functions (in `supabase/functions/`)**
  - `create-order`
  - `order`
  - `list-users`
  - `enable-user`
  - `disable-user`
  - `delete-user`

  If you rename buckets/functions, you’ll want to update the constants in the code.

</details>

<details>
  <summary><strong>Admin Access</strong></summary>

  - Admin UI lives at `/admin`.
  - Admin access is checked server-side by reading your profile role from `profiles.role`.

  If you’re setting up a fresh database, make sure your user has a row in `profiles` and that `role` is set to `admin`.

</details>

<details>
  <summary><strong>Images (Supabase-hosted)</strong></summary>

  Next Image remote loading is locked down.

  - The allowed remote hostname is currently configured in `next.config.ts`.
  - If you switch Supabase projects, update the `images.remotePatterns` hostname to match your new `*.supabase.co` host.

</details>

<details>
  <summary><strong>Scripts</strong></summary>

  ```bash
  npm run dev
  npm run build
  npm run start
  npm run lint
  ```

</details>

<details>
  <summary><strong>Troubleshooting Notes</strong></summary>

  - If auth redirects are weird: double-check `NEXT_PUBLIC_SITE_URL`.
  - If product images won’t render: confirm your Supabase hostname is allowed in `next.config.ts`.
  - If admin pages error: confirm `SUPABASE_SERVICE_ROLE_KEY` is set server-side and your `profiles.role` is `admin`.

</details>
<details>
  <summary><strong>License</strong></summary>

  - Code: MIT (see LICENSE)
  - Content/brand assets: All Rights Reserved (see CONTENT-LICENSE.md)
  - Trademark notice: see NOTICE.md

  Note: the MIT License covers the software source code. It does not grant rights to trademarks, branding, product photography, or product descriptions.

</details>



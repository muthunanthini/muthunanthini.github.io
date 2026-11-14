# Automatic Visitor Email Notification Setup

This guide explains how to activate automatic visitor email notifications for your portfolio hosted on **GitHub Pages** using **Supabase Edge Functions** and **Resend**.

---

## 🔒 Security & Privacy Guarantee

- **No Exposed Secrets**: Your Resend API key is stored securely in backend environment variables. It is **never** visible in frontend JavaScript or GitHub repository files.
- **Strict Privacy**: Zero visitor personal information is collected (no visitor names, emails, phone numbers, IP addresses, locations, browser fingerprinting, or device tracking).
- **Rate-Limited & Anti-Spam**: Page refreshes in the same session will **not** trigger repeated emails (`sessionStorage` flag + 30-minute device cooldown).
- **Direct & Free**: Visitors browse your portfolio freely without login or popups.

---

## Architecture Flow

```
Visitor opens portfolio (GitHub Pages)
   │
   ▼
index.html background fetch (CORS POST, zero visitor info)
   │
   ▼
Supabase Edge Function (Deno backend)
   │  • Reads secret RESEND_API_KEY from backend env vars
   │  • Formats visit date & time in IST (Asia/Kolkata)
   ▼
Resend Email Service (Free tier: 3,000 emails/month)
   │
   ▼
Delivered to: nanthini1772006@gmail.com
Subject: "Someone Viewed Your Portfolio!"
```

---

## Step 1: Get a Free Resend API Key (1 minute)

1. Go to [https://resend.com](https://resend.com) and sign up with your email.
2. In the Resend dashboard, click **API Keys** on the left menu.
3. Click **Create API Key**.
4. Name it `portfolio-notifier`, keep the default permission (**Full Access**), and click **Add**.
5. Copy the generated key (it looks like `re_123456789...`). Keep this key secret.

---

## Step 2: Set Up the Supabase Edge Function (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and log in (or sign up for free).
2. Create a new free project (e.g. name it `portfolio-backend`). Wait ~1-2 minutes for the project to initialize.
3. In your Supabase project dashboard, navigate to **Edge Functions** in the left sidebar.
4. Click **Create Function**:
   - Name: `notify-visit`
   - Copy the code from `supabase/functions/notify-visit/index.ts` and paste it into the editor.
5. In the same Supabase dashboard, go to **Project Settings** > **Edge Functions** (or **Secrets** in Edge Functions tab):
   - Add secret 1:
     - Name: `RESEND_API_KEY`
     - Value: `re_...` (your Resend API key from Step 1)
   - Add secret 2:
     - Name: `NOTIFICATION_EMAIL`
     - Value: `nanthini1772006@gmail.com`
6. Click **Deploy**.
7. Copy your deployed Function URL. It will look like:
   `https://<your-project-ref>.supabase.co/functions/v1/notify-visit`

---

## Step 3: Connect the Endpoint in `index.html` (30 seconds)

1. Open `index.html`.
2. Scroll to line ~1596 inside the notification script.
3. Replace the placeholder URL:
   ```javascript
   const NOTIFICATION_ENDPOINT = "https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/notify-visit";
   ```
   with your actual Supabase URL:
   ```javascript
   const NOTIFICATION_ENDPOINT = "https://abcdefghijklm.supabase.co/functions/v1/notify-visit";
   ```
4. Save `index.html` and push your changes to GitHub (`git add .`, `git commit -m "Add visitor notification"`, `git push`).

---

## Step 4: Testing & Verification

1. **Test Initial Visit**:
   - Open your live portfolio in an Incognito / Private window or browser tab.
   - Within 5–10 seconds, check your inbox at `nanthini1772006@gmail.com`.
   - You should see an email with:
     - **Subject**: `Someone Viewed Your Portfolio!`
     - **Body**: `Good news! Someone has visited your portfolio.`
     - **Visit Date**: (e.g., `14 Nov 2026`)
     - **Visit Time**: (e.g., `11:55:00 AM (IST)`)

2. **Test Anti-Spam / Rate Limiting**:
   - Press **F5** or reload the page in that same tab multiple times.
   - Confirm that **no duplicate emails** are generated.
   - Close the tab or clear `sessionStorage` when you wish to trigger a new session test.

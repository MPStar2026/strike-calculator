# Strike Calculator — Vercel Deployment Guide

## Project Structure
```
strike-calculator/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Home page
│   ├── StrikeCalculator.js    # Main UI (client component)
│   └── api/
│       └── quote/
│           └── route.js       # Server-side stock price fetcher
├── package.json
├── next.config.js
└── README.md
```

## How It Works
- The UI calls `/api/quote?symbol=AAPL`
- That route runs **server-side on Vercel** and fetches Yahoo Finance directly
- No CORS issues, no API keys needed, just works

## Deploy to Vercel (3 steps)

### 1. Push to GitHub
```bash
# Create a new repo on github.com, then:
cd strike-calculator
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/strike-calculator.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import" next to your `strike-calculator` repo
3. Leave all settings as default
4. Click **Deploy**

### 3. Done!
Vercel will give you a URL like `https://strike-calculator.vercel.app`

## Run Locally
```bash
cd strike-calculator
npm install
npm run dev
# Open http://localhost:3000
```

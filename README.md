# Aghatis Resource Monitor

A production-ready **real-time system resource monitoring dashboard** built with Next.js, TypeScript, TailwindCSS, and Recharts. Monitors CPU, RAM, Disk, Network, and Uptime via server-side APIs — fully compatible with Ubuntu/Debian VPS.

---

## Features

- 📊 **Real-time metrics** — CPU per-core, RAM, Disk partitions, Network RX/TX, Uptime
- 🔒 **JWT authentication** — Login-protected dashboard via HttpOnly cookie
- 🌙 **Dark mode** — Premium dark dashboard UI by default
- 📈 **Live charts** — Recharts-powered rolling history graphs
- 🟢 **Status indicators** — Normal / High Usage / Critical badges
- ⚡ **Auto-refresh** — Polls every 2.5 seconds without page reload
- 🐧 **Linux VPS compatible** — Uses `systeminformation` (no GUI dependencies)

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── system/route.ts          # System metrics API
│   │   └── auth/
│   │       ├── login/route.ts       # Login endpoint
│   │       └── logout/route.ts      # Logout endpoint
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard sidebar layout
│   │   └── page.tsx                 # Main dashboard page
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── globals.css                  # Dark-mode design system
│   └── layout.tsx                   # Root layout
├── components/
│   ├── CpuCard.tsx                  # CPU metrics card
│   ├── RamCard.tsx                  # Memory metrics card
│   ├── DiskCard.tsx                 # Disk partitions card
│   ├── NetworkCard.tsx              # Network traffic card
│   ├── UptimeCard.tsx               # System info & uptime
│   ├── MetricCard.tsx               # Reusable card wrapper
│   ├── StatusBadge.tsx              # Normal/High/Critical badge
│   └── ChartWrapper.tsx             # Recharts line chart wrapper
├── lib/
│   ├── systemInfo.ts                # systeminformation wrapper
│   ├── auth.ts                      # JWT sign/verify (jose)
│   └── types.ts                     # TypeScript types & utilities
├── middleware.ts                     # JWT auth middleware
├── .env.local                       # Environment variables
└── next.config.ts                   # Next.js config
```

---

## Default Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> **⚠️ Change these** in `.env.local` before deploying to production!

---

## Environment Variables

Create or edit `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password
JWT_SECRET=your-very-secure-random-secret-at-least-32-chars
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Production Build

```bash
npm run build
npm start
```

---

## Deploy on Ubuntu / Debian VPS

### 1. Install Node.js (via NVM — recommended)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node -v
npm -v
```

### 2. Clone and Set Up the Project

```bash
# Clone your repo (or upload files)
git clone https://github.com/your-username/aghatis-resource-monitor.git
cd aghatis-resource-monitor

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
nano .env.local   # Edit credentials and JWT_SECRET
```

### 3. Build the App

```bash
npm run build
```

### 4. Install and Configure PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the app with PM2
pm2 start npm --name "aghatis-monitor" -- start

# Save PM2 process list (auto-restart on reboot)
pm2 save

# Set PM2 to start on system boot
pm2 startup
# → Run the command that PM2 outputs
```

### 5. Useful PM2 Commands

```bash
pm2 status                  # View running processes
pm2 logs aghatis-monitor    # View logs
pm2 restart aghatis-monitor # Restart the app
pm2 stop aghatis-monitor    # Stop the app
pm2 delete aghatis-monitor  # Remove from PM2
```

### 6. Reverse Proxy with Nginx (Optional)

```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/monitor
```

Paste:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Tech Stack

| Technology         | Purpose                        |
|--------------------|--------------------------------|
| Next.js 16         | App Router, API Routes         |
| TypeScript         | Type safety                    |
| TailwindCSS 4      | Styling                        |
| Recharts           | Live charts                    |
| systeminformation  | Server-side system metrics     |
| jose               | JWT auth (Edge-compatible)     |

---

## License

MIT

# Enneagram Quiz — Raspberry Pi Deployment Guide

A self-hosted Enneagram personality assessment app built with Next.js and SQLite, designed to run continuously on a Raspberry Pi.

---

## Prerequisites

Install Docker and Docker Compose on your Raspberry Pi:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify it works:
```bash
docker --version
docker compose version
```

---

## Deploying the App

### 1. Copy the project to your Pi

From your Mac, use `scp` to transfer the folder:

```bash
scp -r /Users/patrick/Documents/proj/enneagram_quiz admin@192.168.6.50:~/enneagram_quiz
```

Or use a USB drive / git repository — any method works.

### 2. SSH into your Pi

```bash
ssh admin@192.168.6.50
```

### 3. Navigate to the project folder

```bash
cd ~/enneagram_quiz
```

### 4. Build and start the container

```bash
docker compose up -d --build
```

- `--build` compiles the Docker image from scratch (required on first run)
- `-d` runs it in the background (detached mode)

The first build will take **5–10 minutes** on a Pi as it compiles Next.js. Subsequent starts are instant.

### 5. Confirm it's running

```bash
docker compose ps
```

You should see `enneagram-quiz-app` with status `Up`.

The app is now available at: **http://192.168.6.50:19814**

---

## Managing the App

| Task | Command |
|---|---|
| View live logs | `docker compose logs -f` |
| Stop the app | `docker compose down` |
| Restart the app | `docker compose restart` |
| Update after code changes | `docker compose up -d --build` |
| Check status | `docker compose ps` |

---

## Database & Persistence

All quiz results are stored in a SQLite database file at:

```
~/enneagram_quiz/data/production.db
```

This file lives **outside** the Docker container in a mounted volume, so your data is safe even if you:
- Rebuild the image (`--build`)
- Update Docker
- Restart the Pi

> **Backup tip:** Periodically copy `data/production.db` to a safe location.

### Transferring local data to the Pi

To copy your Mac's local quiz database (sessions, results) to the Pi:

```bash
# Make sure the data folder exists on the Pi first
ssh admin@192.168.6.50 "mkdir -p ~/enneagram_quiz/data"

# Copy local dev database to Pi as production database
scp /Users/patrick/Documents/proj/enneagram_quiz/prisma/dev.db admin@192.168.6.50:~/enneagram_quiz/data/production.db
```

---

## Accessing the Admin Dashboard

Navigate to the app in your browser and click the small **hexagon icon** (⬡) in the top-right corner of the home page. This takes you to the admin dashboard where you can:

- View all completed assessments
- See each person's top Enneagram type
- Edit names
- Delete entries

---

## Auto-start on Boot

The `docker-compose.yml` already includes `restart: unless-stopped`, which means the app will **automatically restart** after a Pi reboot. No extra configuration needed.

To verify:
```bash
sudo reboot
# Wait ~60 seconds, then check:
docker compose -f ~/enneagram_quiz/docker-compose.yml ps
```

---

## Troubleshooting

**App won't start / port in use:**
```bash
sudo lsof -i :19814
```
Kill any conflicting process, then retry.

The `Dockerfile` runs `prisma db push` automatically on startup. If you see database errors, run manually:
```bash
docker compose exec enneagram-quiz-app npx prisma db push --accept-data-loss
```

**Rebuild from scratch:**
```bash
docker compose down
docker compose up -d --build
```

# Deploy to IONOS - Auto-Deploy Setup Guide

## Quick Start

Your NOCPC Concessions Inventory app is ready to deploy to IONOS with auto-deployment!

## Prerequisites

You need:
1. IONOS account (you have this ✓)
2. SSH access to IONOS server
3. GitHub account (you have this ✓)

---

## Step 1: Get Your IONOS SSH Credentials

1. Log in to IONOS control panel
2. Find "SSH Access" or "Server Access"
3. Get your:
   - **Server address** (e.g., server123.ionos.com)
   - **Username** (e.g., u12345678)
   - **Password** (or SSH key)

---

## Step 2: Connect via SSH

Open terminal/command prompt:

```bash
ssh username@server123.ionos.com
```

You'll be prompted for password.

---

## Step 3: Navigate to Web Root

```bash
cd htdocs
```

Or if using a different structure:
```bash
cd public_html
# or
cd www
```

Check what's there:
```bash
ls -la
```

---

## Step 4: Clone Your Repository

```bash
# Remove old files if needed (backup first!)
rm -rf *

# Clone your GitHub repository
git clone https://github.com/lwhobley/nola-park-inventory.git .

# Go into directory
cd nola-park-inventory

# Verify files are there
ls -la
```

---

## Step 5: Set Up Auto-Deploy with Webhook

### Option A: Simple Git Pull Script (Recommended)

Create a deploy script:

```bash
# Create deploy script
nano deploy.sh
```

Paste this:

```bash
#!/bin/bash

# Navigate to app directory
cd /home/u12345678/htdocs/nola-park-inventory

# Pull latest changes
git pull origin main

# Log the deployment
echo "Deployed at $(date)" >> deploy.log

# Permissions (if needed)
chmod -R 755 .
```

Save: `Ctrl+X` → `Y` → `Enter`

Make it executable:
```bash
chmod +x deploy.sh
```

### Option B: GitHub Webhook (Advanced)

If your IONOS supports webhooks:

1. Go to GitHub repo settings
2. Click "Webhooks"
3. Add webhook:
   - URL: `https://yoursite.com/deploy.php` (you'll create this)
   - Content type: `application/json`
   - Trigger on push

---

## Step 6: Create Deploy Trigger File

For easier testing, create a PHP deploy file:

```bash
nano deploy.php
```

Paste:

```php
<?php
// Simple deploy trigger
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $output = shell_exec('cd /home/u12345678/htdocs/nola-park-inventory && git pull origin main 2>&1');
    file_put_contents('deploy.log', date('Y-m-d H:i:s') . " - " . $output . "\n", FILE_APPEND);
    echo "Deployed successfully!";
} else {
    echo "Deploy script ready";
}
?>
```

---

## Step 7: Manual Test Deploy

```bash
cd /home/u12345678/htdocs/nola-park-inventory
git pull origin main
```

You should see:
```
Already up to date.
```

Or if there are changes:
```
Updating abc1234..def5678
Fast-forward
 file.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

---

## Step 8: Access Your App

Visit: `https://yoursite.com`

Your NOCPC Concessions Inventory app should be live!

---

## Step 9: Test Auto-Deploy

1. Make a small change to a file locally
2. Commit and push to GitHub:

```bash
git add .
git commit -m "Test deploy"
git push origin main
```

3. SSH into IONOS again:

```bash
cd /home/u12345678/htdocs/nola-park-inventory
git pull origin main
```

4. Refresh your browser - you should see the change!

---

## Automated Deploy (Optional)

### Using Cron Job for Auto-Pull

```bash
crontab -e
```

Add this line to pull every 5 minutes:

```
*/5 * * * * cd /home/u12345678/htdocs/nola-park-inventory && git pull origin main > /dev/null 2>&1
```

Now every 5 minutes, IONOS will automatically pull latest code from GitHub!

---

## File Structure

After cloning, your IONOS should look like:

```
/htdocs/
├── nola-park-inventory/
│   ├── public/
│   │   ├── index.html (your main app)
│   │   ├── manifest.json
│   │   ├── service-worker.js
│   │   └── _redirects
│   ├── .git/
│   ├── package.json
│   ├── README.md
│   └── ... (other files)
└── deploy.php (optional)
```

---

## Troubleshooting

**Problem: "Permission denied" when SSH**
- Check IONOS control panel for SSH access
- Ensure your IP isn't blocked
- Try FTP as backup

**Problem: "git command not found"**
- IONOS may not have Git installed
- Contact IONOS support or use FTP instead
- Or ask support to enable Git

**Problem: Files not updating**
- Check deploy.log: `tail -f deploy.log`
- Verify Git remote: `git remote -v`
- Test manual pull: `git pull origin main`

**Problem: Permission issues (777 errors)**
```bash
chmod -R 755 /home/u12345678/htdocs/nola-park-inventory
chmod -R 644 /home/u12345678/htdocs/nola-park-inventory/public/*
```

---

## One-Step Deploy (After Setup)

Once configured, deploying is easy:

**Option 1 - Manual:**
```bash
ssh user@ionos.com
cd htdocs/nola-park-inventory
git pull origin main
```

**Option 2 - Automated (with cron):**
Just `git push origin main` → IONOS pulls automatically!

---

## Support

If you need help:
1. Check IONOS SSH access in control panel
2. Verify Git is available: `which git`
3. Check PHP version: `php -v`
4. Review deploy.log for errors

---

## Next Steps

1. Follow steps 1-4 above to get SSH access
2. Clone the repository
3. Test the app is live
4. Set up auto-deploy script
5. Start making changes!

Every `git push` will update your live site! 🚀

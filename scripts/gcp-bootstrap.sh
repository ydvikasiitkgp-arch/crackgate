#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# CrackGate GCP bootstrap — run ONCE on a fresh GCP Compute Engine VM
# (Ubuntu 22.04/24.04, amd64 — e.g. e2-standard-2) as the provisioning
# account you chose at instance creation (root is locked on GCE images):
#     gcloud compute ssh <instance> --zone=<zone>
#     export SSH_PUBKEY="ssh-ed25519 AAAA... you@laptop"
#     curl -fsSL https://raw.githubusercontent.com/iamyadavvikas/crackgate/main/scripts/gcp-bootstrap.sh | sudo -E bash
#
# Cloud-specific notes (GCP):
#   • GCP VPC firewall rules are the real firewall — create an allow rule for
#     tcp:80,443 (default network already allows tcp:22) BEFORE this script,
#     or Let's Encrypt will fail later. UFW here is defense-in-depth only:
#       gcloud compute firewall-rules create allow-http-https \
#         --allow tcp:80,tcp:443 --direction INGRESS --source-ranges 0.0.0.0/0
#   • Point your A record (crackgate.in / www) at this VM's external IP after
#     bootstrap, then trigger the deploy from GitHub Actions.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ Run this script with sudo (e.g. 'sudo -E bash ...')." >&2
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_PUBKEY="${SSH_PUBKEY:-}"
APP_DIR="/opt/crackgate"
REPO_URL="${REPO_URL:-https://github.com/iamyadavvikas/crackgate.git}"
COMPOSE_FILE="docker-compose.cloud.yml"

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }

# ── 1. Base packages ────────────────────────────────────────────
log "Updating apt + installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  ufw fail2ban unattended-upgrades \
  htop git jq rsync tzdata

timedatectl set-timezone Asia/Kolkata

# ── 2. rclone (off-box backups via scripts/backup.sh) ───────────
if ! command -v rclone >/dev/null; then
  log "Installing rclone"
  curl -fsSL https://rclone.org/install.sh | bash
fi

# ── 3. Docker Engine + Compose plugin ───────────────────────────
if ! command -v docker >/dev/null; then
  log "Installing Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# Docker log rotation — no awslogs on cloud, so cap json-file sizes.
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  }
}
JSON
systemctl restart docker

# ── 4. Deploy user ──────────────────────────────────────────────
if ! id "$DEPLOY_USER" &>/dev/null; then
  log "Creating user '$DEPLOY_USER'"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG docker,sudo "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/docker, /usr/bin/apt-get" \
    > "/etc/sudoers.d/$DEPLOY_USER"
fi

if [[ -n "$SSH_PUBKEY" ]]; then
  log "Installing SSH key for $DEPLOY_USER"
  install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  echo "$SSH_PUBKEY" > "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

# ── 5. SSH hardening (only if deploy user has a working key) ────
AUTH_KEYS="/home/$DEPLOY_USER/.ssh/authorized_keys"
if [[ -s "$AUTH_KEYS" ]] && grep -qE '^(ssh-(rsa|ed25519|ecdsa)|ecdsa-sha2)' "$AUTH_KEYS"; then
  log "Hardening SSH (disable root + password login)"
  sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/'           /etc/ssh/sshd_config
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
  sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/'    /etc/ssh/sshd_config
  systemctl restart ssh || systemctl restart sshd
else
  echo "⚠️  SKIPPING SSH hardening — no authorized_keys for '$DEPLOY_USER'."
  echo "    Re-run with SSH_PUBKEY=\"<your-public-key>\" to harden."
fi

# ── 6. UFW (belt + suspenders alongside the GCP firewall rules) ─
log "Configuring UFW"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     comment 'SSH'
ufw allow 80/tcp     comment 'HTTP'
ufw allow 443/tcp    comment 'HTTPS'
ufw --force enable

# ── 7. fail2ban + auto-updates ─────────────────────────────────
log "Enabling fail2ban + unattended-upgrades"
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

# ── 8. Swap (2 GB — Next.js/Prisma builds spike) ───────────────
if [[ ! -f /swapfile ]]; then
  log "Creating 2 GB swapfile"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10 >/dev/null
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# ── 9. App directory + .env.production template ────────────────
log "Cloning repo into $APP_DIR (read-only HTTPS)"
if [[ ! -d "$APP_DIR/.git" ]]; then
  install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/opt"
  sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"
fi
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

if [[ ! -f "$APP_DIR/.env.production" ]]; then
  log "Creating .env.production from template"
  sudo -u "$DEPLOY_USER" cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production"
  chmod 600 "$APP_DIR/.env.production"
fi

# ── 10. ghcr-login systemd timer (refresh GHCR auth daily) ──────
cat > /usr/local/bin/ghcr-login.sh <<EOF
#!/usr/bin/env bash
set -e
USERNAME=\$(grep -E '^GHCR_USERNAME=' $APP_DIR/.env.production 2>/dev/null | cut -d= -f2- | tr -d '"' | tail -1)
TOKEN=\$(grep -E '^GHCR_TOKEN=' $APP_DIR/.env.production 2>/dev/null | cut -d= -f2- | tr -d '"' | tail -1)
if [ -n "\$USERNAME" ] && [ -n "\$TOKEN" ]; then
  echo "\$TOKEN" | docker login ghcr.io -u "\$USERNAME" --password-stdin
fi
EOF
chmod +x /usr/local/bin/ghcr-login.sh

cat > /etc/systemd/system/ghcr-login.service <<'EOF'
[Unit]
Description=Refresh GHCR docker login
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/ghcr-login.sh
EOF

cat > /etc/systemd/system/ghcr-login.timer <<'EOF'
[Unit]
Description=Refresh GHCR docker login daily

[Timer]
OnBootSec=2min
OnUnitActiveSec=24h
Persistent=true

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now ghcr-login.timer

# ── 11. systemd unit: crackgate compose stack (auto-start on boot) ──
cat > /etc/systemd/system/crackgate.service <<EOF
[Unit]
Description=CrackGate docker compose stack
After=docker.service ghcr-login.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
User=$DEPLOY_USER
WorkingDirectory=$APP_DIR
ExecStartPre=/usr/local/bin/ghcr-login.sh
# Fail closed at boot: refuse to start while .env.production still holds
# CHANGE_ME placeholders. Otherwise Postgres initializes its data dir with the
# placeholder password (it ignores POSTGRES_PASSWORD after first init), and
# every later deploy dies on auth with no recovery short of wiping pgdata.
ExecStartPre=/bin/sh -c 'if grep -q CHANGE_ME '$APP_DIR'/.env.production; then echo "refusing to start: '$APP_DIR'/.env.production still has CHANGE_ME placeholders — fill in real secrets first" >&2; exit 1; fi'
ExecStart=/usr/bin/docker compose -f $COMPOSE_FILE --env-file .env.production up -d
ExecStop=/usr/bin/docker compose -f $COMPOSE_FILE --env-file .env.production down
TimeoutStartSec=5min
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable crackgate.service
# Started by the GitHub Actions deploy, not at bootstrap — compose file is
# copied over by the workflow.

# ── 12. systemd timer: nightly pg_dump → rclone ─────────────────
cat > /etc/systemd/system/crackgate-backup.service <<EOF
[Unit]
Description=CrackGate nightly DB backup (backup.sh → rclone)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$DEPLOY_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/env COMPOSE_FILE=$COMPOSE_FILE BACKUP_DIR=/home/$DEPLOY_USER/backups $APP_DIR/scripts/backup.sh
EOF

cat > /etc/systemd/system/crackgate-backup.timer <<'EOF'
[Unit]
Description=Run CrackGate backup nightly at 19:30 UTC (01:00 IST)

[Timer]
OnCalendar=*-*-* 19:30:00
Persistent=true
RandomizedDelaySec=10min

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now crackgate-backup.timer

cat <<EOF

✅ GCP bootstrap complete.

  Architecture : $(dpkg --print-architecture)
  Docker       : $(docker --version 2>/dev/null || echo 'not installed')
  Public ports : 22, 80, 443 (UFW) — also verify the GCP firewall rule allows 80/443!

Next steps:
  1. exit
  2. Point your A record (crackgate.in / www) at this VM's external IP.
  3. Fill in the app secrets (Postgres, Auth, Razorpay, ...):
       ssh ${DEPLOY_USER}@<external-ip>
       nano /opt/crackgate/.env.production
     ⚠️  Until every CHANGE_ME is replaced, the stack refuses to start at boot.
  4. Off-box backups (STRONGLY recommended — a single VM is a SPOF and the
     nightly dump is local-only until you do this):
       ssh ${DEPLOY_USER}@<external-ip>
       rclone config            # add a remote, e.g. r2:crackgate-backups
       nano /opt/crackgate/.env.production   # set RCLONE_REMOTE=r2:crackgate-backups
       /opt/crackgate/scripts/backup.sh      # verify first upload
  5. Add GitHub repo secrets (GCP_HOST, GCP_SSH_KEY, GHCR_USERNAME,
     GHCR_TOKEN with read:packages, ...) and vars — see deploy-gcp.yml.
  6. Trigger "Deploy to GCP" from GitHub Actions (workflow_dispatch).

EOF

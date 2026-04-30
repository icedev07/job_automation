#!/bin/bash
set -e

# ── Build crontab from environment variables ─────────────────────────────────
# Defaults: scan Jobright every 2 hours, other boards every 4 hours.
# Override with CRON_JOBRIGHT, CRON_ZIPRECRUITER, etc.
CRON_JOBRIGHT="${CRON_JOBRIGHT:-0 */2 * * *}"
CRON_ZIPRECRUITER="${CRON_ZIPRECRUITER:-30 */4 * * *}"
CRON_GLASSDOOR="${CRON_GLASSDOOR:-0 */4 * * *}"
CRON_DICE="${CRON_DICE:-15 */4 * * *}"
CRON_SIMPLIFY="${CRON_SIMPLIFY:-45 */4 * * *}"

# Collect all env vars so cron jobs inherit them
printenv | grep -v "no_proxy" > /etc/environment

CRONTAB_FILE="/etc/cron.d/job-scanners"
cat > "$CRONTAB_FILE" << CRON_EOF
SHELL=/bin/bash
BASH_ENV=/etc/environment

# Jobright scanner
${CRON_JOBRIGHT} root cd /app && /usr/local/bin/npx tsx scripts/jobrightScan.ts >> /var/log/scanner-jobright.log 2>&1

CRON_EOF

# Only add optional scanners if their search URL is set
if [ -n "$ZIPRECRUITER_SEARCH_URL" ]; then
  echo "${CRON_ZIPRECRUITER} root cd /app && /usr/local/bin/npx tsx scripts/ziprecruiterScan.ts >> /var/log/scanner-ziprecruiter.log 2>&1" >> "$CRONTAB_FILE"
fi

if [ -n "$GLASSDOOR_SEARCH_URL" ]; then
  echo "${CRON_GLASSDOOR} root cd /app && /usr/local/bin/npx tsx scripts/glassdoorScan.ts >> /var/log/scanner-glassdoor.log 2>&1" >> "$CRONTAB_FILE"
fi

if [ -n "$DICE_SEARCH_URL" ]; then
  echo "${CRON_DICE} root cd /app && /usr/local/bin/npx tsx scripts/diceScan.ts >> /var/log/scanner-dice.log 2>&1" >> "$CRONTAB_FILE"
fi

if [ -n "$SIMPLIFY_SEARCH_URL" ]; then
  echo "${CRON_SIMPLIFY} root cd /app && /usr/local/bin/npx tsx scripts/simplifyScan.ts >> /var/log/scanner-simplify.log 2>&1" >> "$CRONTAB_FILE"
fi

# Trailing newline required by cron
echo "" >> "$CRONTAB_FILE"

chmod 0644 "$CRONTAB_FILE"

echo "──────────────────────────────────────────"
echo "Scanner service started"
echo "Active crontab:"
cat "$CRONTAB_FILE"
echo "──────────────────────────────────────────"

# Touch log files so tail doesn't fail
touch /var/log/scanner-jobright.log
touch /var/log/scanner-ziprecruiter.log
touch /var/log/scanner-glassdoor.log
touch /var/log/scanner-dice.log
touch /var/log/scanner-simplify.log

# Start cron in background, tail all logs in foreground
cron
exec tail -F /var/log/scanner-*.log

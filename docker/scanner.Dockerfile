# Scanner service: runs job board scrapers on a schedule (cron-driven).
# Requires Playwright Chromium for browser automation.
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    cron \
    procps \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# Install Playwright Chromium + its OS dependencies
RUN npx playwright install --with-deps chromium

COPY prisma ./prisma
RUN npx prisma generate

COPY lib        ./lib
COPY scripts    ./scripts
COPY generated  ./generated
COPY tsconfig.json ./

# Crontab is generated at runtime from env vars so users can tune schedules.
COPY docker/scanner-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Shared volumes
VOLUME ["/data/jobbot", "/data/resumes", "/data/resumes_mohan"]

ENTRYPOINT ["/entrypoint.sh"]

# Document generation worker: watches the DB and generates tailored
# resumes + cover letters via ChatGPT UI automation (Playwright).
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    procps \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# Playwright Chromium for ChatGPT UI automation
RUN npx playwright install --with-deps chromium

COPY prisma ./prisma
RUN npx prisma generate

COPY lib        ./lib
COPY scripts    ./scripts
COPY generated  ./generated
COPY tsconfig.json ./

# Shared volumes for templates, output, and browser profiles
VOLUME ["/data/jobbot", "/data/resumes", "/data/resumes_mohan"]

ENV BACKFILL_POLL_INTERVAL_SEC=120
ENV RESUMES_OUTPUT_DIR=/data/resumes
ENV MOHAN_RESUMES_OUTPUT_DIR=/data/resumes_mohan

CMD ["npx", "tsx", "scripts/backfillWatch.ts"]

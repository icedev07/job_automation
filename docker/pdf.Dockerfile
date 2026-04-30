# PDF converter service: watches for new .docx files and converts to PDF
# using LibreOffice in headless mode.
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-pdf.txt ./
RUN pip install --no-cache-dir -r requirements-pdf.txt

COPY scripts/convertDocxToPdf.py ./scripts/

# Shared volumes
VOLUME ["/data/resumes", "/data/resumes_mohan"]

ENV DOCX_PDF_WATCH_ROOTS="/data/resumes_mohan;/data/resumes"
ENV DOCX_PDF_WATCH_POLL_SECONDS=300
ENV DOCX_PDF_SUBDIR_WITHIN_DAYS=7

CMD ["python", "scripts/convertDocxToPdf.py", "--watch"]

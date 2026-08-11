#!/usr/bin/env bash
# make-decks.sh — convert all Girls Build Bots slide decks (Marp markdown) to
# editable PowerPoint (and optionally PDF) with one unified template.
#
# Usage:
#   ./make-decks.sh            # md -> pptx for every *-slides.md in this folder
#   ./make-decks.sh --pdf      # also produce PDFs (needs LibreOffice installed)
#
# Requirements: pandoc (pandoc.org), optionally LibreOffice for PDFs.
# The unified schema lives in girlsbuildbots-template.pptx — edit fonts/colors
# there ONCE (View > Slide Master in PowerPoint) and every future export follows.
#
# Google Slides: upload the .pptx files to Google Drive and open them —
# Drive converts to Google Slides automatically (or File > Import slides).

set -euo pipefail
TEMPLATE="girlsbuildbots-template.pptx"
mkdir -p decks-pptx decks-pdf

for md in *-slides.md; do
  base="${md%-slides.md}"
  # strip the Marp front-matter block (pandoc doesn't need it)
  sed '1{/^---$/{:a N;/\n---$/!ba;d}}' "$md" > "/tmp/$base.md"
  pandoc "/tmp/$base.md" -o "decks-pptx/$base.pptx" \
    --reference-doc="$TEMPLATE" --slide-level=1
  echo "✓ decks-pptx/$base.pptx"
  if [[ "${1:-}" == "--pdf" ]]; then
    soffice --headless --convert-to pdf --outdir decks-pdf "decks-pptx/$base.pptx" >/dev/null
    echo "✓ decks-pdf/$base.pdf"
  fi
done
echo "Done. Edit the markdown, re-run this script, and every deck stays on-theme."

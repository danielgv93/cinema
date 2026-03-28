#!/bin/bash
# Genera las imágenes preview (300px de ancho) a partir de las imágenes _full.
# Requiere ImageMagick (convert).
# Uso: ./generate-previews.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CARTELES_DIR="$SCRIPT_DIR/public/carteles"

for full in "$CARTELES_DIR"/*_full.jpg; do
  filename="$(basename "$full")"
  preview="${filename/_full/}"
  echo "Generando $preview desde $filename..."
  convert "$full" -resize 300x -quality 85 "$CARTELES_DIR/$preview"
done

echo "Hecho."

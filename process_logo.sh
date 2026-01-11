#!/bin/bash
# Process logo: remove text portion and center the graphic

cd "$(dirname "$0")"

# Get original dimensions
WIDTH=$(sips -g pixelWidth public/logo.png | awk '{print $2}')
HEIGHT=$(sips -g pixelHeight public/logo.png | awk '{print $2}')

echo "Original size: ${WIDTH}x${HEIGHT}"

# Calculate crop: remove bottom 30% (keep top 70%)
CROP_HEIGHT=$(echo "$HEIGHT * 0.7" | bc | cut -d. -f1)

# Crop to remove bottom text portion
sips -c "$WIDTH" "$CROP_HEIGHT" public/logo.png --out public/logo_cropped.png

# Create a new square image and center the cropped logo
# Use the original width as the square size
sips -z "$WIDTH" "$WIDTH" public/logo_cropped.png --out public/logo_centered.png

# Replace original
mv public/logo_centered.png public/logo.png
rm -f public/logo_cropped.png

echo "✓ Logo processed: Text removed, graphic centered in ${WIDTH}x${WIDTH} square"




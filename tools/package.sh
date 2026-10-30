#!/bin/sh
# Build the itch.io zip: index.html at the zip root.
set -e
cd "$(dirname "$0")/../game"
mkdir -p ../build
rm -f ../build/undertow.zip
zip -qr ../build/undertow.zip . -x "assets/preview.html" -x "assets/items/_testwrap.png"
cd ..
unzip -l build/undertow.zip | head -6
echo "---"
unzip -l build/undertow.zip | grep -c png | xargs echo "png files:"
echo "zip ready: build/undertow.zip"

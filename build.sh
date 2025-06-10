#!/usr/bin/env bash

./bin/tailwindcss-linux -i css/input.css -o tailwind.css

files=(
    "icons"
    "background.js"
    "content.js"
    "manifest.json"
    "sidebar.html"
    "sidebar.js"
    "tailwind.css"
)

echo "Archiving files"

zip -r perplexity-ai-sidebar.xpi "${files[@]}"
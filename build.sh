#!/usr/bin/env sh

./bin/tailwindcss-linux -i css/input.css -o src/tailwind.css

rm addon.zip

(cd src && zip -r -FS ../addon.zip ./*)

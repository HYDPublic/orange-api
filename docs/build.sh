#!/bin/sh

cat src/api.md src/authentication.md src/user.md src/habits.md > tmp.md
aglio -i tmp.md --theme flatly -o output/index.html
rm -f tmp.md
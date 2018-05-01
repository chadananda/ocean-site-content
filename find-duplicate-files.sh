#!/bin/bash
find . -type f -name "*.md" | awk -F '/' '{ print $3 }' | sort | uniq -c | sort | grep -P '^[\s]*2' | sed -e 's/^\s*2 //g' | xargs -I{} find . -type f -name {}
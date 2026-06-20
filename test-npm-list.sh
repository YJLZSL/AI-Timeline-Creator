#!/bin/bash
C:/Users/23501/.astrbot_launcher/components/nodejs/node.exe C:/Users/23501/.astrbot_launcher/components/nodejs/node_modules/npm/bin/npm-cli.js list -a --include=prod --include=optional --omit=dev --json --long --silent --loglevel=error > /dev/null 2>&1
echo "Exit code: $?"

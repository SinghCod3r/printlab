#!/bin/bash
IN_FILE="$1"
OUT_FILE="/tmp/captured_output.png"
echo "Converting $IN_FILE to $OUT_FILE" > /tmp/capture.log
gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r300 -sOutputFile="$OUT_FILE" "$IN_FILE"

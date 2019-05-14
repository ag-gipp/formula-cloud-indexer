#!/bin/bash

INPUTDIR=$1
DIRS=$(find $INPUTDIR -mindepth 1 -maxdepth 1 ! -path . -type d)

while read -r line; do
  ./worker.sh $line &
done <<< $DIRS

wait
echo "All processes completed."

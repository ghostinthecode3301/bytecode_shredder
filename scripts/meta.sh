#!/bin/bash

# This script compiles the contract with combined.json file and another meta about bin

# Check if a filename has been provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <ContractFileName>"
    exit 1
fi

CONTRACT_FILENAME=$1
solc ./contracts/"$CONTRACT_FILENAME".sol --bin --ast-compact-json --asm --combined-json bin-runtime,srcmap-runtime -o "$CONTRACT_FILENAME" --no-cbor-metadata --overwrite
solc --metadata ./contracts/"$CONTRACT_FILENAME".sol --output-dir "$CONTRACT_FILENAME" --overwrite


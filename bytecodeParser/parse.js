#!/usr/bin/env node
import * as fs from "fs";
import {program} from "commander";
import {findIndices} from "./sourceReader.js";

program
    .name('bytecode parser')
    .description('Parses a bytecode and saves it in a file as hexadecimal string')
    .version('6.6.6')
    .option('--source <source>', 'path to source .sol file')
    .option('--lines <i:f>', 'initial and final lines of code formatted like i:f')
    .option('--combined <combined>', 'path to json file that contains sourcemap & binary, produced by solc')
    .option('--name <name>', 'name of smart contract (most often similar to file name without .sol, is needed for parsing right sourcemap)')

program.parse(process.argv);
const options = program.opts()

//fetching stuff
const maps = JSON.parse(fs.readFileSync(options.combined).toString());
const sourceMap = maps.contracts[`${options.source}:${options.name}`]["srcmap-runtime"];
const bytecodeString = maps.contracts[`${options.source}:${options.name}`]["bin-runtime"];
const aimedLines = options.lines.split(':');

const bytes = [];
for (let i = 0; i < bytecodeString.length; i += 2) {
    bytes.push(parseInt(bytecodeString.substr(i, 2), 16));
}

const instructions = parseBytesToInstructions(bytes)
const formattedItems = scan(sourceMap.split(';'), sourceMapReducer, [0, 0, 0, '-', -1]);
const [initialIndex, finalIndex] = await findIndices(parseInt(aimedLines[0]), parseInt(aimedLines[1]), options.source)

console.log(`i:${instructions.length}; fmap: ${formattedItems.length}; map: ${sourceMap.split(';').length}`);

let result = '';
fs.writeFileSync('logs/logs.txt', '');

for (const [index, formattedItem] of formattedItems.entries()) {
    if (formattedItem[0] >= initialIndex && (formattedItem[0] + formattedItem[1]) <= finalIndex) {
        const hexString = instructions[index].map(byte => byte.toString(16).padStart(2, '0')).join('');
        logInstruction(formattedItem, hexString)
        result += hexString;
    }
}
console.log(`Indexes: ${initialIndex}:${finalIndex}`);
console.log(`Signature: ${result}`);

try {
    fs.writeFileSync(`res/${options.name}SignatureLines${aimedLines[0]}to${aimedLines[1]}`, result);
} catch (err) {
    console.log(err)
}

function logInstruction(mapUnit, instruction) {
    try {
        fs.appendFileSync(
            'logs/logs.txt',
            `Map unit data: ${mapUnit}, instruction: ${instruction}\n\n`
        );
    } catch (err) {
        console.log(err)
    }
}

function scan(items, reducer, initialValue) {
    let accumulator = initialValue;
    const result = [];

    for (const currValue of items) {
        //console.log(currValue)
        const curr = reducer(accumulator, currValue);
        accumulator = curr;

        //check-up that we work only with our main .sol file
        if (curr[2] === 0) result.push(curr);
    }

    return result;
}

function sourceMapReducer(accumulator, curr) {
    const parts = curr.split(':');
    const fullParts = [];
    for (let i = 0; i < 4; i++) {
        const fullPart = parts[i] ? parts[i] : accumulator[i];
        fullParts.push(fullPart);
    }

    return [
        parseInt(fullParts[0]),
        parseInt(fullParts[1]),
        parseInt(fullParts[2]),
        fullParts[3],
        accumulator[4] + 1
    ];
}

function parseBytesToInstructions(bytes) {
    const instructions = [];
    const firstPushInstructionCode = 0x5f; // Corresponds to PUSH0
    const lastPushInstructionCode = 0x7f;  // Corresponds to PUSH32

    let i = 0;
    while (i < bytes.length) {
        const byte = bytes[i];

        let instruction = [];
        if (firstPushInstructionCode <= byte && byte <= lastPushInstructionCode) {
            const pushDataLength = byte - firstPushInstructionCode;
            const pushDataStart = i + 1;
            const pushData = bytes.slice(pushDataStart, pushDataStart + pushDataLength);

            instruction = [byte, ...pushData];
            i += pushDataLength + 1;
        } else {
            instruction = [byte];
            i++;
        }
        instructions.push(instruction);
    }
    return instructions;
}
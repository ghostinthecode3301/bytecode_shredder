import events from 'events';
import fs from 'fs';
import readline from 'readline';

export async function findIndices(startLine, endLine, sourcePath) {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(sourcePath),
            crlfDelay: Infinity
        });

        let lineNumber = 1;
        let charIndex = 0;
        let initialCharIndex;
        let finalCharIndex;

        rl.on('line', (line) => {
            //console.log(`Line from file: ${line} | f: ${line[0]} | l: ${line.length} | c: ${charIndex}`);
            if (lineNumber === startLine) initialCharIndex = charIndex;
            charIndex += line.length;
            if (lineNumber === endLine) finalCharIndex = charIndex - 1;

            charIndex += (process.platform === "win32") ? 2 : 1; // Assuming Windows has '\r\n' and UNIX-like systems have '\n'
            lineNumber++;
        });

        await events.once(rl, 'close');

        console.log('Reading file line by line with readline done.');
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
        return [initialCharIndex, finalCharIndex]
    } catch (err) {
        console.error(err);
    }
}

//for correctness checks of findIndices
function charPos(str, char) {
    return str
        .split("")
        .map(function (c, i) { if (c === char) return i; })
        .filter(function (v) { return v >= 0; });
}
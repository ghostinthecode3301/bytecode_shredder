import fs from 'fs';
import {program} from "commander";


program
    .name('signatures comparison')
    .description('Compares 2 singatures')
    .version('6.6.6')
    .option('--paths <paths>', 'paths to signatures files')

program.parse(process.argv);
const options = program.opts()
const [path1, path2] = options.paths.split(',')

function compareFiles(file1Path, file2Path) {
    try {
        // Step 1: Read the contents of the files
        const data1 = fs.readFileSync(file1Path, 'utf-8');
        const data2 = fs.readFileSync(file2Path, 'utf-8');

        // Ensure both strings have the same length for comparison
        const length = Math.min(data1.length, data2.length);

        // Step 2: Compare symbols
        let similarCount = 0;
        for (let i = 0; i < length; i++) {
            if (data1[i] === data2[i]) {
                similarCount++;
            }
        }

        // Step 3: Calculate percentage similarity
        const similarityPercentage = (similarCount / length) * 100;

        // Step 4: Log percentage similarity
        console.log(`The similarity is ${similarityPercentage.toFixed(2)}%`);
    } catch (error) {
        console.error('Error reading or comparing files:', error);
    }
}

// Example usage:
compareFiles(path1, path2);

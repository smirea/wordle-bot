const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const userscriptPath = path.join(dist, 'wordle.userscript.js');
const localUserscriptPath = path.join(dist, 'wordle.userscript.local.js');
const packageJson = require('../package.json');
const bundleName = 'wordle.js';

const sourceCodeUrl = `https://raw.githubusercontent.com/smirea/wordle-bot/master/dist/${bundleName}?v=${packageJson.version}`;
const scriptUrl = `https://raw.githubusercontent.com/smirea/wordle-bot/master/dist/${path.basename(userscriptPath)}`;

const runCmd = (title, command) => {
    console.log('');
    console.log(title);
    console.log('$>', command);
    execSync(command, { stdio: 'inherit' });
}

runCmd(
    '🧩 Building Typescript to check for errors 🧩',
    'yarn build:tsc-errors',
);

runCmd(
    '🧩 Building bundle 🧩',
    'yarn build',
);

console.log('');
console.log('🧩 Create new UserScript version 🧩');
console.log('');

fs.writeFileSync(
    userscriptPath,
    `
// ==UserScript==
// @name            Wordle BOT
// @namespace       @github/wordle
// @version         ${packageJson.version}
// @author          smirea
// @description     https://github.com/smirea/wordle
// @icon            https://www.freeiconspng.com/uploads/letter-w-icon-png-13.png
// @match           https://www.powerlanguage.co.uk/wordle/*
// @require         ${sourceCodeUrl}
// @updateURL       ${scriptUrl}
// @downloadURL     ${scriptUrl}
// ==/UserScript==
    `.trim(),
);

fs.writeFileSync(
    localUserscriptPath,
    `
// ==UserScript==
// @name            Wordle BOT - local development
// @namespace       @github/wordle
// @version         ${packageJson.version}
// @author          smirea
// @description     https://github.com/smirea/wordle
// @icon            https://www.freeiconspng.com/uploads/letter-w-icon-png-13.png
// @match           https://www.powerlanguage.co.uk/wordle/*
// @require         file://${path.join(dist, bundleName)}
// ==/UserScript==

// ❗ NOTE: this is only for local development
    `.trim(),
);

runCmd(
    '🧩 Add bundle 🧩',
    'git add dist',
);

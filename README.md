### Wordle Helper

A [Tampermonkey] script that gives you [Wordle] hints

### Demo

![./demo.mov](./demo.mov)

### Install

1. Install [Tampermonkey] on Chrome (it should also work with Greasemonkey on Firefox, but it's not tested)
2. Import the script file from [./dist/wordle.userscript.js][userscript]
3. Go to [Wordle] and you should see the bo t in the top right corner

### Development
1. Install node modules via `yarn install` or `npm install`
2. Run `yarn watch` (or `yarn build` to only build once)
3. Load the development userscript into [Tampermonkey] from `./dist/wordle.userscript.local.js`

[Wordle]: https://www.powerlanguage.co.uk/wordle/
[Tampermonkey]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
[userscript]: ./dist/wordle.userscript.js

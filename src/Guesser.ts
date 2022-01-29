import defaultWords from './words-shamelessly-pulled-from-the-source-code.json';

interface WordFrequency {
    map: Record<string, number>;
    list: Array<{
        str: string;
        count: number;
        frequency: number;
    }>;
}

export default class Guesser {
    wordSize: number;
    words: string[];

    constructor() {
        this.words = defaultWords;
        this.wordSize = this.words[0]?.length ?? 5;
    }

    getLetterFrequency(words = this.words, ignore: string[] = []): WordFrequency {
        const distribution: Record<string, number> = {};
        const ignoreMap = Object.fromEntries(ignore.map(x => [x, true]));

        for (const word of words) {
            for (let i = 0; i < word.length - 1; ++i) {
                const str = word[i];
                if (ignoreMap[str]) continue;
                distribution[str] = (distribution[str] || 0) + 1;
            }
        }

        const list = Object.entries(distribution)
            .map(([str, count]) => ({
                str,
                count,
                frequency: count / words.length / (this.wordSize - 1),
            }))
            .sort((a, b) => b.frequency - a.frequency)

        const map = Object.fromEntries(list.map(item => [item.str, item.frequency]));

        return { list, map };
    }

    getUniqueLetterWords(words: string[]) {
        return words.filter(word => {
            for (let i = 0; i < word.length - 1; ++i) {
                for (let j = i + 1; j < word.length; ++j) {
                    if (word[i] === word[j]) return false;
                }
            }
            return true;
        });
    }

    scoreWords(words: string[], letterFrequency?: WordFrequency) {
        letterFrequency = letterFrequency || this.getLetterFrequency(words);
        const sorted = words
            .map(word => {
                let score = 0;
                const used: Record<string, boolean> = {};
                for (const ch of word) {
                    if (used[ch]) continue;
                    used[ch] = true;
                    score += (letterFrequency!.map[ch] || 0);
                }
                return { word, score };
            })
            .sort((a, b) => b.score - a.score);

        return sorted;
    }

    getGuess(previous: Guess[]) {
        const letterFrequency = this.getLetterFrequency();
        const currentGuessNumber = previous.length + 1;
        const isEarlyGuess = currentGuessNumber <= 2;
        let present: string[] = [];
        let absent: Record<string, boolean> = {};
        const letters: Array<{ correct?: string; choices: string[] }> = (
            new Array(this.wordSize)
                .fill(null)
                .map(() => ({
                    choices: letterFrequency.list.map(letter => letter.str),
                }))
        );
        const removeChar = (list: string[], char: string) => {
            const index = list.indexOf(char);
            if (index > -1) list.splice(index, 1);
        }

        // compute list of allowed characters at every position
        for (const guess of previous) {
            for (const [index, { status, char }] of guess.entries()) {
                if (status === 'correct') {
                    letters[index].correct = char;
                    letters[index].choices = [];
                    continue;
                }

                if (status === 'present') {
                    present.push(char);
                    removeChar(letters[index].choices, char);
                    continue;
                }

                absent[char] = true;
                letters.forEach(lt => removeChar(lt.choices, char));
            }
        }

        let options = this.words;

        const filters = {
            removeCorrectLetters: () => {
                for (const { correct } of letters.filter(lt => lt.correct)) {
                    removeChar(present, correct!);
                    letters.forEach(lt => removeChar(lt.choices, correct!));
                }
            },
            removePresentLetters: () => {
                for (const char of Array.from(present)) {
                    removeChar(present, char);
                    letters.forEach(lt => removeChar(lt.choices, char));
                }
            },
            ensurePresentLetters: () => {
                options = options.filter(word => present.every(char => word.includes(char)));
            },
            /** has all correct characters in the right position */
            ensureCorrectLetters: () => {
                options = options.filter(word =>
                    word
                        .split('')
                        .every((char, index) =>
                            !letters[index].correct || char === letters[index].correct
                        )
                );
            },
            /** only has possible characters at every position */
            ensureValidLettersAtEachIndex: () => {
                options = options.filter(word =>
                    word
                        .split('')
                        .every((char, index) =>
                            letters[index].correct || letters[index].choices.includes(char)
                        )
                );
            },
            useUniqueLettersIfPossible: () => {
                // exhaust all unique character words first
                const optionsWithUniqueChars = this.getUniqueLetterWords(options);
                if (optionsWithUniqueChars.length) options = optionsWithUniqueChars;
            },
        } as const;

        // for the first few guesses, enforce unique characters
        if (isEarlyGuess) {
            filters.removeCorrectLetters();
            filters.removePresentLetters();
        } else {
            filters.ensurePresentLetters();
            filters.ensureCorrectLetters();
        }

        filters.ensureValidLettersAtEachIndex();
        filters.useUniqueLettersIfPossible();

        const optionsWordFrequency = this.getLetterFrequency(
            options,
            [
                ...Object.keys(absent),
                ...letters.map(lt => lt.correct).filter(x => x) as string[],
            ],
        );
        const sortedOptions = this.scoreWords(options, optionsWordFrequency);

        return { word: sortedOptions[0]?.word, options: sortedOptions };
    }
}

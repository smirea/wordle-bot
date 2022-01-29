import Guesser from './Guesser';

export function simulateGuess({ correct, guess }: { correct: string; guess: string; }) {
    if (correct.length !== guess.length) throw new Error(`guess has different length`);

    const result: Guess = [];
    const charMap: Record<string, boolean> = {};

    for (let i = 0; i < correct.length; ++i) charMap[correct[i]] = true;

    for (let i = 0; i < guess.length; ++i) {
        const char = guess[i];
        result.push(
            correct[i] === char
                ? { status: 'correct', char }
                : {
                    char,
                    status: charMap[char] ? 'present' : 'absent',
                }
        );
    }

    return result;
}

export function simulateGame(correct: string) {
    const guesser = new Guesser();
    const guesses: Guess[] = [];

    const done = (result: { success: boolean; word?: string; count?: number; }) => ({
        ...result,
        correct,
        path: guesses.map(list => list.map(lt => lt.char).join('')),
        guesses,
    });

    for (let count = 1; count <= 6; ++count) {
        const { word } = guesser.getGuess(guesses);
        const result = simulateGuess({ guess: word, correct });
        guesses.push(result);

        if (result.every(x => x.status === 'correct')) {
            return done({ success: true, word, count });
        }
    }

    return done({ success: false });
}

export function printSimulation({ guesses }: Pick<ReturnType<typeof simulateGame>, 'guesses'>) {
    for (const row of guesses) {
        console.log(
            '%s %s',
            row.map(lt => ({ correct: '🟩', present: '🟨', absent: '⬛' })[lt.status]).join(''),
            row.map(lt => lt.char.toUpperCase() + ' ').join(''),
        )
    }
}

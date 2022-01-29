import Guesser from '../Guesser';
import { printSimulation, simulateGame } from '../simlulation';
import { $, $$, INSTANCE_VAR } from './utils';

// printSimulation(simulateGame('knoll'));

const ID = INSTANCE_VAR;

interface State {
    spoiler: Spoiler;
}

enum Spoiler {
    'NONE',
    'ONE_HINT',
    'MORE_HINTS',
    'FIREHOSE',
}

export default class UI {
    container: HTMLDivElement;

    state: State = {
        spoiler: Spoiler.NONE,
    };

    stateHash = '';

    constructor() {
        $$('#' + ID).forEach(el => el.remove());
        this.container = document.createElement('div');
        this.container.setAttribute('id', ID);
        document.body.appendChild(this.container);
    }

    start() {
        document.body.addEventListener('click', this.renderHandler);
        document.body.addEventListener('keypress', this.renderHandler);
        this.render();
    }

    stop() {
        document.body.removeEventListener('click', this.renderHandler);
        document.body.removeEventListener('keypress', this.renderHandler);
    }

    renderHandler = () => setTimeout(() => this.render(), 10);

    update(diff: Partial<State>) {
        this.state = { ...this.state, ...diff };
        this.render();
    }

    getPreviousGuesses() {
        const root = $('game-app')!.shadowRoot!;
        const guesses: Guess[] = [];

        $$('game-row', root).forEach(row => {
            const guess: Guess = [];

            $$('game-tile', row.shadowRoot!).forEach(tile => {
                guess.push({
                    char: tile.getAttribute('letter')!,
                    status: tile.getAttribute('evaluation') as any,
                });
            });

            if (guess.every(g => g.char && g.status)) guesses.push(guess);
        });

        return guesses;
    }

    updateEvent(diff: Partial<State>) {
        return `${INSTANCE_VAR}.update(${JSON.stringify(diff)})`;
    }

    renderContent() {
        const { spoiler } = this.state;

        const nextSpoilerConfig = {
            [Spoiler.NONE]: {
                title: 'No Spoilers!',
                button: 'Spoil me a bit',
            },
            [Spoiler.ONE_HINT]: {
                title: 'Spoil the next best guess',
                button: 'Ok, more, spoil me a lot!',
            },
            [Spoiler.MORE_HINTS]: {
                title: 'Show me the top choices',
                button: 'I have no shame, show me everything',
            },
            [Spoiler.FIREHOSE]: {
                title: 'Firehose',
                button: 'I grew a conscious, no more spoilers',
            },
        }[spoiler];

        const spoilerButton = `
            <div>
                <button
                    type='button'
                    onclick='${this.updateEvent({ spoiler: (spoiler + 1) % (Object.keys(Spoiler).length / 2) })}'
                    class='${ID}_spoiler'
                >${nextSpoilerConfig.button}</button>
            </div>
        `;

        const renderBody = (body?: string) => `
            <div class='${ID}_content'>
                <div class='${ID}_title'>🤖 ${nextSpoilerConfig.title}</div>
                ${body && `<div class='${ID}_body'>${body}</div>` || ''}
                ${spoilerButton}
            </div>
        `;

        if (spoiler === Spoiler.NONE) return renderBody();

        const previous = this.getPreviousGuesses();
        const guesser = new Guesser();
        const { word = '', options } = guesser.getGuess(previous);
        const formatGuess = (guess: string) =>
            `<span class='${ID}_guess'>
                ${renderList(
                    guess.toUpperCase().split(''),
                    letter => `<span class='${ID}_letter'>${letter}</span>`,
                )}
                <span class='${ID}_guess-ghost'>${guess}</span>
            </span>`;
        const renderList = <T extends any, >(arr: T[], cb: (item: T, index: number) => any) =>
            arr.map(cb).filter(x => x && String(x).trim()).join('');

        if (spoiler === Spoiler.ONE_HINT) {
            return renderBody(`next best guess: ${formatGuess(word)}`);
        }

        if (spoiler === Spoiler.MORE_HINTS) {
            return renderBody(`
                <div style='margin-bottom: var(--margin)'>Top 10 best guesses</div>

                ${renderList(options.slice(0, 10), ({ score, word }) => `<div>${formatGuess(word)}</div>`)}
            `);
        }

        if (spoiler === Spoiler.FIREHOSE) {
            const max = 500;
            const indexedOptions = options.map((opt, index) => ({ ...opt, index }));

            const renderOptions = (list: typeof indexedOptions) =>
                renderList(list, ({ score, word, index }) => `
                    <div style='display: flex; align-items: center'>
                        <div style='min-width: 40px; margin-right: var(--margin); text-align: right'>${index + 1})</div>
                        <div>${formatGuess(word)}</div>
                        <div style='margin-left: var(--margin); font-family: monospace;'>score: ${score.toFixed(4)}</div>
                    </div>
                `);

            return renderBody(`
                <div style='margin-bottom: var(--margin)'>There are ${options.length} possibilities</div>
                <div style='max-height: 50vh; overflow-y: auto;'>
                    ${options.length >= max * 1.1
                        ? [
                            renderOptions(indexedOptions.slice(0, max / 2)),
                            `<div style='margin: calc(2 * var(--margin)) 0;'> ... Saving you from yourself by hiding ${indexedOptions.length - max} options ... </div>`,
                            renderOptions(indexedOptions.slice(-1 * max)),
                        ].join('')
                        : renderOptions(indexedOptions)
                    }
                </div>
            `);
        }

        return renderBody('invalid state');
    }

    render() {
        const nextHash = JSON.stringify(this.state) + localStorage.gameState;
        if (nextHash === this.stateHash) return;
        this.stateHash = nextHash;
        this.container.innerHTML = `
            <style>${STYLE}</style>
            ${this.renderContent()}
        `;
    }
}

const STYLE = `
    #${ID} {
        --bg: #1F4B99;
        --fg: white;
        --border: #4580E6;
        --margin: .375rem;

        position: absolute;
        top: 0;
        right: 0;
        padding: var(--margin);
        // border: 1px solid var(--border);
        background: var(--bg);
        color: var(--fg);
        font-size: .875rem;
    }

    #${ID}, #${ID} * {
        box-sizing: border-box;
        font-family: system-ui, tahoma, arial;
    }

    .${ID}_title {
        border-bottom: 1px solid white;
        margin: calc(-1 * var(--margin));
        margin-bottom: var(--margin);
        padding: var(--margin);
        background: var(--fg);
        color: var(--bg);
        font-weight: bold;
    }

    .${ID}_body {
        margin: calc(2 * var(--margin)) 0;
    }

    .${ID}_guess {
        position: relative;
    }

    .${ID}_guess-ghost {
        position: absolute;
        bottom: 100%;
        left: 40%;
        color: transparent;
        pointer-events: none;
    }

    .${ID}_letter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 2px;
        background: #fafafa;
        color: black;
        width: 1.25rem;
        height: 1.25rem;
        text-transform: uppercase;
    }

    .${ID}_spoiler {
        padding: calc(var(--margin) * .75);
    }
`;

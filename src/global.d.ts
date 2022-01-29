interface Window {
    unsafeWindow?: this;
}

declare module '*.styl' {
    const styles: Record<string, string>;
    export default styles;
}

interface Letter {
    char: string;
    status: 'present' | 'absent' | 'correct'; // the actual wordle terminiology
}

type Guess = Letter[];

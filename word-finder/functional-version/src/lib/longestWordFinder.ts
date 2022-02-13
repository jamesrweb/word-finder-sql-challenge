import { promises } from "fs";
import { EOL } from "os";

type Dictionary = Array<string>;
type CharacterCounts = Map<string, number>;
type LongestWordFinderConfiguration = {
    inputCharactersString: string,
    dictionary?: Dictionary,
    fileUrl?: URL
};

function isAlphaCharacter(character: string) {
    return /[a-zA-Z]/.test(character);
}

function charachtersFromString(string: string) {
    return string.split("");
}

function longestWordsReducer(accumulator: string[], entry: string) {
    if (accumulator[0] === undefined) {
        return [entry];
    }

    const { length: entryLength } = entry;
    const { length: currentLongestWordLength } = accumulator[0];

    if (entryLength > currentLongestWordLength) {
        return [entry];
    }

    if (entryLength === currentLongestWordLength) {
        return accumulator.concat(entry);
    }

    return accumulator;
}

function characterCounts(word: string) {
    const counts: CharacterCounts = new Map();

    charachtersFromString(word).forEach(character => {
        const currentCharacterCount = counts.get(character) ?? 0;

        counts.set(character, currentCharacterCount + 1)
    });

    return counts;
}

function isValidEntryForWord(word: string, entry: string) {
    let entryCharacterCounts = characterCounts(entry);
    let wordCharacterCounts = characterCounts(word);

    for (const [character, count] of wordCharacterCounts.entries()) {
        const currentEntryCharacterCount = entryCharacterCounts.get(character);

        if (currentEntryCharacterCount === undefined) {
            continue;
        }

        entryCharacterCounts.set(character, currentEntryCharacterCount - count);
    }

    return [...entryCharacterCounts.values()].every(value => value <= 0);
}


function isValidInputCharacterString(word: string) {
    const wordIsWithinLengthBounds = word.length <= 12;
    const wordIsAlphaOnly = [...word].every(isAlphaCharacter);

    return wordIsWithinLengthBounds && wordIsAlphaOnly;
}

function longestWord(word: string, dictionary: Dictionary) {
    return dictionary
        .filter(entry => isValidEntryForWord(word, entry))
        .reduce(longestWordsReducer, [])
        .shift();
}

function longestConstructableWordInDictionary(word: string, dictionary: Dictionary) {
    return longestWord(word, dictionary);
}

async function longestConstructableWordInLocalFileDictionary(word: string, fileUrl: URL) {
    const fileContents = await promises.readFile(fileUrl, "utf8");
    const localFileDictionary = fileContents.split(EOL);

    return longestWord(word, localFileDictionary);
}

export async function longestWordFinder({ inputCharactersString, dictionary, fileUrl }: LongestWordFinderConfiguration) {
    if (!isValidInputCharacterString(inputCharactersString)) {
        return undefined;
    }

    if (dictionary !== undefined) {
        return longestConstructableWordInDictionary(inputCharactersString, dictionary);
    }

    if (fileUrl !== undefined) {
        return await longestConstructableWordInLocalFileDictionary(inputCharactersString, fileUrl);
    }

    return undefined;
}
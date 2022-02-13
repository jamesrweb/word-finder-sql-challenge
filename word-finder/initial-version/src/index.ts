import { promises } from "fs";
import { EOL } from "os";

type Dictionary = Array<string>;
type CharacterCounts = Map<string, number>;

const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97));
const dictionaryList: Dictionary = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune'
];

function possibleMatchingEntryForWord(word: string) {
  return (entry: string) => isValidEntryForWord(word, entry);
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

  [...word].forEach(character => {
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

function longestWord(word: string, dictionary: Dictionary) {
  return dictionary
    .filter(possibleMatchingEntryForWord(word))
    .reduce(longestWordsReducer, [])
    .shift();
}

class TaskWordFinder {
  public longest = "";

  public async longestWordFinder(word: string, filename?: string) {
    if (!this.isValidSearchString(word)) {
      return this.longest;
    }

    if (filename === undefined) {
      this.longest = longestWord(word, dictionaryList) ?? this.longest;

      return this.longest;
    }

    const file_url = new URL(filename, import.meta.url);
    const file_contents = await promises.readFile(file_url, "utf8");
    const dictionary = file_contents.split(EOL);

    if (!this.isValidDictionary(dictionary)) {
      return this.longest;
    }

    this.longest = longestWord(word, dictionary) ?? this.longest;
    return this.longest;
  }

  private isValidSearchString(word: string) {
    return word.length <= 12 && [...word].every(letter => alphabet.includes(letter));
  }

  private isValidDictionary(dictionary: Dictionary) {
    const whitespaceCharacters = [' ', '\t', '\n', '\r'];

    return dictionary.length > 0 && dictionary.every(line => !whitespaceCharacters.some(whitespaceCharacter => line.includes(whitespaceCharacter)));
  }
}

async function main() {
  const taskWordFinder = new TaskWordFinder();

  console.log({
    part_one: await taskWordFinder.longestWordFinder("ajsxuytcnhre"),
    part_two: await taskWordFinder.longestWordFinder("optonoceari", "input.txt")
  });
}

main();
import { longestWordFinder } from "./lib/longestWordFinder.js";
import { prettyPrint } from "./utils/prettyPrint.js";

const defaultDictionary = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune'
];

async function main() {
  const exampleOutput = await longestWordFinder({
    inputCharactersString: "ajsxuytcnhre",
    dictionary: defaultDictionary
  });
  const actualTestOutput = await longestWordFinder({
    inputCharactersString: "optonoceari",
    fileUrl: new URL("input.txt", import.meta.url)
  });
  const output = prettyPrint({
    exampleOutput,
    actualTestOutput
  });

  console.log(output);
}

main();
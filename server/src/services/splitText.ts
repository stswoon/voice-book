import {SILERO_MAX_LEN} from "./typesAndConsts";

export function splitText(text: string, maxLen: number = SILERO_MAX_LEN): string[] {
    let items = splitTextSimple(text);
    items = splitLongSentence(items, maxLen);
    items = optimizeSentence(items, maxLen);
    return items;
}

function splitTextSimple(text: string): string[] {
    text = text.trim();

    const replacer = (match: string, p1: string): string => p1 + "${splitter}";
    text = text.replace(/([.?!]+)/g, replacer);
    let items = text.split("${splitter}");

    items = items
        .map(item => {
            //if sentence contains only special symbols it cause error in TTS so make such sentence empty
            let tmp = item.replace(/[A-Za-zА-Яа-я]*/gi, "");
            if (tmp.length === item.length) {
                return "";
            } else {
                return item.trim();
            }
        })
        .filter(item => item.length !== 0); //skip all empty sentences

    return items;
}

function splitLongSentence(items: string[], maxLen: number) {
    const items2 = [];
    for (let item of items) {
        if (item.length < maxLen) {
            items2.push(item);
        } else {
            let words = item.split(" ")
            words = optimizeSentence(words, maxLen);
            words.forEach(word => items2.push(word))
        }
    }
    return items2;
}

function optimizeSentence(items: string[], maxLen): string[] {
    const optimizedItems = [];
    let i = 0;
    let optimizedItem = items[i];
    while (i < items.length) {
        if (optimizedItem.length > maxLen) {
            console.warn("Sentence too big, try to split in the middle");
            const part1 = optimizedItem.substring(0, maxLen);
            const part2 = optimizedItem.substring(maxLen, optimizedItem.length);
            if (part1.trim().length) {
                optimizedItems.push(part1.trim());
            }
            if (part2.trim().length) {
                optimizedItems.push(part2.trim());
            }
            optimizedItem = "";
            if (part2.length > maxLen) {
                throw new Error("sentence too big even after splitting onto two parts")
            }
        } else {
            if (i + 1 < items.length) { //next element exists
                if (optimizedItem.length + items[i + 1].length + 1 < maxLen) { //+1 for space
                    optimizedItem += " " + items[i + 1];
                } else {
                    optimizedItems.push(optimizedItem);
                    optimizedItem = items[i + 1];
                }
            } else { //no more next elements
                optimizedItems.push(optimizedItem);
                optimizedItem = "";
            }
        }
        ++i;
    }
    return optimizedItems;
}

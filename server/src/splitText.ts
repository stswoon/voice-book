const SILERO_MAX_LEN = 900; //sometimes fails if near 1000

//seems split by sentence is better for sounds
export function splitTextSimple(text: string): string[] {
    text = text.trim();
    // const replacer = (match: string, p1: string, offset: number, string: string): string => {
    const replacer = (match: string, p1: string): string => {
        return p1 + "${splitter}";
    };
    text = text.replace(/([.?!]+)/g, replacer);
    let items = text.split("${splitter}");
    items = items
        .map(item => item.trim())
        .filter(item => item.length !== 0);

    // text = text.trim();
    // let items = text.split(/[.?!]+/);
    // items = items.filter(item => {
    //     return item.trim().length !== 0;
    // });
    return items;
    //TODO trim non alphabet
    //TODO use MAX_SILERO
    //TODO show errors on user screen
}

export function splitText(text: string, maxLen: number = SILERO_MAX_LEN): string[] {
    const items = splitTextSimple(text);

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

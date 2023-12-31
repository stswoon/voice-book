import {format} from "@vicimpa/rubles";


export function translitDigits(s: string) {
    const replacer = (match: string) => {
        return format(match, "$summString");
    };
    s = s.replace(/\d+/g, replacer);
    return s;
}

export function translitToRussian(s: string): string {
    function safeTranslit(char: string) {
        switch (char) {
            case "A":
                return "А";
            case "a":
                return "a";
            case "B":
                return "Б";
            case "b":
                return "б";
            case "C":
                return "Ц";
            case "c":
                return "ц";
            case "D":
                return "Д";
            case "d":
                return "д";
            case "E":
                return "И";
            case "e":
                return "и";
            case "F":
                return "Ф";
            case "f":
                return "ф";
            case "G":
                return "Г";
            case "g":
                return "г";
            case "H":
                return "Х";
            case "h":
                return "х";
            case "I":
                return "И";
            case "i":
                return "и";
            case "J":
                return "Ж";
            case "j":
                return "ж";
            case "K":
                return "К";
            case "k":
                return "к";
            case "L":
                return "Л";
            case "l":
                return "л";
            case "M":
                return "М";
            case "m":
                return "м";
            case "N":
                return "Н";
            case "n":
                return "н";
            case "O":
                return "О";
            case "o":
                return "о";
            case "P":
                return "П";
            case "p":
                return "п";
            case "Q":
                return "К";
            case "q":
                return "к";
            case "R":
                return "Р";
            case "r":
                return "р";
            case "S":
                return "С";
            case "s":
                return "с";
            case "T":
                return "Т";
            case "t":
                return "т";
            case "U":
                return "У";
            case "u":
                return "у";
            case "V":
                return "В";
            case "v":
                return "в";
            case "W":
                return "В";
            case "w":
                return "в";
            case "X":
                return "Экс";
            case "x":
                return "экс";
            case "Y":
                return "Й";
            case "y":
                return "й";
            case "Z":
                return "З";
            case "z":
                return "з";
        }
        return char;
    }

    let result = "";
    for (let i = 0; i < s.length; ++i) {
        result += safeTranslit(s[i]);
    }
    return result
}

//add point after enter for voice pause
export function pointAfterBeforeEnter(s: string): string {
    const punctuation = [".", ",", "!", "?", ";", ":"];
    const splitenters = s.split("\n");
    for (let i = 0; i < splitenters.length; ++i) {
        let item = splitenters[i];
        if (!punctuation.includes(item[item.length -1]) && item.trim().length !== 0) {
            splitenters[i] = item + ".";
        }
    }
    return splitenters.join("\n");
}

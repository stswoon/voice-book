import assert from "assert";
import {translitDigits} from "./textTranslits";

describe('translitDigits', () => {
    it('simple', () => {
        assert.deepStrictEqual(translitDigits("123"), "сто двадцать три");
    });
    it('empty', () => {
        assert.deepStrictEqual(translitDigits(""), "");
    });
    it('complex', () => {
        assert.deepStrictEqual(translitDigits("привет 2123 как 45 дела"), "привет две тысячи сто двадцать три как сорок пять дела");
    });
});



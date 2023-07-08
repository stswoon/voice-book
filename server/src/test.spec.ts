import {splitText} from "./generateVoiceBookRoute";
import assert from "assert";


describe('splitText', () => {
    it('empty', () => {
        assert.deepStrictEqual(splitText(""), []);
    });
    it('simple', () => {
        assert.deepStrictEqual(splitText("hello"), ["hello"]);
    });
    it('two works', () => {
        assert.deepStrictEqual(splitText("hello.world"), ["hello", "world"]);
    });
});

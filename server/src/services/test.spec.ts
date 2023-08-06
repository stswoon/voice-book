import assert from "assert";
import {splitText} from "./splitText";


describe('splitText', () => {
    it('empty', () => {
        assert.deepStrictEqual(splitText(""), []);
    });
    it('simple', () => {
        assert.deepStrictEqual(splitText("hello"), ["hello"]);
    });
    it('two works', () => {
        assert.deepStrictEqual(splitText("hello.world", 6), ["hello.", "world"]);
    });
    it('different symbols', () => {
        assert.deepStrictEqual(splitText("a. b! c? d", 2), ["a.", "b!", "c?", "d"]);
    });
    it('several symbols', () => {
        assert.deepStrictEqual(splitText("a... bb!! c???? ddd. ee!? fffff", 5), ["a...", "bb!!", "c????", "ddd.", "ee!?", "fffff"]);
    });
    it('zapytaa', () => {
        assert.deepStrictEqual(splitText("a,b;c:d e"), ["a,b;c:d e"]);
    });
    it('trim', () => {
        assert.deepStrictEqual(splitText("  a  "), ["a"]);
    });
    it('trim and remove empty arrays', () => {
        assert.deepStrictEqual(splitText("  a  .  .  b  ", 4), ["a  .", "b"]);
    });
    it('enters', () => {
        assert.deepStrictEqual(splitText("a\nb"), ["a\nb"]);
    });
    it('splits according to maxLen', () => {
        assert.deepStrictEqual(splitText("a. b. cccc11", 10), ["a. b.", "cccc11"]);
    });
    it('should split sentence in the middle if more then maxLen', () => {
        assert.deepStrictEqual(splitText("abcd efgh ijkl mnop", 10), ["abcd efgh", "ijkl mnop"]);
    });
    it('trim and remove empty arrays maxLen error', () => {
        assert.throws(() => splitText("  aaaa  .  .  b  ", 3));
    });
    it('word longer then maxLen', () => {
        assert.throws(() => splitText("0123456789a0123456789", 10));
    });
    it('skip if only non alphabetical symbols', () => {
        assert.deepStrictEqual(splitText("!}]"), []);
    });
    it('some real test', () => {
        const a = "Во все большем количестве российских изданий − как печатных, так и онлайновых − появляются объемные материалы особого типа, за которыми в журналистской среде закрепилось название «длинные тексты» (англ. – long forms) или лонгриды (от англ. − long read – материал, предназначенный для длительного прочтения, в отличие от маленькой заметки). Сразу же следует оговориться, что объем материала – хотя и наиболее заметная, но не ключевая характеристика лонгрида. Объемными могут быть и материалы других жанров, поэтому сам по себе большой объем текста вовсе не означает, что перед нами лонгрид. Как будет показано в исследовании, лонгриды отличает также особый подход к выбору темы, требования к качеству собранной информации и способ подачи материала."
        const b = "В исследовании предпринята попытка описать типологические характеристики лонгридов, разобрать особенности их подготовки, а также выявить распространенность лонгридов в современной российской прессе. Еще одной целью исследования является оценка перспектив этого жанра, о котором можно говорить если не как о сложившемся (в принятых на сегодняшний день в научной среде жанровых классификациях лонгрид отсутствует), то как о складывающемся и проникающем во все большее количество изданий."
        assert.deepStrictEqual(splitText(a + " " + b), [a, b]);
    });
});



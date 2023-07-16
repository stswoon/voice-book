import {Router} from "express";
import {uniqueNamesGenerator, adjectives, colors, animals} from "unique-names-generator";
import {translitToRussian} from "./textTranslits";
import {progress, startRemoveInterval} from "./globalProgress";
import {splitTextSimple} from "./splitText";
import {generateAudios} from "./pythonTts";
import {glueFiles} from "./ffmpegConvertor";


// startRemoveInterval();

export const generateVoiceBookRoutes = Router();

generateVoiceBookRoutes.post("/", async (req, res) => {
    const id = generateName();
    try {
        const text = req.body.text;
        progress[id] = {status: 'queue 1/1', startDate: (new Date()).getTime(), fileBuffers: {}}; //todo queue progress
        runVoiceBook(id, text)
            .then(() => progress[id].status = "ready")
            .catch(cause => {
                progress[id].status = "error";
                console.error("Error::" + cause);
            });
        return res.status(200).json({processId: id, status: progress[id].status});
    } catch (error) {
        progress[id].status = "error";
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey

async function runVoiceBook(id: string, text: string): Promise<void> {
    text = translitToRussian(text);
    // const textItems = splitText(text, SILERO_MAX_LEN);
    const textItems = splitTextSimple(text);
    if (textItems.length === 0) {
        progress[id].status = "error";
        console.error("empty text");
        throw new Error("empty text");
    }
    progress[id].length = textItems.length;
    await generateAudios(progress, textItems, id);
    await glueFiles(progress, id, textItems.length);
    progress[id].status = "ready";
}

generateVoiceBookRoutes.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (progress[id].outputFilePath) {
        return res.download(progress[id]!.outputFilePath!);
    } else if (progress[id].outputStream) {
        res.attachment('audio.mp3');
        progress[id].outputStream!.pipe(res);
    } else {
        res.status(404);
    }
});

generateVoiceBookRoutes.get("/progress/:id", async (req, res) => {
    const id = req.params.id;
    if (progress[id] == null) {
        return res.status(404).json({processId: id, status: "notExist"});
    } else {
        return res.status(200).json({processId: id, status: progress[id].status});
    }
});

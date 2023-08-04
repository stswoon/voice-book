import {Router} from "express";
import {uniqueNamesGenerator, adjectives, colors, animals} from "unique-names-generator";
import {translitToRussian} from "../services/textTranslits";
import {progress, startRemoveInterval} from "../services/globalProgress";
import {splitTextSimple} from "../services/splitText";
import {generateAudios} from "../services/pythonTts";
import {glueFiles} from "../services/ffmpegConvertor";

startRemoveInterval();

export const voiceBookRoutes = Router();

let isInProgress = false;

voiceBookRoutes.post("/generate", async (req, res) => {
    if (isInProgress) {
        return res.status(409).json({error: "Sorry, only one queue is supported now"});
    }
    const id = generateName();
    try {
        const text = req.body.text;
        progress[id] = {status: 'queue 1/1', startDate: (new Date()).getTime(), fileBuffers: {}}; //todo queue progress
        isInProgress = true;
        runVoiceBook(id, text)
            .then(() => {
                progress[id].status = "ready"
                isInProgress = false;
            })
            .catch(cause => {
                isInProgress = false;
                progress[id].status = "error";
                console.error("Error-runVoiceBook::" + cause);
                console.error(cause);
            });
        return res.status(200).json({processId: id, status: progress[id].status});
    } catch (error) {
        isInProgress = false;
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
    await glueFiles(progress, id);
    progress[id].status = "ready";
}

voiceBookRoutes.get("/:id/download", async (req, res) => {
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

voiceBookRoutes.get("/:id/progress", async (req, res) => {
    const id = req.params.id;
    if (progress[id] == null) {
        return res.status(404).json({processId: id, status: "notExist"});
    } else {
        return res.status(200).json({processId: id, status: progress[id].status});
    }
});

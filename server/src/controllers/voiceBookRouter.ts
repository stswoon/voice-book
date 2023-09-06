import {Router} from "express";
import {voiceBookService} from "../services/voiceBookService";
import {cpus} from "os";

voiceBookService.init();

export const voiceBookRouter = Router();

voiceBookRouter.post("/generate", async (req, res) => {
    console.info("/generate");
    const text = req.body.text;
    try {
        const id = voiceBookService.queueForGeneration(text);
        return res.status(200).json({processId: id});
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: e.toString()});
    }
});

voiceBookRouter.get("/:id/download", async (req, res) => {
    console.info("/download");
    const id = req.params.id;
    try {
        const outputFilePath = voiceBookService.getOutputFilePath(id);
        if (outputFilePath) {
            return res.download(outputFilePath!);
        } else {
            const message = `Process with id = ${id} still in progress or queue`;
            console.error(message);
            res.status(409).json({message});
        }
    } catch (e) {
        const message = `No process with id = ${id}`;
        console.error(message);
        res.status(404).json({message});
    }
});

voiceBookRouter.get("/:id/progress", async (req, res) => {
    console.info("/progress");
    const id = req.params.id;
    try {
        const progress = voiceBookService.getProgress(id);
        const status = voiceBookService.getStatus(id);
        return res.status(200).json({processId: id, progress: progress, status: status});
    } catch (e) {
        const message = `No process with id = ${id}`;
        console.error(message);
        res.status(404).json({message});
    }
});

voiceBookRouter.delete("/:id/cancel", async (req, res) => {
    console.info("/cancel");
    const id = req.params.id;
    try {
        voiceBookService.terminate(id);
        return res.status(200).json({processId: id, status: "terminating..."});
    } catch (e) {
        const message = `No process with id = ${id}`;
        console.error(message);
        res.status(404).json({message});
    }
});

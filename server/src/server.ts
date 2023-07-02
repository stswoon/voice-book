import express, {NextFunction, Request, Response} from "express";
import {generateVoiceBookRoutes} from "./generateVoiceBookRoute";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const unexpectedExceptionHandle = (cause: any) => console.error("Something went wrong: ", cause);
process.on("uncaughtException", unexpectedExceptionHandle);
process.on("unhandledRejection", unexpectedExceptionHandle);
app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    unexpectedExceptionHandle(error);
    res.status(500).send("Server Error");
});

app.get("/health", (req: Request, res: Response) => res.send("OK"));
app.use("/", express.static("static"));

app.use("/api/generateVoiceBook", generateVoiceBookRoutes);

app.listen(PORT, () => console.info(`Application listening on ${PORT}`));

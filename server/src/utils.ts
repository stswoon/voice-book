import dotenv from "dotenv";

export const utils = {
    now: (): number => (new Date()).getTime(),
    timeSpend: (startTime: number): string => {
        const now = utils.now();
        const diff = now - startTime;
        const s = Math.round(diff / 1000);
        return `${s}sec`;
    },
    deepCopy: <T>(o: T): T => JSON.parse(JSON.stringify(o))
}

export type JsMap<K extends string, V> = { [key in K]: V; };


dotenv.config();
export const START_POOL_LIMIT: number = Number(process.env.START_POOL_LIMIT ?? 1);

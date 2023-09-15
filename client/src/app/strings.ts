import {AppService} from "./AppService.ts";

export type StringsType = typeof en;
export const strings = (): StringsType => {
    const lang = AppService.getLang();
    return lang === "en" ? en : ru;
}

const en = {
    OpaTtsRunControls: {
        send: "Send",
        download: "Download",
        cancel: "Cancel",
        closeTab: "Close tab",
        splitByChapters: "Split by chapters",
        splitChapterText: "Chapter"
    },
    OpaCookieAccept: {
        text: "This site use cookie for adds. Use the Accept button to consent. Leave site to decline." +
            " Using site without click Accept also mean that you consent for using cookies.",
        button: "Accept"
    },
    OpaTestTextMenu: {
        menuTitle: "Testing Texts",
        itemGreetings: "Greetings",
        itemHelloWorld: "Hello World",
        itemThreePigs: "Three Pigs",
    },
    OpaAds: {
        donate: "If you like app you can {DONATE} me. Sorry for ads but I need 7$/mo to maintain server.",
        adblockDisable: "Please allow add-block to show ads because I need at least 7$\mo for server maintain."
    },
    AppServiceToasts: {
        errorSendToast: "Error during processing text, processId={processId}",
        errorCancelToast: "Failed cancel process",
        initGetStatusToast: "Getting status for previous process, processId={processId}"
    }
};

const ru: StringsType = {
    OpaTtsRunControls: {
        send: "Сгенерировать",
        download: "Скачать",
        cancel: "Отменить",
        closeTab: "Закрыть вкладку",
        splitByChapters: "Разбить по главам",
        splitChapterText: "Глава"
    },
    OpaCookieAccept: {
        text: "Этот сайт использует cookie для рекламу. Нажмите кнопку Принять чтобы предоставить согласие." +
            " Если не согласны покиньте сайт." +
            " Использование сайта без нажатия кнопки Принять, также означает ваше согласие с использование cookie.",
        button: "Принять"
    },
    OpaTestTextMenu: {
        menuTitle: "Тестовые Тексты",
        itemGreetings: "Приветствие",
        itemHelloWorld: "Привет Мир",
        itemThreePigs: "Три Поросенка",
    },
    OpaAds: {
        donate: "Если вам нравиться приложение вы можете перейти по ссылке {DONATE}. Извиняюсь за рекламу," +
            "но нужно набрать 7$/месяц для поддержания сервера.",
        adblockDisable: "Пожалуйста выключите ad-block что реклама могла отобразиться, т.к. мне нужно хотя бы " +
            "7$/месяц для поддержания сервера."
    },
    AppServiceToasts: {
        errorSendToast: "Ошибка при конвертации текста, processId={processId}",
        errorCancelToast: "Ошибка отмены процессора",
        initGetStatusToast: "Получаю статус запущенного в прошлый раз процесса, processId={processId}"
    }
};

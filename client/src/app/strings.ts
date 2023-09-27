import {AppService} from "./services/AppService.ts";

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
        newTab: "New tab",
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
        tab: "Tab",
    },
    OpaAds: {
        donate: "If you like app you can {DONATE} for server maintaining.",
        adblockDisable: "Please allow add-block to show ads because I need at least 5$\mo for server maintain."
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
        newTab: "Новая вкладка",
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
        tab: "Вкладка",
    },
    OpaAds: {
        donate: "Если вам нравиться приложение поддержите работу сервера {DONATE}.",
        adblockDisable: "Пожалуйста выключите ad-block что реклама могла отобразиться, т.к. мне нужно хотя бы " +
            "500р/месяц для поддержания сервера."
    },
    AppServiceToasts: {
        errorSendToast: "Ошибка при конвертации текста, processId={processId}",
        errorCancelToast: "Ошибка отмены процессора",
        initGetStatusToast: "Получаю статус запущенного в прошлый раз процесса, processId={processId}"
    }
};

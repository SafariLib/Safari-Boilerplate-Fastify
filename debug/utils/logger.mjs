import consoleColors from './consoleColors.mjs';

export default {
    startTest: title => {
        console.log();
        console.log(consoleColors.title, `Starting ${title} functions tests`, consoleColors.Reset);
        console.log();
    },
    success: title => {
        console.log();
        console.log(consoleColors.success, `${title} functions tests successfully passed`, consoleColors.Reset);
        console.log();
    },
    error: (title, message) => {
        console.log();
        console.log(consoleColors.error, title, consoleColors.Reset);
        console.log(message);
        console.log();
    },
    info: title => {
        console.log();
        console.log(consoleColors.info, title, consoleColors.Reset);
        console.log();
    },
};

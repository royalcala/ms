//https://github.com/totherik/caller
export function CallerPath(depth = 0): string {
    var pst, stack, file, frame;

    pst = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        Error.prepareStackTrace = pst;
        return stack;
    };

    stack = (new Error()).stack;
    depth = !depth || isNaN(depth) ? 1 : (depth > stack.length - 2 ? stack.length - 2 : depth);
    stack = stack.slice(depth + 1);

    do {
        frame = stack.shift();
        file = frame && frame.getFileName();
    } while (stack.length && file === 'module.js');

    return file;
};

// export function getPathFromError(error: Error) {
//     var pst, stack, file, frame;
//     let depth = 0

//     pst = Error.prepareStackTrace;
//     Error.prepareStackTrace = function (_, stack) {
//         Error.prepareStackTrace = pst;
//         return stack;
//     };

//     stack = error.stack;
//     depth = !depth || isNaN(depth) ? 1 : (depth > stack.length - 2 ? stack.length - 2 : depth);
//     stack = stack.slice(depth + 1);

//     do {
//         frame = stack.shift();
//         file = frame && frame.getFileName();
//     } while (stack.length && file === 'module.js');

//     return file;
// }
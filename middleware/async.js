/**
 * ! Note: Currently unused in current version. Replaced with express-async-errors NPM package which does the same thing.
 * A factory function returning a standard express route handler function encapsulating error handling logic.
 * The error handling logic passes control to the error middleware function if an error occurs in the handler.
 * This function removes the need to use a try-catch block in each route handler function.
 * @param {fn} handler - an async express route handler function
 */

module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res);
        } catch (error) {
            next(error);
        }
    };
};

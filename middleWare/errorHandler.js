const constant = require('./status.json');

// Handling all errors by displaying them in JSON format
const handleError = (error, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    let errorTitle = "Unknown Error";
    for (const item of constant) {
        let statusArray = Object.values(item);
        let index = statusArray.indexOf(statusCode);
        if (index !== -1) {
            errorTitle = Object.keys(item)[index];
            break;
        }
    }

    res.status(statusCode).json({
        title: errorTitle,
        message: error.message,
        status: statusCode,
        location: error.stack
    });
};

module.exports = handleError;

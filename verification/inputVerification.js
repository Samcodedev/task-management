

const inputVerification = async ( input ) => {
    try {
        if (typeof input === "string") {
            return "string";
        } else if (typeof input === "number" && Number.isInteger(input)) {
            return "integer";
        } else if (typeof input === "boolean") {
            return "boolean";
        } else if (Array.isArray(input)) {
            return "array";
        } else if (typeof input === "object" && input !== null) {
            return "object";
        } else if (input === null) {
            return "Input is null";
        } else {
            return "Unknown data type";
        }
    } catch (err) {
        return null
    }
}


module.exports = { inputVerification }
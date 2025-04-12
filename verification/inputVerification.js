const inputVerification = async (validationRules) => {
    try {
        const validationErrors = [];

        for (const rule of validationRules) {
            const { value, type, message } = rule;
            let inputType;

            if (typeof value === "string") {
                inputType = "string";
            } else if (typeof value === "number" && Number.isInteger(value)) {
                inputType = "integer";
            } else if (typeof value === "boolean") {
                inputType = "boolean";
            } else if (Array.isArray(value)) {
                inputType = "array";
            } else if (typeof value === "object" && value !== null) {
                inputType = "object";
            } else if (value === null) {
                inputType = null;
            } else {
                inputType = "Unknown data type";
            }

            if (inputType !== type) {
                validationErrors.push(message);
            }
        }

        if (validationErrors.length > 0) {
            return {
                isValid: false,
                errors: validationErrors
            };
        }

        return {
            isValid: true,
            errors: []
        };
    } catch (err) {
        return {
            isValid: false,
            errors: ["An error occurred during validation"]
        };
    }
}

module.exports = { inputVerification }
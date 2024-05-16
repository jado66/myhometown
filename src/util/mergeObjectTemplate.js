export function mergeObjectTemplate(object, template) {
    if (typeof object !== 'object' || object === null || typeof template !== 'object' || template === null) {
        throw new Error("Input parameters should be of type object");
    }

    let result = { ...object };

    Object.keys(template).forEach((key) => {
        if (typeof template[key] === 'object' && template[key] !== null && !(template[key] instanceof Array)) { // Check if the current property is an object but not an Array
            if (!result[key]) {
                result[key] = {};
            }
            result[key] = mergeObjectTemplate(result[key], template[key]);  // Recursive call
        } else if (result[key] === undefined) {
            result[key] = template[key];
        }
    });

    return result;
}

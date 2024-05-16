export function mergeObjectTemplate(object, template) {
    // Ensure both input are indeed objects
    if (typeof object !== 'object' || typeof template !== 'object') {
        throw new Error("Input parameters should be of type object");
    }

    return { ...template, ...object };
}

 
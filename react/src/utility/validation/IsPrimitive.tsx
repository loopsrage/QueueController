export const IsPrimitive = (input: never) => {
    if (input === null) {
        return true; // null is a primitive
    }
    const type = typeof input;
    return (
        type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        type === 'symbol' ||
        type === 'bigint'
    );
}
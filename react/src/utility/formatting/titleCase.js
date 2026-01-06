
import { IsNullOrUndefined } from "../validation/isNullOrUndefined"

export const TitleCase = (input, separator) => {
    if (IsNullOrUndefined(input)) {
        return ""
    }
    return input.toLowerCase()
        .split(separator)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
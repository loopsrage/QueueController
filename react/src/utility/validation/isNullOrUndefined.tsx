import type { JSX } from "react/jsx-runtime"

export const IsNullOrUndefined = (value: string | JSX.Element | null | undefined) => { return value === null || value === undefined }
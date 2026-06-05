// lib/session-config.ts
let cachedDuration = 0
export const setSessionDuration = (minutes: number) => { cachedDuration = minutes * 60 }
export const getConfigDuration   = () => cachedDuration
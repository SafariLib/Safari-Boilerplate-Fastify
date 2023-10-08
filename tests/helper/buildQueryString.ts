export const buildQuerystring = (query: Record<string, unknown>) =>
    `?${Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`;

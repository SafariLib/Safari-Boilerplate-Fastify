export const buildQuerystring = query =>
    `?${Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`;

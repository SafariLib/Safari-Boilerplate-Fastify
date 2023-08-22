export type HashString = (string: string) => Promise<string>;

export type CompareStrings = (s1: string, s2: string) => Promise<boolean>;

export interface Bcrypt {
    hashString: HashString;
    compareStrings: CompareStrings;
}

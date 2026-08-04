export const characters = [
    "Niki",
    "LunLun",
    "Lucy",
    "Shua",
    "Dhanpir",
    "Pochi",
    "Al",
] as const;

export type Character = typeof characters[number];

export function isCharacter(character: string): character is Character {
    return (characters as readonly string[]).includes(character);
}

export type Part =
    | "Hat"
    | "Hair"
    | "Dye"
    | "Upper"
    | "Lower"
    | "Shoes"
    | "Socks"
    | "Hand"
    | "Backpack"
    | "Face"
    | "Racket"
    | "Other";

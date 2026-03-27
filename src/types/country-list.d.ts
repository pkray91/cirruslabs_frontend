declare module 'country-list' {
  export function getNames(): string[];
  export function getCode(name: string): string;
  export function getName(code: string): string;
  export function getCodes(): string[];
  export function getCodeList(): Record<string, string>;
  export function getNameList(): Record<string, string>;
}

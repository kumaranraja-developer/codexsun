// cortex/core/types.ts
export type pkType = number;
export type strType = string;
export type emailType = string & { __emailBrand: true };
export type hashedType = string & { __hashedBrand: true };
export type boolType = boolean;
export type tzType = Date;

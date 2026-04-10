declare module "*.png" {
  const value: any;
  export = value;
}

interface RequireContext {
  keys(): string[];
  (id: string): any;
}

declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): RequireContext;
  (id: string): any;
};

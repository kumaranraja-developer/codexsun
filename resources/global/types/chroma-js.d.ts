
declare module 'resources/global/types/chroma-js' {
  namespace chroma {
    function scale(colors: string[] | chroma.Scale): chroma.Scale;
    interface Scale {
      (t: number): chroma.Color;
      domain(d: number[]): Scale;
      mode(mode: string): Scale;
      colors(count?: number): string[];
    }
  }

  export = chroma;
}
declare module 'react-scroll';
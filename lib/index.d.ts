type opts = {
    proxyType?: string;
    proxyUrl?: string;
};
export declare const JadiAnime: (img: string, opts?: opts | undefined) => Promise<{
    img: string;
}>;
export {};

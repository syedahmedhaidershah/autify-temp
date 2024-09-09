export type etlStageStateType = {
    url: string;
    assetsDir: string;
}

export type processUrlOptionsType = {
    assetsDir: string;
    metadataStore: string;
};

export type processedUrlType = {
    data: string;
    assets: string[];
    etlStageState: etlStageStateType;
};

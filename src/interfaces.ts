export type Guid = string;
export type DateTime = string;

export interface ImportInterface {
    filePath?: string,
    directory?: string,
    rawJson?: any,
    documentNumber0?: string,
    documentNumber1?: string,
    documentNumber2?: string,
    partNumber0?: string,
    partNumber1?: string,
    partNumber2?: string,
    documentRemoteID?: string,
    partRemoteID?: string,
    displayName?: string,
}

export interface DocumentInterface {
    id: Guid,
    key: string,
    originFileName: string,
    formatFileName: string,
    lowerFormatFileName: string,
    contentMD5: string,
    rawJsonMD5: string,
    documentNumber0: string,
    documentNumber1: string,
    documentNumber2: string,
    partNumber0: string,
    partNumber1: string,
    partNumber2: string,
    documentRemoteID: string,
    partRemoteID: string,
    displayName: string,
    createTime: DateTime,
}

export interface DirectoryInterface {
    id: Guid,
    path: string,
    documents: Guid[]
}

export interface IImportInput {
    Items: {
        FilePath: string
    }[]
}

export interface PluginSubscriber {
    url: string,
    name: string,
    type: 'git-release' | 'git-repository'
}

export interface LocalSubscriber {
    name: string,
    url: string
}

export interface PluginInterface {
    Name: string,
    Entry: string
}


export interface ScanResult {
    untrackedFiles: string[],
    documents: DocumentInterface[],
    modifiedDocuments: DocumentInterface[],
    missingDocuments: DocumentInterface[],
}


export interface IUserInfomation {
    isLogin: boolean,
    name?: string,
    id?: string,
    email?: string,
    avatar_url?: string,
    html_url?: string
}

export interface ICheckInInput {
    Items: {
        FilePath: string
    }[]
}

export interface ICheckInOutput {

}

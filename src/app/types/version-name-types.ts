export interface VersionNameType {
    id: string,
    adjective: string,
    animal: string
}

export interface VersionNamesResultType {
    code: string,
    versionNames: Array<VersionNameType> | null
}

export interface ProjectType {
    id: string,
    name: string,
    current_version_name: string | null
}
export interface ProjectsResultType {
    code: string,
    projects: Array<ProjectType> | null
}

export interface VersionNameType {
    id: string,
    adjective: string,
    animal: string
}

export interface VersionNamesResultType {
    code: string,
    versionNames: Array<VersionNameType> | null
}

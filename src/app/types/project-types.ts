export interface ProjectType {
    id: string,
    name: string,
    current_version_name: string | null;
}
export interface ProjectsResultType {
    code: string,
    projects: Array<ProjectType> | null;
}

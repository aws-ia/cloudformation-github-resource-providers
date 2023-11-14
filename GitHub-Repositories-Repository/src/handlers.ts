import {ResourceModel, SecurityAndAnalysis, TypeConfigurationModel} from './models';
import {CaseTransformer, Transformer} from '../../GitHub-Common/src/util';
import {Octokit} from "@octokit/rest";
import {Endpoints, RequestError} from "@octokit/types";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {RetryableCallbackContext} from "../../GitHub-Common/src/abstract-base-resource";
import {version} from '../package.json';
import {
    Action,
    BaseModel,
    BaseResource,
    exceptions,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import {AlreadyExists} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib/dist/exceptions";

type CreateOrgRepoEndpoint = 'POST /orgs/{org}/repos';
type CreateUserRepoEndpoint = 'POST /user/repos';
type UpdateRepoEndpoint = 'PATCH /repos/{owner}/{repo}';
type GetUserRepoEndpoint = 'GET /repos/{owner}/{repo}';
type GetOrgRepoEndpoint = 'GET /orgs/{org}/repos';
type ListOrgRepoEndpoint = 'GET /orgs/{org}/repos';
type ListUserRepoEndpoint = 'GET /users/{username}/repos';

type CreateOrgRepoResponseData = Endpoints[CreateOrgRepoEndpoint]['response']['data'];
type CreateUserRepoResponseData = Endpoints[CreateUserRepoEndpoint]['response']['data'];
type UpdateRepoResponseData = Endpoints[UpdateRepoEndpoint]['response']['data'];
type GetUserRepoResponseData = Endpoints[GetUserRepoEndpoint]['response']['data'];
type GetOrgRepoResponseData = Endpoints[GetOrgRepoEndpoint]['response']['data'];
type ListOrgRepoResponseData = Endpoints[ListOrgRepoEndpoint]['response']['data'];
type ListUserRepoResponseData = Endpoints[ListUserRepoEndpoint]['response']['data'];
type RepoData = CreateOrgRepoResponseData
    & CreateUserRepoResponseData
    & UpdateRepoResponseData
    & GetUserRepoResponseData
    & GetOrgRepoResponseData
    & ListOrgRepoResponseData
    & ListUserRepoResponseData;

class Resource extends AbstractGitHubResource<ResourceModel, GetUserRepoResponseData, CreateOrgRepoResponseData | CreateUserRepoResponseData, UpdateRepoResponseData, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    processRequestException(e: Error | RequestError, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            super.processRequestException(e, request);
        } catch (ex) {
            // The base class always return an AlreadyExists exception when a 422 occurred. This is fine in most case
            // but here, a 422 doesn't necessarily mean that the resource exists. So we are checking if the message
            // contains "already exists" and if it doesn't then we throw a InvalidRequest. Otherwise, we rethrow.
            if (ex instanceof AlreadyExists && !e.toString().includes('already exists')) {
                throw new exceptions.InvalidRequest((e as Error).message);
            }
            throw ex;
        }
    }

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetUserRepoResponseData> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        // Note - in order to allow renaming the github repo, we need to use the id instead of owner and name for the path.
        // See here for more information about this api (since it's undocumented): https://github.com/piotrmurach/github/issues/282
        // ts ignore below necessary as this path is not part of octokit endpoints

        // @ts-ignore
        const response = await octokit.request<GetRepoByIdEndpoint>('GET /repositories/{id}', {
            id: model.id
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const requestRoute = model.owner
            ? 'GET /orgs/{org}/repos'
            : 'GET /user/repos';
        const requestParams = model.owner
            ? {org: model.owner}
            : {}
        const models = await octokit.paginate<RepoData>(
            requestRoute,
            requestParams);

        return models.map(repoItem => this.setModelFrom(model, repoItem));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateOrgRepoResponseData | CreateUserRepoResponseData> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        let payload:any = {
            ...{org: model.organization ? model.organization : undefined},
            name: model.name,
            private: model.private_,
            description: model.description,
            homepage: model.homepage,
            visibility: (model.visibility || 'public') as "private" | "public" | "visibility" | "internal",
            allow_auto_merge: model.allowAutoMerge,
            allow_merge_commit: model.allowMergeCommit,
            allow_rebase_merge: model.allowRebaseMerge,
            allow_squash_merge: model.allowSquashMerge,
            auto_init: model.autoInit,
            team_id: model.teamId,
            delete_branch_on_merge: model.deleteBranchOnMerge,
            has_issues: model.hasIssues,
            has_projects: model.hasProjects,
            has_wiki: model.hasWiki,
            is_template: model.isTemplate,
            gitignore_template: model.gitIgnoreTemplate,
            license_template: model.licenseTemplate
        };

        if (model.allowForking != null) {
            payload.allow_forking = model.allowForking;
        }

        const response = await octokit.request<CreateOrgRepoEndpoint | CreateUserRepoEndpoint>(model.organization ? 'POST /orgs/{org}/repos' : 'POST /user/repos', payload);

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<UpdateRepoResponseData> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        // TODO: Convert the model to a dictionary corresponding the type for the request
        let payload: any = {
            owner: model.owner,
            repo: model.name,
            name: model.name,
            private: model.private_,
            description: model.description,
            homepage: model.homepage,
            visibility: (model.visibility || 'public') as "private" | "public" | "visibility" | "internal",
            allow_auto_merge: model.allowAutoMerge,
            allow_merge_commit: model.allowMergeCommit,
            allow_rebase_merge: model.allowRebaseMerge,
            allow_squash_merge: model.allowSquashMerge,
            delete_branch_on_merge: model.deleteBranchOnMerge,
            has_issues: model.hasIssues,
            has_projects: model.hasProjects,
            has_wiki: model.hasWiki,
            is_template: model.isTemplate,
            archived: model.archived,
            default_branch: model.defaultBranch,
            security_and_analysis: !!model.securityAndAnalysis
                ? {
                    advanced_security: model.securityAndAnalysis.advanceSecurity,
                    secret_scanning: model.securityAndAnalysis.secretScanning
                } : {}
        };

        if (!!model.allowForking) {
            payload.allow_forking = model.allowForking;
        }

        const pathWithId = `PATCH /repositories/${model.id}`;

        // Note - in order to allow renaming the github repo, we need to use the id instead of owner and name for the path.
        // See here for more information about this api (since it's undocumented): https://github.com/piotrmurach/github/issues/282
        // ts ignore below necessary as this path is not part of octokit endpoints

        // @ts-ignore
        const response = await octokit.request<UpdateRepoEndpoint>(pathWithId, payload);

        return response.data;
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request('DELETE /repositories/{repositoryId}', {
            repositoryId: model.id,
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: RepoData): ResourceModel {
        if (!from) {
            return model;
        }

        delete from.updated_at;

        let resourceModel: ResourceModel = new ResourceModel( {
            id: from.id,
            owner: from.owner?.login ? from.owner.login : model.owner,
            licenseTemplate: from.license?.key,
            name: from.name,
            private_: from.private,
            description: from.description,
            homepage: from.homepage,
            visibility: (from.visibility || 'public') as "private" | "public" | "visibility" | "internal",
            allowAutoMerge: from.allow_auto_merge,
            allowMergeCommit: from.allow_merge_commit,
            allowRebaseMerge: from.allow_rebase_merge,
            allowSquashMerge: from.allow_squash_merge,
            deleteBranchOnMerge: from.delete_branch_on_merge,
            hasIssues: from.has_issues,
            hasProjects: from.has_projects,
            hasWiki: from.has_wiki,
            isTemplate: from.is_template,
            archived: from.archived,
            defaultBranch: from.default_branch,
            htmlUrl: from.html_url || '',
            gitUrl:from.git_url || '',
            language: from.language || '',
            forksCount: from.forks_count || 0,
            starsCount: from.stargazers_count || 0,
            watchersCount: from.watchers_count || 0,
            issuesCount: from.open_issues_count || 0
        });

        if (!!from.allow_forking) {
            resourceModel.allowForking = from.allow_forking;
        }

        // Delete write-only properties - probably only necessary for tests
        delete resourceModel.organization;
        delete resourceModel.teamId;
        delete resourceModel.allowForking;
        delete resourceModel.allowAutoMerge;
        delete resourceModel.autoInit;
        delete resourceModel.gitIgnoreTemplate;
        return resourceModel;
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

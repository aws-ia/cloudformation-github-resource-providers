import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {ResourceModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints, OctokitResponse} from "@octokit/types";
import {handleError} from "../../GitHub-Common/src/util"

interface CallbackContext extends Record<string, any> {
}

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
type GetUserRepoResponseData = Endpoints[GetUserRepoEndpoint]['response']['data']
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

class Resource extends BaseResource<ResourceModel> {

    private static setModelFromApiResponse(baseModel: ResourceModel, data: RepoData): ResourceModel {
        baseModel.owner = data.owner.login;
        baseModel.gitUrl = data.git_url;
        baseModel.htmlUrl = data.html_url;
        baseModel.defaultBranch = data.default_branch;
        baseModel.language = data.language;
        baseModel.forksCount = data.forks_count;
        baseModel.starsCount = data.forks_count;
        baseModel.watchersCount = data.forks_count;
        baseModel.issuesCount = data.forks_count;
        return baseModel;
    }


    private async getRepo(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<GetUserRepoResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request('GET /repos/{owner}/{repo}', {
                owner: model.owner,
                repo: model.name
            });
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }

    private async assertRepoExist(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            await this.getRepo(model, request);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        if (await this.assertRepoExist(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            // TODO: This does not support organization repositories yet.
            const response = await octokit.request<CreateOrgRepoEndpoint | CreateUserRepoEndpoint>(model.org ? 'POST /orgs/{org}/repos' : 'POST /user/repos', {
                ...{org: model.org ? model.org : undefined},
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
            });
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromApiResponse(model, response.data as RepoData));
        } catch (e) {
            handleError(e, request, this.typeName);}
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        if (!(await this.assertRepoExist(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        function allowForkingUpdated() {
            return request.previousResourceState.allowForking !== request.desiredResourceState.allowForking;
        }

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            let payload = {
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
            const response = await octokit.request<UpdateRepoEndpoint>('PATCH /repos/{owner}/{repo}', allowForkingUpdated() ?
                {
                    ...payload,
                    allow_forking: model.allowForking
                }:
                payload);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromApiResponse(model, response.data as RepoData));
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        if (!(await this.assertRepoExist(model, request))) {
            throw new exceptions.NotFound(this.typeName,request.logicalResourceIdentifier);
        }
        const octokit = new Octokit({auth: model.gitHubAccess})
        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            await octokit.request('DELETE /repos/{owner}/{repo}', {
                owner: model.org,
                repo: model.name
            });
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const response = await this.getRepo(model, request);
        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromApiResponse(model, response.data as RepoData));
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.List)
    public async list(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const octokit = new Octokit({auth: model.gitHubAccess});

        try {
            let requestMethod, requestParams = undefined;
            model.org ? (requestMethod = octokit.repos.listForOrg, requestParams = {org: model.org}) : (requestMethod = octokit.repos.listForUser);
            const models = await octokit.paginate(requestMethod, requestParams
                , response => response.data.map(repoItem => {
                    let resourceModel = new ResourceModel();
                    resourceModel.owner = repoItem.owner.login;
                    resourceModel.org = model.org ? repoItem.owner.login : undefined;
                    resourceModel.name = repoItem.name;
                    resourceModel.private_ = repoItem.private;
                    resourceModel.description = repoItem.description;
                    resourceModel.homepage = repoItem.homepage;
                    resourceModel.visibility = repoItem.visibility;
                    resourceModel.hasIssues = repoItem.has_issues;
                    resourceModel.hasProjects = repoItem.has_projects;
                    resourceModel.hasWiki = repoItem.has_wiki;
                    resourceModel.isTemplate = repoItem.is_template;
                    return resourceModel;
                }));
            return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels(models).build();
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

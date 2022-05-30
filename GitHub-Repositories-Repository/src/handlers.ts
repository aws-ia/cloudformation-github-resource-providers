import {
    Action,
    AwsTaskWorkerPool,
    BaseResource,
    Constructor,
    exceptions,
    handlerEvent,
    HandlerSignatures,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {ResourceModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints, OctokitResponse, RequestError} from "@octokit/types";

interface CallbackContext extends Record<string, any> {
}

type CreateOrgRepoEndpoint = 'POST /orgs/{org}/repos';
type CreateUserRepoEndpoint = 'POST /user/repos';
type UpdateRepoEndpoint = 'PATCH /repos/{owner}/{repo}';
type GetRepoEndpoint = 'GET /repos/{owner}/{repo}';
type ListOrgRepoEndpoint = 'GET /orgs/{org}/repos';
type ListUserRepoEndpoint = 'GET /users/{username}/repos';

type CreateOrgRepoResponseData = Endpoints[CreateOrgRepoEndpoint]['response']['data'];
type CreateUserRepoResponseData = Endpoints[CreateUserRepoEndpoint]['response']['data'];
type UpdateRepoResponseData = Endpoints[UpdateRepoEndpoint]['response']['data'];
type GetRepoResponseData = Endpoints[GetRepoEndpoint]['response']['data'];
type ListOrgRepoResponseData = Endpoints[ListOrgRepoEndpoint]['response']['data'];
type ListUserRepoResponseData = Endpoints[ListUserRepoEndpoint]['response']['data'];
type RepoData = CreateOrgRepoResponseData
    & CreateUserRepoResponseData
    & UpdateRepoResponseData
    & GetRepoResponseData
    & ListOrgRepoResponseData
    & ListUserRepoResponseData;

class Resource extends BaseResource<ResourceModel> {
    constructor(typeName: string, modelTypeReference: Constructor<ResourceModel>, workerPool?: AwsTaskWorkerPool, handlers?: HandlerSignatures<ResourceModel>) {
        super(typeName, modelTypeReference, workerPool, handlers);
    }

    private setModelFromApiResponse(baseModel: ResourceModel, data: RepoData): ResourceModel {
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

    private isRequestError(ex: object) {
        return ex.hasOwnProperty('status') && ex.hasOwnProperty('name') && ex.hasOwnProperty('errors');
    }

    private async getRepo(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<GetRepoResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request('GET /repos/{owner}/{repo}', {
                owner: model.owner,
                repo: model.name
            });
        } catch (e) {
            if (this.isRequestError(e) && (e as RequestError).status === 404) {
                throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
            }
            if (this.isRequestError(e) && (e as RequestError).status === 403) {
                throw new exceptions.AccessDenied((e as RequestError).errors.map(e => e.message).join('\n'));
            }
            throw new exceptions.InternalFailure(e);
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
            logger.log(`jdc Creating repo for {}`,JSON.stringify(model));
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
            logger.log(`jdc response: {}`,JSON.stringify(response));
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response.data as RepoData));
        } catch (e) {
            logger.log(`jdc error creating: {}`,e);
            // TODO: Should have utility to get the right exception
            this.handleError(e, request)}
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
        logger.log(`jdc updating repo for {}`,JSON.stringify(model));

        if (!(await this.assertRepoExist(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            const response = await octokit.request<UpdateRepoEndpoint>('PATCH /repos/{owner}/{repo}', {
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
                allow_forking: model.allowForking,
                archived: model.archived,
                default_branch: model.defaultBranch,
                security_and_analysis: !!model.securityAndAnalysis
                    ? {
                        advanced_security: model.securityAndAnalysis.advanceSecurity,
                        secret_scanning: model.securityAndAnalysis.secretScanning
                    } : {}
            });
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response.data as RepoData));
        } catch (e) {
            logger.log(`jdc error updating: {}`,e);
            logger.log(e);
            // TODO: Should have utility to get the right exception
            this.handleError(e, request)
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
        const octokit = new Octokit({auth: model.gitHubAccess})

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            const response = await octokit.request('DELETE /repos/{owner}/{repo}', {
                owner: model.org,
                repo: model.name
            });
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
        } catch (e) {
            logger.log(e);
            if (e instanceof exceptions.BaseHandlerException) {
                throw e;
            }
            // TODO: handle not authorized error
            this.handleError(e, request)
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
        try{
            const response = await this.getRepo(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response.data as RepoData));
        }catch (e) {
            logger.log(e);
            this.handleError(e, request);
        }

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
        let response: any;

        try{
            response = await octokit.paginate(model.org ? 'GET /orgs/{org}/repos' : 'GET /user/repos', {
                    org: model.org ? model.org : undefined,
                    per_page: 100
                },
                response1 => {
                    return response1.data
                });
        } catch (e) {
            // TODO: handle unauthorized
            logger.log(`Error response: {}`, e)
            this.handleError(e, request)
        }

        const models :ResourceModel[] = [];
        for(const repoItem of response) {
            let resourceModel = new ResourceModel();
            resourceModel.owner = repoItem.owner.login;
            resourceModel.org = repoItem.org ?  repoItem.org : undefined,
            resourceModel.name = repoItem.name,
            resourceModel.private_ = repoItem.private_,
            resourceModel.description = repoItem.description,
            resourceModel.homepage = repoItem.homepage,
            resourceModel.visibility = repoItem.visibility,
            resourceModel.allowAutoMerge = repoItem.allowAutoMerge,
            resourceModel.allowMergeCommit = repoItem.allowMergeCommit,
            resourceModel.allowRebaseMerge = repoItem.allowRebaseMerge,
            resourceModel.allowSquashMerge = repoItem.allowSquashMerge,
            resourceModel.autoInit = repoItem.autoInit,
            resourceModel.teamId = repoItem.teamId,
            resourceModel.deleteBranchOnMerge = repoItem.deleteBranchOnMerge,
            resourceModel.hasIssues = repoItem.hasIssues,
            resourceModel.hasProjects = repoItem.hasProjects,
            resourceModel.hasWiki = repoItem.hasWiki,
            resourceModel.isTemplate = repoItem.isTemplate,
            resourceModel.gitIgnoreTemplate = repoItem.gitIgnoreTemplate,
            resourceModel.licenseTemplate = repoItem.licenseTemplate
            models.push(resourceModel)
        }

        return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
            .status(OperationStatus.Success)
            .resourceModels(models).build();
    }

    private handleError(response: OctokitResponse<any>, request: ResourceHandlerRequest<ResourceModel>) {
        if (response.status === 400) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        } else if (response.status === 401) {
            throw new exceptions.AccessDenied();
        } else if (response.status === 403) {
            throw new exceptions.AccessDenied();
        } else if (response.status === 404) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        } else if (response.status === 422) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }
        throw new exceptions.InternalFailure();
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

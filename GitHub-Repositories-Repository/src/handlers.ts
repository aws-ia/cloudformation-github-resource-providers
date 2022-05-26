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
import {Octokit} from '@octokit/core';
import {OctokitResponse} from "@octokit/types";

interface CallbackContext extends Record<string, any> {
}

// type GitHubModel<T> = Omit<T, 'constructor' | 'toJSON' | 'private_' | 'getAdditionalIdentifiers' | 'getPrimaryIdentifier' | 'getTypeName' | 'serialize'>
//
// type CreateResourceModel = GitHubModel<ResourceModel>;
// type UpdateResourceModel = GitHubModel<Omit<ResourceModel, 'org' | 'name' | 'teamId' | 'autoInit' | 'gitIgnoreTemplate' | 'licenseTemplate'>> & {
//     owner: string
//     repo: string
// }

class Resource extends BaseResource<ResourceModel> {
    constructor(typeName: string, modelTypeReference: Constructor<ResourceModel>, workerPool: AwsTaskWorkerPool, handlers: HandlerSignatures<ResourceModel>) {
        super(typeName, modelTypeReference, workerPool, handlers);
    }

    private setModelFromApiResponse(baseModel: ResourceModel, response: OctokitResponse<any>): ResourceModel {
        baseModel.gitUrl = response.data.git_url;
        baseModel.htmlUrl = response.data.html_url;
        baseModel.defaultBranch = response.data.default_branch;
        baseModel.language = response.data.language;
        baseModel.forksCount = response.data.forks_count;
        baseModel.starsCount = response.data.forks_count;
        baseModel.watchersCount = response.data.forks_count;
        baseModel.issuesCount = response.data.forks_count;
        return baseModel;
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

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            const response = await octokit.request('POST /orgs/{org}/repos', {
                org: model.org,
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

            // Setting Status to success will signal to CloudFormation that the operation is complete
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response));
        } catch (err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }
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

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            const response = await octokit.request('PATCH /repos/{owner}/{repo}', {
                owner: model.org,
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

            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response));
        } catch (err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
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
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
        // TODO: put code here
        progress.status = OperationStatus.Success;
        return progress;
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

        const octokit = new Octokit({
            auth: model.gitHubAccess
        })

        try {
            // TODO: Convert the model to a dictionary corresponding the type for the request
            const response = await octokit.request('GET /repos/{owner}/{repo}', {
                owner: model.org,
                repo: model.name
            });
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(this.setModelFromApiResponse(model, response));
        } catch (err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
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
        // TODO: put code here
        const progress = ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
            .status(OperationStatus.Success)
            .resourceModels([model])
            .build();
        return progress;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

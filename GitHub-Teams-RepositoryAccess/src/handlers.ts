import {ResourceModel, TypeConfigurationModel} from './models';
import {Octokit} from "@octokit/rest";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {Endpoints, RequestError} from "@octokit/types";
import {version} from '../package.json';
import {
    exceptions,
    ResourceHandlerRequest
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import {AlreadyExists} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib/dist/exceptions";

type GetTeamRepoAccessEndpoint = 'GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';
type ListTeamRepoAccessEndpoint = 'GET /orgs/{org}/teams/{team_slug}/repos';
type PutTeamRepoAccessEndpoint = 'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';
type DeleteTeamRepoAccessEndpoint = 'DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';

type GetTeamRepoAccessPayload = Endpoints[GetTeamRepoAccessEndpoint]['response']['data'];
type ListTeamRepoAccessPayload = Endpoints[ListTeamRepoAccessEndpoint]['response']['data'];
type RepoAccess = GetTeamRepoAccessPayload & ListTeamRepoAccessPayload;


class Resource extends AbstractGitHubResource<ResourceModel, GetTeamRepoAccessPayload, void, void, TypeConfigurationModel> {

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

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetTeamRepoAccessPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetTeamRepoAccessEndpoint>(
            'GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
            {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository,
                headers: {Accept: 'application/vnd.github.v3+json'}
            });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.paginate<RepoAccess>(
                'GET /orgs/{org}/teams/{team_slug}/repos',
                {
                    org: model.org,
                    team_slug: model.team,
                    headers: {Accept: 'application/vnd.github.v3+json'}
                });

        return response.map(access => this.setModelFrom(model, access));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request<PutTeamRepoAccessEndpoint>(
            'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
            {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository,
                permission: model.permission as "pull" | "push" | "admin" | "maintain" | "triage" | undefined
            });
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        await this.create(model, typeConfiguration);
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request<DeleteTeamRepoAccessEndpoint>(
            'DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
            {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository
            });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: GetTeamRepoAccessPayload): ResourceModel {
        let permission = model.permission || 'push';
        if (from?.permissions?.admin === true) {
            permission = 'admin';
        }
        if (from?.permissions?.maintain === true) {
            permission = 'maintain';
        }
        if (from?.permissions?.triage === true) {
            permission = 'triage';
        }
        if (from?.permissions?.pull) {
            permission = 'pull';
        }

        return new ResourceModel({
            ...model,
            permission: permission
        });
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

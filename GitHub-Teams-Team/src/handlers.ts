import {ResourceModel, TypeConfigurationModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints} from "@octokit/types";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {version} from '../package.json';

type GetTeamEndpoint = 'GET /orgs/{org}/teams/{team_slug}';
type ListTeamEndpoint = 'GET /orgs/{org}/teams';
type CreateTeamEndpoint = 'POST /orgs/{org}/teams';
type UpdateTeamEndpoint = 'PATCH /orgs/{org}/teams/{team_slug}';

type GetTeamPayload = Endpoints[GetTeamEndpoint]['response']['data'];
type CreateTeamPayload = Endpoints[CreateTeamEndpoint]['response']['data'];
type UpdateTeamPayload = Endpoints[UpdateTeamEndpoint]['response']['data'];

type TeamData = GetTeamPayload & CreateTeamPayload & UpdateTeamPayload;

class Resource extends AbstractGitHubResource<ResourceModel, GetTeamPayload, CreateTeamPayload, UpdateTeamPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetTeamPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetTeamEndpoint>('GET /orgs/{org}/teams/{team_slug}', {
            org: model.organization,
            team_slug: model.slug
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.paginate<ListTeamEndpoint, ResourceModel[]>(
            'GET /orgs/{org}/teams',
            {
                org: model.organization,
                per_page: 100
            },
            response => response.data.map(p => this.setModelFrom(model, p as TeamData)));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateTeamPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<CreateTeamEndpoint>('POST /orgs/{org}/teams', {
            org: model.organization,
            name: model.name,
            description: model.description,
            privacy: model.privacy as "closed" | "secret"
        });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateTeamPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<UpdateTeamEndpoint>('PATCH /orgs/{org}/teams/{team_slug}', {
            org: model.organization,
            team_slug: model.slug,
            name: model.name,
            description: model.description,
            privacy: model.privacy as "closed" | "secret"
        });

        return response.data;
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request('DELETE /orgs/{org}/teams/{team_slug}', {
            org: model.organization,
            team_slug: model.slug
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: TeamData): ResourceModel {
        return new ResourceModel({
            ...model,
            description: from?.description,
            privacy: from?.privacy,
            slug: from?.slug
        });
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

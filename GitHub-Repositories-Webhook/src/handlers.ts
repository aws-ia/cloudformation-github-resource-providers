import {ResourceModel, TypeConfigurationModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints} from "@octokit/types"
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {version} from '../package.json';

type GetWebhookEndpoint = 'GET /repos/{owner}/{repo}/hooks';
type CreateWebhookEndpoint = 'POST /repos/{owner}/{repo}/hooks';
type UpdateWebhookEndpoint = 'PATCH /repos/{owner}/{repo}/hooks/{hook_id}';

type GetWebhookPayload = Endpoints[GetWebhookEndpoint]['response']['data'];
type CreateWebhookPayload = Endpoints[CreateWebhookEndpoint]['response']['data'];
type UpdateWebhookPayload = Endpoints[UpdateWebhookEndpoint]['response']['data'];

type WebhookPayload = GetWebhookPayload & CreateWebhookPayload & UpdateWebhookPayload;

class Resource extends AbstractGitHubResource<ResourceModel, GetWebhookPayload, CreateWebhookPayload, UpdateWebhookPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetWebhookPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetWebhookEndpoint>(`GET /repos/{owner}/{repo}/hooks/{hook_id}`, {
            owner: model.owner,
            repo: model.repository,
            hook_id: model.id
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.paginate<GetWebhookEndpoint, ResourceModel[]>(
            `GET /repos/{owner}/{repo}/hooks`,
            {
                owner: model.owner,
                repo: model.repository
            },
            response => response.data.map(repoItem => this.setModelFrom(model, repoItem as WebhookPayload)));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateWebhookPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<CreateWebhookEndpoint>(`POST /repos/{owner}/{repo}/hooks`, {
            owner: model.owner,
            repo: model.repository,
            name: model.name,
            active: model.active,
            events: [...model.events],
            config: {
                url: model.url,
                content_type: model.contentType,
                secret: model.secret,
                insecure_ssl: model.insecureSsl
            }
        });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<UpdateWebhookPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<UpdateWebhookEndpoint>(`PATCH /repos/{owner}/{repo}/hooks/{hook_id}`, {
            owner: model.owner,
            repo: model.repository,
            hook_id: model.id,
            name: model.name,
            active: model.active,
            events: [...model.events],
            config: {
                url: model.url,
                content_type: model.contentType,
                secret: model.secret,
                insecure_ssl: model.insecureSsl
            }
        });

        return response.data;
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request(`DELETE /repos/{owner}/{repo}/hooks/{hook_id}`, {
            owner: model.owner,
            repo: model.repository,
            hook_id: model.id
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: WebhookPayload): ResourceModel {
        const resourceModel = new ResourceModel({
            ...model,
            id: from.id,
            active: from.active,
            events: from.events,
            url: from.config.url,
            contentType: from.config.content_type,
            insecure_ssl: from.config.insecure_ssl,
        });

        delete resourceModel.secret;

        return resourceModel;
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

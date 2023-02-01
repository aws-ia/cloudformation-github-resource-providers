import {ResourceModel, TypeConfigurationModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints} from "@octokit/types";
import sodium from "libsodium-wrappers";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {version} from '../package.json';
import {CaseTransformer, Transformer} from '../../GitHub-Common/src/util';

type CreateOrgSecretEndpoint = 'PUT /orgs/{org}/actions/secrets/{secret_name}';
type GetOrgSecretEndpoint = 'GET /orgs/{org}/actions/secrets/{secret_name}';
type ListOrgSecretEndpoint = 'GET /orgs/{org}/actions/secrets';
type DeleteOrgSecretEndpoint = 'DELETE /orgs/{org}/actions/secrets/{secret_name}';
type GetOrgPublicKeyEndpoint = 'GET /orgs/{org}/actions/secrets/public-key';

type CreateSecretPayload = Endpoints[CreateOrgSecretEndpoint]['response']['data'];
type GetSecretPayload = Endpoints[GetOrgSecretEndpoint]['response']['data'];

class Resource extends AbstractGitHubResource<ResourceModel, GetSecretPayload, CreateSecretPayload, CreateSecretPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetSecretPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetOrgSecretEndpoint>('GET /orgs/{org}/actions/secrets/{secret_name}', {
            org: model.org,
            secret_name: model.secretName   
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.paginate<ListOrgSecretEndpoint>('GET /orgs/{org}/actions/secrets', {
            org: model.org
        });

        return response.map(tagPayload => this.setModelFrom(model));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateSecretPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        // get repo public key for encryption
        const repoPublicKeyResponse = await octokit.request<GetOrgPublicKeyEndpoint>('GET /orgs/{org}/actions/secrets/public-key', {
            org: model.org,
        });

        // encrypt with libsodium as per github requirement https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28#create-or-update-an-organization-secret
        await sodium.ready
        const binKey = sodium.from_base64(repoPublicKeyResponse.data.key, sodium.base64_variants.ORIGINAL)
        const binSec = sodium.from_string(model.secretValue)
        const encBytes = sodium.crypto_box_seal(binSec, binKey)
        const encryptedOutput = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL)

        const response = await octokit.request<CreateOrgSecretEndpoint>('PUT /orgs/{org}/actions/secrets/{secret_name}', {
            org: model.org,
            secret_name: model.secretName,
            encrypted_value: encryptedOutput.toString(),
            key_id: repoPublicKeyResponse.data.key_id,
            //@ts-ignore
            visibility: model.visibility,
            //@ts-ignore
            selected_repository_ids: model.selectedRepositoryIds
        });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateSecretPayload> {
        return this.create(model, typeConfiguration);
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request<DeleteOrgSecretEndpoint>('DELETE /orgs/{org}/actions/secrets/{secret_name}', {
            org: model.org,
            secret_name: model.secretName
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: CreateSecretPayload): ResourceModel {
        let result = new ResourceModel({
            ...model,
            ...Transformer.for(from)
                .transformKeys(CaseTransformer.SNAKE_TO_CAMEL)
                .forModelIngestion()
                .transform()
        });

        // delete writeOnlyProps
        delete result.secretValue;
        delete result.selectedRepositoryIds;

        return result;
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;

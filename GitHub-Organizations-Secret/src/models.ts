// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Organizations::Secret';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ORG: string = '/properties/Org';
    @Exclude()
    protected readonly IDENTIFIER_KEY_SECRETNAME: string = '/properties/SecretName';

    @Expose({ name: 'Org' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'org', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    org?: Optional<string>;
    @Expose({ name: 'SecretValue' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'secretValue', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    secretValue?: Optional<string>;
    @Expose({ name: 'SecretName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'secretName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    secretName?: Optional<string>;
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'SelectedRepositoryIds' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'selectedRepositoryIds', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    selectedRepositoryIds?: Optional<Array<number>>;
    @Expose({ name: 'Visibility' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'visibility', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    visibility?: Optional<string>;
    @Expose({ name: 'SelectedRepositoriesUrl' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'selectedRepositoriesUrl', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    selectedRepositoriesUrl?: Optional<string>;
    @Expose({ name: 'CreatedAt' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'createdAt', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    createdAt?: Optional<string>;
    @Expose({ name: 'UpdatedAt' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'updatedAt', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    updatedAt?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.org != null) {
            identifier[this.IDENTIFIER_KEY_ORG] = this.org;
        }

        if (this.secretName != null) {
            identifier[this.IDENTIFIER_KEY_SECRETNAME] = this.secretName;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 2 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;


    @Expose({ name: 'GitHubAccess' })
    @Type(() => GitHubAccess)
    gitHubAccess?: Optional<GitHubAccess>;

}

export class GitHubAccess extends BaseModel {
    ['constructor']: typeof GitHubAccess;


    @Expose({ name: 'AccessToken' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accessToken', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accessToken?: Optional<string>;

}


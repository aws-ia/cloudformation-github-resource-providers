// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Repositories::Collaborator';

    @Exclude()
    protected readonly IDENTIFIER_KEY_OWNER: string = '/properties/Owner';
    @Exclude()
    protected readonly IDENTIFIER_KEY_REPOSITORY: string = '/properties/Repository';
    @Exclude()
    protected readonly IDENTIFIER_KEY_USERNAME: string = '/properties/Username';

    @Expose({ name: 'GitHubAccess' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitHubAccess', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitHubAccess?: Optional<string>;
    @Expose({ name: 'Owner' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'owner', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    owner?: Optional<string>;
    @Expose({ name: 'Repository' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repository', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    repository?: Optional<string>;
    @Expose({ name: 'Username' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'username', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    username?: Optional<string>;
    @Expose({ name: 'Permission' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'permission', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    permission?: Optional<string>;
    @Expose({ name: 'Permissions' })
    @Type(() => Permissions)
    permissions?: Optional<Permissions>;
    @Expose({ name: 'InvitationId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'invitationId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    invitationId?: Optional<number>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.owner != null) {
            identifier[this.IDENTIFIER_KEY_OWNER] = this.owner;
        }

        if (this.repository != null) {
            identifier[this.IDENTIFIER_KEY_REPOSITORY] = this.repository;
        }

        if (this.username != null) {
            identifier[this.IDENTIFIER_KEY_USERNAME] = this.username;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 3 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class Permissions extends BaseModel {
    ['constructor']: typeof Permissions;


    @Expose({ name: 'Pull' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'pull', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    pull?: Optional<boolean>;
    @Expose({ name: 'Triage' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'triage', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    triage?: Optional<boolean>;
    @Expose({ name: 'Push' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'push', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    push?: Optional<boolean>;
    @Expose({ name: 'Maintain' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'maintain', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    maintain?: Optional<boolean>;
    @Expose({ name: 'Admin' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'admin', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    admin?: Optional<boolean>;

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


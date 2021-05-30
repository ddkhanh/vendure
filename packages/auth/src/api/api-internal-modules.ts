import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { AuthResolver } from './resolvers/admin/auth.resolver';
import { createDynamicGraphQlModulesForPlugins } from '../plugin/dynamic-plugin-api.module';
import { ServiceModule } from '../service/service.module';
import { ConfigurableOperationCodec } from './common/configurable-operation-codec';
import { CustomFieldRelationResolverService } from './common/custom-field-relation-resolver.service';
import { IdCodecService } from './common/id-codec.service';

const authenResolvers = [
    AuthResolver,
];

/**
 * The internal module containing some shared providers used by more than
 * one API module.
 */
@Module({
    imports: [ConfigModule, ServiceModule.forRoot()],
    providers: [IdCodecService, ConfigurableOperationCodec, CustomFieldRelationResolverService],
    exports: [
        IdCodecService,
        ConfigModule,
        ConfigurableOperationCodec,
        CustomFieldRelationResolverService,
        ServiceModule.forRoot(),
    ],
})
export class ApiSharedModule {}

/**
 * The internal module containing the Admin GraphQL API resolvers
 */
@Module({
    imports: [
        ApiSharedModule,
        ...createDynamicGraphQlModulesForPlugins('authen'),
    ],
    providers: [...authenResolvers],
    exports: [...authenResolvers],
})
export class AuthenApiModule {}

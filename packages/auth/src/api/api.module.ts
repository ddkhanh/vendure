import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload';
import path from 'path';

import { ConfigService } from '../config/config.service';
import { DataImportModule } from '../data-import/data-import.module';
import { I18nModule } from '../i18n/i18n.module';
import { ServiceModule } from '../service/service.module';

import { AuthenApiModule, ApiSharedModule } from './api-internal-modules';
import { RequestContextService } from './common/request-context.service';
import { configureGraphQLModule } from './config/configure-graphql-module';
import { AuthGuard } from './middleware/auth-guard';
import { ExceptionLoggerFilter } from './middleware/exception-logger.filter';
import { IdInterceptor } from './middleware/id-interceptor';
import { TranslateErrorResultInterceptor } from './middleware/translate-error-result-interceptor';
import { ValidateCustomFieldsInterceptor } from './middleware/validate-custom-fields-interceptor';

/**
 * The ApiModule is responsible for the public API of the application. This is where requests
 * come in, are parsed and then handed over to the ServiceModule classes which take care
 * of the business logic.
 */
@Module({
    imports: [
        ServiceModule.forRoot(),
        DataImportModule,
        I18nModule,
        ApiSharedModule,
        AuthenApiModule,  
        configureGraphQLModule(configService => ({
            apiType: 'authen',
            apiPath: configService.apiOptions.authenApiPath,
            playground: configService.apiOptions.adminApiPlayground,
            debug: configService.apiOptions.adminApiDebug,
            typePaths: ['admin-api', 'common'].map(p => path.join(__dirname, 'schema', p, '*.graphql')),
            resolverModule: AuthenApiModule,
            validationRules: configService.apiOptions.adminApiValidationRules,
        })),
    ],
    providers: [
        RequestContextService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: IdInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ValidateCustomFieldsInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TranslateErrorResultInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionLoggerFilter,
        },
    ],
})
export class ApiModule implements NestModule {
    constructor(private configService: ConfigService) {}
    configure(consumer: MiddlewareConsumer): any {
        const { adminApiPath, shopApiPath } = this.configService.apiOptions;
        const { uploadMaxFileSize } = this.configService.assetOptions;

        consumer
            .apply(graphqlUploadExpress({ maxFileSize: uploadMaxFileSize }))
            .forRoutes(adminApiPath, shopApiPath);
    }
}

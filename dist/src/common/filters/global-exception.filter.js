"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Request could not be processed';
        let code = 'INTERNAL_SERVER_ERROR';
        let details = [];
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const resObj = res;
                message =
                    typeof resObj.message === 'string'
                        ? resObj.message
                        : 'Request could not be processed';
                if (Array.isArray(resObj.message)) {
                    code = 'VALIDATION_ERROR';
                    details = resObj.message;
                    message = 'Validation failed for one or more fields';
                }
                else if (resObj.code) {
                    code = String(resObj.code);
                }
                else {
                    code = this.mapStatusToErrorCode(status);
                }
                if (Array.isArray(resObj.details)) {
                    details = resObj.details;
                }
            }
        }
        else {
            this.logger.error(`Unhandled error on ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
        }
        const body = {
            success: false,
            message,
            error: {
                code,
                details,
            },
        };
        response.status(status).json(body);
    }
    mapStatusToErrorCode(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'VALIDATION_ERROR';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case common_1.HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case common_1.HttpStatus.NOT_FOUND:
                return 'RESOURCE_NOT_FOUND';
            case common_1.HttpStatus.CONFLICT:
                return 'RESOURCE_CONFLICT';
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return 'RATE_LIMIT_EXCEEDED';
            default:
                return 'REQUEST_FAILED';
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map
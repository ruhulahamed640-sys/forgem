"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const constants_1 = require("../constants");
const auth_service_1 = require("../../modules/auth/auth.service");
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    authService;
    constructor(reflector, authService) {
        this.reflector = reflector;
        this.authService = authService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(constants_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const cookieToken = request.cookies?.['sp_access_token'];
        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7).trim();
        }
        else if (cookieToken) {
            if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
                const csrfCookie = request.cookies?.['sp_csrf_token'];
                const csrfHeader = request.headers['x-csrf-token'];
                if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
                    throw new common_1.UnauthorizedException({
                        message: 'CSRF token validation failed',
                        code: 'CSRF_TOKEN_INVALID',
                    });
                }
            }
            token = cookieToken;
        }
        if (!token) {
            throw new common_1.UnauthorizedException({
                message: 'Authentication token is required',
                code: 'MISSING_AUTH_TOKEN',
            });
        }
        const user = await this.authService.verifyAccessTokenAndSession(token);
        request.user = user;
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        auth_service_1.AuthService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map
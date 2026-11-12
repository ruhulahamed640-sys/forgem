"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../../src/app.module");
const sanitize_validation_pipe_1 = require("../../src/common/pipes/sanitize-validation.pipe");
describe('StudyPilot API E2E Suite (/api/v1)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes((0, sanitize_validation_pipe_1.createGlobalValidationPipe)());
        await app.init();
    });
    afterAll(async () => {
        if (app)
            await app.close();
    });
    it('GET /api/v1/health returns standardized success envelope', async () => {
        const res = await request(app.getHttpServer()).get('/api/v1/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('status');
    });
    it('Protected endpoints reject unauthenticated requests with 401 and standardized error envelope', async () => {
        const res = await request(app.getHttpServer()).get('/api/v1/users/me');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('MISSING_AUTH_TOKEN');
    });
});
//# sourceMappingURL=studypilot.e2e-spec.js.map
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../../src/app.module';

describe("GET /customer/{id}", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe("GET customer by as this customer", () => {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im0tZDE1MlpqYjZqNHhxOEtmT0lTTiJ9.eyJodHRwczovL21ldGEuY29tL3JvbGVzIjpbImN1c3RvbWVyIl0sImdpdmVuX25hbWUiOiLQoNC-0LzQsNC9IiwiZmFtaWx5X25hbWUiOiLQodGW0LzQvtC90Y_QvSIsIm5pY2tuYW1lIjoid3d3cHJhbmlrIiwibmFtZSI6ItCg0L7QvNCw0L0g0KHRltC80L7QvdGP0L0iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUdObXl4YXpmSGdaV0RZbWNWdEpEdGVxODZIRlFEMW9ieVdJUXNJRk01YVU9czk2LWMiLCJsb2NhbGUiOiJ1ayIsInVwZGF0ZWRfYXQiOiIyMDIzLTAzLTMwVDE5OjUwOjQ2LjkzM1oiLCJlbWFpbCI6Ind3d3ByYW5pa0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9kZXYtNjYzbS1sZTkuZXUuYXV0aDAuY29tLyIsImF1ZCI6Ilp1WDBianh5NmJBS1Foa25LSEVibWxsdlFxRzVNSklKIiwiaWF0IjoxNjgwMjA1ODQ3LCJleHAiOjE2ODAyNDE4NDcsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE1NTc5NjA0OTI5NjE2MDkxMzI2Iiwic2lkIjoiVFBsbEJCNGhHN3lQQ0RERWI3NXpGVkdvOUlDVy1ybXAiLCJub25jZSI6IlJsRmhaSGhYYVd0cmFVOVlTWHBtUWxwSFExUjBWR3RUTlVka1VYbFdjbUUxTlVaTFNXazFaREJ5VXc9PSJ9.HM5NLWHlyCgd1plDw-AUf6InbIC7838WwGAEo8LawdMoWw4azQlxSOeugulqx_cxhI7snp7by6uxCW8LdP4-YicZWFGgxMxgeLNmsUbsvAcQgkdh9jOCn6AUZ-AtEiCpcqpOr8tgq34VlpGToZ-k7DDYH9QFvrpU-NSiRR6PADzzG1C6lW1GggCQU8h-niLlgZuwvRWQewXPYE0nh4oB_zwDg_Z914yBrmmBi3KeYLtPFCUimhIL18Y5JzHMPn02VyU-P84YaJj2fYXBtHO-m0X-7r-825qVtS_1QBnV-sKKGgQMCRrP09B6eR5EDtpCdJjL_vruWgW3C9gvjtCixg";
        const id = "4571046f-0e3b-44d0-8bba-efee83ea8d27"
        test("should return 200 status code", async () => {
            const response = await request(app.getHttpServer())
                .get(`/customers/${id}`)
                .send()
                .set({ Authorization: `Bearer ${token}`});
            expect(response.statusCode).toBe(200);
            expect(response.body.firstName).toBe("Roman");
            expect(response.body.phone).toBe("+380936530874");
        })
       
    })
})
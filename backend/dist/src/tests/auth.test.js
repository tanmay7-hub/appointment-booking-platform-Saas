import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";
describe("Authentication API", () => {
    it("should reject requests without authentication", async () => {
        const response = await request(app)
            .get("/api/organizations")
            .expect(401);
        expect(response.body).toBeDefined();
    });
});
//# sourceMappingURL=auth.test.js.map
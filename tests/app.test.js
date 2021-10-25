// alem dos testes, colocar o dump dentro da pasta do projeto e mandar pro github juntos
import connection from "../src/database.js";
import supertest from "supertest";
import app from "../src/app.js";

afterAll(() => {
    connection.end();
});

describe("POST /sign-up", () => {

    beforeEach(async () => {
        await connection.query("DELETE FROM users WHERE id != 1");
    });
    
    afterAll(async () => {
        await connection.query("DELETE FROM users WHERE id != 1");
    });

    const mockUser = {
        name: "Roberval",
        email: "roberval_xuxuzinho@email.com",
        password: "senhasegura"
    }

    it("returns 400 for body property missing", async() => {
        const auxUser = { ...mockUser };
        delete auxUser.name;
        const result = await supertest(app).post("/sign-up").send(auxUser);
        expect(result.status).toEqual(400);
    });

    it("returns 400 if password safety requirements not satisfied", async() => {
        const auxUser = { ...mockUser };
        delete auxUser.password;
        auxUser.password = "123";
        const result = await supertest(app).post("/sign-up").send(auxUser);
        expect(result.status).toEqual(400);
    });

    it("returns 201 for valid params", async() => {
        const result = await supertest(app).post("/sign-up").send(mockUser);
        expect(result.status).toEqual(201);
    });

    it("returns 409 if email is already registered", async() => {
        await supertest(app).post("/sign-up").send(mockUser);
        const result = await supertest(app).post("/sign-up").send(mockUser);
        expect(result.status).toEqual(409);
    });

});
import connection from "../database.js";
import { v4 as uuid } from "uuid";
import { validateUser } from "../schemas/users.js";

async function register (req, res) {
    const { name, email, password } = req.body;
    const errors = validateUser.validate(req.body).error;
    if (errors) return res.sendStatus(400);
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const existentEmail = await connection.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (existentEmail.rows[0].length) return res.status(409).send("This email has already been used!");
        await connection.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, hashedPassword]);
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function login (req, res) {
    const { email, password } = req.body;
    try {
        const result = await connection.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
            await connection.query(`INSERT INTO sessions ("userId", token) VALUES ($1, $2)`, [user.id, token]);
            res.status(201).send(token);
        } else {
            res.status(404).send("Email or password are incorrect!");
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export {
    register,
    login,
}
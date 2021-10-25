import { validateUser } from "../schemas/users.js";
import validateToken from "../helpers/validateToken.js";
import connection from "../database.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

async function register (req, res) {
    const { name, email, password } = req.body;
    const errors = validateUser.validate(req.body).error;
    if (errors) return res.sendStatus(400);
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const existentEmail = await connection.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (existentEmail.rows[0]?.length) return res.status(409).send("This email has already been used!");
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
            const activeSession = await connection.query(`SELECT * FROM sessions WHERE "userId" = $1`, [user.id]);
            if(!activeSession.rowCount) {
                const token = uuid();
                await connection.query(`INSERT INTO sessions ("userId", token) VALUES ($1, $2)`, [user.id, token]);
                return res.status(201).send(token);
            }
            res.send(activeSession.rows[0].token);
        } else {
            res.status(404).send("Email or password are incorrect!");
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function getUser (req, res) {
    const authorization = req.headers['authorization'];
    try {
        const user = await validateToken(authorization);
        if (user) {
            const userTransactions = await connection.query(`SELECT * FROM transactions WHERE "userId" = $1`, [user.id]);
            const result = { user, transactions: userTransactions.rows }
            delete result.user.password;
            res.status(200).send(result);
        } else {
            return res.sendStatus(401);
        }    
    } catch (error) {
        console.log(error);
        res.send(500);
    }
}

async function deleteSession (req, res) {
    const authorization = req.headers['authorization'];
    try {
        const user = await validateToken(authorization);
        if (user) {
            await connection.query(`DELETE FROM sessions WHERE "userId" = $1`, [user.id]);
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }    
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function newFunds (req, res) {
    const { value, description, type } = req.body;
    const valueToCents = 100*(parseFloat(value).toFixed(2));
    const date = dayjs().format("MM/DD");
    const authorization = req.headers["authorization"];
    try {
        const user = await validateToken(authorization);
        if (type !== "income" && type !== "expense") return res.status(400).send("Invalid type transaction!");
        if (user) {
            await connection.query(`INSERT INTO transactions ("userId", value, type, description, date) VALUES ($1, $2, $3, $4, $5)`, [user.userId, valueToCents, type, description, date]);
            res.sendStatus(201);
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export {
    register,
    login,
    getUser,
    deleteSession,
    newFunds
}
import express from "express";
import cors from "cors";

import { register, login, getUser, deleteSession, newFunds } from "./controllers/users.js";

const port = 4000;
const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", register);
app.post("/sign-in", login);
app.get("/users", getUser);
app.delete("/users", deleteSession);
app.post("/users", newFunds);

export default app;
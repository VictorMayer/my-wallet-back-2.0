import express from "express";
import chalk from "chalk";
import cors from "cors";

import { register, login } from "./controllers/users.js";

const port = 4000;
const app = express();
app.use(express.json());
app.use(cors());

app.post("/sing-up", register);
app.post("/sign-in", login);

app.listen(4000, () => {
    console.log("Server running on Port: "+chalk.blue(port));
});
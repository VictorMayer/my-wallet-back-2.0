import app from "./app.js";
import chalk from "chalk";

const port = 4000;

app.listen(port, () => {
    console.log("Server running on Port: "+chalk.blue(port));
});
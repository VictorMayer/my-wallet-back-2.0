import joi from "joi";

const validateUser = joi.object({
    name: joi.string().min(2).required(),
    email: joi.string().min(5).pattern(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).required(),
    password: joi.string().min(6).required()
}).length(3);

export { validateUser };
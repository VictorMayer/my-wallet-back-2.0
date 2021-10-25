import connection from "../database.js";

export default async function validateToken(authorization) {
    const token = authorization?.replace('Bearer ', '');
    if (!token) return false;
    try {
        const result = await connection.query(`
            SELECT * FROM sessions
            JOIN users ON sessions."userId" = users.id
            WHERE sessions.token = $1
        `, [token]);
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return false;
    }
}
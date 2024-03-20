
import mysql from 'mysql2/promise';

var randomValue = 5;

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "qweasd123",
    database: "interactive_comments",
    port: "3306",
    waitForConnections: true, // Optional: whether the pool should automatically queue queries when all connections are in use
    connectionLimit: 10, // Optional: maximum number of connections in the pool
    queueLimit: 0 // Optional: maximum number of queued requests allowed when all connections are busy (0 = unlimited)
});

const model =
    {
        async addtwo()
        {
            return 2;
        },






        async retThree()
        {
            return 3;
        },

        async getAllComments()
        {
            try {
                const connection = await pool.getConnection();

                // SQL query to select all rows from the users table
                const selectQuery = 'SELECT * FROM Comments';

                // Execute the SQL query
                const [rows] = await connection.query(selectQuery);

                connection.release();
                console.log(rows);

                return rows;
            } catch (error) {
                console.error('Error getting comments:', error);
                return [];
            } 
        },

    }

export default model;

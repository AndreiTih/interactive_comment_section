import mysql from 'mysql2/promise';


//TODO: Note to future self, there's a catch 22 here on a new server, we're passing the database interactive_comments when we create 
// the pool, but we need the pool to create the database. To solve this either create the database manually instead of with code
// or use the USE database thingy in your queries and ommit it from your createPool call.
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


////////////////////////////////////////////////////////////////////
///////////////////////////////// INTIALIZE DATABASE AND TABLES ////
////////////////////////////////////////////////////////////////////

const model = 
    {
        async initDatabase()
        {
            await createDatabaseIfNotExists();
            await createAllTablesIfNotExists();
        },

        /*
        Creating the tables if they don't exist
        */
        async createDatabaseIfNotExists()
        {
            try {
                const connection = await pool.getConnection();

                const createDatabaseQuery=`
                CREATE DATABASE IF NOT EXISTS interactive_comments;
                `;

                // Execute the SQL query
                await connection.query(createDatabaseQuery);

                // Release the connection back to the pool
                connection.release();

            } catch (error) {
                console.error('Error creating database', error);
            }
        },
        async createAllTablesIfNotExists()
        {
            const createUsersTableQuery =`
            CREATE TABLE IF NOT EXISTS Users (
                Username VARCHAR(255) NOT NULL,
                PRIMARY KEY (Username) 
            );`;
            const createCommentsTableQuery =`
            CREATE TABLE IF NOT EXISTS Comments (
                ID INT AUTO_INCREMENT NOT NULL,
                Content VARCHAR(10000) NOT NULL,
                Username VARCHAR(255) NOT NULL,
                Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (ID),
                FOREIGN KEY (Username) REFERENCES Users(Username)
            );`;
            try {
                const connection = await pool.getConnection();

                await connection.query(createUsersTableQuery);
                await connection.query(createCommentsTableQuery);

                // Release the connection back to the pool
                connection.release();

            } catch (error) {
                console.error('Error creating database', error);
            }
        },

        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////// SELECT QUERIES ///////////////////
        ////////////////////////////////////////////////////////////////////

        async getAllComments()
        {
            try {
                const connection = await pool.getConnection();

                // SQL query to select all rows from the users table
                const selectQuery = 'SELECT * FROM Comments';

                // Execute the SQL query
                const [rows] = await connection.query(selectQuery);

                connection.release();

                return rows;
            } catch (error) {
                console.error('Error getting comments:', error);
                return [];
            } 
        },
        async getAllUsers()
        {
            try {
                const connection = await pool.getConnection();

                // SQL query to select all rows from the users table
                const selectQuery = 'SELECT * FROM Users';

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

        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////// INSERT QUERIES ///////////////////
        ////////////////////////////////////////////////////////////////////

        async insertComment(username, content)
        {
            const currentTimeUTC = new Date().toISOString().slice(0, 19).replace('T', ' ');
            try {
                const connection = await pool.getConnection();

                const insertQuery = `INSERT INTO Comments (Content,Username,Time) VALUES (?,?,'${currentTimeUTC}')`;

                await connection.query(insertQuery,[content,username]);

                connection.release();
            } catch (error) {
                console.error('Error inserting comment:', error);
            } 
        },

        async insertUser(username)
        {
            try {
                const connection = await pool.getConnection();

                const insertQuery = 'INSERT INTO Users (Username) VALUES (?)';

                await connection.query(insertQuery,[username]);

                connection.release();
            } catch (error) {
                console.error('Error inserting users:', error);
            } 
        },

        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////// REMOVE QUERIES ///////////////////
        ////////////////////////////////////////////////////////////////////

        async deleteComment(comment_id)
        {
            try {
                const connection = await pool.getConnection();

                const deleteQuery = 'DELETE FROM Comments WHERE ID = ?';

                await connection.query(deleteQuery, [comment_id]);

                connection.release();
            } catch (error) {
                console.error('Error deleting comment:', error);
            } 
        },

        async updateComment(comment_id, content)
        {
            try {
                const connection = await pool.getConnection();

                const [result] = await connection.execute(
                    'UPDATE Comments SET content = ? WHERE id = ?',
                    [content, comment_id]
                );

                if (result.affectedRows === 1) {
                    console.log('Comment updated successfully');
                } else {
                    console.log('Comment with specified id not found');
                }

                connection.release();
            } catch (error) {
                console.error('Error updating comment:', error);
            } 
        },


        // Populates the database with some data for testing
        async populateDummyData()
        {
            /*
        insertUser("amyrobson");
        insertUser("maxblagun");
        insertUser("Alberto");
        insertUser("Andrei");
        */

            insertComment('amyrobson',
                `Impressive! Though it seems the drag feature could be improved. But overall it
        looks incredible. You've nailed the design and the responsiveness at various
        breakpoints works really well.`,
                'amyrobson');
            insertComment('maxblagun',
                `Woah, your project looks awesome! How long have you been coding for? I'm still new,
        but I think I want to dive into React as well soon. Prehaps you can give me an insight
        on where I can learn React? Thanks!`,
                'maxblagun');
            insertComment('Alberto',
                `@maxblagun if you're still new, I'd recommend focusing on the fundamentals of HTML, CSS and
        JS before considering React. It's very tempting to jump ahead but lay a foundation first.`,
                'Alberto');
            insertComment('Andrei',
                `@ramsesmiron I couldn't agree more with this. Everything moves so fast and it always seems like
        everyone knows the newest library/framework. But the fundamentals are what stay constant.`,
            );
        }
    }

//initDatabase();
//populateDummyData();
async function testingStuff()
{
    await deleteComment(1);
    getAllComments();
}

//testingStuff();

export default model; 

import mysql from 'mysql2/promise';
import fs from 'fs';

//TODO: Note to future self, there's a catch 22 here on a new server, we're passing the database interactive_comments when we create 
// the pool, but we need the pool to create the database. To solve this either create the database manually instead of with code
// or use the USE database thingy in your queries and ommit it from your createPool call.

const db_settings = JSON.parse(fs.readFileSync('db_config.json'));
db_settings.waitForConnections = true;
db_settings.connectionLimit = 10;
db_settings.queueLimit = 0;
console.log(db_settings);
var pool = mysql.createPool(db_settings);


const model = 
    {
        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////// SELECT QUERIES ///////////////////
        ////////////////////////////////////////////////////////////////////

        async getAllComments()
        {
            try {
                const connection = await pool.getConnection();

                // SQL query to select all rows from the users table
                const selectQuery = 'SELECT * FROM interactive_comments.Comments';

                // Execute the SQL query
                const [rows] = await connection.query(selectQuery);

                connection.release();

                return rows;
            } catch (error) {
                console.error('Error getting comments:', error);
                return [];
            } 
        },
        async getUsernameWithID(id)
        {
            try {
                const connection = await pool.getConnection();

                // SQL query to select all rows from the users table
                const selectQuery = `SELECT Username FROM interactive_comments.Comments WHERE ID='${id}';`

                // Execute the SQL query
                const [rows] = await connection.query(selectQuery);

                connection.release();

                console.log("username with id: " + rows[0].Username);
                return rows[0].Username;
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
                const selectQuery = 'SELECT * FROM interactive_comments.Users';

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

        async isUserInDataBase(username)
        {
            try {
                const connection = await pool.getConnection();
                // Execute the SQL query
                const [rows] = await connection.query(`SELECT * FROM interactive_comments.Users WHERE Username = '${username}' `);

                connection.release();
                return (rows.length > 0);
            } catch (error) {
                console.error('Error getting comments:', error);
                return [];
            } 
        },
        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////// INSERT QUERIES ///////////////////
        ////////////////////////////////////////////////////////////////////

        async insertComment(username, content,reply_id = null)
        {
            const currentTimeUTC = new Date().toISOString().slice(0, 19).replace('T', ' ');
            try {
                const connection = await pool.getConnection();

                const insertQuery = `INSERT INTO interactive_comments.Comments (Content,Username,Time,ReplyID) VALUES (?,?,'${currentTimeUTC}',?)`;

                await connection.query(insertQuery,[content,username,reply_id]);

                connection.release();
            } catch (error) {
                console.error('Error inserting comment:', error);
            } 
        },
        async editComment(id, new_content)
        {
            const currentTimeUTC = new Date().toISOString().slice(0, 19).replace('T', ' ');
            try {
                const connection = await pool.getConnection();

                const insertQuery = `UPDATE interactive_comments.Comments SET Content = ? ,Time ='${currentTimeUTC}' WHERE ID = ?`;

                await connection.query(insertQuery,[new_content,id]);

                connection.release();
            } catch (error) {
                console.error('Error inserting comment:', error);
            } 
        },

        async insertUser(username)
        {
            try {
                const connection = await pool.getConnection();

                const insertQuery = 'INSERT INTO interactive_comments.Users (Username) VALUES (?)';

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

                const deleteQuery = 'DELETE FROM interactive_comments.Comments WHERE ID = ?';

                await connection.query(deleteQuery, [comment_id]);

                connection.release();
                return true;
            } catch (error) {
                console.error('Error deleting comment:', error);
                return false;
            } 
        },

        async updateComment(comment_id, content)
        {
            try {
                const connection = await pool.getConnection();

                const [result] = await connection.execute(
                    'UPDATE interactive_comments.Comments SET content = ? WHERE id = ?',
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
    }

//////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// INTIALIZE DATABASE /////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

async function initDatabase()
{
    await createDatabaseIfNotExists();
    await createAllTablesIfNotExists();
    await populateCommentsTableIfEmpty();
}
async function createDatabaseIfNotExists()
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
}
/*
        Creating the tables if they don't exist
        */
async function createAllTablesIfNotExists()
{
    const createUsersTableQuery =`
            CREATE TABLE IF NOT EXISTS interactive_comments.Users (
                Username VARCHAR(255) NOT NULL,
                PRIMARY KEY (Username) 
            );`;
    const createCommentsTableQuery =`
            CREATE TABLE IF NOT EXISTS interactive_comments.Comments (
                ID INT AUTO_INCREMENT NOT NULL,
                Content VARCHAR(10000) NOT NULL,
                Username VARCHAR(255) NOT NULL,
                Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ReplyID INT,
                PRIMARY KEY (ID),
                FOREIGN KEY (Username) REFERENCES Users(Username),
                FOREIGN KEY (ReplyID) REFERENCES Comments(ID)
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
}

// Populates the database with some data for testing
async function populateCommentsTableIfEmpty()
{
    const results = await pool.query(`SELECT COUNT(*) AS count FROM interactive_comments.Comments`);

    if(results[0][0].count > 0)
    {
        console.log("The Comments table is already populated, skipping the populateCommentsTableIfEmpty step ...")
        return;
    }

    model.insertComment('amyrobson',
        `Impressive! Though it seems the drag feature could be improved. But overall it
        looks incredible. You've nailed the design and the responsiveness at various
        breakpoints works really well.`,
        'amyrobson');
    model.insertComment('Andrei',
        `Woah, your project looks awesome! How long have you been coding for? I'm still new,
        but I think I want to dive into React as well soon. Prehaps you can give me an insight
        on where I can learn React? Thanks!`,
        'maxblagun');
    model.insertComment('Alberto',
        `@maxblagun if you're still new, I'd recommend focusing on the fundamentals of HTML, CSS and
        JS before considering React. It's very tempting to jump ahead but lay a foundation first.`,
        'Alberto');
    model.insertComment('Gil',
        `@ramsesmiron I couldn't agree more with this. Everything moves so fast and it always seems like
        everyone knows the newest library/framework. But the fundamentals are what stay constant.`,
    );
}

initDatabase();
export default model; 

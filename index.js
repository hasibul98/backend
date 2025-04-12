// file: index.js
// not use "type": "module", if you use require....   

const express = require( "express" );
const mysql = require( "mysql2/promise" );
const cors = require( "cors" );
const bodyParser = require( "body-parser" );
const bcrypt = require( 'bcryptjs' );

const app = express();
app.use( cors() );
app.use( bodyParser.json() );

async function startServer ()
{
    try
    {
        const db = await mysql.createConnection( {
            host: "localhost",
            user: "root",
            password: "root",
            database: "blog_posting",
        } );

        console.log( "MySQL connected successfully" );
        // await db.query( `create database blog_posting` );
        // console.log( await db.query( 'show databases' ) );
        // await db.query( `
        //             CREATE TABLE users(
        //                 id INT AUTO_INCREMENT PRIMARY KEY,
        //                 fullname VARCHAR(100) NOT NULL,
        //                 email VARCHAR(100) NOT NULL UNIQUE,
        //                 password VARCHAR(300) NOT NULL
        //             );

        //     `);
        app.post( '/signup', async ( req, res ) =>
        {
            const { name, email, password } = req.body;
            if ( !name || !email || !password )
            {
                return res.status( 400 ).json( { error: "All fields ar required" } );
            }
            try
            {
                // Hash the password before saving it to the database
                const hashedPassword = await bcrypt.hash( password, 10 ); // 10 is the salt rounds
                await db.query( "INSERT INTO users (fullname, email, password) VALUES(?, ?, ?)", [ name, email, hashedPassword ] );
                res.status( 201 ).json( { message: "user registered successfully" } );
            } catch ( err )
            {
                if ( err.code === "ER_DUP_ENTRY" )
                {
                    return res.status( 409 ).json( { error: "Email already exists" } );
                }
                console.error( "Signup error:", err );
                res.status( 500 ).json( { error: "internal server error" } );
            }

        } );
        // app.get( "/signup", ( req, res ) =>
        // {
        //     res.send( 'i am working' );
        // } );

        app.listen( 5000, () =>
        {
            console.log( "Server started on port 5000" );
        } );

    } catch ( err )
    {
        console.error( "Database connection failed:", err );
    }
}

startServer();



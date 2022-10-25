const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
const mysql = require('mysql');
const cors = require("cors");
let passwordHash = require('password-hash');
app.use(express.json());
app.use(cors());
const DBConnect = process.env.DB_CONNECT || require('./db')

app.get('/', (req, res) => {
    
    res.send({message: "Welcome to the RELIE API"})
})

// Get user for login

app.get('/user/:email/:password',  (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select id, password from users where email = '${req.params.email}'`, (err, results) => {
        if(err) {
            connection.end();
            res.status(403).send(err);
        }

        else {
            if(passwordHash.verify(req.params.password, results[0].password) === true) {
                connection.end();

                const newData = {id: results[0].id, loggedIn: true}
                res.send(newData)
            }
            else {
                connection.end();

                res.status(403).send({message: "Wrong Password"})
            }
        }
    })
})

// Get user by ID for Nav

app.get('/user/:id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select first_name, last_name from users where id = ${req.params.id} `, (err, results) => {
        if(!err) {
            connection.end();
            res.send(results);
        }
        else {
            res.status(204).send({message: 'There was no user found with this id'})
        }
    })
})

// Get user by ID for Profile Page

app.get('/profile/:id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select first_name, last_name, email, phone_number, status, created from users where id = ${req.params.id} `, (err, results) => {
        if(!err) {
            connection.end();

            if(results[0].status === 1) {
                const newData = [{
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email,
                    phone_number: results[0].phone_number,
                    created: results[0].created,
                    status: "Active"
                }]

                res.send(newData);
            }

            else {
                const newData = [{
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email,
                    phone_number: results[0].phone_number,
                    created: results[0].created,
                    status: "Inactive"
                }]
                
                res.send(newData)
            }
        }
        else {
            res.status(204).send({message: 'There was no user found with this id'})
        }
    })
})

// Get the quote and order amount for dashboard

app.get('/quotes&OrdersNumber/:rep_id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    let data=[];

    connection.query(`select count(*) from quotes q where q.rep_id = ${req.params.rep_id}`, (err, results) => {
        if(!err) {
            data.push(results[0]);
        }
        else {
            res.status(403).send({message: 'Error'})
        }
    })

    connection.query(`select count(*) from orders q where q.rep_id = ${req.params.rep_id}`, (err, results) => {
        if(!err) {
            data.push(results[0]);
            connection.end();
            res.send(data);
        }
        else {
            res.status(403).send({message: 'Error'})
        }
    })
})

// Get all orders associated with rep_id

app.get('/myOrders/:rep_id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select order_id, cust_id, quote_id, total_amount, order_date from orders where rep_id = ${req.params.rep_id}`, (err, results) => {
        if(!err) {
            connection.end();
            res.send(results);
        }
        else {
            connection.end();
            res.status(403).send({message: 'No orders found'})
        }
    })
})

// Get customer info for order 

app.get('/customerOrder/:cust_id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select fname, lname from customers where cust_id = ${req.params.cust_id}`, (err, results) => {
        if(!err) {
            connection.end();
            res.send(results);
        }
        else {
            res.status(403).send({message: 'Customer not found'})
        }
    })
})

// Get your quotes by rep_id

app.get('/myQuotes/:rep_id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select quote_name, quote_id, quote_phone, quote_date, quote_status, sq_foot, quote_tot1, quote_tot2 from quotes where rep_id = ${req.params.rep_id}`, (err, results) => {
        if(!err) {
            connection.end();
            res.send(results);
        }
        else {
            connection.end();
            res.status(403).send({message: "No Quotes Found"});
        }
    })
})

// Get information for edit profile

app.get('/profileInfo/:rep_id/:info', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select first_name, last_name, ${req.params.info} from users where id = ${req.params.rep_id}`, (err, results) => {
        if(!err) {
            connection.end();
            res.send(results);
        }
        else {
            res.status(403).send({message: 'Rep not found', error: err})
        }
    })
})

// Update profile information

app.put('/myProfile/:id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`update users set first_name = '${req.body.first_name}', last_name = '${req.body.last_name}', email = '${req.body.email}', phone_number = '${req.body.phone_number}' where id = '${req.params.id}'`, (err, results) => {
        if(!err) {
            connection.end();
            res.send({message: 'Profile Updated!'})
        }
        else {
            connection.end();
            res.status(400).send({message: 'Profile not found', error: err})
        }
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`));
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

// Get user by ID for Profile Page

app.get('/profile/:id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    let newData;

    connection.query(`select first_name, last_name, email, phone_number, status, created, address from users where id = ${req.params.id} `, (err, results) => {
        if(!err) {

            if(results[0].status === 1) {
                newData = [{
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email,
                    phone_number: results[0].phone_number,
                    created: results[0].created,
                    address: results[0].address,
                    zipcode: results[0].zipcode,
                    status: "Active"
                }]
            }

            else {
                newData = [{
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email,
                    phone_number: results[0].phone_number,
                    created: results[0].created,
                    address: results[0].address,
                    status: "Inactive"
                }]
            
            }
        }
        else {
            res.status(204).send({message: 'There was no user found with this id'})
        }
    })

    connection.query(`select marital_status from user_details where id = ${req.params.id}`, (err, results) => {
        connection.end();
        if(!err) {
            // newData = {...newData, maritalStatus: results[0].marital_status};
            newData.push(results[0])

            res.send(newData);
        }
        else {
            res.status(403).send({message: 'Marital Status Error', error: err})
        }
    })
})

// Get all products

app.get('/getProducts', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`select prod_name, prod_type_id, prod_cost, prod_calc from products`, (err, results) => {
        connection.end();
        if(!err) {
            res.send(results)
        }
        else {
            res.status(403).send({message: 'Products error', error: err})
        }
    })
})

// Get insulation types and costs

app.get('/insulation', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query('select ins_type, ins_r_value from insulation', (err, results) => {
        connection.end();
        if(!err) {
            res.send(results)
        }
        else {
            res.status(403).send({message: 'Insulation Error', error: err})
        }
    })
})





// Updates

// Update profile information

app.put('/myProfile/:id', (req, res) => {
    const connection = mysql.createConnection(DBConnect);

    connection.query(`update users set first_name = '${req.body.first_name}', last_name = '${req.body.last_name}', email = '${req.body.email}', phone_number = '${req.body.phone_number}' where id = '${req.params.id}'`, (err, results) => {
        connection.end();
        if(!err) {
            res.send({message: 'User Updated'})
        }
        else {
            res.status(400).send({message: 'Profile not found', error: err})
        }
    })

    // let mStatus;

    // if(req.body.maritalStatus === 'Unmarried') {
    //     mStatus = "u"
    // }
    // else {
    //     mStatus = "M"
    // }

    // connection.query(`update user_details set marital_status = ${mStatus} where id = ${req.params.id}`, (err, results) => {
    //     connection.end();
    //     if(!err) {
    //         res.send({message: 'User Updated'})
    //     }
    //     else {
    //         console.log(err)
    //         res.status(403).send({message: "Marital Status Error"})
    //     }
    // })
})


app.listen(port, () => console.log(`Listening on port ${port}`));
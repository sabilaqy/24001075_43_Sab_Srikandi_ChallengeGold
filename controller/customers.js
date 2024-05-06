const express = require('express');
const client = require('../models/dbConnection');
const router = express.Router();

// 1. GET LIST API 
router.get('/', async (req, res)=>{
    // ambil data
        const rawData = await client.query(`SELECT * FROM customers;`)
        const customers = rawData.rows;
        console.log(customers);
        res.status(200).render('detail/index', {
            dataUser: customers
        });
 });

 // 2. GET DETAIL CUSTOMER
router.get('/:id', async (req, res)=>{
    const id = req.params.id;
    const rawData = await client.query(`
        SELECT * FROM customers
        WHERE customer_id = $1
    `, [id]);
    const data = rawData.rows[0];
    res.status(200).render('detail/customer', {
        dataCustomer: data,
        id
    });
});

// 3. GET DETAIL CUSTOMER'S ORDER
router.get('/orders/:id', async (req, res)=>{
        const id = req.params.id;
        const rawData = await client.query(`
        SELECT * FROM orders
        WHERE customer_id = $1
        `, [id]);
        const data = rawData.rows;
        console.log(data);
        // res.status(200).json(data);
        res.status(200).render('detail/customers_order', {
            orders: data,
            id
        });
});

// 4. POST API
router.post('/create', async (req, res)=>{
     // ambil data dari client
     const payload = req.body;
     const customer_name = payload.customer_name;
     const customer_contact = payload.customer_contact;
     const address = payload.address;
     const city = payload.city;
     const postal_code = payload.postal_code;
     const country = payload.country;

     await client.query('BEGIN') // untuk memulai transaksi
     try {
         const insertedData = await client.query(`
            INSERT INTO customers (customer_name, customer_contact, address, city, postal_code, country)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING customer_id, customer_name
        `, [
            customer_name,
            customer_contact,
            address,
            city,
            postal_code,
            country
        ])
        await client.query('COMMIT')
        // kasih response
        res.redirect('/customers');
        } catch (error) {
            console.log(error);
            await client.query('ROLLBACK'); // untuk mengatasi data yang error
            res.status(500).send('internal server error');
        }
 })

// 5. PUT API
router.put('/update/:id', async (req, res)=>{
    // ambil data
    await client.query('BEGIN')
    try {
        const payload = req.body
        const id = req.params.id;
    
        const rawOldData = await client.query(`
        SELECT * FROM customers
        WHERE customer_id = $1
        `, [id]);
        const oldData = rawOldData.rows[0];
        console.log(oldData);
    
        // update data
        let name = oldData.customer_name
        let contact= oldData.customer_contact;
        let address = oldData.address;
        let postalCode = oldData.postal_code;
        let city = oldData.city
            contact= payload.customer_contact;
            address = payload.address;
            postalCode = payload.postal_code;
            city = payload.city
        const newRawData = await client.query(`
        UPDATE customers
        SET customer_name = $1, customer_contact = $2, address = $3, postal_code = $4, city = $5
        WHERE customer_id = $6
        `, [name, contact, address, postalCode, city, id]);
        const newData = newRawData.rows[0];
        console.log(newData);
        await client.query('COMMIT');
        res.redirect('/customers');
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK');
        res.status(500).send('internal server error');
     }
 })

// 6. DELETE API
router.delete('/delete/:id', async(req, res)=>{
    await client.query('BEGIN');
    try {
        const id = req.params.id;
        await client.query(`
            DELETE FROM customers
            WHERE customer_id = $1
        `, [id]);
        await client.query('COMMIT')
        res.redirect('/customers');
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK')
        response.status(500).send('internal server error')
    }
 })

// 7. GET EDITOR for adding and updating data
router.get('/editor/add', async(req, res)=>{
    const updateId = req.query.update_id;

    const rawData = await client.query(`
        SELECT * FROM customers
        WHERE customer_id = $1 
    `, [updateId]);
    const data = rawData.rows[0];

    res.status(200).render('editor/add_users',{
        updateId, 
        data
    });
});
router.get('/editor/update', async(req, res)=>{
    const updateId = req.query.update_id;

    const rawData = await client.query(`
        SELECT * FROM customers
        WHERE customer_id = $1 
    `, [updateId]);
    const data = rawData.rows[0];

    res.status(200).render('editor/update_users',{
        updateId, 
        data
    });
});


module.exports = router;
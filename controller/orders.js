const express = require('express');
const client = require('../models/dbConnection');
const router = express.Router();

// 1. GET LIST API 
router.get('/', async (req, res)=>{
    // ambil data orders
        const rawData = await client.query(`SELECT * FROM orders;`)
        const orders = rawData.rows;
        const count = rawData.rowCount;
        res.status(200).json({count, orders});
        res.render('index.ejs');
 });

// 2. GET DETAIL API
router.get('/:id', async (req, res)=>{
    // ambil data berdasarkan id
    const id = req.params.id;
    const rawData = await client.query(`
    SELECT * FROM orders
    WHERE order_id = $1
    `, [id]);
    const data = rawData.rows[0];
    res.status(200).json({data});
})

// 3. POST API
router.post('/create', async (req, res)=>{
    // ambil data dari customer
    const payload = req.body;
    const quantity = payload.quantity;
    const product_id = payload.product_id;
    const customer_id = payload.customer_id

    await client.query('BEGIN');
    try {
        // ambil data harga product
        const selectedData = await client.query(`
            SELECT unit_price FROM products
            WHERE product_id = $1;
        `, [product_id])
        const {unit_price} = selectedData.rows[0]
        console.log(unit_price)
        const totalPrice = quantity * unit_price;
        // tambah product ke dalam order
        const data = await client.query(`
            INSERT INTO orders (quantity, product_id, customer_id, total_Price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `, [quantity, product_id, customer_id, totalPrice]);
        await client.query('COMMIT');
        res.status(200).json({data: data.rows[0]})
    } catch (error) {
        console.log(error)
        await client.query('ROLLBACK')
        res.status(500).send('internal server error')
    }
 });

// 4. PUT API
router.put('/update/:id', async (req, res)=>{
   // ambil data
   await client.query('BEGIN')
   try {
       const payload = req.body
       const id = req.params.id;
   
       const rawOldData = await client.query(`
       SELECT * FROM orders
       WHERE order_id = $1
       `, [id]);
       const oldData = rawOldData.rows[0];
       console.log(oldData);
   
       // update data
       let product = oldData.product_id;
       let customer = oldData.customer_id;
       let quantity = oldData.quantity
           product = payload.product_id;
           customer = payload.customer_id;
           quantity = payload.quantity;

       const newRawData = await client.query(`
       UPDATE orders
       SET customer_id = $1, product_id = $2, quantity = $3
       WHERE orders_id = $4
       `, [product, customer, quantity, id]);
       const newData = newRawData.rows[0];
       console.log(newData);
       await client.query('COMMIT');
       res.status(200).json({data: newData});
   } catch (error) {
       console.log(error);
       await client.query('ROLLBACK');
       res.status(500).send('internal server error');
    }
 })

// 5. DELETE API
router.delete('/delete/:id', async (req, res)=>{ 
    await client.query('BEGIN');
    try {
        const id = req.params.id;
        await client.query(`
            DELETE FROM orders
            WHERE order_id = $1
        `, [id]);
        await client.query('COMMIT')
        res.status(200).send('Your orders deleted!')
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK')
        response.status(500).send('internal server error')
    }
})

// 6. GET EDITOR for adding and updating data
router.get('/editor/add', async(req, res)=>{
    const updateId = req.query.update_id;

    const rawData = await client.query(`
        SELECT * FROM orders
        WHERE order_id = $1 
    `, [updateId]);
    const data = rawData.rows[0];

    res.status(200).render('editor/add_orders',{
        updateId, 
        data
    });
});

module.exports = router;
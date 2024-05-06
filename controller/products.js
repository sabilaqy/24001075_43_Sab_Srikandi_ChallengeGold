const express = require('express');
const client = require('../models/dbConnection');
const router = express.Router();

// 1. GET LIST API 
router.get('/', async (req, res)=>{
    // ambil data
        const rawData = await client.query(`SELECT * FROM products;`)
        const products = rawData.rows;
        const count = rawData.rowCount;
        res.status(200).render('detail/product', {
            products
        });
});
    
// 2. GET DETAIL API
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const rawData = await client.query(`
    SELECT name, description, unit_price
    FROM products
    WHERE product_id = $1
    `, [id]);
    const data = rawData.rows[0];
    res.status(200).json({data});
})

// 3. POST API
router.post('/', async (req, res)=>{
    // create data
    await client.query('BEGIN')
    try {
        const payload = req.body
        const name = payload.name
        const description = payload.description
        const size = payload.size
        const price = payload.price

        const rawProducts = await client.query(`
        INSERT INTO products (name, description, size, unit_price)
        VALUES ($1, $2, $3, $4)
        RETURNING*;
        `, [name, description, size, price]);
        const products = rawProducts.rows[0];
        
        await client.query('COMMIT');
        console.log({products})
        res.status(200).json({products});
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK')
        res.status(500).send('Internal server error')
    }
 });

// 4. PUT API
router.put('/:id', async (req, res)=>{
    // ambil data
    await client.query('BEGIN')
    try {
        const payload = req.body
        const id = req.params.id;
    
        const rawOldData = await client.query(`
        SELECT name, description, size, unit_price
        FROM products
        WHERE product_id = $1
        `, [id]);
        const oldData = rawOldData.rows[0];
        console.log(oldData);
    
        // update data
        let name = oldData.name;
        let description = oldData.description;
            name = payload.name;
            description = payload.description;

        const newRawData = await client.query(`
        UPDATE products
        SET name = $1, description = $2
        WHERE product_id = $3
        `, [name, description, id]);
        const newData = newRawData.rows[0];
        console.log(newData);
        await client.query('COMMIT');
        res.status(200).json({data: newData});
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK');
        res.status(500).send('internal server error');
     }
 });

// 5. DELETE API
router.delete('/:id', async(req, res)=>{
    await client.query('BEGIN');
    try {
        const id = req.params.id;
        await client.query(`
            DELETE FROM products
            WHERE product_id = $1
        `, [id]);
        await client.query('COMMIT')
        res.status(200).send('The product deleted!')
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK')
        response.status(500).send('internal server error')
    }
 })



module.exports = router;
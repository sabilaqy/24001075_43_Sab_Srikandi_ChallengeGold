const express = require('express');
const app = express();
const methodOverride = require('method-override');
const client = require('./models/dbConnection')
const PORT = 3000;
const engine = require('ejs');

// MIDDLEWARE
app.use(express.static('public'));
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.use(methodOverride('_method'));


// ROUTES
const customerRoutes = require('./controller/customers')
const productRoutes = require('./controller/products')
const orderRoutes = require('./controller/orders')

app.get('/',(req,res)=>{res.status(200).render('landing/index')});
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`)
})
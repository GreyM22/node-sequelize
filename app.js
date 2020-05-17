const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error-controller');
const sequelize = require('./util/database');

const app = express();

const adminRoutes = require('./routers/admin');
const shopRoutes = require('./routers/shop');
const Product = require('./model/product');
const User = require('./model/user');
const Cart = require('./model/cart');
const CartItem = require('./model/cart-item');
const Order = require('./model/order');
const OrderItem = require('./model/orderItem');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.pageNotFound);

Product.belongsTo(User, { constrains: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.hasMany(CartItem);
Cart.belongsToMany(Product, { through: CartItem});
Product.belongsToMany(Cart, { through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem});
Product.belongsToMany(Order, { through: OrderItem});



sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        return Product.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Grei',
                email: 'grei@test.com'
            })
        }
        return Promise.resolve(user);
    })
    .then( user => {
        user.createCart();
        app.listen(3000);
    })
    .catch(err => console.log(err));

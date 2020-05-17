const Product = require('../model/product');

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: '/products',
                hasProduct: products.length > 0
            });
        })
        .catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findByPk(id)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => console.log(err));
}

exports.getIndexPage = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                hasProduct: products.length > 0
            });
        })
        .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {

    req.user
        .getCart()
        .then(cart => {
            cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: products
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    const id = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: id } });
        })
        .then(products => {
            let newProduct;
            if (products.length > 0) {
                newProduct = products[0];
                oldQuantity = newProduct.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return newProduct;
            } else {
                return Product
                    .findByPk(id)
                    .then(product => {
                        fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
                    })
                    .catch(err => console.log(err));
            }
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
        })
        .then(response => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({where: {id: id}});
        })
        .then(products => {
            let product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => res.redirect('/cart'))
        .catch(err => console.log(err));
}

exports.postOrders = (req, res, next) => {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }));
                })
                .catch(err => console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => res.redirect('/orders'))
        .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
}


exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Your Checkout',
        path: '/checkout'
    });
}

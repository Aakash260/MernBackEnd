import productModel from "../models/productModel.js"
import fs from 'fs'
import slugify from "slugify"
import braintree from "braintree"
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv'
dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.Merchant_ID,
    publicKey: process.env.Public_Key,
    privateKey: process.env.Private_Key,
});

export const createProductController = async (req, res) => {

    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is Required' })
            case !description:
                return res.status(400).send({ error: 'Description is Required' })
            case !price:
                return res.status(400).send({ error: 'Price is Required' })
            case !category:
                return res.status(400).send({ error: 'Category is Required' })
            case !quantity:
                return res.status(400).send({ error: 'Quantity is Required' })

            case photo && photo.size > 1000000:
                return res.status(400).send({ error: 'Photo is required size less 1mb' })

        }
        const products = new productModel({ ...req.fields, slug: slugify(name) })
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'Product created Successfully',
            products
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in creating Product',
            error
        })
    }
}


export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select('-photo').limit(12).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            message: 'All Products',
            products,
            total: products.length
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in fetching Product',
            error
        })
    }
}


export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select('-photo').populate('category')
        res.status(201).send({
            success: true,
            message: 'Single product',
            product
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in fetching product',
            error
        })
    }
}



export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select('photo')
        if (product.photo.data) {
            res.set('Content-type', product.photo.contentType)
            return res.status(200).send(product.photo.data)
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in fetching product',
            error
        })
    }
}



export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select('-photo')
        res.status(200).send({
            success: true,
            message: 'product delete successfully'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in deleting product',
            error
        })
    }
}


export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is Required' })
            case !description:
                return res.status(400).send({ error: 'Description is Required' })
            case !price:
                return res.status(400).send({ error: 'Price is Required' })
            case !category:
                return res.status(400).send({ error: 'Category is Required' })
            case !quantity:
                return res.status(400).send({ error: 'Quantity is Required' })

            case photo && photo.size > 1000000:
                return res.status(400).send({ error: 'Photo is required size less 1mb' })

        }
        const products = await productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true })
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'Product updated Successfully',
            products
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in updating Product',
            error
        })
    }
}

export const productFilterController = async (req, res) => {

    try {
        const { checked, radio } = req.body

        let arg = {}
        if (checked.length > 0) arg.category = checked
        if (radio.length) { arg.price = { $gte: radio[0], $lte: radio[1] } }

        const products = await productModel.find(arg)
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log("🚀 ~ file: productController.js:164 ~ productFilterController ~ error:", error)
        res.status(400).send({
            success: false,
            message: 'Error in filtering',
            error
        })
    }
}

export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        res.status(400).send({
            success: false,
            error
        })
    }
}

export const productListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel.find({}).select('-photo').skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {

    }
}

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const result = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).select('-photo')
        res.json(result)
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in Search',
            error
        })
    }
}

export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const product = await productModel.find({
            category: cid,
            _id: { $ne: pid },
        }).select('-photo').limit(3).populate('category');
        res.status(200).send({ success: true, product })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'error while creating products',
            error
        })
    }
}


export const braintreeTokenController = async (req, res) => {  
    try {
        gateway.clientToken.generate({}, function (err, response) {
            
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map(i => { total += i.price })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id
                    }).save();
                    res.json({ ok: true })
                } else {
                    res.status(500).send(error)
                }
            }
        )
    } catch (error) {
        console.log(error)
    }
}
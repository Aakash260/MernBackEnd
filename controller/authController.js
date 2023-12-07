
import userModels from '../models/userModels.js'
import { comparePassword, hashedPassword } from '../helper/autoHelper.js';
import orderModel from '../models/orderModel.js';
import JWT from 'jsonwebtoken'

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        if (!name || !email || !password || !phone || !address || !answer) {
            return res.send({
                message: 'fill all the fields please...'
            })
        }
        const isUserExist = await userModels.findOne({ email: email })

        if (isUserExist) {
            return res.status(200).send({
                success: false,
                message: 'Already Registered'
            })
        }
        const hashPassword = await hashedPassword(password)
        const user = await new userModels({ name, email, phone, address, password: hashPassword, answer }).save();
        res.status(200).send({
            success: true,
            message: "User Registered Successfully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in Registration",
            error
        })
    }
}



export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(200).send({
                error: 'fill all the fields please...'
            })
        }
        const user = await userModels.findOne({ email })
        if (!user) {
            return res.status(200).send({
                success: false,
                error: 'Email not registered'
            })
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                error: 'Invalid Credentials'
            })
        }
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).send({
            success: 'true',
            message: "Login user successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        })
    }
}



export const ForgotPassword = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email || !answer || !newPassword) {
            res.status(401).send({ message: 'please fill all the fields' })
        }
        const user = await userModels.findOne({ email, answer })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email Or Answer"
            })
        }
        const hashed = await hashedPassword(newPassword)
        await userModels.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully"
        })
    } catch (error) {
        console.log(error)
    }

}


export const getOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate("buyer", "name");
        res.json(orders)
    }
    catch (error) {
        res.status(500).send({
            error,
            success: false,
            message: "Error in fetching Order"
        })
    }
}

export const getAllOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer", "name");
        res.json(orders)
    }
    catch (error) {
        console.log(error)
        res.status(500).send({
            error,
            success: false,
            message: `Error in Fetching User Orders`
        })
    }
}

export const OrderUpdateController = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders)
    }
    catch (error) {
        console.log(error)
        res.status(500).send({
            error,
            success: false,
            message: `Error In updating Status`
        })
    }
}
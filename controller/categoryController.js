
import categoryModel from "../models/categoryModel.js"
import slugify from "slugify"

export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        if (!name) {
            res.status(401).send({
                success: false,
                message: 'name required'
            })
        }
        const existCategory = await categoryModel.findOne({ name })
        if (existCategory) {
            return res.status(200).send({
                success: false,
                message: 'Already Exist'
            })
        }
        const category = await new categoryModel({ name, slug: slugify(name) }).save()
        res.status(201).send({
            success: true,
            message: 'Category Created',
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: 'error in category'
        })
    }
}


export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        const { id } = req.params
        const category = await categoryModel.findByIdAndUpdate(id, { name, slug: slugify(name) }, { new: true })
        res.status(200).send({
            success: true,
            message: "updated successfully",
            category
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:'Error in updating category',
           error
        })
    }
}


export const getAllcategoryController = async(req,res) => {
    try {
        const all_category=await categoryModel.find({})
        res.status(200).send({
            success:true,
            message:'all category',
            all_category
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:'Error in fetching category',
           error
        })
    }
}

 
export const singleCategoryController = async(req,res) => {
 try {
    const category=await categoryModel.findOne({slug:req.params.slug})
    res.status(201).send({
        success: true,
        message: 'Single category',
        category
    })
 } catch (error) {
    res.status(500).send({
        success:false,
        message:'Error in fetching category',
       error
    })
 }
}


 

export const deleteCategoryController = async(req,res) => {
  try {
    const {id}=req.params
    await categoryModel.findByIdAndDelete(id)
    res.status(200).send({
        success:true,
        message:'delete successfully',
  
    })
  } catch (error) {
    res.status(500).send({
        success:false,
        message:'unable to delete',
        error
    })
  }
}



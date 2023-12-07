import express from 'express'
import { requireSignIn,isAdmin } from '../middleware/authMiddleware.js';
import { createCategoryController,updateCategoryController,getAllcategoryController,singleCategoryController,deleteCategoryController } from '../controller/categoryController.js';
const router= express.Router()

router.post('/create-category',requireSignIn,isAdmin,createCategoryController)

router.put('/update-category/:id',requireSignIn,isAdmin,updateCategoryController)

router.get('/get-category',getAllcategoryController)

router.get('/single-category/:slug',singleCategoryController)

router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController)
export default router
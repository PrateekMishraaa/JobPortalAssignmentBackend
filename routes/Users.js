import express from "express"
const router = express.Router()
import Users from "../models/User.js"
import JWT from "jsonwebtoken"
import bcrypt from "bcryptjs"

router.post('/register',async(req,res)=>{
    const {firstname,lastname,email,mobile,password} = req.body;
    if(!firstname || !lastname || !email || !mobile || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    if(mobile.length<10){
        return res.status(400).json({message:"Mobile Number should be not be more then 10 digits"})
    }
    try{
        const isUser = await Users.findOne({email})
        if(isUser){
            return res.status(300).json({message:"User already exist"})
        }
        const NewUser = await Users.create({
            firstname,
            lastname,
            email,
            mobile,
            password
        })
        console.log("user created",NewUser)
        return res.status(200).json({message:"User Created Successfully",user:NewUser})
    }catch(error){
        console.log("error",error)
        return res.status(500).json({message:"Internal server error",error})
    }
})
router.post("/login",async(req,res)=>{
    const {email,password}= req.body;
    if(!email || !password){
        return res.status(403).json({message:"Invalid credentials"})
    }
    try{
        const isUserExist = await Users.findOne({email})
        if(!isUserExist){
            return res.status(404).json({message:"User not found"})
        }
        const isMatch = await bcrypt.compare(password,isUserExist.password)
        if(!isMatch){
            return res.status(400).json({message:"Incorrect Password"})
        }
        const payload ={
            firstname:isUserExist.firstname,
            lastname:isUserExist.lastname,
            email:isUserExist.email,
            mobile:isUserExist.mobile
        }
        const token = await JWT.sign(payload,"jkahsdjkasjhd",{expiresIn:"2d"})
        if(!token){
            return res.status(300).json({message:"Issue facing while userloggin"})
        }
        console.log(token,payload)
        return res.status(200).json({message:"User logged in successfully",token,payload})
    }catch(error){
        console.log("error",error)
        return res.status(500).json({message:"internal server error",error})
    }
})
router.get("/allusers",async(req,res)=>{
    try{
        const users = await Users.find()
        console.log("users",users)
        return res.status(200).json({message:"User found with db",users})
    }catch(error){
        console.log('error',error)
        return res.status(500).json({message:"Internal server error",error})
    }
})
export default router
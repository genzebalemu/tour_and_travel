
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User }  from "../models/user.js";
const secret ="test";

export const signup = async (req,res)=>{
    const {email,password,firstname,lastname} = req.body;
    try {

        const existedUser = await User.findOne({email}) 
        if(existedUser){
           return res.status(400).json({message:"user already signup"})
        }
        const hashedPassword = await bcrypt.hash(password,12);
        if (firstname.trim() === '' || lastname.trim() === '') {
            return res.status(400).json({ message: 'Please provide both firstname and lastname.' });
          }
          
        const result = await User.create({
            name:`${firstname} ${lastname}`,
            email,
            password:hashedPassword
        });
    //    await result.save()
        const token = jwt.sign({email:result.email,id:result._id},secret,{expiresIn:"1h"});
        res.status(201).json({ result, token })
    } catch (error) {
        res.status(500).json({message:"something went wrong"});
        console.log(error);
    }
}

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "1h",
    });

    res.status(200).json({ result: oldUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

export const googleSignIn = async (req, res) => {
  const { email, name, token, googleId } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      const result = { _id: oldUser._id.toString(), email, name };
      return res.status(200).json({ result, token });
    }

    const result = await User.create({
      email,
      name,
      googleId,
    });

    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};


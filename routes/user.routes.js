const express = require("express");
const router = express.Router();
const { generateToken, jwtAuthMiddleware } = require("../jwt/jwt.js");
const User = require('../models/user.model.js')


router.post('/signup', async (req, res)=> {
    try {
        const data = req.body;

        const newUser = await User(data);
        await newUser.save();

        console.log('data saved'); 

        const payload = {
          id: newUser.id,
        };
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);

        return res.status(201).json({ newUser, token});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'})
    }
});


router.post("/login", async (req, res) => {

    try {
        const { aadharCardNumber, password } = req.body;
        if(!aadharCardNumber || !password) return res.status(400).json({error: "Please fill all the fields"})
    
        const user = await User.findOne({ aadharCardNumber });
    
        if(!user || !(await user.isPasswordCorrect(password))){
            return res.status(401).json({ error: "Invalid aadharCardNumber or password" });
        }
    
        const payload = {
            id: user.id
        }
    
        const token = generateToken(payload);
        res.json({ token, message: 'user successfully logged in' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/profile", jwtAuthMiddleware, async (req, res)=> {
    try {
        const userData = req.user;
        console.log("User Data: ", userData);

        const userId = await userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        const isMatchedPassword = await user.isPasswordCorrect(currentPassword);

        if(!isMatchedPassword){
            return res.status(401).json({ error: "Invalid credentials" });
        }

        user.password = newPassword;
        await user.save();

        //! OR

        // const updatedUser = await User.findByIdAndUpdate(userId, {
        //     password: newPassword,
        // }, {new: true});

        // if(!updatedUser){
        //     return res.status(401).json({ error: "Password doesn't changed" });
        // }

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;

import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (request, response) => {
    const { fullName, email, password } = request.body;

    try {
        if (password.length < 8) {
            return response.status(400).json({ message: "Password must be at least 8 characters" });
        }

        if (!fullName || !email || !password) {
            return response.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return response.status(400).json({ message: "Email already exists" });
        }

        //hash password using bcrypt package
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            //generating token
            generateToken(newUser._id, response);
            await newUser.save();

            response.status(201).json({
                _id: newUser._id, //mongoDB saves id with _id
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
        else {
            response.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (request, response) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return response.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return response.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, response);

        response.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        response.status(400).json({ message: "Internal Server Error"});
    }
}

export const logout = (request, response) => {
    try {
        response.cookie("jwt", "", {maxAge: 0});
        response.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error logging out.", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (request, response) => {
    try {
        const {profilePic} = request.body;

        const userID = request.user._id;

        if(!profilePic){
            response.status(400).json({message: "Profile pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userID, {profilePic:uploadResponse.secure_url}, {new: true});

        response.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (request, response) => {
    try {
        response.status(200).json(request.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
}
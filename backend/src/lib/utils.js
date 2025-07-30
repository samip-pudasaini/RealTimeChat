//generating tokens and sending it back to the user

import jwt from "jsonwebtoken"

export const generateToken = (userId, response) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    //sending the jwt token back in cookies
    response.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //in milisecond
        httpOnly: true, //prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", //CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development" //false when in development
    });

    return token
}
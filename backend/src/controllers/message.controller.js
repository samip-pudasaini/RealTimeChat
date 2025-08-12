import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js"

export const getUserForSidebar = async (request, response) => {
    try {
        const loggedInUserId = request.user._id;
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); //not equal user and no passwords

        response.status(200).json(filteredUser);
    } catch (error) {
        console.log("Error in getUsersForSidebar", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages = async (request, response) => {
    try {
        const { id: userToChatId } = request.params;
        const myId = request.user._id;

        const messages = await Message.find({
            $or: [
                {
                    senderId: myId, receiverId: userToChatId
                },
                {
                    senderId:userToChatId, receiverId: myId
                }
            ]
        });

        response.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (request, response) => {
    try {
        const { text, image } = request.body;
        const { id: receiverId } = request.params;
        const senderId = request.user._id;

        let imageURL;

        if(image){
            //Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL,
        });

        await newMessage.save();

        response.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessag Controller", error.message);
        response.status(500).json({ message: "Internal Server Error" });
    }
}


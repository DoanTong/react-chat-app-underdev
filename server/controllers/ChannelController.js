import User from "../models/UserModel.js";
import Channel from "../models/ChannelModel.js";
import Message from "../models/MessageModel.js";
import mongoose from "mongoose";


export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return response.status(400).json("Quản trị viên không tồn tại trong hệ thống." );
    }
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response.status(400).json({
        message: "Một số thành viên không tồn tại trong hệ thống."
      });
    }

    // Tạo kênh mới
    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Lỗi khi tạo kênh:", error.stack);
    return response.status(500).json({ message: "Lỗi server khi tạo kênh!" });
  }
};

// Lấy danh sách các kênh của người dùng
export const getUserChannels = async (request, response, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });
    
    // Nếu không có kênh nào được tìm thấy
    if (channels.length === 0) {
      return response.status(200).json({
        message: "Người dùng chưa tham gia kênh nào.",
        channels: [],
      });
    }

    // Trả về danh sách kênh
    return response.status(201).json({ channels });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kênh:", error.stack);
    return response.status(500).json({ message: "Lỗi server khi lấy danh sách kênh!" });
  }
};
export const getChannelMessages = async (request, response, next) => {
  try {
    const { channelId } = request.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate:{
      path:'sender', 
      select:"firtName lastName email _id image color",

    },
  });
  if(!channel){
    return response.status(404).send("Nhóm không tồn tại")
  }
    const messages = channel.messages;
    return response.status(201).json({ messages })
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kênh:", error.stack);
    return response.status(500).json({ message: "Lỗi server khi lấy danh sách kênh!" });
  }
};

// import User from "../models/UserModel.js";
// import jwt from "jsonwebtoken"

// const maxAge = 3 * 24 * 60 * 60 * 1000; 

// const createToken = (email, userId) => {
//     return jwt({email, userId}, process.env.JWT_KEY, {expiresIn:maxAge});
// };

// export const signup = async  (request, response, next) => {
//     try {
//         const {email, password} = request.body;
//         if(!email || !password){
//             return response.status(400).send("Email and Password is required.")
//         }
//         const user = await User.Create({email,password});
//         response.cookie("jwt", createToken(email, user.id),{
//             maxAge,
//             secure:true,
//             sameSite: "None",
//         });
//         return response.status(201).json({user:{
//             id:user.id,
//             email:user.email,
//             profileSetup:user.profileSetup,
//         },
//     });
//     } catch(error) {
//         console.log({error});
//         return response.status(500).send("Internal Server Error")
//     }
// };
import { compare } from "bcrypt";
import User from "../models/UserModel.js"; // Kiểm tra import
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs"

const maxAge = 3 * 24 * 60 * 60 * 1000; // Thời gian sống của token (3 ngày)

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc!" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại!" });
    }

    // Tạo người dùng mới
    const user = await User.create({ email, password });

    // Tạo JWT token
    const token = createToken(email, user.id);

    // Cài đặt cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge,
      secure: process.env.NODE_ENV === "production", // Chỉ bật "secure" trong môi trường production
      sameSite: "strict",
    });

    // Trả về thông tin người dùng
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup || false,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
};


export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Kiểm tra dữ liệu đầu vào
      if (!email || !password) {
        return res.status(400).json({ message: "Email và mật khẩu là bắt buộc!" });
      }
      // Kiem tra nguoi dung dang ki
      const user = await User.findOne({ email });
      if(!User){
        return res.status(404).json({ message: "Email with the given email not found." });
      }
      const auth = await compare(password, user.password);
      if(!auth){
        return res.status(409).json({ message: "Password không đúng!!!" });
      }
      // Tạo JWT token
      const token = createToken(email, user.id);
  
      // Cài đặt cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge,
        secure: process.env.NODE_ENV === "production", // Chỉ bật "secure" trong môi trường production
        sameSite: "strict",
      });
  
      // Trả về thông tin người dùng
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          profileSetup: user.profileSetup || false,
          firstName: user.firstName,
          lastName: user.lasttName,
          image: user.image,
          color: user.color,
        },
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      return res.status(500).json({ message: "Lỗi server khi đăng ký!" });
    }
  };

  export const getUserInfo = async (request, response, next) => {
    try {
      const userData = await User.findById(request.userId);
      if (!userData) {
        return response.status(404).json({ message: "User with the given ID not found." });
      }
  
      return response.status(200).json({
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName, 
        image: userData.image,
        color: userData.color,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng!" });
    }
  };

  export const updateProfile = async (request, response, next) => {
    try {
      const {userId} = request;
      const { firstName, lastName, color } = request.body;
      if (!firstName || !lastName ) {
        return response.status(400).send("Firstname, Lastname và color không được để trống!!!");
      }
  
      const userData = await User.findByIdAndUpdate(userId, {
        firstName,lastName,color,profileSetup:true
      }, {new: true, runValidators:true})


      return response.status(200).json({
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName, 
        image: userData.image,
        color: userData.color,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng!" });
    }
  };
  
  export const addProfileImage = async (request, response, next) => {
    try {
      if(!request.file){
        return response.status(400).sned("File is required.");
      }

      const date = Date.now();
      let fileName = "uploads/profiles/" +date + request.file.originalname;
      renameSync(request.file.path, fileName);

      const updateUser = await User.findByIdAndUpdate(request.userId,{image:fileName}, {new:true, runValidators:true});

      return response.status(200).json({
        image: updateUser.image,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng!" });
    }
  };
  
  export const removeProfileImage = async (request, response, next) => {
    try {
      const { userId } = request;
      const user = await User.findById(userId);

      if(!user){
        return response.status(404).send("User not found.")
      }

      if(user.image){
        unlinkSync(user.image)
      }

      user.image=null;
      await user.save();

      return response.status(200).send("Profile image đã xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng!" });
    }
  };

  export const logout = async (request, response, next) => {
    try {
      response.cookie("jwt","", {maxAge:1,secure:true, sameSite:"None"});

      return response.status(200).send("Logout thành công.");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng!" });
    }
  };
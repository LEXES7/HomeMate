import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
    res.json({ message: 'API is working!' });

};

export const getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find({}, '-password'); 
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };


export const updateUser = async (req, res, next) => {
    if(req.user.id !== req.params.userId){
        return next(errorHandler(403, 'You are not allowed to update this user'));
    }
    if(req.body.password){
        if(req.body.password.length < 6){
            return next(errorHandler(400, 'Password must be at least 6 characters'));   
        }
        req.body.password = await bcryptjs.hash(req.body.password, 10);
    }
    if(req.body.username){
        if(req.body.username.length < 7 || req.body.username.length > 20){
            return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
        }
        if(req.body.username.includes(' ')){
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if(req.body.username !== req.body.username.toLowerCase()){
            return next (errorHandler(400, 'Username must be lowercase'));
        }
        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)){
            return next(errorHandler(400, 'Username must contain only letters and numbers'));
        }
        try{
            const updateUser = await User.findByIdAndUpdate(req.params.userId, {
            $set:{
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
            },
            }, {new: true});
        const {password, ...rest} = updateUser._doc;
        res.status(200).json(rest);

        } catch(error){
            next(error);

        }
            
    }
};

export const deleteUser = async (req, res, next) => {
    try {
      // Allow admins to delete any user
      if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You are not allowed to delete this user'));
      }
  
      await User.findByIdAndDelete(req.params.userId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

export const signout = (req, res, next) => {
    try{
        res
        .clearCookie('access_token')
        .status(200)
        .json('Signout successful');
    }
    catch(error){
        next(error);
    }
};

export const getUserProfile = async (req, res, next) => {
    try {
      // Ensure `req.user` is populated by the `verifyToken` middleware
      const user = await User.findById(req.user.id, '-password'); // Exclude the password field
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
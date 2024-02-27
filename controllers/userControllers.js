const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const { v4: uuid } = require("uuid");

// Register User

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password) {
      return next(new HttpError("Fill in all fields", 422));
    }
    const newEmail = email.toLowerCase();

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exixts", 422));
    }

    if (password.trim().length < 6) {
      return next(new HttpError("passwrod must be 7 charecters", 422));
    }

    if (password != password2) {
      return next(new HttpError("password does not match", 422));
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashPassword,
    });

    res.status(201).json(`New User ${newUser.email} registerd`);
  } catch (error) {
    return next(new HttpError("User Registration Failed", 422));
  }
};

//LOGIN USER

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    if (!email || !password) {
      return next(new HttpError("Fill in all fields"));
    }

    const newEmail = email.toLowerCase();

    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("invalid credentials", 422));
    }

    const comparePass = await bcrypt.compare(password, user.password);

    if (!comparePass) {
      return next(new HttpError("invalid credentials", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.SECRET_KEY);

    return res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login Failed please check your credentials", 422)
    );
    // res.json({message:error.message})
  }
};

//get user

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//get authors

const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//change avatar

const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    const user = await User.findById(req.user.id);

    if (user.avatar) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
        if (err) {
          return next(new HttpError(err));
        }
      });
    }

    const { avatar } = req.files;
    if (avatar.size > 500000) {
      return next(
        new HttpError("Profile Picture tooo big, should be less 500kb", 422)
      );
    }

    let fileName;
    fileName = avatar.name;

    let splitedFileName = fileName.split(".");

    let newfileName =
      splitedFileName[0] +
      uuid() +
      "." +
      splitedFileName[splitedFileName.length - 1];
    avatar.mv(
      path.join(__dirname, "..", "uploads", newfileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        }

        const updatedAvatar = await User.findByIdAndUpdate(
          req.user.id,
          { avatar: newfileName },
          { new: true }
        );
        if (!updatedAvatar) {
          return next(new HttpError("Avatar could't be changed", 422));
        }

        res.status(200).json(updatedAvatar);
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};

//edit user

const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    if (
      !name ||
      !email ||
      !currentPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new HttpError("user not found", 422));
    }

    const emailExist = await User.findOne({ email });

    if (emailExist && emailExist._id != req.user.id) {
      return next(new HttpError("email already exists", 422));
    }

    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validateUserPassword) {
      return next(new HttpError("Invalid current password", 422));
    }

    if (newPassword != confirmNewPassword) {
      return next(new HttpError("new password does not match", 422));
    }

    //hash

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    //update user in databse

    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash },
      { new: true }
    );

    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getAuthors,
  changeAvatar,
  editUser,
};

import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';

const cookieOptions = {
  maxAge: 1 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  secure: process.env.NODE_ENV === 'production',
};

const clearCookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  secure: process.env.NODE_ENV === 'production',
};

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email', success: false });
    }

    const userByPhone = await User.findOne({ phoneNumber });
    if (userByPhone) {
      return res.status(400).json({ message: 'User already exists with this phone number', success: false });
    }

    const hashedpassword = await bcrypt.hash(password, 10);
    
    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudResponse.secure_url;
    }

    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedpassword,
      role,
      profile: {
        profilePhoto
      }
    });
    return res.status(201).json({ message: 'User registered successfully', success: true });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        message: 'Email and password are required', 
        success: false 
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'incorrect email or password', 
        success: false 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'incorrect email or password', 
        success: false 
      });
    }

    if (role !== user.role) {
      return res.status(403).json({ 
        message: 'Unauthorized role', 
        success: false 
      });
    }

    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).cookie('token', token, cookieOptions).json({
      message: `Welcome back ${user.fullName}`,
      user: userData,
      token,
      success: true
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie('token', '', { ...clearCookieOptions, maxAge: 0 });
    return res.status(200).json({ message: 'Logged out successfully', success: true });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    let skillsArray;
    if (skills) skillsArray = skills.split(",");

    const userId = req.id; // <-- get userId from authenticated user
    const user = await User.findById(userId); // <-- add const

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { resource_type: "raw" });
      // Wait, is profile initialized completely? Yes, registered users have profile object.
      // Resume URL
      if (!user.profile) user.profile = {};
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = req.file.originalname;
    }

    await user.save();
    
    const updatedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    
    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser, success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
}

export const toggleSaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    if (!user.profile.savedJobs) {
      user.profile.savedJobs = [];
    }

    const isSaved = user.profile.savedJobs.includes(jobId);
    if (isSaved) {
      // Unsave logic
      user.profile.savedJobs = user.profile.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      // Save logic 
      user.profile.savedJobs.push(jobId);
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({ 
      message: isSaved ? 'Job removed from saved list' : 'Job saved successfully', 
      user: updatedUser, 
      success: true 
    });
  } catch (error) {
    console.error('Error toggling save job:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
}

import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found!" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in createPost controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post Not Found!" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post." });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post Deleted Successfully!" });
  } catch (error) {
    console.log(`Error in Delete Post Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const commentOnPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text Field is required" });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post Not Found!" });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log(`Error in commentOnPost Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post Not Found!" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike Post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);
    } else {
      // Like Post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: postId,
        type: "like",
      });

      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log(`Error in likeUnlikePost Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json({ message: "No Posts Today!" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in GetAllPosts Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found!" });

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Error in GetAllLiked Posts Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getFollowingPosts = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User Not Found!" });

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(`Error in GetFollowingPosts Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User Not Found!" });

    const posts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in GetUserPosts Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

import bcrypt from "bcrypt";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.json({ message: "testing the api" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account"));

  try {
    if (req.body.password) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashPassword;
    }

    const updateUser = await User.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password: pass, ...rest } = updateUser._doc;
    res.status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

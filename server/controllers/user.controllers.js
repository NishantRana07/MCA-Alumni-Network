const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth.middlewares");
const bcrypt = require("bcryptjs");

// Creating User Account
const handleUserSignUp = async (req, res) => {
  try {
    const { email, rollNo } = req.body;

    // Check if email already exists
    const existingEmail = await userModel.findOne({ email: { $eq: email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if roll number already exists
    const existingRollNo = await userModel.findOne({ rollNo: { $eq: rollNo } });
    if (existingRollNo) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user
    const user = new userModel({ ...req.body, password: hashedPassword });
    await user.save();

    // Send success response
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User Account
const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send success response
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000,
    });
    res.status(200).json({ message: "Logged in successfully", user, token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Alumni Data
async function updateUserById(req, res) {
  try {
    const rollNo = req.params.id;
    const user = await userModel.findOneAndUpdate({rollNo}, req.body, {
      new: true,
    });
    res.send(user);
    console.log("user updated successfully");
  } catch (err) {
    res.status(404).send(err);
  }
}

// Delete Alumni Data
async function deleteUserById(req, res) {
  try {
    const rollNo = req.params.id;
    const user = await userModel.findOneAndDelete({rollNo});
    if (!user) {
      return res.status(404).send("user doesn't exists");
    } else {
      res.send(user);
      console.log("user deleted successfully");
    }
  } catch (err) {
    res.status(404).send(err);
  }
}

async function getAlumniById(req, res) {
  try {
    const rollNo = req.params.id;
    const user = await userModel.findOne({ rollNo: rollNo });
    if (!user) {
      return res.status(404).send("user doesn't exists");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(404).send(err);
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("jwt");
    res.send("Logged Out");
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = {
  handleUserSignUp,
  handleUserLogin,
  updateUserById,
  deleteUserById,
  getAlumniById,
  logoutUser,
};

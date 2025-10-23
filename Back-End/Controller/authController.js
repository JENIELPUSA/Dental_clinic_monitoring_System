const UserLogin = require("../Models/LogInDentalSchema");
const Doctor = require("../Models/DoctorDentalSchema");
const Patient = require("../Models/PatientDentalSchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");
const sendEmail = require("./../Utils/email");
const Staff = require("../Models/StaffDentalSchema")


const { google } = require("googleapis");

exports.gmailCallback = async (req, res) => {
  const code = req.query.code;
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Refresh Token:", tokens.refresh_token);
    res.send("Authorization successful! Check your console for the refresh token.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving access token");
  }
};


const signToken = (id, role, linkId) => {
  return jwt.sign({ id, role, linkId }, process.env.SECRET_STR, {
    expiresIn: "1d",
  });
};

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPR,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  res.cookie("jwt", token, options);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signup = AsyncErrorHandler(async (req, res, next) => {
  const {
    midle_name,
    contact_number,
    specialty,
    first_name,
    last_name,
    email,
    password,
    role,
    avatar,
    address,
    phoneNumber,
    dob,
    gender,
    emergency_contact_name,
    emergency_contact_number,
  } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Validation per role
  const missingFields = [];
  if (role === "patient") {
    if (!first_name) missingFields.push("First Name");
    if (!last_name) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
    if (!address) missingFields.push("Address");
    if (!dob) missingFields.push("Date Of Birth");
    if (!gender) missingFields.push("Gender");
  } else if (role === "doctor" || role === "staff") {
    if (!first_name) missingFields.push("First Name");
    if (!last_name) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Check for existing user
  const existingUser = await UserLogin.findOne({ username: email });
  if (existingUser) {
    return res.status(400).json({
      message: "User with this email already exists!",
    });
  }

  // Create linked record based on role
  let linkedRecord = null;

  if (role === "doctor") {
    linkedRecord = await Doctor.create({
      first_name,
      last_name,
      midle_name,
      email,
      contact_number,
      specialty,
    });
  } else if (role === "patient") {
    linkedRecord = await Patient.create({
      avatar,
      first_name,
      last_name,
      email,
      contact_number: phoneNumber,
      gender,
      dob,
      address,
      emergency_contact_name,
      emergency_contact_number,
    });
  } else if (role === "staff") {
    linkedRecord = await Staff.create({
      first_name,
      last_name,
      midle_name,
      email,
      contact_number,
    });
  }

const authHeader = req.headers.authorization;
let decodedToken = null;

if (authHeader && authHeader.startsWith("Bearer ")) {
  const token = authHeader.split(" ")[1];

  try {
    decodedToken = jwt.verify(token, process.env.SECRET_STR);
  } catch (err) {
    console.log("Invalid or expired token");
  }
}

const isVerified = decodedToken?.role === "admin";

console.log("ACCOUNT CREATED BY:", decodedToken?.role || "NO TOKEN");
console.log("isVerified set to:", isVerified);

const newUserLogin = await UserLogin.create({
  avatar,
  first_name,
  last_name,
  username: email,
  contact_number,
  password,
  role,
  linkedId: linkedRecord._id,
  otp,
  otpExpiresAt: Date.now() + 5 * 60 * 1000,
  isVerified,
});
if (!isVerified) {
  console.log("Sending OTP to:", email);
  await sendEmail({
    email: email,
    subject: "Email Verification OTP",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
}


  return res.status(201).json({
    status: "Success",
    user: newUserLogin,
    profile: linkedRecord,
  });
});


exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserLogin.findOne({ username: email }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 400));
  }

  if (!user.isVerified) {
    return res.status(401).json({
      message: "Please verify your email address before logging in.",
    });
  }

  let linkId = user.linkedId || user._id;
  let zone = user.Designatedzone;

  if (user.role === "patient") {
    const patient = await Patient.findOne({ user_id: user._id });
    if (patient) {
      linkId = patient._id;
      zone = patient.zone;
    }
  }

  // ✅ Generate token with role and linkId
  const token = signToken(user._id, user.role, linkId);

  req.session.userId = user._id;
  req.session.isLoggedIn = true;
  req.session.user = {
    email: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    Designatedzone: zone,
  };

  return res.status(200).json({
    status: "Success",
    userId: user._id,
    linkId,
    role: user.role,
    token,
    email: user.username,
    Designatedzone: zone,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});



exports.logout = AsyncErrorHandler((req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed.");
    res.clearCookie("connect.sid");
    res.send("Logged out successfully!");
  });
});

exports.verifyOtp = AsyncErrorHandler(async (req, res, next) => {
  const { otp, userId } = req.body;

  if (!otp || !userId) {
    return res.status(400).json({
      message: "Both OTP and userId are required.",
    });
  }

  const user = await UserLogin.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }
  if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return res.status(200).json({
    message: "Email Verified Successfully",
    data: {
      _id: user._id,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

exports.protect = AsyncErrorHandler(async (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    req.user = req.session.user;
    return next();
  }
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  const user = await UserLogin.findById(decodedToken.id);

  if (!user) {
    return next(
      new CustomError("The user with the given token does not exist", 401)
    );
  }
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

  if (isPasswordChanged) {
    return next(
      new CustomError(
        "The password has been changed recently. Please log in again.",
        401
      )
    );
  }

  req.session.user = {
    _id: user._id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  };
  req.session.isLoggedIn = true;
  req.user = user;
  next();
});


exports.restrict = (role) => {
  return (req, res, next) => {
    if (!req.session?.isLoggedIn || req.session.user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. Role required: ${role}` });
    }
    next();
  };
};

exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;

  // 🔁 Look for the user by username (which stores email in your case)
  const user = await UserLogin.findOne({ username: email });

  // If user doesn't exist, return 404
  if (!user) {
    return next(
      new CustomError("We could  not find the user with given email", 404)
    );
  }

  // Generate a password reset token
  const resetToken = user.createResetTokenPassword();
  await user.save({ validateBeforeSave: false });

  // Generate reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `We have received a password reset request. Please use the below link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

  try {
    // Send password reset email
    await sendEmail({
      email: user.username,
      subject: "Password change request received",
      text: message,
    });

    // Respond with success
    res.status(200).json({
      status: "Success",
      message: "Password reset link sent to the user email",
    });
  } catch (err) {
    // Clean up if sending fails
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There was an error sending password reset email. Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserLogin.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid or expired token.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  return res.status(200).json({
    status: "Success",
  });
});


exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const user = await UserLogin.findById(req.user._id).select('+password');

  if (!user) {
    return next(new CustomError('User not found.', 404));
  }

  const isMatch = await user.comparePasswordInDb(req.body.currentPassword, user.password);
  if (!isMatch) {
    return next(new CustomError('The current password you provided is wrong', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

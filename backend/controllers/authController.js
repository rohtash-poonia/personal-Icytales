const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { cookieOptions } = require("../config/env");
const { allowFields, text, email, password, httpError } = require("../utils/validation");
const SESSION_AGE = 7 * 24 * 60 * 60 * 1000;
function publicUser(user) { return { id: user._id, name: user.name, email: user.email, role: user.role }; }
function setSession(res, user) {
  const token = jwt.sign({ id: String(user._id), sv: user.sessionVersion || 0 }, process.env.JWT_SECRET, {
    algorithm: "HS256", expiresIn: "7d", issuer: "icytales", audience: "icytales-web",
  });
  res.cookie("token", token, { ...cookieOptions(), maxAge: SESSION_AGE });
  res.set("Cache-Control", "no-store");
}
const registerUser = asyncHandler(async (req, res) => {
  allowFields(req.body, ["name", "email", "password"]);
  const data = { name: text(req.body.name, "Name", { max: 100 }), email: email(req.body.email), password: password(req.body.password) };
  if (await User.exists({ email: data.email })) throw httpError(409, "An account with this email already exists");
  const user = await User.create(data);
  setSession(res, user);
  res.status(201).json(publicUser(user));
});
async function authenticateLogin(req, res, adminOnly = false) {
  allowFields(req.body, ["email", "password"]);
  const normalizedEmail = email(req.body.email);
  const enteredPassword = password(req.body.password);
  const user = await User.findOne({ email: normalizedEmail }).select("+password +sessionVersion");
  if (!user || user.isBlocked || !(await user.matchPassword(enteredPassword))) throw httpError(401, "Invalid email or password");
  if (adminOnly && user.role !== 'admin') throw httpError(403, 'Administrator access required');
  user.lastLoginAt = new Date();
  await user.save();
  setSession(res, user);
  res.json(publicUser(user));
}
const loginUser = asyncHandler((req,res)=>authenticateLogin(req,res));
const loginAdmin = asyncHandler((req,res)=>authenticateLogin(req,res,true));
const updateMe = asyncHandler(async (req,res) => {
  allowFields(req.body, ['name','email','currentPassword']);
  if (req.body.name === undefined && req.body.email === undefined) throw httpError(400,'Provide a name or email to update');
  const user = await User.findById(req.user._id).select('+password');
  if (!user || user.isBlocked) throw httpError(401,'Authentication required');
  if (req.body.name !== undefined) user.name = text(req.body.name,'Name',{max:100});
  if (req.body.email !== undefined) {
    const newEmail = email(req.body.email);
    if (newEmail !== user.email) {
      const enteredPassword = password(req.body.currentPassword);
      if (!(await user.matchPassword(enteredPassword))) throw httpError(401,'Current password is incorrect');
      if (await User.exists({email:newEmail,_id:{$ne:user._id}})) throw httpError(409,'An account with this email already exists');
      user.email = newEmail;
    }
  }
  await user.save();
  res.set('Cache-Control','no-store').json(publicUser(user));
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie("token", cookieOptions());
  res.set("Cache-Control", "no-store").json({ message: "Logged out successfully" });
});
function getMe(req, res) { res.set("Cache-Control", "no-store").json(publicUser(req.user)); }
module.exports = { registerUser, loginUser, loginAdmin, logoutUser, getMe, updateMe };

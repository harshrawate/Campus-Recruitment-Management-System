const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Super Admin", "Admin"],
      required: true,
    },
    registerTimestamp: { type: Date, default: Date.now },
    loginTimestamps: { type: [Date], default: [] },
  },
  { timestamps: true, versionKey: false }
);

adminSchema.pre("save", async function (next) {
  const admin = this;

  if (!admin.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.methods.addLoginTimestamp = async function () {
  this.loginTimestamps.push(new Date());
  await this.save();
};

module.exports = mongoose.model("Admin", adminSchema);

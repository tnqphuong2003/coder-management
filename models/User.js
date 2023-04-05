const mongoose = require("mongoose");
//Create schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      default: "employee",
      required: true,
    },
    tasks: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" }],
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(/^find/, function (next) {
  if (!("_conditions" in this)) return next();
  if (!("isDeleted" in userSchema.paths)) {
    delete this["_conditions"]["all"];
    return next();
  }
  if (!("all" in this["_conditions"])) {
    //@ts-ignore
    this["_conditions"].isDeleted = false;
  } else {
    delete this["_conditions"]["all"];
  }
  next();
});

//Create and export model
const User = mongoose.model("User", userSchema);
module.exports = User;

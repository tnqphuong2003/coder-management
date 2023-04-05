const express = require("express");
const {
  createUser,
  getUsers,
  editUser,
  deleteUser,
  getTasksByUserId,
} = require("../controllers/user.controllers");
const router = express.Router();

// CREATE
router.post("/", createUser);

// READ
router.get("/", getUsers);
router.get("/:id", getTasksByUserId);

// UPDATE
router.put("/:id", editUser);

// // DELETE
router.delete("/:id", deleteUser);

module.exports = router;

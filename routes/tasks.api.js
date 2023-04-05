const express = require("express");
const {
  createTask,
  getTaskById,
  getTasks,
  deleteTask,
  assignTask,
  updateTask,
} = require("../controllers/task.controllers");
const router = express.Router();

// CREATE
router.post("/", createTask);

// READ
router.get("/", getTasks);

router.get("/:id", getTaskById);

// ASSIGN
router.put("/:id", updateTask);

// DELETE
router.delete("/:id", deleteTask);

module.exports = router;

const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const userController = {};

//Create a user
userController.createUser = async (req, res, next) => {
  const { name, role } = req.body;
  try {
    if (!name) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }

    const userFound = await User.findOne({ name: name });
    if (userFound) {
      throw new AppError(401, "User already exists", "Create User Error");
    }

    const info = {
      name: name,
      role: role,
    };

    const roleEnum = ["employee", "manager"];
    if (role && !roleEnum.includes(role)) {
      throw new AppError(401, "Role is invalid", "Create User Error");
    }

    if (!info) throw new AppError(401, "Bad Request", "Create User Error");

    const created = await User.create(info);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create User Success"
    );
  } catch (err) {
    next(err);
  }
};

//Get all user
userController.getUsers = async (req, res, next) => {
  const filter = {};
  const allowedFilter = ["name", "page", "limit"];

  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw new AppError(
          401,
          `Query ${key} is not allowed`,
          "Get User Error"
        );
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    //mongoose query
    const listOfFound = await User.find(filter);
    console.log(listOfFound.length);

    let result = [];
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter((user) => user[condition] === filterQuery[condition])
          : listOfFound.filter(
              (user) => user[condition] === filterQuery[condition]
            );
      });
    } else {
      result = listOfFound;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    let dataResult = {
      users: result,
      total: Math.ceil(listOfFound.length / limit),
      page: page,
    };

    sendResponse(
      res,
      200,
      true,
      { data: dataResult },
      null,
      "Found list of users success"
    );
  } catch (err) {
    next(err);
  }
};

userController.getUserById = async (req, res, next) => {
  let targetId = req.params.id;
  console.log(targetId);
  try {
    if (!targetId) {
      throw new AppError(401, "Id is not null", "Get User Error");
    }

    if (!mongoose.isValidObjectId(targetId)) {
      throw new AppError(401, "Id type is invalid", "Get User Error");
    }

    //mongoose query
    const user = await User.findById(targetId);
    if (!user) {
      throw new AppError(401, "User does not exists", "Get User Error");
    }

    sendResponse(res, 200, true, { data: user }, null, "Found user success");
  } catch (err) {
    next(err);
  }
};

userController.getTasksByUserId = async (req, res, next) => {
  let userId = req.params.id;
  console.log(userId);
  try {
    if (!userId) {
      throw new AppError(401, "Id is not null", "Get all tasks of user error");
    }

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError(
        401,
        "Id type is invalid",
        "Get all tasks of user error"
      );
    }

    //mongoose query
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(401, "User does not exists", "Get User Error");
    }

    const tasksOfUser = await Task.find({ assignee: userId });
    user.tasks = tasksOfUser;

    sendResponse(res, 200, true, { data: user }, null, "Found tasks success");
  } catch (err) {
    next(err);
  }
};

//Update a user
userController.editUser = async (req, res, next) => {
  const targetId = req.params.id;

  try {
    if (!targetId) {
      const exception = new Error(`Id is not null`);
      exception.statusCode = 401;
      throw exception;
    }

    if (!mongoose.isValidObjectId(targetId)) {
      const exception = new Error(`Id type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    const updateInfo = req.body;

    const options = { new: true };
    const updated = await Car.findByIdAndUpdate(targetId, updateInfo, options);
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Update user success"
    );
  } catch (err) {
    next(err);
  }
};

//Delete user
userController.deleteUser = async (req, res, next) => {
  const targetId = req.params.id;
  try {
    if (!targetId) {
      const exception = new Error(`Id is not null`);
      exception.statusCode = 401;
      throw exception;
    }
    if (!mongoose.isValidObjectId(targetId)) {
      const exception = new Error(`Id type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    const options = { new: true };

    const deleted = await User.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      options
    );
    sendResponse(
      res,
      200,
      true,
      { data: deleted },
      null,
      "Delete user success"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = userController;

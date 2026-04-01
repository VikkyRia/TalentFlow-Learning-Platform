const UserModel = require("./user.model");
const { success, error } = require("../../utils/response");

const UserController = {
  // GET /api/users/profile
  async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return error(res, "User not found", 404);
      }

      return success(res, "Profile fetched successfully", { user });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // PATCH /api/users/profile
  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;

      if (!name && !avatar) {
        return error(res, "Please provide at least one field to update");
      }

      const user = await UserModel.updateProfile(req.user.id, {
        name,
        avatar,
      });

      return success(res, "Profile updated successfully", { user });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/users
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      return success(res, "Users fetched successfully", {
        count: users.length,
        users,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/users/:id
  async getUserById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return error(res, "User not found", 404);
      }

      return success(res, "User fetched successfully", { user });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // PATCH /api/users/:id/role
  async updateRole(req, res) {
    try {
      const { role } = req.body;
      const validRoles = ["learner", "instructor", "admin"];

      if (!role) {
        return error(res, "Role is required");
      }

      if (!validRoles.includes(role)) {
        return error(
          res,
          `Invalid role. Must be one of: ${validRoles.join(", ")}`
        );
      }

      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return error(res, "User not found", 404);
      }

      const updated = await UserModel.updateRole(req.params.id, role);

      return success(res, "User role updated successfully", { user: updated });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/users/:id/progress
  async getLearningHistory(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return error(res, "User not found", 404);
      }

      const history = await UserModel.getLearningHistory(req.params.id);

      return success(res, "Learning history fetched successfully", {
        count: history.length,
        history,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },
};

module.exports = UserController;
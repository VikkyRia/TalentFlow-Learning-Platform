const { error } = require("../utils/response");

// Usage in routes: allowRoles("admin", "instructor")
const allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return error(res, "Unauthorized", 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        "Access denied. You do not have permission.",
        403
      );
    }

    next();
  };
};

module.exports = { allowRoles };
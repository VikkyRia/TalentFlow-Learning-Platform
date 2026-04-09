const CourseModel = require("./course.model");
const { success, error } = require("../../utils/response");

const CourseController = {
  // GET /api/courses
  async getAllCourses(req, res) {
    try {
      const courses = await CourseModel.findAll();
      return success(res, "Courses fetched successfully", {
        count: courses.length,
        courses,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/courses/:id
  async getCourseById(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      return success(res, "Course fetched successfully", { course });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // POST /api/courses
  async createCourse(req, res) {
    try {
      const { title, description, thumbnail } = req.body;

      if (!title) {
        return error(res, "Course title is required");
      }

      const course = await CourseModel.create({
        title,
        description,
        thumbnail,
        instructor_id: req.user.id,
      });

      return success(res, "Course created successfully", { course }, 201);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // PATCH /api/courses/:id
  async updateCourse(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      // Check if user is the instructor or admin
      const isInstructor = await CourseModel.isInstructor(
        req.params.id,
        req.user.id
      );

      if (!isInstructor && req.user.role !== "admin") {
        return error(
          res,
          "Access denied. You are not the instructor of this course.",
          403
        );
      }

      const updated = await CourseModel.update(req.params.id, req.body);

      return success(res, "Course updated successfully", { course: updated });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // DELETE /api/courses/:id
  async deleteCourse(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      await CourseModel.delete(req.params.id);

      return success(res, "Course deleted successfully");
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // POST /api/courses/:id/enroll
  async enrollInCourse(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      // Check if course is published
      if (!course.is_published) {
        return error(res, "This course is not available for enrollment yet");
      }

      // Check if already enrolled
      const alreadyEnrolled = await CourseModel.isEnrolled(
        req.user.id,
        req.params.id
      );

      if (alreadyEnrolled) {
        return error(res, "You are already enrolled in this course");
      }

      const enrollment = await CourseModel.enroll(req.user.id, req.params.id);

      return success(res, "Enrolled successfully! Happy learning 🎓", {
        enrollment,
      }, 201);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/courses/:id/enrollees
  async getEnrollees(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      // Only instructor or admin can see enrollees
      const isInstructor = await CourseModel.isInstructor(
        req.params.id,
        req.user.id
      );

      if (!isInstructor && req.user.role !== "admin") {
        return error(
          res,
          "Access denied. You are not the instructor of this course.",
          403
        );
      }

      const enrollees = await CourseModel.getEnrollees(req.params.id);

      return success(res, "Enrollees fetched successfully", {
        count: enrollees.length,
        enrollees,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },
};

module.exports = CourseController;
const LessonModel = require("./lesson.model");
const CourseModel = require("../courses/course.model");
const { success, error } = require("../../utils/response");

const LessonController = {
  // GET /api/courses/:id/lessons
  async getLessons(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      const lessons = await LessonModel.findByCourse(req.params.id);

      return success(res, "Lessons fetched successfully", {
        count: lessons.length,
        lessons,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // GET /api/courses/:id/lessons/:lessonId
  async getLessonById(req, res) {
    try {
      const lesson = await LessonModel.findById(req.params.lessonId);

      if (!lesson) {
        return error(res, "Lesson not found", 404);
      }

      // Make sure lesson belongs to this course
      if (lesson.course_id !== req.params.id) {
        return error(res, "Lesson does not belong to this course", 400);
      }

      return success(res, "Lesson fetched successfully", { lesson });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // POST /api/courses/:id/lessons
  async createLesson(req, res) {
    try {
      const { title, content, video_url, document_url, order_number } =
        req.body;

      if (!title || !order_number) {
        return error(res, "Title and order number are required");
      }

      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return error(res, "Course not found", 404);
      }

      // Only the course instructor or admin can add lessons
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

      const lesson = await LessonModel.create({
        course_id: req.params.id,
        title,
        content,
        video_url,
        document_url,
        order_number,
      });

      return success(res, "Lesson created successfully", { lesson }, 201);
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // PATCH /api/courses/:id/lessons/:lessonId
  async updateLesson(req, res) {
    try {
      const lesson = await LessonModel.findById(req.params.lessonId);

      if (!lesson) {
        return error(res, "Lesson not found", 404);
      }

      // Make sure lesson belongs to this course
      if (lesson.course_id !== req.params.id) {
        return error(res, "Lesson does not belong to this course", 400);
      }

      // Only the course instructor or admin can update lessons
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

      const updated = await LessonModel.update(req.params.lessonId, req.body);

      return success(res, "Lesson updated successfully", { lesson: updated });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // DELETE /api/courses/:id/lessons/:lessonId
  async deleteLesson(req, res) {
    try {
      const lesson = await LessonModel.findById(req.params.lessonId);

      if (!lesson) {
        return error(res, "Lesson not found", 404);
      }

      // Make sure lesson belongs to this course
      if (lesson.course_id !== req.params.id) {
        return error(res, "Lesson does not belong to this course", 400);
      }

      // Only the course instructor or admin can delete lessons
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

      await LessonModel.delete(req.params.lessonId);

      return success(res, "Lesson deleted successfully");
    } catch (err) {
      return error(res, err.message, 500);
    }
  },

  // POST /api/courses/:id/lessons/:lessonId/complete
  async markComplete(req, res) {
    try {
      const lesson = await LessonModel.findById(req.params.lessonId);

      if (!lesson) {
        return error(res, "Lesson not found", 404);
      }

      // Make sure lesson belongs to this course
      if (lesson.course_id !== req.params.id) {
        return error(res, "Lesson does not belong to this course", 400);
      }

      // Check if already completed
      const alreadyCompleted = await LessonModel.isCompleted(
        req.user.id,
        req.params.lessonId
      );

      if (alreadyCompleted) {
        return error(res, "You have already completed this lesson");
      }

      // Mark lesson as complete
      await LessonModel.markComplete(req.user.id, req.params.lessonId);

      // Calculate new progress percentage
      const totalLessons = await LessonModel.countByCourse(req.params.id);
      const completedLessons = await LessonModel.countCompleted(
        req.user.id,
        req.params.id
      );

      const percentage = Math.round((completedLessons / totalLessons) * 100);
      const isCompleted = percentage === 100;

      // Update progress table
      await db_updateProgress(
        req.user.id,
        req.params.id,
        percentage,
        isCompleted
      );

      return success(res, "Lesson marked as complete! 🎉", {
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        percentage,
        course_completed: isCompleted,
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  },
};

// Helper to update progress table
async function db_updateProgress(user_id, course_id, percentage, completed) {
  const db = require("../../config/db");
  await db.query(
    `INSERT INTO progress (user_id, course_id, percentage, completed)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, course_id)
     DO UPDATE SET 
       percentage = $3,
       completed = $4,
       updated_at = NOW()`,
    [user_id, course_id, percentage, completed]
  );
}

module.exports = LessonController;
const db = require("../../config/db");

const CourseModel = {
  // Get all published courses
  async findAll() {
    const result = await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.thumbnail,
        c.is_published,
        c.created_at,
        u.name as instructor_name,
        COUNT(DISTINCT e.id) as total_enrollments
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.is_published = true
       GROUP BY c.id, u.name
       ORDER BY c.created_at DESC`
    );
    return result.rows;
  },

  // Find a single course by ID
  async findById(id) {
    const result = await db.query(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.thumbnail,
        c.is_published,
        c.created_at,
        u.id as instructor_id,
        u.name as instructor_name,
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT l.id) as total_lessons
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       LEFT JOIN lessons l ON l.course_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, u.id, u.name`,
      [id]
    );
    return result.rows[0];
  },

  // Create a new course
  async create({ title, description, thumbnail, instructor_id }) {
    const result = await db.query(
      `INSERT INTO courses (title, description, thumbnail, instructor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || null, thumbnail || null, instructor_id]
    );
    return result.rows[0];
  },

  // Update a course
  async update(id, { title, description, thumbnail, is_published }) {
    const result = await db.query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail = COALESCE($3, thumbnail),
           is_published = COALESCE($4, is_published),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, thumbnail, is_published, id]
    );
    return result.rows[0];
  },

  // Delete a course
  async delete(id) {
    await db.query("DELETE FROM courses WHERE id = $1", [id]);
  },

  // Check if user is enrolled in a course
  async isEnrolled(user_id, course_id) {
    const result = await db.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [user_id, course_id]
    );
    return result.rows.length > 0;
  },

  // Enroll a user in a course
  async enroll(user_id, course_id) {
    const result = await db.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, course_id]
    );
    return result.rows[0];
  },

  // Get all enrollees in a course
  async getEnrollees(course_id) {
    const result = await db.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.avatar,
        e.enrolled_at,
        COALESCE(p.percentage, 0) as progress
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN progress p ON p.user_id = e.user_id 
         AND p.course_id = e.course_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC`,
      [course_id]
    );
    return result.rows;
  },

  // Check if user is the instructor of a course
  async isInstructor(course_id, user_id) {
    const result = await db.query(
      "SELECT id FROM courses WHERE id = $1 AND instructor_id = $2",
      [course_id, user_id]
    );
    return result.rows.length > 0;
  },
};

module.exports = CourseModel;
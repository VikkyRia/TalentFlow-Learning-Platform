const db = require("../../config/db");

const LessonModel = {
  // Get all lessons in a course
  async findByCourse(course_id) {
    const result = await db.query(
      `SELECT 
        l.id,
        l.title,
        l.content,
        l.video_url,
        l.document_url,
        l.order_number,
        l.created_at
       FROM lessons l
       WHERE l.course_id = $1
       ORDER BY l.order_number ASC`,
      [course_id]
    );
    return result.rows;
  },

  // Find a single lesson by ID
  async findById(id) {
    const result = await db.query(
      `SELECT * FROM lessons WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Create a new lesson
  async create({ course_id, title, content, video_url, document_url, order_number }) {
    const result = await db.query(
      `INSERT INTO lessons 
        (course_id, title, content, video_url, document_url, order_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_id, title, content || null, video_url || null, document_url || null, order_number]
    );
    return result.rows[0];
  },

  // Update a lesson
  async update(id, { title, content, video_url, document_url, order_number }) {
    const result = await db.query(
      `UPDATE lessons
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           video_url = COALESCE($3, video_url),
           document_url = COALESCE($4, document_url),
           order_number = COALESCE($5, order_number),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, content, video_url, document_url, order_number, id]
    );
    return result.rows[0];
  },

  // Delete a lesson
  async delete(id) {
    await db.query("DELETE FROM lessons WHERE id = $1", [id]);
  },

  // Mark a lesson as completed by a user
  async markComplete(user_id, lesson_id) {
    const result = await db.query(
      `INSERT INTO lesson_completions (user_id, lesson_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, lesson_id) DO NOTHING
       RETURNING *`,
      [user_id, lesson_id]
    );
    return result.rows[0];
  },

  // Check if a lesson is already completed by a user
  async isCompleted(user_id, lesson_id) {
    const result = await db.query(
      `SELECT id FROM lesson_completions 
       WHERE user_id = $1 AND lesson_id = $2`,
      [user_id, lesson_id]
    );
    return result.rows.length > 0;
  },

  // Count total lessons in a course
  async countByCourse(course_id) {
    const result = await db.query(
      `SELECT COUNT(*) as total FROM lessons WHERE course_id = $1`,
      [course_id]
    );
    return parseInt(result.rows[0].total);
  },

  // Count completed lessons by a user in a course
  async countCompleted(user_id, course_id) {
    const result = await db.query(
      `SELECT COUNT(*) as total 
       FROM lesson_completions lc
       JOIN lessons l ON lc.lesson_id = l.id
       WHERE lc.user_id = $1 AND l.course_id = $2`,
      [user_id, course_id]
    );
    return parseInt(result.rows[0].total);
  },
};

module.exports = LessonModel;
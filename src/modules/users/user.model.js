const db = require("../../config/db");

const UserModel = {
  // Find a user by their email
  async findByEmail(email) {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },

  // Find a user by their ID
  async findById(id) {
    const result = await db.query(
      "SELECT id, name, email, role, avatar, is_verified, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  // Get all users (admin only)
  async findAll() {
    const result = await db.query(
      "SELECT id, name, email, role, avatar, is_verified, created_at FROM users ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // Update user profile
  async updateProfile(id, { name, avatar }) {
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           avatar = COALESCE($2, avatar),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, role, avatar, is_verified, created_at`,
      [name, avatar, id]
    );
    return result.rows[0];
  },

  // Update user role (admin only)
  async updateRole(id, role) {
    const result = await db.query(
      `UPDATE users 
       SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, created_at`,
      [role, id]
    );
    return result.rows[0];
  },

  // Get user's enrolled courses and progress
  async getLearningHistory(id) {
    const result = await db.query(
      `SELECT 
        c.id as course_id,
        c.title as course_title,
        c.thumbnail,
        e.enrolled_at,
        COALESCE(p.percentage, 0) as progress,
        COALESCE(p.completed, false) as completed
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [id]
    );
    return result.rows;
  },
};

module.exports = UserModel;
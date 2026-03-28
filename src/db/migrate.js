const db = require("../config/db");

async function migrate() {
  try {
    await db.query(`

      -- ========================
      -- USERS TABLE
      -- Stores all platform users
      -- ========================
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'learner',
        avatar VARCHAR(255),
        is_verified BOOLEAN DEFAULT false,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- ========================
      -- COURSES TABLE
      -- Stores all courses on the platform
      -- ========================
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(255),
        instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- ========================
      -- ENROLLMENTS TABLE
      -- Tracks which users are enrolled in which courses
      -- ========================
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );

      -- ========================
      -- LESSONS TABLE
      -- Each course has many lessons
      -- ========================
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url VARCHAR(255),
        document_url VARCHAR(255),
        order_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- ========================
      -- LESSON COMPLETIONS TABLE
      -- Tracks which lessons a learner has completed
      -- ========================
      CREATE TABLE IF NOT EXISTS lesson_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      );

      -- ========================
      -- ASSIGNMENTS TABLE
      -- Each course can have many assignments
      -- ========================
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- ========================
      -- SUBMISSIONS TABLE
      -- Learners submit their assignments here
      -- ========================
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        file_url VARCHAR(255),
        grade VARCHAR(50),
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT NOW(),
        graded_at TIMESTAMP,
        UNIQUE(assignment_id, user_id)
      );

      -- ========================
      -- PROGRESS TABLE
      -- Tracks overall course completion per user
      -- ========================
      CREATE TABLE IF NOT EXISTS progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        percentage NUMERIC(5,2) DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );

      -- ========================
      -- CERTIFICATES TABLE
      -- Issued when a learner reaches 100% progress
      -- ========================
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        issued_at TIMESTAMP DEFAULT NOW(),
        certificate_url VARCHAR(255),
        UNIQUE(user_id, course_id)
      );

      -- ========================
      -- NOTIFICATIONS TABLE
      -- Platform notifications for users
      -- ========================
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- ========================
      -- DISCUSSIONS TABLE
      -- Course discussion posts
      -- ========================
      CREATE TABLE IF NOT EXISTS discussions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

    `);

    console.log(" All tables created successfully");
  } catch (err) {
    console.error(" Migration error:", err.message);
  }
}

module.exports = migrate;
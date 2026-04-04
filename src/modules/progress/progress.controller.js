const db = require("../../config/db");
const { success, error } = require("../../utils/response");


// GET my overall progress across all courses
exports.getMyProgress = async (req, res) => {
    const userId = req.user.id;

    try {

        const result = await db.query(
        `
        SELECT 
            p.course_id,
            c.title,
            p.percentage,
            p.completed,
            p.updated_at
        FROM progress p
        JOIN courses c ON c.id = p.course_id
        WHERE p.user_id = $1
        ORDER BY p.updated_at DESC
        `,
        [userId]
        );

        return success(res, "Progress fetched", result.rows);

    } catch (err) {
        return error(res, err.message, 500);
    }
};


// GET my progress in a specific course
exports.getCourseProgress = async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.params;

    try {

        const result = await db.query(
        `
        SELECT 
            p.course_id,
            c.title,
            p.percentage,
            p.completed,
            p.updated_at
        FROM progress p
        JOIN courses c ON c.id = p.course_id
        WHERE p.user_id = $1 AND p.course_id = $2
        `,
        [userId, courseId]
        );

        if (result.rows.length === 0) {
        return error(res, "Progress not found for this course", 404);
        }

        return success(res, "Course progress fetched", result.rows[0]);

    } catch (err) {
        return error(res, err.message, 500);
    }
};
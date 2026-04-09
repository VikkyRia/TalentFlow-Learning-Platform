const db = require("../../config/db");
const { success, error } = require("../../utils/response");


// GET all assignments in a course
exports.getCourseAssignments = async (req, res) => {
    const { courseId } = req.params;

    try {
        const result = await db.query(
        `SELECT * FROM assignments
        WHERE course_id = $1
        ORDER BY created_at DESC`,
        [courseId]
        );

        return success(res, "Assignments fetched", result.rows);

    } catch (err) {
        return error(res, err.message, 500);
    }
};


// CREATE assignment (Instructor/Admin)
exports.createAssignment = async (req, res) => {
    const { courseId } = req.params;
    const { title, description, due_date } = req.body;

    try {
        const result = await db.query(
        `INSERT INTO assignments
        (course_id, title, description, due_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [courseId, title, description, due_date]
        );

        return success(res, "Assignment created", result.rows[0], 201);

    } catch (err) {
        return error(res, err.message, 500);
    }
};


// GET single assignment
exports.getAssignment = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
        `SELECT * FROM assignments
        WHERE id = $1`,
        [id]
        );

        if (result.rows.length === 0) {
        return error(res, "Assignment not found", 404);
        }

        return success(res, "Assignment fetched", result.rows[0]);

    } catch (err) {
        return error(res, err.message, 500);
    }
};


// UPDATE assignment (Instructor/Admin)
exports.updateAssignment = async (req, res) => {
    const { id } = req.params;
    const { title, description, due_date } = req.body;

    try {
        const result = await db.query(
        `UPDATE assignments
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            due_date = COALESCE($3, due_date),
            updated_at = NOW()
        WHERE id = $4
        RETURNING *`,
        [title, description, due_date, id]
        );

        if (result.rows.length === 0) {
        return error(res, "Assignment not found", 404);
        }

        return success(res, "Assignment updated", result.rows[0]);

    } catch (err) {
        return error(res, err.message, 500);
    }
    };


    // DELETE assignment (Instructor/Admin)
    exports.deleteAssignment = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
        `DELETE FROM assignments
        WHERE id = $1
        RETURNING *`,
        [id]
        );

        if (result.rows.length === 0) {
        return error(res, "Assignment not found", 404);
        }

        return success(res, "Assignment deleted");

    } catch (err) {
        return error(res, err.message, 500);
    }
};
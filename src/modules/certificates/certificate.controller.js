const db = require("../../config/db");
const { success, error } = require("../../utils/response");

// GET all certificates for logged-in user
exports.getMyCertificates = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `
      SELECT 
        c.id,
        c.course_id,
        co.title AS course_title,
        c.issued_at,
        c.certificate_url
      FROM certificates c
      JOIN courses co ON co.id = c.course_id
      WHERE c.user_id = $1
      ORDER BY c.issued_at DESC
      `,
      [userId]
    );

    return success(res, "Certificates fetched successfully", result.rows);

  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET a single certificate by ID for logged-in user
exports.getCertificateById = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await db.query(
        `
        SELECT 
            c.id,
            c.course_id,
            co.title AS course_title,
            c.issued_at,
            c.certificate_url
        FROM certificates c
        JOIN courses co ON co.id = c.course_id
        WHERE c.user_id = $1 AND c.id = $2
        `,
        [userId, id]
        );

        if (result.rows.length === 0) {
        return error(res, "Certificate not found", 404);
        }

        return success(res, "Certificate fetched successfully", result.rows[0]);

    } catch (err) {
        return error(res, err.message, 500);
    }
};
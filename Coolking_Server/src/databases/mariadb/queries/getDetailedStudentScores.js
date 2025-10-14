const { QueryTypes } = require('sequelize');

async function getDetailedStudentScores(sequelize, studentId) {
  try {
    const query = `
      SELECT
        sem.years AS academic_year,
        sem.name AS semester,
        s.student_id,
        s.name AS student_name,
        sub.name AS subject_name,
        IF(g.theo_regular1 IS NULL, '-', FORMAT(g.theo_regular1, 1)) AS theo_regular1,
        IF(g.theo_regular2 IS NULL, '-', FORMAT(g.theo_regular2, 1)) AS theo_regular2,
        IF(g.theo_regular3 IS NULL, '-', FORMAT(g.theo_regular3, 1)) AS theo_regular3,
        IF(g.pra_regular1 IS NULL, '-', FORMAT(g.pra_regular1, 1)) AS pra_regular1,
        IF(g.pra_regular2 IS NULL, '-', FORMAT(g.pra_regular2, 1)) AS pra_regular2,
        IF(g.pra_regular3 IS NULL, '-', FORMAT(g.pra_regular3, 1)) AS pra_regular3,
        IF(g.mid IS NULL, '-', FORMAT(g.mid, 1)) AS midterm,
        IF(g.final IS NULL, '-', FORMAT(g.final, 1)) AS final,
        IF(g.avr IS NULL, '-', FORMAT(g.avr, 1)) AS average
      FROM scores g
      INNER JOIN students s ON g.student_id = s.student_id AND s.isDeleted = false
      INNER JOIN course_sections cs ON g.course_section_id = cs.id AND cs.isDeleted = false
      INNER JOIN subjects sub ON cs.subject_id = sub.subject_id AND sub.isDeleted = false
      INNER JOIN sessions sem ON cs.session_id = sem.id
      WHERE s.student_id = :studentId
      ORDER BY sem.years DESC, sem.name ASC, sub.name ASC`;

    const results = await sequelize.query(query, {
      replacements: { studentId },
      type: QueryTypes.SELECT
    });

    if (results.length === 0) {
      return { message: 'Không tìm thấy điểm của sinh viên này', data: [] };
    }

    return { 
      message: 'Lấy điểm thành công',
      data: results 
    };
  } catch (error) {
    console.error('Error fetching student scores:', error);
    throw new Error('Lỗi khi lấy điểm sinh viên');
  }
}

module.exports = {
  getDetailedStudentScores
};

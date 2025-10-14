const { QueryTypes } = require('sequelize');

async function getStudentScoresBySemester(sequelize, studentId) {
  try {
    const query = `
      WITH ScoreData AS (
        SELECT 
          sem.years AS academic_year,
          sem.name AS semester,
          sub.name AS subject_name,
          sub.theo_credit,
          sub.pra_credit,
          g.avr AS score,
          CASE 
            WHEN g.avr >= 9.0 THEN 4.0
            WHEN g.avr >= 8.5 THEN 3.7
            WHEN g.avr >= 8.0 THEN 3.5
            WHEN g.avr >= 7.0 THEN 3.0
            WHEN g.avr >= 6.5 THEN 2.5
            WHEN g.avr >= 5.5 THEN 2.0
            WHEN g.avr >= 5.0 THEN 1.5
            WHEN g.avr >= 4.0 THEN 1.0
            ELSE 0
          END AS grade_point
        FROM scores g
        INNER JOIN students s ON g.student_id = s.student_id AND s.isDeleted = false
        INNER JOIN course_sections cs ON g.course_section_id = cs.id AND cs.isDeleted = false
        INNER JOIN subjects sub ON cs.subject_id = sub.subject_id AND sub.isDeleted = false
        INNER JOIN sessions sem ON cs.session_id = sem.id
        WHERE s.student_id = :studentId
      )
      SELECT 
        academic_year,
        semester,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'subject_name', subject_name,
            'credits', (COALESCE(theo_credit, 0) + COALESCE(pra_credit, 0)),
            'score', IF(score IS NULL, '-', FORMAT(score, 1)),
            'grade_point', FORMAT(grade_point, 1)
          )
        ) AS subjects,
        COUNT(*) as total_subjects,
        SUM(COALESCE(theo_credit, 0) + COALESCE(pra_credit, 0)) as total_credits,
        FORMAT(
          AVG(grade_point * (COALESCE(theo_credit, 0) + COALESCE(pra_credit, 0))) / 
          AVG(COALESCE(theo_credit, 0) + COALESCE(pra_credit, 0)), 
          2
        ) as gpa
      FROM ScoreData
      GROUP BY academic_year, semester
      ORDER BY academic_year DESC, semester ASC`;

    const results = await sequelize.query(query, {
      replacements: { studentId },
      type: QueryTypes.SELECT
    });

    if (results.length === 0) {
      return {
        message: 'Không tìm thấy điểm của sinh viên này',
        data: []
      };
    }

    // Parse JSON string arrays back to objects
    const formattedResults = results.map(semester => ({
      ...semester,
      subjects: JSON.parse(semester.subjects)
    }));

    return {
      message: 'Lấy điểm thành công',
      data: formattedResults
    };
  } catch (error) {
    console.error('Error fetching student semester scores:', error);
    throw new Error('Lỗi khi lấy điểm sinh viên theo học kỳ');
  }
}

module.exports = {
  getStudentScoresBySemester
};

const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const initModels = require('../databases/mariadb/model/init-models');
const sequelize = require('../config/mariadb.conf');

const models = initModels(sequelize);

async function seed() {
    //Account admin
    await models.Account.create({
        id: uuidv4(),
        user_id: 'ADMIN',
        password: 'admin',
        role: 'ADMIN',
        status: 'ACTIVE'
    });

    // 1. Faculty
    const faculties = [];
    const facultyIds = new Set();
    for (let i = 0; i < 50; i++) {
        let faculty_id;
        do {
            faculty_id = 'F' + faker.number.int({ min: 1000, max: 9999 });
        } while (facultyIds.has(faculty_id));
        facultyIds.add(faculty_id);
        
        faculties.push(await models.Faculty.create({
            id: uuidv4(),
            faculty_id: faculty_id,
            name: faker.company.name(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            address: faker.location.streetAddress()
        }));
    }

    // 1b. Major
    const majors = [];
    const majorIds = new Set();
    
    // Danh sách các tên ngành học mẫu (tiếng Anh để tránh lỗi encoding)
    const majorNames = [
        'Information Technology', 'Software Engineering', 'Information Security',
        'Artificial Intelligence', 'Data Science', 'Information Systems',
        'Computer Networks', 'Business Administration', 'Marketing',
        'Accounting', 'Finance and Banking', 'International Economics',
        'Economic Law', 'International Law', 'Electronics Engineering',
        'Electrical Engineering', 'Mechanical Engineering', 'Automotive Engineering',
        'Civil Engineering', 'Architecture', 'General Medicine',
        'Pharmacy', 'Nursing', 'Dentistry',
        'English Language', 'Japanese Language', 'Chinese Language',
        'Korean Language', 'French Language', 'Mathematics Education',
        'Physics Education', 'Chemistry Education', 'Biology Education',
        'Literature Education', 'History Education', 'Geography Education',
        'Biomedical Engineering', 'Biotechnology', 'Environmental Science',
        'Engineering Physics', 'Chemistry', 'Chemical Engineering',
        'Applied Mathematics', 'Graphic Design', 'Public Relations',
        'Journalism', 'Multimedia Communications', 'Tourism',
        'Hotel Management', 'Restaurant Management'
    ];
    
    for (let i = 0; i < 50; i++) {
        const faculty = faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
        
        let major_id;
        do {
            major_id = 'M' + faker.number.int({ min: 1000, max: 9999 });
        } while (majorIds.has(major_id));
        majorIds.add(major_id);
        
        // Lấy tên ngành học ngẫu nhiên từ danh sách
        const majorName = i < majorNames.length 
            ? majorNames[i] 
            : majorNames[faker.number.int({ min: 0, max: majorNames.length - 1 })];
        
        majors.push(await models.Major.create({
            id: uuidv4(),
            major_id: major_id,
            name: majorName,
            faculty_id: faculty.faculty_id
        }));
    }

    // 2. Clazz
    const clazzes = [];
    for (let i = 0; i < 50; i++) {
        const faculty = faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
        clazzes.push(await models.Clazz.create({
            id: uuidv4(),
            name: faker.commerce.department(),
            faculty_id: faculty.faculty_id
        }));
    }

    // 3. Session
    const sessions = [];
    for (let i = 0; i < 50; i++) {
        sessions.push(await models.Session.create({
            id: uuidv4(),
            name: 'HK' + faker.number.int({ min: 1, max: 3 }),
            years: `${faker.number.int({ min: 2018, max: 2025 })}-${faker.number.int({ min: 2018, max: 2025 })}`
        }));
    }

    // 4. Subject
    const subjects = [];
    const subjectIds = new Set();
    for (let i = 0; i < 50; i++) {
        const faculty = faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
        
        let subject_id;
        do {
            subject_id = 'S' + faker.number.int({ min: 1000, max: 9999 });
        } while (subjectIds.has(subject_id));
        subjectIds.add(subject_id);
        
        subjects.push(await models.Subject.create({
            id: uuidv4(),
            subject_id: subject_id,
            faculty_id: faculty.faculty_id,
            name: faker.commerce.productName(),
            theo_credit: faker.number.int({ min: 1, max: 5 }),
            pra_credit: faker.number.int({ min: 0, max: 3 }),
            isDeleted: false
        }));
    }

    // 5. CourseSection
    const courseSections = [];
    for (let i = 0; i < 50; i++) {
        const clazz = clazzes[faker.number.int({ min: 0, max: clazzes.length - 1 })];
        const subject = subjects[faker.number.int({ min: 0, max: subjects.length - 1 })];
        const session = sessions[faker.number.int({ min: 0, max: sessions.length - 1 })];
        courseSections.push(await models.CourseSection.create({
            id: uuidv4(),
            clazz_id: clazz.id,
            subject_id: subject.subject_id,
            session_id: session.id,
            isDeleted: false
        }));
    }

    // 6. Lecturer
    const lecturers = [];
    const lecturerIds = new Set();
    for (let i = 0; i < 50; i++) {
        const faculty = faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
        let lecturer_id;
        do {
            lecturer_id = 'L' + faker.number.int({ min: 1000, max: 9999 });
        } while (lecturerIds.has(lecturer_id));
        lecturerIds.add(lecturer_id);
        lecturers.push(await models.Lecturer.create({
            id: uuidv4(),
            lecturer_id: lecturer_id,
            name: faker.person.fullName(),
            dob: faker.date.past(40, '2000-01-01'),
            gender: faker.datatype.boolean(),
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            faculty_id: faculty.faculty_id,
            isDeleted: false
        }));
    }

    // 7. Lecturer_CourseSection
    for (let i = 0; i < 50; i++) {
        const lecturer = lecturers[faker.number.int({ min: 0, max: lecturers.length - 1 })];
        const courseSection = courseSections[faker.number.int({ min: 0, max: courseSections.length - 1 })];
        await models.LecturerCourseSection.create({
            id: uuidv4(),
            lecturer_id: lecturer.lecturer_id,
            course_section_id: courseSection.id
        });
    }

    // 8. Student
    const students = [];
    const studentIds = new Set();
    for (let i = 0; i < 50; i++) {
        const clazz = clazzes[faker.number.int({ min: 0, max: clazzes.length - 1 })];
        // 80% sinh viên có chuyên ngành, 20% chưa chọn chuyên ngành (major_id = null)
        const hasMajor = faker.datatype.boolean(0.8);
        const major = hasMajor ? majors[faker.number.int({ min: 0, max: majors.length - 1 })] : null;
        
        let student_id;
        do {
            student_id = 'ST' + faker.number.int({ min: 1000, max: 9999 });
        } while (studentIds.has(student_id));
        studentIds.add(student_id);
        students.push(await models.Student.create({
            id: uuidv4(),
            student_id: student_id,
            name: faker.person.fullName(),
            dob: faker.date.past(20, '2010-01-01'),
            gender: faker.datatype.boolean(),
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            clazz_id: clazz.id,
            major_id: hasMajor ? major.id : null,
            isDeleted: false
        }));
    }

    // 9. Student_CourseSection
    for (let i = 0; i < 50; i++) {
        const student = students[faker.number.int({ min: 0, max: students.length - 1 })];
        const courseSection = courseSections[faker.number.int({ min: 0, max: courseSections.length - 1 })];
        await models.StudentCourseSection.create({
            id: uuidv4(),
            student_id: student.student_id,
            course_section_id: courseSection.id
        });
    }

    // 10. Parent
    const parents = [];
    const parentIds = new Set();
    for (let i = 0; i < 50; i++) {
        const student = students[faker.number.int({ min: 0, max: students.length - 1 })];
        let parent_id;
        do {
            parent_id = 'P' + faker.number.int({ min: 1000, max: 9999 });
        } while (parentIds.has(parent_id));
        parentIds.add(parent_id);
        parents.push(await models.Parent.create({
            id: uuidv4(),
            parent_id: parent_id,
            student_id: student.student_id,
            name: faker.person.fullName(),
            dob: faker.date.past(40, '2000-01-01'),
            gender: faker.datatype.boolean(),
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            isDeleted: false
        }));
    }

    // 11. Account
    // Tạo Set để theo dõi các user_id, email và phone_number đã sử dụng
    const usedUserIds = new Set();
    const usedEmails = new Set();
    const usedPhones = new Set();
    let accountCount = 0;
    
    // Tạo danh sách tất cả người dùng có thể
    const allUsers = [
        ...students.map(s => ({ 
            id: s.student_id, 
            role: 'STUDENT',
            email: s.email,
            phone: s.phone
        })),
        ...lecturers.map(l => ({ 
            id: l.lecturer_id, 
            role: 'LECTURER',
            email: l.email,
            phone: l.phone
        })),
        ...parents.map(p => ({ 
            id: p.parent_id, 
            role: 'PARENT',
            email: p.email,
            phone: p.phone
        }))
    ];
    
    // Xáo trộn danh sách để chọn ngẫu nhiên
    const shuffledUsers = faker.helpers.shuffle([...allUsers]);
    
    // Tạo tối đa 50 account hoặc cho đến khi hết người dùng
    for (let i = 0; i < Math.min(50, shuffledUsers.length); i++) {
        const { id: user_id, role, email: originalEmail, phone: originalPhone } = shuffledUsers[i];
        
        if (!usedUserIds.has(user_id)) {
            usedUserIds.add(user_id);
            
            // Đảm bảo email là duy nhất
            let email = originalEmail;
            if (email && usedEmails.has(email)) {
                // Nếu email đã được sử dụng, tạo email mới
                do {
                    email = faker.internet.email();
                } while (usedEmails.has(email));
            }
            if (email) usedEmails.add(email);
            
            // Đảm bảo phone_number là duy nhất
            let phone_number = originalPhone;
            if (phone_number && usedPhones.has(phone_number)) {
                // Nếu số điện thoại đã được sử dụng, tạo số điện thoại mới
                do {
                    phone_number = faker.phone.number();
                } while (usedPhones.has(phone_number));
            }
            if (phone_number) usedPhones.add(phone_number);
            
            await models.Account.create({
                id: uuidv4(),
                user_id,
                email,
                phone_number,
                password: '123456',
                role,
                status: 'ACTIVE'
            });
            accountCount++;
        }
    }
    
    console.log(`Created ${accountCount} unique accounts`);
    

    // 12. Schedule
    // Lấy danh sách các user_id đã được tạo account
    const accountUsers = await models.Account.findAll();
    const validUserIds = accountUsers.map(account => account.user_id);
    
    for (let i = 0; i < 50; i++) {
        // Chỉ sử dụng những user_id đã tồn tại trong bảng accounts
        if (validUserIds.length === 0) {
            console.log("Không có user_id hợp lệ để tạo Schedule");
            break;
        }
        
        const user_id = faker.helpers.arrayElement(validUserIds);
        const courseSection = courseSections[faker.number.int({ min: 0, max: courseSections.length - 1 })];
        
        await models.Schedule.create({
            id: uuidv4(),
            user_id,
            course_section_id: courseSection.id,
            isExam: faker.datatype.boolean(),
            start_lesson: faker.number.int({ min: 1, max: 12 }),
            end_lesson: faker.number.int({ min: 1, max: 12 })
        });
    }

    // 13. Score
    // Lấy tất cả các student_course_section để đảm bảo mối quan hệ hợp lệ
    const studentCourseSections = await models.StudentCourseSection.findAll({
        include: [
            { model: models.Student, as: 'student' },
            { model: models.CourseSection, as: 'course_section' }
        ]
    });
    
    // Chỉ tạo điểm cho các sinh viên đã đăng ký khóa học
    for (let i = 0; i < Math.min(50, studentCourseSections.length); i++) {
        const randomIndex = faker.number.int({ min: 0, max: studentCourseSections.length - 1 });
        const studentCourseSection = studentCourseSections[randomIndex];
        
        await models.Score.create({
            id: uuidv4(),
            student_id: studentCourseSection.student_id,
            course_section_id: studentCourseSection.course_section_id,
            theo_regular1: faker.number.float({ min: 0, max: 10 }),
            theo_regular2: faker.number.float({ min: 0, max: 10 }),
            theo_regular3: faker.number.float({ min: 0, max: 10 }),
            pra_regular1: faker.number.float({ min: 0, max: 10 }),
            pra_regular2: faker.number.float({ min: 0, max: 10 }),
            pra_regular3: faker.number.float({ min: 0, max: 10 }),
            mid: faker.number.float({ min: 0, max: 10 }),
            final: faker.number.float({ min: 0, max: 10 }),
            avr: faker.number.float({ min: 0, max: 10 })
        });
    }

    console.log('✅ Seeded 50 records for each table!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadCourses();
});

async function loadCourses() {
    try {
        let faculty = await fetch('https://university-management-system-ums-production.up.railway.app/faculty');
        let students = await fetch('https://university-management-system-ums-production.up.railway.app/student');
        let courses = await fetch('https://university-management-system-ums-production.up.railway.app/course');

        courses = await courses.json();
        faculty = await faculty.json();
        students = await students.json();
        courses = courses.courses;
        faculty = faculty.faculty;
        students = students.students;
        let facultyCourses = faculty.courses;
        const facultyID = faculty._id;
        facultyCourses = courses.filter(course => facultyCourses.includes(course._id.toString()));
        let courseList = [];
        facultyCourses.forEach(course => {
            let temp = { 'name': course.name, 'courseId': course._id, 'students': [] };
            students.forEach(student => {
                student.currentCourses.forEach(c => {
                    if (c.faculty == facultyID && c.course == course._id) {
                        temp.students.push(student);
                    }
                });
            });
            courseList.push(temp);
        });
        renderdata(courseList);
    } catch (err) {
        console.error("Error loading data", err);
    }
}

function renderdata(courseList) {
    const container = document.getElementById("cards-container");
    container.innerHTML = ""; // Clear previous content

    if (!courseList.length) {
        // text should be white
        container.innerHTML += `<p class="text-muted">No active students</p>`;
        return;
    }

    courseList.forEach(course => {
        const div = document.createElement('div');
        div.className = 'card mb-4 shadow-sm rounded';

        const innerdiv1 = document.createElement('div');
        innerdiv1.className = 'card-header bg-dark text-white rounded';
        innerdiv1.innerHTML = `<h6 class="mb-0">${course.name}</h6>`;
        div.appendChild(innerdiv1);

        const innerdiv2 = document.createElement('div');
        innerdiv2.className = 'card-body';

        if (course.students.length === 0) {
            innerdiv2.innerHTML = `<p class="text-muted">No students enrolled</p>`;
        } else {
            course.students.forEach(student => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'student';
                studentDiv.dataset.studentId = student._id; // Store student ID for easy access
                studentDiv.dataset.courseId = course.courseId; // Store course ID for easy access
                studentDiv.innerHTML = `
            <div>
                <strong>${student.name}</strong> (${student.rollNo})
            </div>
            <button class="btn btn-success btn-sm">
                Assign Grade
            </button>
        `;
                const btn = studentDiv.querySelector('button');
                btn.addEventListener('click', () => {
                    assignGrade(studentDiv.dataset.studentId, studentDiv.dataset.courseId);
                });
                innerdiv2.appendChild(studentDiv);
            });
        }

        div.appendChild(innerdiv2); // always append the body
        container.appendChild(div);
    });
}


async function assignGrade(studentId, courseId) {
    let grade = prompt("Enter grade for student:");
    if (grade === null || grade === ""){
        alert("Please enter a valid grade between 0 and 4.");
        return;
    }
    grade = Number(grade);
    if (isNaN(grade) || grade < 0 || grade > 4) {
        alert("Please enter a valid grade between 0 and 4.");
        return;
    }
    try {
        const response = await fetch('https://university-management-system-ums-production.up.railway.app/faculty/assignGrade', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentID: studentId,
                courseID: courseId,
                grade: grade
            })
        });

        const data = await response.json();
        alert(data.message);
        loadCourses();
    } catch (error) {
        console.error("Error assigning grade:", error);
    }
}
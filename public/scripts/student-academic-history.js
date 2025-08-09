const courseList = document.getElementById("course-list");

async function loadCourses() {
    try {
        const coursesRes = await fetch('http://localhost:3500/course');
        const studentRes = await fetch('http://localhost:3500/student/profile');
        if (!coursesRes.ok || !studentRes.ok) {
            throw new Error('Failed to fetch data');
        }
        let courses = await coursesRes.json();
        courses = courses.courses;
        let student = await studentRes.json();
        student = student.student;
        let passedCourses = student.coursesPassed;
        let cgpa = student.cgpa;
        const courseMap = {};
        for (const course of courses) {
            courseMap[course._id.toString()] = course;
        }

        // Now create the final array with enriched data
        const finalCourses = passedCourses.map(current => {
            const course = courseMap[current.course];

            return {
                name: course?.name || 'Unknown',
                code: course?.code || 'Unknown',
                ch: course?.ch || 'Unknown',
                GPA: current.Grade || 'Unknown'
            };
        });

        renderdata(finalCourses,cgpa);
    } catch (err) {
        console.error('Error fetching courses:', err);
    }
};

async function renderdata(courses,cgpa) {
    document.getElementById("cgpa").innerText = cgpa;
    if (courses.length === 0) {
        courseList.innerHTML = `<p class="text-white">No passed courses.</p>`;
    }
    courses.forEach(course => {
        const col = document.createElement("div");
        col.className = "col";
        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${course.name}</h5>
                <p class="card-text">Code: ${course.code}</p>
                <p class="card-text">Credit Hours: ${course.ch}</p>
                <p class="card-text">GPA: ${course.GPA}</p>
            `;
        col.appendChild(card);
        courseList.appendChild(col);
    });
}

loadCourses();
const ROLES = {
    FACULTY: 1818,
    STUDENT: 2828
};

document.getElementById('studentRegisterForm').addEventListener('submit', (e) => {
    handleStudentRegistration(e);
});

document.getElementById('facultyRegisterForm').addEventListener('submit', (e) => {
    handleFacultyRegistration(e);
});

// Switch tabs based on query parameter
const params = new URLSearchParams(window.location.search);
const type = params.get('type');

if (type === 'faculty') {
    const facultyTab = new bootstrap.Tab(document.querySelector('#faculty-tab'));
    facultyTab.show();
} else {
    const studentTab = new bootstrap.Tab(document.querySelector('#student-tab'));
    studentTab.show();
}

async function handleStudentRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.studentName.value,
        rollNo: form.rollNo.value,
        department: form.department.value,
        semester: parseInt(form.semester.value),
        email: form.studentEmail.value,
        password: form.studentPassword.value,
        role: ROLES.STUDENT
    };

    const res = await fetch('https://university-management-system-ums-production.up.railway.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Student registered sucessfully!');
        form.reset();
        window.location.href = '/index.html?type=student';
        // form.style.display = 'none';
    } else {
        const errorData = await res.json(); 
        alert('Registration failed, error: ' + errorData.message);
    }
}

async function handleFacultyRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.facultyName.value,
        email: form.facultyEmail.value,
        password: form.facultyPassword.value,
        designation: form.designation.value,
        role: ROLES.FACULTY
    };
    const res = await fetch('https://university-management-system-ums-production.up.railway.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        form.reset();
        alert('Faculty registered sucessfully!');
        // form.style.display = 'none';
        window.location.href = '/index.html?type=faculty';
    } else {
        const errorData = await res.json(); 
        alert('Registration failed, error: ' + errorData.message);

    }
}
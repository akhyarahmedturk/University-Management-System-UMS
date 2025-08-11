
const ROLES = {
    ADMIN: 5500,
    FACULTY: 1818,
    STUDENT: 2828
};


const params = new URLSearchParams(window.location.search);
const type = params.get('type');

if (type === 'faculty') {
    const facultyTab = new bootstrap.Tab(document.querySelector('#faculty-tab'));
    facultyTab.show();
}
else if (type === 'Admin') {
    const adminTab = new bootstrap.Tab(document.querySelector('#admin-tab'));
    adminTab.show();
}
else {
    const studentTab = new bootstrap.Tab(document.querySelector('#student-tab'));
    studentTab.show();
}

// Redirect to proper registration tab
document.getElementById('registerStudent').addEventListener('click', () => {
    window.location.href = '/register.html?type=student';
});

document.getElementById('registerFaculty').addEventListener('click', () => {
    window.location.href = '/register.html?type=faculty';
});

// Handle login form submissions
document.getElementById('student').addEventListener('submit', (e) => {
    const email = document.getElementById('studentEmail').value;
    const pass = document.getElementById('studentPassword').value;
    handleLogin(e, ROLES.STUDENT, email, pass);
});

document.getElementById('faculty').addEventListener('submit', (e) => {
    const email = document.getElementById('facultyEmail').value;
    const pass = document.getElementById('facultyPassword').value;
    handleLogin(e, ROLES.FACULTY, email, pass);
});

document.getElementById('admin').addEventListener('submit', (e) => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    handleLogin(e, ROLES.ADMIN, email, pass);
});

// Login handler
async function handleLogin(e, role, email, password) {
    e.preventDefault();
    const form = e.target;
    const data = {
        email: email,
        password: password,
        role: role
    };

    try {
        const res = await fetch('http://localhost:3500/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            if (role === ROLES.STUDENT) window.location.href = '/protected/student-dashboard.html';
            else if (role === ROLES.ADMIN) window.location.href= '/protected/admin-dashboard.html';
            else if (role === ROLES.FACULTY) window.location.href= '/protected/faculty-dashboard.html';
            else window.location.href = `/index.html`;
        }
        else {
            const errorData = await res.json();
            alert(`Authentication failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (err) {
        alert(`An error occurred while logging in: ${err.message || 'Unknown error'}`);
    }
}
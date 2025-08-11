document.getElementById('toggle-password-section').addEventListener('click', () => {
    const section = document.getElementById('password-section');
    section.classList.toggle('d-none');
});
// Fetch and populate student data
async function loadProfile() {
    try {
        const res = await fetch('https://university-management-system-ums-production.up.railway.app/student/profile');
        let student = await res.json();
        student = student.student || {};
        document.getElementById('name').textContent = student.name || '';
        document.getElementById('rollNo').textContent = student.rollNo || '';
        document.getElementById('department').textContent = student.department || '';
        document.getElementById('semester').textContent = student.semester || '';
        document.getElementById('email').textContent = student.email || '';
        document.getElementById('cgpa').textContent = (student.cgpa ?? 'NaN'); // Handle NaN case
    } catch (err) {
        alert('Failed to load profile.');
        console.error(err);
    }
}

// Submit updated data
document.getElementById('change-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('password').value;
    const updatedData = { oldPassword, newPassword };
    if (!oldPassword || !newPassword) {
        alert('Please fill in both fields.');
        return;
    }
    try {
        const res = await fetch('https://university-management-system-ums-production.up.railway.app/student/updatePassword', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            alert('Password updated successfully!');
        } else {
            const error = await res.json();
            alert('Error: ' + error.message);
        }
    } catch (err) {
        alert('Update failed.');
        console.error(err);
    }
});

loadProfile();
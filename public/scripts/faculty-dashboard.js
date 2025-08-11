document.getElementById('logout').addEventListener('click', async () => {
    fetch('https://university-management-system-ums-production.up.railway.app/logout');
    window.location.href = '/index.html?type=faculty';
})
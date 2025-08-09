document.getElementById('logout').addEventListener('click', async () => {
    fetch('http://localhost:3500/logout');
    window.location.href = '/index.html?type=faculty';
})
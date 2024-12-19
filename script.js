// DOM Elements
const postsContainer = document.getElementById('posts');
const usersList = document.getElementById('users');
const searchInput = document.getElementById('search');

// Fetch Data from JSON files
let posts = [];
let users = [];

// Load JSON data
async function loadData() {
    const postsResponse = await fetch('posts.json');
    const usersResponse = await fetch('users.json');

    posts = await postsResponse.json();
    users = await usersResponse.json();

    displayUsers();
    displayPosts(posts);
}

// Display Users in the Sidebar
function displayUsers() {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        li.addEventListener('click', () => filterByUser(user.id));
        usersList.appendChild(li);
    });
}

// Display Posts in the Posts Container
function displayPosts(postList) {
    postsContainer.innerHTML = '';
    postList.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <small>By: ${user ? user.name : 'Unknown User'}</small>
        `;

        postsContainer.appendChild(postElement);
    });
}

// Filter Posts by Search Input
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query)
    );
    displayPosts(filteredPosts);
});

// Filter Posts by User ID
function filterByUser(userId) {
    const userPosts = posts.filter(post => post.userId === userId);
    displayPosts(userPosts);
}

// Initialize Forum
loadData();

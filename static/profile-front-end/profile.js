const footerButtons = document.querySelectorAll('.footer-btn');
const profileBtn = document.getElementById('profile-btn');
const followButton = document.getElementById('followBtn');

window.addEventListener('load', () => {
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    profileBtn.classList.add('text-[#878d26]');
}
);

if (followButton) {
    const userId = followButton.dataset.userId;


    followButton.addEventListener('click', () => {
        toggleFollow(userId);
    });

    // Call checkFollowStatus when the page loads
    document.addEventListener('DOMContentLoaded', (event) => {
        checkFollowStatus(userId);
    });

    async function toggleFollow(userId) {
        const followBtn = document.getElementById('followBtn');
        const followIcon = document.getElementById('followIcon');

        try {
            if (followBtn.innerText === 'Follow') {
                console.log({ userId });
                await fetch(`/follow/${userId}`, { method: 'POST' }); // use actual userId
                followBtn.innerText = 'Followed';
                followIcon.classList.remove('fa-user-plus');
                followIcon.classList.add('fa-user-check');
            } else {
                await fetch(`/unfollow/${userId}`, { method: 'POST' }); // use actual userId
                followBtn.innerText = 'Follow';
                followIcon.classList.remove('fa-user-check');
                followIcon.classList.add('fa-user-plus');
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function checkFollowStatus(userId) {
        try {
            const response = await fetch(`/is-following/${userId}`); // endpoint that checks if the current user is following the user with the given userId
            const isFollowing = await response.json();

            const followBtn = document.getElementById('followBtn');
            const followIcon = document.getElementById('followIcon');

            if (isFollowing) {
                followBtn.innerText = 'Followed';
                followIcon.classList.remove('fa-user-plus');
                followIcon.classList.add('fa-user-check');
            } else {
                followBtn.innerText = 'Follow';
                followIcon.classList.remove('fa-user-check');
                followIcon.classList.add('fa-user-plus');
            }
        } catch (error) {
            console.log(error);
        }
    }
}
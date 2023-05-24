const footerButtons = document.querySelectorAll('.footer-btn');
const profileBtn = document.getElementById('profile-btn');
const followButton = document.getElementById('followBtn');
const profileImage = document.querySelector('.profile-image');
const currentUser = profileImage.dataset.currentuser;
const backButton = document.getElementById('back-button');
const followers = document.getElementById('followers');

window.addEventListener('load', () => {
    if (currentUser == 'true') {
        footerButtons.forEach(btn => {
            btn.classList.remove('text-[#878d26]');
        });
        profileBtn.classList.add('text-[#878d26]');
    } else {
        return;
    }
});

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
        try {
            if (followBtn.innerText.includes('Follow')) {
                console.log({ userId });
                await fetch(`/api-user/follow/${userId}`, { method: 'POST' }); // use actual userId
                followBtn.innerHTML = `<i id="followIcon" class="fas fa-user-check text-base text-[#878d26] mr-2"></i>
               Unfollow`;
                followers.innerText = Number(followers.innerText) + 1;
            } else {
                await fetch(`/api-user/unfollow/${userId}`, { method: 'POST' }); // use actual userId
                followBtn.innerHTML = `<i id="followIcon" class="fas fa-user-plus text-base text-[#878d26] mr-2"></i>
                Follow`;
                followers.innerText = Number(followers.innerText) - 1;
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function checkFollowStatus(userId) {
        try {
            const response = await fetch(`/api-user/is-following/${userId}`); // endpoint that checks if the current user is following the user with the given userId
            const data = await response.json();
            if (data.isFollowing) {
                const isFollowing = data.isFollowing;
                console.log(isFollowing, 'isFollowing');
                const followBtn = document.getElementById('followBtn');
                if (isFollowing) {
                    followBtn.innerHTML = `<i id="followIcon" class="fas fa-user-check text-base text-[#878d26] mr-2"></i>
               Unfollow`;
                } else {
                    followBtn.innerHTML = `<i id="followIcon" class="fas fa-user-plus text-base text-[#878d26] mr-2"></i>
                Follow`;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}
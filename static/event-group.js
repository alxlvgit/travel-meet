let groupPageOpen = false;
const currentUrl = window.location.href;
const eventId = currentUrl.split('/')[4];
const groupId = currentUrl.split('/')[6];


// Init Swiper for event and groups
const swiper = new Swiper(".swiper", {
    slidesPerView: "auto",
    freeMode: true,
    mousewheel: {
        releaseOnEdges: true,
    },
});

// Check if URL contains group
if (currentUrl.includes('event') && currentUrl.includes('group')) {
    groupPageOpen = true;
    console.log('URL contains both "event" and "group"');
} else {
    console.log('URL does not contain both "event" and "group"');
}


// handle rendered groups window
const handleRenderedGroupWindow = async () => {
    const backButton = document.querySelector('.back-link');
    backButton.attributes.href.value = `/events/${eventId}`;
    const joinButton = document.querySelector('.join-button');
    const leaveButton = document.querySelector('.leave-button');
    handleJoinButton(joinButton);
    handleLeaveButton(leaveButton);
    await renderMembers();
}

// Check if groups are rendered
if (groupPageOpen) {
    handleRenderedGroupWindow();
}

function generateMemberHtml(member) {
    return `
      <div class="swiper-slide w-auto">
        <img class="w-16 h-16 object-cover rounded-full border-2 border-white outline-[#878d26] outline outline-2 m-1"
          src="${member.profileImageURI}" alt="Profile 1" />
      </div>
    `;
}

// Render groups
async function renderMembers() {
    const response = await fetch(`/api-events/group/${groupId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    const group = data.group;
    const membersContainer = document.querySelector('.members-container .swiper-wrapper');
    membersContainer.innerHTML = '';
    group.members.forEach(member => {
        const memberHtml = generateMemberHtml(member);
        membersContainer.insertAdjacentHTML('beforeend', memberHtml);
    });
    const { isCreator, isMember } = await checkIfCreatorOrMember(group, data.userId);
    switchFooterButtons(isCreator, isMember);
}


const switchFooterButtons = (isCreator, isMember) => {
    const joinButton = document.querySelector('.join-button');
    const leaveButton = document.querySelector('.leave-button');
    const deleteButton = document.querySelector('.delete-button');
    if (isCreator) {
        joinButton.classList.add('hidden');
        leaveButton.classList.add('hidden');
        deleteButton.classList.remove('hidden');
    } else if (isMember) {
        joinButton.classList.add('hidden');
        leaveButton.classList.remove('hidden');
        deleteButton.classList.add('hidden');
    } else {
        joinButton.classList.remove('hidden');
        leaveButton.classList.add('hidden');
        deleteButton.classList.add('hidden');
    }
    console.log('isCreator', isCreator);
    console.log('isMember', isMember);
}

const checkIfCreatorOrMember = async (group, userId) => {
    let isCreator = false;
    let isMember = false;
    console.log(group.creatorId);
    console.log(userId);
    if (group.creatorId === userId) {
        isCreator = true;
    }
    group.members.forEach(member => {
        if (member.id === userId) {
            isMember = true;
        }
    }
    );
    return {
        isCreator,
        isMember,
    };
}



// Handle join button
function handleJoinButton(joinButton) {
    joinButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const groupId = joinButton.dataset.groupid;
        const response = await fetch(`/api-events/groups/${groupId}/join`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            await renderMembers();
        } else {
            alert(response.statusText);
        }
    });
}

// Handle leave button
function handleLeaveButton(leaveButton) {
    leaveButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const groupId = leaveButton.dataset.groupid;
        console.log(groupId);
        const response = await fetch(`/api-events/groups/${groupId}/leave`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            await renderMembers();
        } else {
            alert(response.statusText);
        }
    });
}







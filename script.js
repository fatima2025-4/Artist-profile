// Initialize variables
let currentStep = 1;
const totalSteps = 3;
let selectedStyleValues = [];
let artworkPage = 1;
let isLoadingArtworks = false;
let followedArtists = [];
let userArtworks = [];

// Sample artwork data
const sampleArtworks = [
    {
        id: 1,
        title: "Starry Night",
        artist: "Vincent van Gogh",
        imageUrl: "https://www.vangoghgallery.com/img/starry_night_full.jpg",
        liked: false
    },
    {
        id: 2,
        title: "The Persistence of Memory",
        artist: "Salvador Dalí",
        imageUrl: "https://www.moma.org/media/W1siZiIsIjMwMDAwOSJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MTQ0MFx1MDAzZSJdXQ.jpg",
        liked: false
    },
    {
        id: 3,
        title: "Girl with a Pearl Earring",
        artist: "Johannes Vermeer",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
        liked: false
    },
    {
        id: 4,
        title: "The Scream",
        artist: "Edvard Munch",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
        liked: false
    }
];

// Initialize Bootstrap modal
const discoverModal = new bootstrap.Modal(document.getElementById('discoverModal'));

// Function to toggle artworks section visibility
function toggleArtworksSection() {
    const artworksSection = document.querySelector('.artworks-section');
    if (currentStep === 1 || currentStep === 2) {
        artworksSection.style.display = 'block';
    } else {
        artworksSection.style.display = 'none';
    }
}

// Step Navigation
document.querySelectorAll('.next-step').forEach(function(button) {
    button.addEventListener('click', function() {
        nextStep();
    });
});

document.querySelectorAll('.prev-step').forEach(function(button) {
    button.addEventListener('click', function() {
        prevStep();
    });
});

function nextStep() {
    if (validateStep(currentStep)) {
        document.getElementById('step' + currentStep).classList.remove('active');
        currentStep++;
        updateProgress();
        document.getElementById('step' + currentStep).classList.add('active');
        toggleArtworksSection();
        
        if (currentStep === 3) {
            populateReview();
        }
    }
}

function prevStep() {
    document.getElementById('step' + currentStep).classList.remove('active');
    currentStep--;
    updateProgress();
    document.getElementById('step' + currentStep).classList.add('active');
    toggleArtworksSection();
}

function validateStep(step) {
    let isValid = true;
    const currentStepEl = document.getElementById('step' + step);
    
    // Clear previous validations
    currentStepEl.querySelectorAll('.is-invalid').forEach(function(input) {
        input.classList.remove('is-invalid');
    });
    
    currentStepEl.querySelectorAll('.invalid-feedback').forEach(function(feedback) {
        feedback.style.display = 'none';
    });

    // Validate required fields
    currentStepEl.querySelectorAll('[required]').forEach(function(input) {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
            const feedback = input.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'block';
            }
        }
    });

    // Special validation for step 2
    if (step === 2) {
        // Validate at least one style is selected
        const stylesSelected = selectedStyleValues.length > 0;
        const styleFeedback = currentStepEl.querySelector('.style-tags + .invalid-feedback');
        
        if (!stylesSelected) {
            isValid = false;
            if (styleFeedback) {
                styleFeedback.style.display = 'block';
            }
        }

        // Validate bio and goals fields
        const bioField = currentStepEl.querySelector('textarea:first-of-type');
        const goalsField = currentStepEl.querySelector('textarea:last-of-type');
        
        [bioField, goalsField].forEach(field => {
            if (field && !field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                const feedback = field.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.style.display = 'block';
                }
            }
        });
    }

    return isValid;
}

// Style tags selection
document.querySelectorAll('.style-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        this.classList.toggle('selected');
        const value = this.dataset.value;
        
        if (this.classList.contains('selected')) {
            if (!selectedStyleValues.includes(value)) {
                selectedStyleValues.push(value);
            }
        } else {
            selectedStyleValues = selectedStyleValues.filter(v => v !== value);
        }
        
        // Update hidden field
        document.getElementById('selectedStyles').value = selectedStyleValues.join(',');
    });
});

function updateProgress() {
    const progressBar = document.querySelector('.progress-bar');
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = percentage + '%';
    
    document.querySelectorAll('.step').forEach(function(stepElement, index) {
        if (index < currentStep) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
}

function populateReview() {
    const reviewContent = document.getElementById('reviewContent');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    // Get all form values with reliable selectors
    const formData = {
        // Step 1 values
        name: step1.querySelector('input[type="text"]').value,
        dob: step1.querySelector('input[type="date"]').value,
        education: step1.querySelector('input[pattern="[A-Za-z ]{3,30}"]').value,
        email: step1.querySelector('input[type="email"]').value,
        location: step1.querySelector('input[pattern="[A-Za-z ]{3,}"]').value,
        phone: step1.querySelector('input[type="tel"]').value || 'Not provided',
        social: step1.querySelector('input[type="url"]').value || 'Not provided',
        
        // Step 2 values
        styles: selectedStyleValues.join(', ') || 'None selected',
        bio: step2.querySelector('textarea:first-of-type').value,
        goals: step2.querySelector('textarea:last-of-type').value
    };

    // Format date for better display
    const formattedDate = formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Not provided';

    // Create review HTML
    reviewContent.innerHTML = `
        <div class="review-section">
            <h4 class="review-title">Basic Information</h4>
            <div class="review-item"><strong>Name:</strong> ${formData.name}</div>
            <div class="review-item"><strong>Email:</strong> ${formData.email}</div>
            <div class="review-item"><strong>Date of Birth:</strong> ${formattedDate}</div>
            <div class="review-item"><strong>Education:</strong> ${formData.education}</div>
            <div class="review-item"><strong>Location:</strong> ${formData.location}</div>
            <div class="review-item"><strong>Phone:</strong> ${formData.phone}</div>
            <div class="review-item"><strong>Social Links:</strong> ${formData.social}</div>
        </div>
        
        <div class="review-section mt-4">
            <h4 class="review-title">Get to know me</h4>
            <div class="review-item"><strong>Selected Styles:</strong> ${formData.styles}</div>
            <div class="review-item"><strong>Bio:</strong> ${formData.bio}</div>
            <div class="review-item"><strong>Artistic Goals:</strong> ${formData.goals}</div>
        </div>
    `;
}

// Image Upload Handling
document.getElementById('profileContainer').addEventListener('click', function() {
    document.getElementById('avatarUpload').click();
});

document.getElementById('avatarUpload').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('profileImg').src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Background Image Upload
document.getElementById('bgUpload').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const header = document.querySelector('.profile-header');
        header.style.backgroundImage = 
            'linear-gradient(45deg, rgba(77, 184, 178, 0.6), rgba(164, 224, 221, 0.6)), ' + 
            'url(' + reader.result + ')';
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Initialize empty artworks collection
function initializeEmptyArtworks() {
    const artworksContainer = document.getElementById('artworksContainer');
    artworksContainer.innerHTML = `
        <div class="text-center py-5" style="color: var(--secondary-dark);">
            <i class="fas fa-palette" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h4 style="color: var(--dark);">You haven't uploaded any artwork yet</h4>
            
            <button class="btn btn-primary mt-3" style="border-radius: 20px;" id="addtoportfolioBtn">
                Add to portfolio
            </button>
        </div>
    `;
    
    document.getElementById('addtoportfolioBtn').addEventListener('click', function() {
        loadArtworksGallery();
        discoverModal.show();
    });
}

// Load artworks into gallery
function loadArtworksGallery() {
    const gallery = document.getElementById('artworksGallery');
    gallery.innerHTML = '';
    
    sampleArtworks.forEach(artwork => {
        const artworkElement = document.createElement('div');
        artworkElement.className = 'col-md-6 col-lg-3 mb-4';
        artworkElement.innerHTML = `
            <div class="gallery-artwork">
                <img src="${artwork.imageUrl}" class="gallery-artwork-img" alt="${artwork.title}">
                <div class="gallery-artwork-body">
                    <h5 class="gallery-artwork-title">${artwork.title}</h5>
                    <p class="gallery-artwork-artist">${artwork.artist}</p>
                    <button class="like-btn ${artwork.liked ? 'liked' : ''}" data-id="${artwork.id}">
                        <i class="fas fa-heart"></i> ${artwork.liked ? 'Liked' : 'Like'}
                    </button>
                </div>
            </div>
        `;
        gallery.appendChild(artworkElement);
    });
}

// Like artwork function
function likeArtwork(artworkId) {
    const artwork = sampleArtworks.find(a => a.id === artworkId);
    if (artwork) {
        artwork.liked = !artwork.liked;
        
        const likeBtn = document.querySelector(`.like-btn[data-id="${artworkId}"]`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked');
            likeBtn.innerHTML = artwork.liked ? 
                '<i class="fas fa-heart"></i> Liked' : 
                '<i class="far fa-heart"></i> Like';
        }
        
        if (artwork.liked) {
            addUserArtwork(artwork.imageUrl);
        } else {
            removeUserArtwork(artwork.imageUrl);
        }
    }
}

// Add artwork to user collection
function addUserArtwork(url) {
    if (!userArtworks.includes(url)) {
        userArtworks.push(url);
        updateArtworksDisplay();
    }
}

// Remove artwork from collection
function removeUserArtwork(url) {
    userArtworks = userArtworks.filter(artUrl => artUrl !== url);
    updateArtworksDisplay();
}

// Update artworks display
function updateArtworksDisplay() {
    const artworksContainer = document.getElementById('artworksContainer');
    artworksContainer.innerHTML = '';
    
    if (userArtworks.length === 0) {
        initializeEmptyArtworks();
    } else {
        userArtworks.forEach(url => {
            artworksContainer.appendChild(createArtworkCard(url));
        });
    }
}

// Create artwork card
function createArtworkCard(url) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.innerHTML = `
        <img src="${url}" class="artwork-image" alt="Favorite artwork">
        <div class="artwork-actions">
            <button class="btn btn-primary btn-sm"><i class="fas fa-heart"></i> Like</button>
            <button class="btn btn-secondary btn-sm"><i class="fas fa-share"></i> Share</button>
        </div>
    `;
    
    setTimeout(function() {
        card.classList.add('visible');
    }, 100);
    
    return card;
}

// Back to top button functionality
document.getElementById('backToTopBtn').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// Form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Profile submitted successfully!');
    // Here you would typically send the data to a server
});

// Following/Followers functionality
function addFollowingAndFollowersButtons() {
    const profileContainer = document.querySelector('.container.text-center');
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'd-flex justify-content-center gap-3 mt-3 mb-4';
    
    // Following Button
    const followingButton = document.createElement('button');
    followingButton.className = 'btn btn-primary';
    followingButton.style.borderRadius = '20px';
    followingButton.style.padding = '8px 20px';
    followingButton.innerHTML = `
        <span style="font-weight:600">0</span> Following
    `;
    followingButton.addEventListener('click', showFollowingModal);
    
    // Followers Button
    const followersButton = document.createElement('button');
    followersButton.className = 'btn btn-primary';
    followersButton.style.borderRadius = '20px';
    followersButton.style.padding = '8px 20px';
    followersButton.innerHTML = `
        <span style="font-weight:600">0</span> Followers
    `;
    followersButton.addEventListener('click', showFollowersModal);
    
    buttonsContainer.appendChild(followersButton);
    buttonsContainer.appendChild(followingButton);
    
    // Insert buttons after bio
    const bioElement = document.getElementById('bio');
    bioElement.insertAdjacentElement('afterend', buttonsContainer);
}

function showFollowingModal() {
    const modalHTML = `
        <div class="modal fade" id="followingModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Following</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <i class="fas fa-user-friends fa-3x text-muted mb-3"></i>
                        <p>You aren't following anyone yet</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('followingModal'));
    modal.show();
    
    document.getElementById('followingModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showFollowersModal() {
    const modalHTML = `
        <div class="modal fade" id="followersModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Followers</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <p>You don't have any followers yet</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('followersModal'));
    modal.show();
    
    document.getElementById('followersModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addFollowingAndFollowersButtons();
    initializeEmptyArtworks();
    toggleArtworksSection();
    
    // Event delegation for like buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const artworkId = parseInt(e.target.closest('.like-btn').dataset.id);
            likeArtwork(artworkId);
        }
    });
});
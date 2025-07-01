// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
// Find the gallery container and the button
const gallery = document.getElementById('gallery');
const getImagesBtn = document.querySelector('.filters button');

// NASA API key (demo key, replace with your own for production)
const API_KEY = 'zG5cIkCDRDIzluQV7Et8VcyzZJXZEZiccLfhWzww'; // Replace with your provided API key if needed

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Function to fetch images from NASA's APOD API
async function fetchSpaceImages(startDate, endDate) {
  // Build the API URL with the selected date range
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  try {
    // Fetch data from the API
    const response = await fetch(url);
    // Parse the JSON data
    const data = await response.json();
    // Return the data as an array (sorted by date ascending)
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    // If there's an error, log it and return an empty array
    console.error('Error fetching images:', error);
    return [];
  }
}

// Function to create a gallery item element
function createGalleryItem(item) {
  // Create the gallery item div
  const div = document.createElement('div');
  div.className = 'gallery-item';

  // If the entry is an image
  if (item.media_type === 'image') {
    div.innerHTML = `
      <img src="${item.url}" alt="${item.title}" />
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
    // Add a click event to open the modal with this item's details
    div.addEventListener('click', () => openModal(item));
    return div;
  }

  // If the entry is a video
  if (item.media_type === 'video') {
    // Check if it's a YouTube video
    let videoEmbed = '';
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      // Extract YouTube video ID for embedding
      let videoId = '';
      if (item.url.includes('youtube.com')) {
        const urlParams = new URL(item.url).searchParams;
        videoId = urlParams.get('v');
      } else if (item.url.includes('youtu.be')) {
        videoId = item.url.split('/').pop();
      }
      if (videoId) {
        videoEmbed = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen 
            class="gallery-video"
            title="${item.title}">
          </iframe>
        `;
      }
    }

    // If not YouTube or failed to extract ID, show a link
    if (!videoEmbed) {
      videoEmbed = `
        <a href="${item.url}" target="_blank" rel="noopener" class="gallery-video-link">
          Watch Video
        </a>
      `;
    }

    div.innerHTML = `
      ${videoEmbed}
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
    // Add a click event to open the modal with this item's details
    div.addEventListener('click', () => openModal(item));
    return div;
  }

  // If not image or video, skip
  return null;
}

// Function to render the gallery
function renderGallery(items) {
  // Clear the gallery
  gallery.innerHTML = '';
  // If there are no images, show a message
  if (!items.length) {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚫</div><p>No images found for this date range.</p></div>`;
    return;
  }
  // Add each gallery item to the gallery
  items.forEach(item => {
    const galleryItem = createGalleryItem(item);
    if (galleryItem) gallery.appendChild(galleryItem);
  });
}

// Function to open the modal with image or video details
function openModal(item) {
  // Create the modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  // Modal content for images
  let mediaContent = '';
  if (item.media_type === 'image') {
    mediaContent = `<img src="${item.hdurl || item.url}" alt="${item.title}" class="modal-image" />`;
  } else if (item.media_type === 'video') {
    // Modal content for videos
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      // Extract YouTube video ID for embedding
      let videoId = '';
      if (item.url.includes('youtube.com')) {
        const urlParams = new URL(item.url).searchParams;
        videoId = urlParams.get('v');
      } else if (item.url.includes('youtu.be')) {
        videoId = item.url.split('/').pop();
      }
      if (videoId) {
        mediaContent = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen 
            class="modal-video"
            title="${item.title}">
          </iframe>
        `;
      }
    }
    // If not YouTube or failed to extract ID, show a link
    if (!mediaContent) {
      mediaContent = `
        <a href="${item.url}" target="_blank" rel="noopener" class="modal-video-link">
          Watch Video
        </a>
      `;
    }
  }

  // Modal content with media, title, date, and explanation
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" title="Close">&times;</span>
      ${mediaContent}
      <h2>${item.title}</h2>
      <p><em>${item.date}</em></p>
      <p>${item.explanation}</p>
    </div>
  `;
  // Add event to close modal when clicking the close button or overlay
  modal.querySelector('.modal-close').onclick = () => document.body.removeChild(modal);
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };
  // Add modal to the page
  document.body.appendChild(modal);
}

// Listen for button click to fetch and display images
getImagesBtn.addEventListener('click', async () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;
  // Show a loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>`;
  // Fetch images from the API
  const items = await fetchSpaceImages(startDate, endDate);
  // Render the gallery with the fetched items
  renderGallery(items);
});

// --- Did You Know? Space Facts Section ---

// Array of fun space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? There are more stars in the universe than grains of sand on Earth.",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? Jupiter is so big that over 1,300 Earths could fit inside it.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Space is completely silent because there is no air to carry sound.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? Halley's Comet only appears every 76 years.",
  "Did you know? A spoonful of a neutron star weighs about a billion tons."
];

// Function to pick a random fact from the array
function getRandomFact() {
  // Math.random() gives a number between 0 and 1, multiply by array length and round down
  const index = Math.floor(Math.random() * spaceFacts.length);
  return spaceFacts[index];
}

// Find the container to insert the fact section above the gallery
const container = document.querySelector('.container');

// Create the fact section element
const factSection = document.createElement('section');
factSection.className = 'space-fact-section';
// Set the inner HTML with a random fact
factSection.innerHTML = `
  <div class="space-fact-card">
    <span class="space-fact-title">🌟 Did You Know?</span>
    <p class="space-fact-text">${getRandomFact()}</p>
  </div>
`;

// Insert the fact section before the gallery
container.insertBefore(factSection, document.getElementById('gallery'));

// --- Modal styles (for simplicity, inject here) ---
const modalStyles = document.createElement('style');
modalStyles.textContent = `
/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
/* Modal content */
.modal-content {
  background: #fff;
  border-radius: 8px;
  max-width: 600px;
  width: 90vw;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  position: relative;
  text-align: center;
}
.modal-image {
  width: 100%;
  max-height: 350px;
  object-fit: contain;
  border-radius: 4px;
  margin-bottom: 15px;
}
.modal-video, .gallery-video {
  width: 100%;
  height: 315px;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #000;
}
.gallery-video {
  height: 180px;
}
.modal-video-link, .gallery-video-link {
  display: inline-block;
  margin: 10px 0 15px 0;
  padding: 10px 18px;
  background: #0B3D91;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s;
}
.modal-video-link:hover, .gallery-video-link:hover {
  background: #FC3D21;
  color: #fff;
}
.modal-close {
  position: absolute;
  top: 10px; right: 18px;
  font-size: 32px;
  color: #888;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #212121;
}
`;
document.head.appendChild(modalStyles);

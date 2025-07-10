document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const imageList = document.getElementById('image-list');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('image-title');
  const modalAuthor = document.getElementById('image-author');
  const modalSize = document.getElementById('image-size');
  const closeModal = document.querySelector('.close-modal');
  const downloadBtn = document.querySelector('.download-btn');
  
  // API Configuration
  const accessKey = 'YgiLwB85YeXPySTY7ExUlHC_dO-SSoX7xFVcuKx62qw'; // Replace with your actual Unsplash API key
  let currentPage = 1;
  let currentQuery = '';
  let isLoading = false;

  // Initialize with popular images
  fetchPopularImages();

  // Event Listeners
  searchBtn.addEventListener('click', () => performSearch());
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  loadMoreBtn.addEventListener('click', loadMoreImages);
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Search Functionality
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    currentQuery = query;
    currentPage = 1;
    imageList.innerHTML = createLoader();
    fetchImages(query);
  }

  // Fetch Popular Images (for initial load)
  async function fetchPopularImages() {
    imageList.innerHTML = createLoader();
    
    try {
      const url = `https://api.unsplash.com/photos?page=1&per_page=12&order_by=popular&client_id=${accessKey}`;
      const res = await fetch(url);
      const data = await res.json();
      displayImages(data);
    } catch (err) {
      showError();
      console.error('Error fetching popular images:', err);
    }
  }

  // Fetch Images from API
  async function fetchImages(query) {
    if (isLoading) return;
    isLoading = true;
    
    try {
      const url = `https://api.unsplash.com/search/photos?page=${currentPage}&query=${query}&per_page=12&client_id=${accessKey}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (currentPage === 1) {
        displayImages(data.results);
      } else {
        appendImages(data.results);
      }
      
      // Show/hide load more button
      loadMoreBtn.style.display = data.results.length === 12 ? 'block' : 'none';
    } catch (err) {
      showError();
      console.error('Error fetching images:', err);
    } finally {
      isLoading = false;
    }
  }

  // Load More Images
  function loadMoreImages() {
    currentPage++;
    fetchImages(currentQuery);
  }

  // Display Images
  function displayImages(images) {
    if (!images || images.length === 0) {
      imageList.innerHTML = createMessage('No images found. Try a different search term.');
      return;
    }

    imageList.innerHTML = '';
    images.forEach(img => {
      imageList.appendChild(createImageCard(img));
    });
  }

  // Append Images (for pagination)
  function appendImages(images) {
    if (!images || images.length === 0) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    images.forEach(img => {
      imageList.appendChild(createImageCard(img));
    });
  }

  // Create Image Card Element
  function createImageCard(img) {
    const card = document.createElement('div');
    card.className = 'image';
    
    card.innerHTML = `
      <img src="${img.urls.regular}" alt="${img.alt_description || 'Unsplash image'}" class="photo">
      <div class="image-overlay">
        <h3 class="image-title">${img.description || 'Untitled'}</h3>
        <p class="image-author">By ${img.user.name}</p>
      </div>
      <div class="image-actions">
        <button class="action-btn like-btn"><i class="far fa-heart"></i></button>
        <button class="action-btn download-btn"><i class="fas fa-download"></i></button>
      </div>
    `;
    
    // Add click event to open modal
    card.querySelector('img').addEventListener('click', () => openModal(img));
    
    // Add download functionality
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadImage(img.links.download, `unsplash-${img.id}.jpg`);
    });
    
    return card;
  }

  // Open Image Modal
  function openModal(img) {
    modalImage.src = img.urls.full;
    modalTitle.textContent = img.description || 'Untitled';
    modalAuthor.textContent = `By ${img.user.name}`;
    modalSize.textContent = `${img.width} × ${img.height} px`;
    
    // Update download button
    downloadBtn.onclick = () => downloadImage(img.links.download, `unsplash-${img.id}.jpg`);
    
    modal.style.display = 'block';
  }

  // Download Image
  function downloadImage(url, filename) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error('Download failed:', err);
        alert('Download failed. Please try again.');
      });
  }

  // Helper Functions
  function createLoader() {
    return `
      <div class="loader-container">
        <div class="loader"></div>
        <p>Loading images...</p>
      </div>
    `;
  }

  function createMessage(text) {
    return `<p class="message">${text}</p>`;
  }

  function showError() {
    imageList.innerHTML = createMessage('Failed to load images. Please check your connection and try again.');
  }
});

// Add CSS for loader (you can add this to your CSS file)
const loaderCSS = `
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4361ee;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  text-align: center;
  color: #666;
  padding: 40px;
  font-size: 1.1rem;
}
`;

// Inject loader CSS
const style = document.createElement('style');
style.innerHTML = loaderCSS;
document.head.appendChild(style);
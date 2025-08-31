// Function to load videos from JSON file
async function loadVideosFromJSON() {
    try {
        console.log('Attempting to fetch video_db.json...');
        const response = await fetch('video_db.json');
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('JSON data loaded successfully:', data);
        console.log('Number of videos found:', data.data ? data.data.length : 0);
        
        return data.data; // Return the video data array
    } catch (error) {
        console.error('Error loading video data:', error);
        console.error('Error details:', error.message);
        return [];
    }
}

// Function to calculate "time ago" from upload date
function getTimeAgo(uploadDate) {
    const now = new Date();
    const uploaded = new Date(uploadDate);
    const diffTime = Math.abs(now - uploaded);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
        return "1 day ago";
    } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
    } else if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else if (diffDays <= 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 month ago" : `${months} months ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return years === 1 ? "1 year ago" : `${years} years ago`;
    }
}

// Function to extract duration from ISO format or return default
function formatDuration(duration) {
    // If duration is in ISO format (P0DT0H0M0S), return a default
    if (duration === "P0DT0H0M0S" || !duration) {
        return "0:00";
    }
    return duration;
}

// Function to truncate title if too long
function truncateTitle(title, maxLength = 60) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
}

// Function to parse view count and convert to number for sorting
function parseViewCount(viewString) {
    if (!viewString) return 0;
    
    const cleanView = viewString.toLowerCase().replace(/[^0-9.kmb]/g, '');
    const number = parseFloat(cleanView);
    
    if (viewString.toLowerCase().includes('k')) {
        return number * 1000;
    } else if (viewString.toLowerCase().includes('m')) {
        return number * 1000000;
    } else if (viewString.toLowerCase().includes('b')) {
        return number * 1000000000;
    }
    
    return number || 0;
}

// Function to render popular videos (sorted by views)
function renderPopularVideos(videos) {
    // Find the Popular Videos section by looking for the h3 with "Popular Videos" text
    const popularVideosSections = document.querySelectorAll('.vidz_sec');
    let popularVideosContainer = null;
    let popularVideosSection = null;
    
    // Find the section that contains "Popular Videos" heading
    for (let section of popularVideosSections) {
        const heading = section.querySelector('h3');
        if (heading && heading.textContent.trim() === 'Popular Videos') {
            popularVideosContainer = section.querySelector('.vidz_list .row');
            popularVideosSection = section;
            break;
        }
    }
    
    if (!popularVideosContainer) {
        console.error('Popular videos container not found');
        return;
    }
    
    // Remove any existing pagination in Popular Videos section
    const existingPagination = popularVideosSection.querySelector('.pagination-tabs');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // Sort videos by view count (highest first)
    const sortedVideos = [...videos].sort((a, b) => {
        const viewsA = parseViewCount(a.fields.views);
        const viewsB = parseViewCount(b.fields.views);
        return viewsB - viewsA;
    });
    
    // Take first 12 most popular videos
    const videosToShow = sortedVideos.slice(0, 12);
    
    // Clear existing content
    popularVideosContainer.innerHTML = '';
    
    videosToShow.forEach((video, index) => {
        const videoData = video.fields;
        const timeAgo = getTimeAgo(videoData.upload_date);
        const truncatedTitle = truncateTitle(videoData.title);
        
        const videoCard = `
            <div class="col-lg-3 col-md-6 col-sm-6 col-6 full_wdth">
                <div class="videoo">
                    <div class="vid_thumbainl">
                        <a href="single_video_page.html" title="${videoData.title}">
                            <img src="${videoData.thumbnail_url}" alt="${videoData.title}" onerror="this.src='images/resources/vide1.png'">
                            <span class="hd-badge">HD</span>
                            <span class="watch_later">
                                <i class="icon-watch_later_fill"></i>
                            </span>
                        </a>	
                    </div><!--vid_thumbnail end-->
                    <div class="video_info">
                        <h3><a href="single_video_page.html" title="${videoData.title}">${truncatedTitle}</a></h3>
                        <h4><a href="#" title="">${videoData.author}</a></h4>
                        <span>${videoData.views} views .<small class="posted_dt">${timeAgo}</small></span>
                    </div>
                </div><!--videoo end-->
            </div>
        `;
        
        popularVideosContainer.innerHTML += videoCard;
    });
    
    console.log(`Populated Popular Videos section with ${videosToShow.length} videos (no pagination)`);
}

// Global variables for pagination
let allVideos = [];
let currentPage = 1;
let videosPerPage = 12; // Default value, can be changed by user

// Function to render video cards for a specific page
function renderVideosPage(videos, page) {
    console.log(`Rendering videos page ${page} with ${videos.length} total videos`);
    const newVideosContainer = document.querySelector('.vidz_sec .vidz_list .row');
    
    console.log('New videos container found:', newVideosContainer);
    
    if (!newVideosContainer) {
        console.error('❌ New videos container not found');
        console.log('Available .vidz_sec elements:', document.querySelectorAll('.vidz_sec'));
        return;
    }
    
    // Clear existing content
    newVideosContainer.innerHTML = '';
    
    // Calculate start and end indices for current page
    const startIndex = (page - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const videosToShow = videos.slice(startIndex, endIndex);
    
    videosToShow.forEach((video, index) => {
        const videoData = video.fields;
        const timeAgo = getTimeAgo(videoData.upload_date);
        const truncatedTitle = truncateTitle(videoData.title);
        
        const videoCard = `
            <div class="col-lg-3 col-md-6 col-sm-6 col-6 full_wdth">
                <div class="videoo">
                    <div class="vid_thumbainl">
                        <a href="single_video_page.html" title="${videoData.title}">
                            <img src="${videoData.thumbnail_url}" alt="${videoData.title}" onerror="this.src='images/resources/vide1.png'">
                            <span class="hd-badge">HD</span>
                            <span class="watch_later">
                                <i class="icon-watch_later_fill"></i>
                            </span>
                        </a>	
                    </div><!--vid_thumbnail end-->
                    <div class="video_info">
                        <h3><a href="single_video_page.html" title="${videoData.title}">${truncatedTitle}</a></h3>
                        <h4><a href="#" title="">${videoData.author}</a></h4>
                        <span>${videoData.views} views .<small class="posted_dt">${timeAgo}</small></span>
                    </div>
                </div><!--videoo end-->
            </div>
        `;
        
        newVideosContainer.innerHTML += videoCard;
    });
}

// Function to create pagination buttons
function createPagination(totalVideos) {
    const totalPages = Math.ceil(totalVideos / videosPerPage);
    const paginationContainer = document.querySelector('.pagination-tabs');
    
    if (!paginationContainer) {
        console.error('Pagination container not found');
        return;
    }
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Don't show pagination if there's only one page or no videos
    if (totalPages <= 1) {
        return;
    }
    
    // Add Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.onclick = () => goToPrevPage();
        paginationContainer.appendChild(prevButton);
    }
    
    // Calculate which page numbers to show
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 9) {
        startPage = Math.max(1, endPage - 9);
    }
    
    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `page${i}`;
        input.name = 'pagination';
        input.checked = i === currentPage;
        input.onchange = () => changePage(i);
        
        const label = document.createElement('label');
        label.setAttribute('for', `page${i}`);
        label.textContent = i;
        
        paginationContainer.appendChild(input);
        paginationContainer.appendChild(label);
    }
    
    // Add Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => goToNextPage();
        paginationContainer.appendChild(nextButton);
    }
    
    // Add page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.style.marginLeft = '15px';
    pageInfo.style.color = '#666';
    paginationContainer.appendChild(pageInfo);
}

// Function to change videos per page
function changeVideosPerPage(newCount) {
    videosPerPage = parseInt(newCount);
    currentPage = 1; // Reset to first page
    renderVideosPage(allVideos, currentPage);
    createPagination(allVideos.length);
    
    // Scroll to top of videos section
    document.querySelector('.vidz_sec').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Function to create videos per page selector
function createVideosPerPageSelector() {
    const newVideosSection = document.querySelector('.vidz_sec');
    if (!newVideosSection) return;
    
    // Check if selector already exists
    let existingSelector = newVideosSection.querySelector('.videos-per-page-selector');
    if (existingSelector) {
        existingSelector.remove();
    }
    
    // Create the selector container
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'videos-per-page-selector';
    selectorContainer.innerHTML = `
        <label for="videosPerPageSelect">Videos per page:</label>
        <select id="videosPerPageSelect" onchange="changeVideosPerPage(this.value)">
            <option value="12" ${videosPerPage === 12 ? 'selected' : ''}>12</option>
            <option value="24" ${videosPerPage === 24 ? 'selected' : ''}>24</option>
            <option value="36" ${videosPerPage === 36 ? 'selected' : ''}>36</option>
        </select>
    `;
    
    // Insert after the title
    const title = newVideosSection.querySelector('h3');
    title.parentNode.insertBefore(selectorContainer, title.nextSibling);
}

// Function to change page
function changePage(page) {
    if (page < 1 || page > Math.ceil(allVideos.length / videosPerPage)) {
        return;
    }
    
    currentPage = page;
    renderVideosPage(allVideos, currentPage);
    createPagination(allVideos.length);
    
    // Scroll to top of videos section
    document.querySelector('.vidz_sec').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Function to go to next page
function goToNextPage() {
    const totalPages = Math.ceil(allVideos.length / videosPerPage);
    if (currentPage < totalPages) {
        changePage(currentPage + 1);
    }
}

// Function to go to previous page
function goToPrevPage() {
    if (currentPage > 1) {
        changePage(currentPage - 1);
    }
}

// Function to render new videos (wrapper for backward compatibility)
function renderNewVideos(videos) {
    allVideos = videos;
    currentPage = 1;
    createVideosPerPageSelector(); // Create the selector
    renderVideosPage(videos, currentPage);
    createPagination(videos.length);
}

// Initialize the video loading when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== VIDEO LOADER INITIALIZATION ===');
    console.log('DOM Content Loaded, starting video loading process...');
    
    try {
        const videos = await loadVideosFromJSON();
        
        if (videos && videos.length > 0) {
            console.log(`✅ Successfully loaded ${videos.length} videos`);
            console.log('First video sample:', videos[0]);
            
            // Populate New Videos section with pagination
            console.log('Rendering New Videos section...');
            renderNewVideos(videos);
            
            // Populate Popular Videos section (sorted by views)
            console.log('Rendering Popular Videos section...');
            renderPopularVideos(videos);
            
            console.log('✅ Video loading completed successfully');
        } else {
            console.error('❌ No videos loaded or videos array is empty');
            console.log('Videos variable:', videos);
        }
    } catch (error) {
        console.error('❌ Error in video loading process:', error);
    }
});

// Make functions globally accessible for pagination buttons
window.changePage = changePage;
window.goToNextPage = goToNextPage;
window.goToPrevPage = goToPrevPage;
window.changeVideosPerPage = changeVideosPerPage;

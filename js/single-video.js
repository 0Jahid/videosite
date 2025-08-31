// Single Video Page Functionality

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to load video data from JSON
async function loadVideoData() {
    try {
        const response = await fetch('video_db.json');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error loading video data:', error);
        return [];
    }
}

// Function to find video by ID
function findVideoById(videos, videoId) {
    return videos.find(video => video.fields.post_id === videoId);
}

// Function to calculate time ago
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

// Function to update video player with embed URL
function updateVideoPlayer(embedUrl) {
    const videoContainer = document.querySelector('.vid-pr');
    if (videoContainer) {
        // Try to extract a cleaner embed URL if needed
        let cleanEmbedUrl = embedUrl;
        
        // If the URL doesn't start with http, add https
        if (!cleanEmbedUrl.startsWith('http')) {
            cleanEmbedUrl = 'https://' + cleanEmbedUrl;
        }
        
        // Default to direct link approach (primary option)
        videoContainer.innerHTML = `
            <div class="video-player-container">
                <!-- Primary Default Option: Direct Link -->
                <div class="video-direct-link" style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px;">
                        <i class="icon-play" style="font-size: 48px; color: rgba(255,255,255,0.9);"></i>
                    </div>
                    <h3 style="margin-bottom: 15px; color: white; font-size: 24px; font-weight: 600;">🎬 Watch Video</h3>
                    <p style="margin-bottom: 25px; font-size: 16px; opacity: 0.9; line-height: 1.5;">
                        Click the button below to watch this video in the best quality
                    </p>
                    <a href="${cleanEmbedUrl}" target="_blank" class="watch-video-btn" 
                       style="display: inline-block; padding: 15px 30px; background: #fff; color: #667eea; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255,255,255,0.2);">
                        ▶️ WATCH NOW
                    </a>
                    <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                        Default viewing option - Opens in a new window for the best experience
                    </p>
                </div>
            </div>
        `;
        
        console.log('Video player updated with direct link as default option');
    }
}

// Function to update video information
function updateVideoInfo(videoData) {
    const timeAgo = getTimeAgo(videoData.upload_date);
    
    // Update title
    const titleElement = document.querySelector('.vid-info h3');
    if (titleElement) {
        titleElement.textContent = videoData.title;
    }
    
    // Update page title
    document.title = videoData.title + " - Video Site";
    
    // Update views
    const viewsElement = document.querySelector('.info-pr span');
    if (viewsElement) {
        viewsElement.textContent = `${videoData.views} views • Uploaded ${timeAgo}`;
    }
    
    // Update likes/dislikes if rating data exists
    if (videoData.rating) {
        const likesElement = document.querySelector('.pr_links li:first-child span');
        const dislikesElement = document.querySelector('.pr_links li:last-child span');
        
        if (likesElement) {
            likesElement.textContent = videoData.rating.likes || '0';
        }
        if (dislikesElement) {
            dislikesElement.textContent = videoData.rating.dislikes || '0';
        }
    }
    
    // Update description if exists
    const descriptionElement = document.querySelector('.about-ch-sec');
    if (descriptionElement && videoData.description) {
        // Clear existing content and add description
        descriptionElement.innerHTML = `
            <div class="abt-rw">
                <h4>Description:</h4>
                <p>${videoData.description}</p>
            </div>
            <div class="abt-rw">
                <h4>Category:</h4>
                <ul>
                    ${videoData.categories ? videoData.categories.map(cat => `<li><span>${cat}</span></li>`).join('') : '<li><span>Video</span></li>'}
                </ul>
            </div>
            <div class="abt-rw">
                <h4>Author:</h4>
                <ul>
                    <li><span>${videoData.author}</span></li>
                </ul>
            </div>
            <div class="abt-rw">
                <h4>Release Date:</h4>
                <ul>
                    <li><span>${videoData.release_date || 'Unknown'}</span></li>
                </ul>
            </div>
            ${videoData.actors && videoData.actors.length > 0 ? `
            <div class="abt-rw">
                <h4>Cast:</h4>
                <ul>
                    ${videoData.actors.map(actor => `<li><span>${actor.name}</span></li>`).join('')}
                </ul>
            </div>
            ` : ''}
        `;
    }
}

// Function to add download button
function addDownloadButton(downloadUrl) {
    // Find the likes/dislikes section
    const prLinksElement = document.querySelector('.pr_links');
    if (prLinksElement && downloadUrl) {
        // Add download button
        const downloadButton = document.createElement('li');
        downloadButton.innerHTML = `
            <a href="${downloadUrl}" target="_blank" class="download-btn" data-toggle="tooltip" data-placement="top" title="Download Video">
                <i class="icon-download"></i>
            </a>
            <span>Download</span>
        `;
        prLinksElement.appendChild(downloadButton);
    }
}

// Function to load and display single video
async function loadSingleVideo() {
    console.log('=== SINGLE VIDEO PAGE INITIALIZATION ===');
    
    // Get video ID from URL
    const videoId = getUrlParameter('id');
    console.log('Video ID from URL:', videoId);
    
    if (!videoId) {
        console.error('No video ID provided in URL');
        return;
    }
    
    try {
        // Load all video data
        const videos = await loadVideoData();
        console.log('Loaded videos:', videos.length);
        
        // Find the specific video
        const video = findVideoById(videos, videoId);
        console.log('Found video:', video);
        
        if (!video) {
            console.error('Video not found with ID:', videoId);
            return;
        }
        
        const videoData = video.fields;
        
        // Update video player with embed URL
        if (videoData.embed_url) {
            console.log('Updating video player with embed URL:', videoData.embed_url);
            updateVideoPlayer(videoData.embed_url);
        }
        
        // Update video information
        console.log('Updating video information');
        updateVideoInfo(videoData);
        
        // Add download button
        if (videoData.download_url) {
            console.log('Adding download button with URL:', videoData.download_url);
            addDownloadButton(videoData.download_url);
        }
        
        console.log('✅ Single video page loaded successfully');
        
    } catch (error) {
        console.error('Error loading single video:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadSingleVideo);

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

// Function to find similar videos by category and cast
function findSimilarVideos(videos, currentVideo, maxResults = 4) {
    const currentCategories = currentVideo.categories || [];
    const currentActors = currentVideo.actors || [];
    const currentId = currentVideo.post_id;
    
    // Filter out the current video and score videos by similarity
    const scoredVideos = videos
        .filter(video => video.fields.post_id !== currentId)
        .map(video => {
            const videoFields = video.fields;
            const videoCategories = videoFields.categories || [];
            const videoActors = videoFields.actors || [];
            
            let score = 0;
            
            // Score based on matching categories (higher priority)
            const categoryMatches = currentCategories.filter(cat => 
                videoCategories.includes(cat)
            ).length;
            score += categoryMatches * 10; // Categories have weight of 10
            
            // Score based on matching actors/cast
            const actorMatches = currentActors.filter(currentActor => 
                videoActors.some(videoActor => 
                    videoActor.name === currentActor.name
                )
            ).length;
            score += actorMatches * 5; // Actors have weight of 5
            
            return { video: videoFields, score };
        })
        .filter(item => item.score > 0) // Only include videos with some similarity
        .sort((a, b) => b.score - a.score) // Sort by highest score first
        .slice(0, maxResults) // Limit to max results
        .map(item => item.video);
    
    // If we don't have enough similar videos, fill with recent videos
    if (scoredVideos.length < maxResults) {
        const recentVideos = videos
            .filter(video => 
                video.fields.post_id !== currentId && 
                !scoredVideos.some(similar => similar.post_id === video.fields.post_id)
            )
            .sort((a, b) => new Date(b.fields.upload_date) - new Date(a.fields.upload_date))
            .slice(0, maxResults - scoredVideos.length)
            .map(video => video.fields);
        
        scoredVideos.push(...recentVideos);
    }
    
    return scoredVideos;
}

// Function to render similar videos in sidebar
function renderSimilarVideos(similarVideos) {
    const videoListContainer = document.querySelector('.videoo-list-ab');
    if (!videoListContainer) {
        console.log('Video list container not found');
        return;
    }
    
    videoListContainer.innerHTML = ''; // Clear existing content
    
    similarVideos.forEach(video => {
        const timeAgo = getTimeAgo(video.upload_date);
        const videoElement = document.createElement('div');
        videoElement.className = 'videoo';
        
        videoElement.innerHTML = `
            <div class="vid_thumbainl">
                <a href="single_video_page.html?id=${video.post_id}" title="${video.title}">
                    <img src="${video.thumbnail_url}" alt="${video.title}" loading="lazy">
                    <span class="hd-badge">HD</span>
                    <span class="watch_later">
                        <i class="icon-watch_later_fill"></i>
                    </span>
                </a>	
            </div><!--vid_thumbnail end-->
            <div class="video_info">
                <h3><a href="single_video_page.html?id=${video.post_id}" title="${video.title}">${video.title}</a></h3>
                <h4><a href="#" title="">${video.author}</a></h4>
                <span class="video_views">${video.views} views • ${timeAgo}</span>
            </div><!--video_info end-->
        `;
        
        videoListContainer.appendChild(videoElement);
    });
    
    console.log(`Rendered ${similarVideos.length} similar videos`);
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
        
        // Create working embedded video player
        videoContainer.innerHTML = `
            <div class="video-player-container">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="${cleanEmbedUrl}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerpolicy="no-referrer-when-downgrade"
                    loading="lazy"
                    style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
                ></iframe>
                
                <!-- Fallback if iframe doesn't work -->
                <div class="video-fallback" style="display: none; text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin-top: 10px; color: white;">
                    <h4 style="margin-bottom: 15px; color: white;">🎬 Video Player</h4>
                    <p style="margin-bottom: 20px;">If the video doesn't load above, click below to watch</p>
                    <a href="${cleanEmbedUrl}" target="_blank" class="external-video-btn" 
                       style="display: inline-block; padding: 12px 24px; background: #fff; color: #667eea; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">
                        ▶️ Open Video
                    </a>
                </div>
            </div>
        `;
        
        // Check if iframe loads properly, if not show fallback
        const iframe = videoContainer.querySelector('iframe');
        const fallback = videoContainer.querySelector('.video-fallback');
        
        // Show fallback after 8 seconds if iframe has issues
        setTimeout(() => {
            // Simple check - if iframe is still there but might have sandbox issues
            try {
                if (iframe && iframe.contentWindow) {
                    console.log('Video iframe loaded successfully');
                } else {
                    console.log('Video iframe may have issues, showing fallback option');
                    fallback.style.display = 'block';
                }
            } catch (error) {
                console.log('Video iframe access error, showing fallback');
                fallback.style.display = 'block';
            }
        }, 8000);
        
        console.log('Video player updated with embedded iframe');
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
        
        // Load and display similar videos
        console.log('Loading similar videos...');
        const similarVideos = findSimilarVideos(videos, videoData, 4);
        console.log('Found similar videos:', similarVideos.length);
        renderSimilarVideos(similarVideos);
        
        console.log('✅ Single video page loaded successfully');
        
    } catch (error) {
        console.error('Error loading single video:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadSingleVideo);

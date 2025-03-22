// DOM Elements
const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const processedVideo = document.getElementById('processedVideo');
const channelButtons = {
    C: document.getElementById('channelC'),
    M: document.getElementById('channelM'),
    Y: document.getElementById('channelY')
};
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
let currentFile = null;

// Initialize FFmpeg
const ffmpeg = FFmpeg.createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
        const percent = (ratio * 100).toFixed(0);
        progressBar.style.width = `${percent}%`;
        statusMessage.textContent = `Processing: ${percent}%`;
    },
    corePath: '/ffmpeg/ffmpeg-core.js'
});

// Handle file selection
async function handleFileSelect(file) {
    if (file) {
        try {
            console.log('Processing file:', file.name, file.type, file.size);
            currentFile = file;
            const url = URL.createObjectURL(file);
            videoPlayer.src = url;
            videoPlayer.load();

            // Enable channel buttons
            Object.values(channelButtons).forEach(button => {
                button.disabled = false;
            });

            // Hide processed video if it was previously shown
            processedVideo.parentElement.classList.remove('visible');
            processedVideo.src = '';
            
            statusMessage.textContent = 'Video loaded successfully! Select a channel to extract.';
            statusMessage.className = 'status-message success';
        } catch (error) {
            console.error('Error loading video:', error);
            statusMessage.textContent = error.message;
            statusMessage.className = 'status-message error';
            Object.values(channelButtons).forEach(button => {
                button.disabled = true;
            });
        }
    }
}

// Process video function
async function processVideo(channel) {
    if (!currentFile) return;

    const button = channelButtons[channel];
    try {
        button.classList.add('processing');
        progressBar.style.width = '0%';
        statusMessage.textContent = 'Processing video...';
        statusMessage.className = 'status-message';

        // Write the file to FFmpeg's virtual filesystem
        ffmpeg.FS('writeFile', 'input.mp4', await FFmpeg.fetchFile(currentFile));

        // Prepare FFmpeg command based on selected channel
        let filters;
        switch (channel) {
            case 'C':
                // Extract cyan channel (inverse of red)
                filters = 'colorchannelmixer=rr=0:gg=1:bb=1';
                break;
            case 'M':
                // Extract magenta channel (inverse of green)
                filters = 'colorchannelmixer=rr=1:gg=0:bb=1';
                break;
            case 'Y':
                // Extract yellow channel (inverse of blue)
                filters = 'colorchannelmixer=rr=1:gg=1:bb=0';
                break;
        }

        // Run FFmpeg command
        await ffmpeg.run(
            '-i', 'input.mp4',
            '-vf', filters,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '22',
            'output.mp4'
        );

        // Read the result
        const data = ffmpeg.FS('readFile', 'output.mp4');
        
        // Create a URL for the processed video
        const processedUrl = URL.createObjectURL(
            new Blob([data.buffer], { type: 'video/mp4' })
        );

        // Display the processed video
        processedVideo.src = processedUrl;
        processedVideo.parentElement.classList.add('visible');
        processedVideo.load();

        // Clean up
        ffmpeg.FS('unlink', 'input.mp4');
        ffmpeg.FS('unlink', 'output.mp4');

        statusMessage.textContent = `${channel === 'C' ? 'Cyan' : channel === 'M' ? 'Magenta' : 'Yellow'} channel extracted successfully!`;
        statusMessage.className = 'status-message success';
    } catch (error) {
        console.error('Error processing video:', error);
        statusMessage.textContent = 'Error processing video: ' + error.message;
        statusMessage.className = 'status-message error';
    } finally {
        button.classList.remove('processing');
    }
}

// Initialize application
async function init() {
    try {
        await ffmpeg.load();
        console.log('FFmpeg loaded successfully');
        statusMessage.textContent = 'Video processor ready!';
        statusMessage.className = 'status-message success';
    } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        statusMessage.textContent = 'Failed to load video processor';
        statusMessage.className = 'status-message error';
        return;
    }

    // Add event listeners
    videoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) handleFileSelect(file);
    });

    // Add click handlers for channel buttons
    Object.entries(channelButtons).forEach(([channel, button]) => {
        button.addEventListener('click', () => processVideo(channel));
    });

    // Add drag and drop support
    const dropZone = document.querySelector('.upload-section');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
        }
    });
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
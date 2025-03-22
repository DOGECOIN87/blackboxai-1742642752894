# CMYK Video Processor

A web-based application that processes videos using FFmpeg.wasm to handle CMYK and YCCK color spaces. This application provides a modern, user-friendly interface for video processing with real-time progress tracking and drag-and-drop support.

## Features

- Process videos with CMYK and YCCK color space conversions
- Modern, responsive UI with drag-and-drop support
- Real-time processing progress indication
- Preview processed videos directly in the browser
- Built with FFmpeg.wasm for client-side video processing
- Cross-browser compatible

## Technical Stack

- FFmpeg.wasm for video processing
- Modern JavaScript (ES6+)
- Tailwind-inspired CSS for styling
- Font Awesome icons
- Google Fonts (Inter)

## How to Use

1. Start the application:
   ```bash
   python3 -c "
   from http.server import HTTPServer, SimpleHTTPRequestHandler
   class CORSRequestHandler(SimpleHTTPRequestHandler):
       def end_headers(self):
           self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
           self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
           SimpleHTTPRequestHandler.end_headers(self)
   server = HTTPServer(('localhost', 8000), CORSRequestHandler)
   print('Server running on port 8000...')
   server.serve_forever()
   "
   ```

2. Open your browser and navigate to `http://localhost:8000/cmyk-video-processor/`

3. Upload a video by either:
   - Clicking the upload area and selecting a video file
   - Dragging and dropping a video file onto the upload area

4. Once the video is loaded, it will be displayed in the preview area

5. Click the "Process Video" button to start the CMYK/YCCK color space conversion

6. Monitor the progress bar for processing status

7. When processing is complete, the converted video will automatically replace the original in the preview area

## Features in Detail

### Video Processing
- Converts video to YUVA444P format
- Applies BT.709 color space parameters
- Maintains video quality while processing
- Real-time progress tracking

### User Interface
- Clean, modern design
- Responsive layout that works on all screen sizes
- Interactive upload area with drag-and-drop support
- Progress bar with percentage indication
- Status messages for user feedback
- Disabled states for proper UX flow

### Error Handling
- Comprehensive error messages
- Graceful handling of unsupported file types
- Recovery from processing failures
- Clear user feedback for all operations

## Technical Implementation

The application uses several key technologies:

### FFmpeg.wasm Configuration
```javascript
const ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
        updateProgress(ratio * 100);
    }
});
```

### Video Processing Pipeline
```javascript
await ffmpeg.run(
    '-i', 'input.mp4',
    '-vf', 'format=yuva444p',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    'output.mp4'
);
```

### Resource Management
- Automatic cleanup of temporary files
- Proper handling of memory resources
- Blob URL management for video previews

## Browser Compatibility

The application requires a modern browser with support for:
- WebAssembly
- ES6+ JavaScript
- Modern CSS features
- File API
- Drag and Drop API

## Known Limitations

- Processing large videos may take significant time due to client-side processing
- Browser memory limitations may affect very large files
- Some older browsers may not support all features

## Future Enhancements

Potential improvements that could be added:
- Additional color space conversion options
- Batch processing capabilities
- Video format conversion options
- Save processing presets
- Processing history
- Download processed videos in different formats

## Troubleshooting

If you encounter issues:

1. Ensure your browser is up to date
2. Check that JavaScript is enabled
3. Verify the video file format is supported
4. Clear browser cache if experiencing loading issues
5. Check browser console for detailed error messages
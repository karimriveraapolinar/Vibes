# Vibes - Tetris Game Deployment Guide

## Overview

Vibes is a modern Tetris game implementation with advanced features including particle effects, screen shake, wave motion, and customizable piece styles. This document provides detailed instructions for deploying the game.

## Prerequisites

- A modern web browser with JavaScript enabled
- A web server (local or hosted)
- Basic understanding of web development concepts

## Usage Guide

### How to Play

1. **Starting the Game**

   - Open the game in your web browser
   - The game will start automatically with background music
   - Press 'R' to restart if needed

2. **Controls**

   - **Arrow Left/Right**: Move piece horizontally
   - **Arrow Up**: Rotate piece
   - **Arrow Down**: Soft drop (accelerate piece downward)
   - **Spacebar**: Hard drop (instantly drop piece)
   - **C**: Hold piece (store current piece for later use)
   - **R**: Restart game (when game is over)

3. **Game Features**

   - **Hold Piece**: Store the current piece and use it later
   - **Ghost Piece**: See where the current piece will land
   - **Next Piece Preview**: View the upcoming piece
   - **Particle Effects**: Visual feedback for line clears
   - **Screen Shake**: Enhanced visual feedback for actions
   - **Wave Motion**: Dynamic background animation

4. **Scoring System**

   - Clear lines to earn points
   - Special bonuses for:
     - T-Spins
     - Tetris (4 lines at once)
     - Back-to-back difficult clears
     - Combos
     - Stack bonuses

5. **Difficulty Progression**

   - Game speed increases with level
   - New level every 10 lines cleared
   - Higher levels yield more points

6. **Customization**
   - Different piece styles available:
     - Classic
     - Modern
     - Neon
   - Customizable piece colors
   - Adjustable visual effects

### Tips for Success

1. Use the ghost piece to plan your moves
2. Save pieces with the hold feature for difficult situations
3. Practice T-spins for higher scores
4. Build for Tetris opportunities
5. Use hard drop (spacebar) for faster piece placement
6. Watch for combo opportunities

### Accessibility

- The game supports keyboard controls
- Visual effects can be reduced for better performance
- Background music can be muted through browser controls

## Project Structure

```
Vibes/
├── index.html          # Main HTML file
├── game.js            # Game logic and implementation
├── styles.css         # Styling for the game
├── citylights.mp3     # Background music
└── DEPLOYMENT.md      # This deployment guide
```

## Deployment Steps

### 1. Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Vibes.git
   cd Vibes
   ```

2. Set up a local web server:

   - Using Python:
     ```bash
     # Python 3
     python -m http.server 8000
     # Python 2
     python -m SimpleHTTPServer 8000
     ```
   - Using Node.js:
     ```bash
     # Install http-server globally
     npm install -g http-server
     # Run the server
     http-server
     ```

3. Access the game:
   - Open your web browser
   - Navigate to `http://localhost:8000` (or the port specified by your server)

### 2. Production Deployment

#### Option A: Static Hosting (Recommended)

1. Choose a static hosting service:

   - GitHub Pages
   - Netlify
   - Vercel
   - Firebase Hosting
   - AWS S3 + CloudFront

2. Deploy using your chosen platform:
   - Follow the platform's deployment guidelines
   - Ensure all files are included in the deployment
   - Configure any necessary build settings

#### Option B: Traditional Web Server

1. Upload files to your web server:

   - Use FTP or SSH to transfer files
   - Ensure proper file permissions are set
   - Configure your web server (Apache/Nginx) to serve static files

2. Configure server settings:
   - Enable CORS if needed
   - Set up proper MIME types
   - Configure caching headers

## Configuration

### Audio Settings

The game uses background music (`citylights.mp3`). Ensure:

- The audio file is properly placed in the project directory
- The file path in `game.js` matches your deployment structure
- Audio playback is enabled in the browser

### Performance Optimization

1. Enable browser caching for static assets
2. Minify JavaScript and CSS files (optional)
3. Optimize the audio file size

## Browser Compatibility

The game is compatible with:

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Troubleshooting

### Common Issues

1. Audio not playing:

   - Check browser autoplay policies
   - Verify audio file path
   - Ensure audio file is accessible

2. Game not loading:

   - Check browser console for errors
   - Verify all files are present
   - Check file permissions

3. Performance issues:
   - Reduce particle effects
   - Lower wave motion intensity
   - Disable screen shake effects

### Debug Mode

To enable debug mode:

1. Open browser developer tools (F12)
2. Look for console messages
3. Check for any error indicators

## Security Considerations

1. Use HTTPS for production deployment
2. Implement proper CORS policies
3. Sanitize user inputs
4. Keep dependencies updated

## Maintenance

1. Regular updates:

   - Check for browser compatibility
   - Update dependencies
   - Monitor performance metrics

2. Backup:
   - Keep source code backups
   - Document any custom configurations
   - Maintain deployment logs

## Support

For issues or questions:

1. Check the GitHub repository
2. Review the deployment documentation
3. Contact the development team

## Version History

- v1.0.0: Initial release
  - Basic Tetris gameplay
  - Particle effects
  - Screen shake
  - Wave motion
  - Customizable piece styles

## License

[Your License Information]

## Contact

[Your Contact Information]

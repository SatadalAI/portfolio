# Project Context: Satadal Dhara Portfolio

## Overview
This project is a personal portfolio website for Satadal Dhara, showcasing skills, projects, artwork, and blog posts. It is a static website designed with a modern, dark-themed aesthetic, featuring animations and interactive elements.

## Tech Stack
- **HTML5**: Semantic structure.
- **CSS3**: Vanilla CSS with extensive use of Flexbox, Grid, Animations, and Media Queries. No external CSS frameworks are currently used.
- **JavaScript (ES6+)**: Vanilla JS for DOM manipulation, dynamic content loading, and animations.
- **Data**: JSON files (`images.json`, `blogs.json`) act as a lightweight CMS for the gallery and blog sections.

## Project Structure
- **Root**:
  - `index.html`: The main landing page containing the Hero, About, Journey, and Analytics sections.
  - `projects.html`, `blog.html`, `gallery.html`, `contact.html`: Separate pages for specific sections (though some navigation logic suggests a SPA-like feel, these exist as standalone files).
  - `style.css`: The central stylesheet containing all visual styles, animations, and responsive rules.
  - `script.js`: The main JavaScript file handling logic for the gallery, blog, modals, and scroll animations.
  - `images.json`: Array of image filenames/paths for the gallery.
  - `blogs.json`: Array of blog post objects (title, excerpt, url).
- **Directories**:
  - `images/`: Stores image assets.
  - `blog/`: Contains individual blog post HTML files (e.g., `blog/post1.html`).

## Key Features
1.  **Dynamic Content Loading**:
    - **Gallery**: `updateGalleryFromApi()` fetches `images.json` and renders the gallery grid dynamically.
    - **Blog**: `populateBlogGrid()` fetches `blogs.json` and creates blog cards dynamically.
2.  **Animations**:
    - CSS animations for background movement (`bg-animation`), floating particles, and element fade-ins.
    - JavaScript-driven number counters for the "Impact" section.
    - Smooth scrolling for navigation.
3.  **Responsive Design**:
    - Mobile-friendly navigation and layout adjustments via CSS media queries.
4.  **Interactive Elements**:
    - Image modal for viewing gallery items in full size.
    - Hover effects on cards and buttons.

## Development & Usage
- **Running Locally**: Since it is a static site, it can be served using any static file server (e.g., VS Code Live Server, `python -m http.server`, `npx serve`).
- **Deployment**: The presence of `CNAME` suggests it is likely deployed on GitHub Pages or a similar static hosting service.

## Notes
- The `script.js` mentions a "SITE-WIDE DATA SOURCE (now backed by simple server API)" but the implementation fetches local JSON files, implying a serverless/static approach.
- `script_original.js` appears to be a backup or older version of the logic.

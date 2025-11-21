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
  - `projects.html`, `blog.html`, `gallery.html`, `contact.html`: Separate pages for specific sections.
  - `gemini.md`: Project documentation and context.
- **Assets (`assets/`)**:
  - `css/style.css`: Central stylesheet with Engineer/Artist themes.
  - `js/script.js`: Main logic for gallery, blog, modals, tilt effects, and theme toggling.
  - `img/`: Stores gallery images and assets.
  - `data/`: JSON data files (`images.json`, `blogs.json`).
  - `satadal.jpg`: Profile picture.
- **Directories**:
  - `blog/`: Contains individual blog post HTML files.

## Key Features
1.  **Dual Persona Theme**:
    - **Engineer Mode (Default)**: Professional, clean, dark theme with "Projects" navigation.
    - **Artist Mode**: Vibrant, expressive, warm theme with "Gallery" navigation replacing Projects.
    - **Theme Toggle**: Interactive switch in the Island Navigation.
2.  **Island Navigation**:
    - Floating, centralized navigation bar.
    - Responsive design with active state highlighting.
    - Dynamic link ordering: Home -> Projects/Gallery -> Blog -> Contact.
3.  **Dynamic Content Loading**:
    - **Gallery**: Fetches `assets/data/images.json` to render artwork.
    - **Blog**: Fetches `assets/data/blogs.json` to render posts.
4.  **Animations & Effects**:
    - **3D Tilt**: Interactive tilt effect on project and blog cards.
    - **Particles**: Background particle animation.
    - **Scroll Animations**: Smooth scrolling and fade-in effects.
    - **Analytics**: Animated number counters.
5.  **Responsive Design**:
    - Mobile-friendly layout with adjusted navigation and spacing.

## Development & Usage
- **Running Locally**: Serve using any static file server (e.g., `python -m http.server`, `npx serve`).
- **Deployment**: Static hosting (e.g., GitHub Pages).

## Notes
- The project uses a clean `assets/` directory structure for better organization.
- Navigation order changes based on the selected theme (Engineer vs Artist).

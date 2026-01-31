import os
import json

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'gallery')
DATA_FILE = os.path.join(BASE_DIR, 'assets', 'data', 'images.json')

# Album folder mapping
ALBUMS = {
    'digital-art': 'Digital Creations',
    'concept-sketches': 'Concept Sketches',
    '3d-renders': '3D Renders',
    'photography': 'Photography'
}

VALID_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}

def scan_gallery():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    # Load existing data to preserve descriptions and order if needed
    with open(DATA_FILE, 'r') as f:
        try:
            current_data = json.load(f)
        except json.JSONDecodeError:
            current_data = []

    # Map existing data by ID for quick lookup of non-file properties
    existing_map = {item['id']: item for item in current_data}
    
    new_data = []

    for folder_name, nice_name in ALBUMS.items():
        folder_path = os.path.join(GALLERY_DIR, folder_name)
        
        # Create folder if it doesn't exist
        if not os.path.exists(folder_path):
            try:
                os.makedirs(folder_path)
                print(f"Created missing folder: {folder_name}")
            except OSError as e:
                print(f"Error creating {folder_name}: {e}")
                continue

        # Get existing properties or defaults
        existing = existing_map.get(folder_name, {})
        album_entry = {
            'id': folder_name,
            'title': existing.get('title', nice_name),
            'description': existing.get('description', f'Collection of {nice_name.lower()}.'),
            'cover': existing.get('cover', 'assets/img/thumbnails/album_placeholder.png'),
            'images': []
        }

        # Scan for images
        images = []
        try:
            for file in os.listdir(folder_path):
                if os.path.splitext(file)[1].lower() in VALID_EXTENSIONS:
                    # Creating web-accessible path
                    web_path = f"assets/img/gallery/{folder_name}/{file}"
                    images.append(web_path)
            
            # Sort images to ensure consistent order
            images.sort()
            album_entry['images'] = images

            # Auto-set cover to first image if placeholder is currently used and we have images
            if images and 'album_placeholder' in album_entry['cover']:
                album_entry['cover'] = images[0]

        except Exception as e:
            print(f"Error scanning {folder_name}: {e}")

        new_data.append(album_entry)

    # Write back to JSON
    with open(DATA_FILE, 'w') as f:
        json.dump(new_data, f, indent=2)
    
    print(f"✅ Successfully updated {DATA_FILE}")
    print(f"   Scanned {len(new_data)} albums.")

if __name__ == "__main__":
    scan_gallery()

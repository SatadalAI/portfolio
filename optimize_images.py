"""
Image Optimization Script
Converts PNG/JPG images to WebP format for better performance.
Run this script from the portfolio root directory.

Requirements:
    pip install Pillow

Usage:
    python optimize_images.py
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    exit(1)

# Configuration
SOURCE_DIR = Path("assets/img")
QUALITY = 85  # WebP quality (0-100)
DELETE_ORIGINALS = False  # Set to True to delete original files after conversion

VALID_EXTENSIONS = {'.png', '.jpg', '.jpeg'}

def convert_to_webp(source_path: Path) -> bool:
    """Convert an image to WebP format."""
    try:
        webp_path = source_path.with_suffix('.webp')
        
        # Skip if WebP already exists and is newer
        if webp_path.exists() and webp_path.stat().st_mtime > source_path.stat().st_mtime:
            print(f"  Skipped (already exists): {webp_path.name}")
            return False
        
        with Image.open(source_path) as img:
            # Convert RGBA to RGB if necessary (WebP supports both, but RGB is smaller)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')
            
            img.save(webp_path, 'WEBP', quality=QUALITY)
        
        original_size = source_path.stat().st_size
        webp_size = webp_path.stat().st_size
        savings = ((original_size - webp_size) / original_size) * 100
        
        print(f"  Converted: {source_path.name} -> {webp_path.name} ({savings:.1f}% smaller)")
        
        if DELETE_ORIGINALS:
            source_path.unlink()
            print(f"  Deleted original: {source_path.name}")
        
        return True
        
    except Exception as e:
        print(f"  Error converting {source_path.name}: {e}")
        return False

def main():
    if not SOURCE_DIR.exists():
        print(f"Source directory not found: {SOURCE_DIR}")
        return
    
    print(f"Scanning {SOURCE_DIR} for images...")
    print("-" * 50)
    
    converted = 0
    skipped = 0
    
    for file_path in SOURCE_DIR.rglob("*"):
        if file_path.suffix.lower() in VALID_EXTENSIONS:
            if convert_to_webp(file_path):
                converted += 1
            else:
                skipped += 1
    
    print("-" * 50)
    print(f"Done! Converted: {converted}, Skipped: {skipped}")
    print("\nNote: Update your HTML/JSON files to reference .webp files instead of .png/.jpg")

if __name__ == "__main__":
    main()

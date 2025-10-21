const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');
const outputPath = path.join(__dirname, '../blogs.json');
const allowedExts = ['.html', '.htm'];

function stripTags(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, ' ').trim();
}

function firstMatch(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

fs.readdir(blogDir, (err, files) => {
  if (err) {
    console.error('Failed to read blog directory:', err.message);
    process.exit(1);
  }

  const blogFiles = files.filter(f => allowedExts.includes(path.extname(f).toLowerCase())).sort();
  const posts = [];

  blogFiles.forEach(file => {
    try {
      const full = fs.readFileSync(path.join(blogDir, file), 'utf8');

      // Try to extract <h1 class="page-title"> or element with class page-title
      let title = firstMatch(full, /<h[1-6][^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i)
               || firstMatch(full, /class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)
               || firstMatch(full, /<title[^>]*>([\s\S]*?)<\/title>/i)
               || file;

      title = stripTags(title);

      // Try to find first <p> inside .blog-article section, then any first <p>
      let excerpt = firstMatch(full, /<section[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
                 || firstMatch(full, /class=["'][^"']*blog-article[^"']*["'][\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
                 || firstMatch(full, /<p[^>]*>([\s\S]*?)<\/p>/i)
                 || '';

      excerpt = stripTags(excerpt);
      if (excerpt.length > 300) excerpt = excerpt.substring(0, 297).trim() + '…';

      posts.push({
        url: path.posix.join('blog', file),
        title,
        excerpt
      });
    } catch (e) {
      console.error('Failed to process blog file', file, e.message);
    }
  });

  try {
    fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf8');
    console.log(`Generated blogs.json with ${posts.length} posts`);
  } catch (e) {
    console.error('Failed to write blogs.json:', e.message);
    process.exit(1);
  }
});

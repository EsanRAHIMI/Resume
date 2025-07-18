const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

class CodeViewerService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../../'); // RESUME folder
    this.scanDirectories = ['backend', 'frontend'];
    this.includedExtensions = ['.js', '.jsx', '.json', '.html', '.css', '.md', '.txt', '.env'];
    this.excludedItems = ['node_modules', '.git', 'uploads', 'package-lock.json', '.DS_Store', 'README.md', 'LICENSE' ,'code.js'];
  }

  shouldExcludeItem(itemName) {
    return this.excludedItems.some(excluded => itemName.includes(excluded));
  }

  shouldIncludeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.includedExtensions.includes(ext);
  }

  getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      files.forEach(file => {
        if (this.shouldExcludeItem(file.name)) return;

        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          this.getAllFiles(fullPath, arrayOfFiles);
        } else if (this.shouldIncludeFile(fullPath)) {
          arrayOfFiles.push(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Cannot read directory ${dirPath}`);
    }

    return arrayOfFiles;
  }

  getDirectoryStructure(dirPath) {
    if (!fs.existsSync(dirPath)) return [];

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      return files
        .filter(file => !this.shouldExcludeItem(file.name))
        .map(file => {
          const fullPath = path.join(dirPath, file.name);
          if (file.isDirectory()) {
            const children = this.getDirectoryStructure(fullPath);
            return { name: file.name, type: 'directory', children };
          }
          return { name: file.name, type: 'file' };
        });
    } catch (error) {
      return [];
    }
  }

  generateTree(nodes, prefix = '') {
    return nodes
      .map((node, index, array) => {
        const isLast = index === array.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const subPrefix = prefix + (isLast ? '    ' : '│   ');

        if (node.type === 'directory') {
          return `${prefix}${connector}${node.name}/\n${this.generateTree(node.children || [], subPrefix)}`;
        }
        return `${prefix}${connector}${node.name}`;
      })
      .join('\n');
  }

  getCodeData() {
    const allFiles = [];
    
    this.scanDirectories.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.getAllFiles(fullPath, allFiles);
      }
    });

    const fileContents = allFiles.map(file => {
      try {
        const relativePath = path.relative(this.projectRoot, file);
        const content = fs.readFileSync(file, 'utf-8');
        return { file: relativePath, content };
      } catch (error) {
        return { file: path.relative(this.projectRoot, file), content: 'Error reading file' };
      }
    });

    const directoryTree = this.scanDirectories.map(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        const structure = this.getDirectoryStructure(fullPath);
        return `${dir}/\n${this.generateTree(structure)}`;
      }
      return `${dir}/\n  (Directory not found)`;
    }).join('\n\n');

    return { files: fileContents, directoryTree };
  }
}

const codeViewerService = new CodeViewerService();

router.get('/', (req, res) => {
  const { directory, search } = req.query;
  const data = codeViewerService.getCodeData();

  if (data.error) {
    return res.status(500).json(data);
  }

  // Get available directories
  const availableDirectories = ['backend', 'frontend'];
  
  // Filter by directory
  let filteredFiles = data.files;
  if (directory) {
    filteredFiles = data.files.filter(file => file.file.startsWith(directory + '/') || file.file.startsWith(directory + '\\'));
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredFiles = filteredFiles.filter(file => 
      file.file.toLowerCase().includes(searchLower) || 
      file.content.toLowerCase().includes(searchLower)
    );
  }

  // Generate directory tree
  let displayTree = '';
  if (directory) {
    // Show only selected directory structure
    const dirFiles = filteredFiles.map(file => {
      const relativePath = file.file.replace(directory + '/', '').replace(directory + '\\', '');
      return relativePath.split(/[\/\\]/);
    });

    function buildTree(paths, prefix = '') {
      const levels = {};
      paths.forEach(parts => {
        const [first, ...rest] = parts;
        if (first) {
          if (!levels[first]) levels[first] = [];
          if (rest.length) levels[first].push(rest);
        }
      });

      return Object.entries(levels)
        .map(([name, subPaths]) => {
          const subTree = subPaths.length ? buildTree(subPaths, prefix + '│   ') : '';
          return `${prefix}├── ${name}\n${subTree}`;
        })
        .join('');
    }

    displayTree = `${directory}/\n${buildTree(dirFiles)}`;
  } else {
    displayTree = data.directoryTree;
  }

  // Generate file display
  const fileDisplay = filteredFiles.map(file => `
    <div class="file-container">
      <h2 class="file-title"># ${file.file} 
        <a href="/api/code/download?file=${encodeURIComponent(file.file)}" class="download-link">📥</a>
      </h2>
      <pre class="file-content"><code>${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Code Viewer</title>
        <style>
          body { 
            font-family: 'Consolas', monospace; 
            background: #1a1a1a; 
            color: #e0e0e0; 
            padding: 20px; 
            margin: 0; 
          }
          .container { max-width: 1200px; margin: 0 auto; }
          h1 { color: #4fc3f7; margin-bottom: 20px; }
          .controls { 
            display: flex; 
            align-items: center; 
            gap: 15px; 
            margin-bottom: 30px; 
            background: #2d2d2d; 
            padding: 15px; 
            border-radius: 8px; 
            flex-wrap: wrap;
          }
          select, input, button { 
            background: #3d3d3d; 
            color: #e0e0e0; 
            padding: 8px 12px; 
            border: 1px solid #555; 
            border-radius: 4px; 
            font-size: 14px; 
          }
          button { cursor: pointer; }
          button:hover { background: #4d4d4d; }
          .status { 
            background: #1e1e1e; 
            padding: 5px 10px; 
            border-radius: 4px; 
            font-size: 12px; 
            color: #81c784; 
          }
          .directory-tree { 
            background: #2d2d2d; 
            padding: 15px; 
            border-radius: 8px; 
            color: #81c784; 
            overflow-x: auto; 
          }
          .file-container { 
            margin-bottom: 20px; 
            border: 1px solid #555; 
            border-radius: 8px; 
            overflow: hidden; 
          }
          .file-title { 
            color: #4fc3f7; 
            background: #2d2d2d; 
            padding: 10px 15px; 
            margin: 0; 
            font-size: 16px; 
          }
          .download-link { 
            color: #ffb74d; 
            text-decoration: none; 
            margin-left: 10px; 
          }
          .file-content { 
            background: #1e1e1e; 
            padding: 15px; 
            margin: 0; 
            overflow-x: auto; 
            font-size: 13px; 
          }
          .no-files { 
            text-align: center; 
            padding: 40px; 
            color: #f44336; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📁 Code Viewer</h1>
          
          <div class="controls">
            <label>Directory:</label>
            <select id="directory" onchange="updateFilters()">
              <option value="">All Directories</option>
              ${availableDirectories.map(dir => 
                `<option value="${dir}" ${dir === directory ? 'selected' : ''}>${dir}</option>`
              ).join('')}
            </select>
            
            <label>Search:</label>
            <input type="text" id="search" value="${search || ''}" placeholder="Search files..." onkeyup="handleSearch(event)">
            <button onclick="updateFilters()">🔍 Search</button>
            <button onclick="clearFilters()">🔄 Clear</button>
            
            <div class="status">
              📁 ${directory || 'All'} | 🔍 ${search || 'No search'} | 📄 ${filteredFiles.length} files
            </div>
          </div>

          <h2>📂 Project Structure</h2>
          <pre class="directory-tree">${displayTree}</pre>

          <h2>📄 Files (${filteredFiles.length})</h2>
          ${fileDisplay || '<div class="no-files">No files found</div>'}
        </div>

        <script>
          function updateFilters() {
            const directory = document.getElementById('directory').value;
            const search = document.getElementById('search').value;
            
            let url = '/api/code';
            const params = new URLSearchParams();
            
            if (directory) params.append('directory', directory);
            if (search) params.append('search', search);
            
            if (params.toString()) url += '?' + params.toString();
            
            window.location.href = url;
          }
          
          function clearFilters() {
            window.location.href = '/api/code';
          }
          
          function handleSearch(event) {
            if (event.key === 'Enter') {
              updateFilters();
            }
          }
        </script>
      </body>
    </html>
  `;

  res.send(html);
});

router.get('/download', (req, res) => {
  const { file: filePath } = req.query;
  
  if (!filePath) {
    return res.status(400).send('File path required');
  }

  const absolutePath = path.resolve(codeViewerService.projectRoot, filePath);
  
  if (!absolutePath.startsWith(codeViewerService.projectRoot)) {
    return res.status(403).send('Access denied');
  }

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).send('File not found');
  }

  res.download(absolutePath);
});

module.exports = router;
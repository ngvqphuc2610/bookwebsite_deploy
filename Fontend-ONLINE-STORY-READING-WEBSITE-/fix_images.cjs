const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const dir = 'c:/ONLINE-STORY-READING-WEBSITE/frontend/src/components';
const files = walk(dir);

files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        let content = fs.readFileSync(file, 'utf8');

        // Match <img ... fill ... />
        // This is complex for a regex, so let's do a few passes.

        // 1. If it has 'fill', add absolute classes
        let lines = content.split('\n');
        let newLines = [];
        let inImg = false;
        let imgBuffer = "";

        // A simpler way: use global replace with a function
        content = content.replace(/<img([\s\S]*?)\/>/g, (match, p1) => {
            if (p1.includes('fill')) {
                // Remove fill, priority, sizes, loading attributes
                let cleaned = p1.replace(/\sfill/g, '')
                    .replace(/\spriority/g, '')
                    .replace(/\ssizes="[^"]*"/g, '')
                    .replace(/\ssizes=\{[^}]*\}/g, '')
                    .replace(/\sloading="[^"]*"/g, '');

                // Add classes to className
                if (cleaned.includes('className="')) {
                    cleaned = cleaned.replace(/className="([^"]*)"/, 'className="absolute inset-0 w-full h-full $1"');
                } else if (cleaned.includes('className={')) {
                    // Skip complex ones for now or wrapped in cn()
                    // If it uses cn(), it might be trickier, but let's try a simple append
                    cleaned = cleaned.replace(/className=\{cn\(([^)]*)\)\}/, 'className={cn("absolute inset-0 w-full h-full", $1)}');
                } else {
                    cleaned += ' className="absolute inset-0 w-full h-full object-cover"';
                }
                return `<img${cleaned} />`;
            }
            return match;
        });

        fs.writeFileSync(file, content);
        console.log(`Fixed images in ${file}`);
    }
});

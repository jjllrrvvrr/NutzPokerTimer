const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building Nutz Poker Timer...\n');

// Créer le dossier dist s'il n'existe pas
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('✅ Dossier dist/ créé');
}

try {
    // Minifier JavaScript
    console.log('📦 Minification du JavaScript...');
    execSync('npx terser script.js -o dist/script.min.js --compress --mangle --comments false', { stdio: 'inherit' });
    console.log('✅ script.min.js créé');

    // Minifier CSS
    console.log('📦 Minification du CSS...');
    execSync('npx csso style.css -o dist/style.min.css', { stdio: 'inherit' });
    console.log('✅ style.min.css créé');

    // Copier et adapter index.html
    console.log('📦 Traitement du HTML...');
    let html = fs.readFileSync('index.html', 'utf8');

    // Remplacer les références aux fichiers non-minifiés par les versions minifiées
    html = html.replace('href="style.css"', 'href="style.min.css"');
    html = html.replace('src="script.js"', 'src="script.min.js"');

    // Minifier le HTML
    fs.writeFileSync(path.join(distDir, 'index.temp.html'), html);
    execSync('npx html-minifier-terser --collapse-whitespace --remove-comments --minify-css true --minify-js true -o dist/index.html dist/index.temp.html', { stdio: 'inherit' });
    fs.unlinkSync(path.join(distDir, 'index.temp.html'));
    console.log('✅ index.html créé');

    // Copier les autres fichiers nécessaires
    console.log('📦 Copie des fichiers supplémentaires...');
    const filesToCopy = ['manifest.json', 'sw.js', 'screen.jpg'];
    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(distDir, file));
            console.log(`✅ ${file} copié`);
        }
    });

    // Afficher les tailles de fichiers
    console.log('\n📊 Statistiques de compression:');

    const originalJS = fs.statSync('script.js').size;
    const minifiedJS = fs.statSync('dist/script.min.js').size;
    console.log(`   JS:   ${(originalJS / 1024).toFixed(2)} KB → ${(minifiedJS / 1024).toFixed(2)} KB (-${((1 - minifiedJS / originalJS) * 100).toFixed(1)}%)`);

    const originalCSS = fs.statSync('style.css').size;
    const minifiedCSS = fs.statSync('dist/style.min.css').size;
    console.log(`   CSS:  ${(originalCSS / 1024).toFixed(2)} KB → ${(minifiedCSS / 1024).toFixed(2)} KB (-${((1 - minifiedCSS / originalCSS) * 100).toFixed(1)}%)`);

    const originalHTML = fs.statSync('index.html').size;
    const minifiedHTML = fs.statSync('dist/index.html').size;
    console.log(`   HTML: ${(originalHTML / 1024).toFixed(2)} KB → ${(minifiedHTML / 1024).toFixed(2)} KB (-${((1 - minifiedHTML / originalHTML) * 100).toFixed(1)}%)`);

    console.log('\n✅ Build terminé avec succès!\n');
    console.log('📁 Les fichiers optimisés sont dans le dossier dist/');

} catch (error) {
    console.error('❌ Erreur lors du build:', error.message);
    process.exit(1);
}

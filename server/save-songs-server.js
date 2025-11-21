// Servidor Node.js para guardar songs.js y proxy de APIs de letras
// Ejecutar con: node save-songs-server.js

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const conjugationService = require('./conjugation-service');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Configurar CORS para todas las respuestas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            message: 'Servidor activo - Guardado y Proxy de letras' 
        }));
        return;
    }

    // Proxy para buscar letras (evita CORS)
    if (req.method === 'GET' && req.url.startsWith('/api/lyrics')) {
        handleLyricsRequest(req, res);
        return;
    }

    // Proxy para conjugación de verbos (evita CORS)
    if (req.method === 'GET' && req.url.startsWith('/api/conjugate')) {
        handleConjugateRequest(req, res);
        return;
    }

    if (req.method === 'POST' && req.url === '/save-songs') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { content } = JSON.parse(body);
                
                // Guardar en data/songs.js
                const filePath = path.join(__dirname, '../data/songs.js');
                fs.writeFileSync(filePath, content, 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Archivo songs.js guardado exitosamente' 
                }));

                console.log('✅ data/songs.js actualizado correctamente');
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: error.message 
                }));
                console.error('❌ Error al guardar:', error);
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Manejar requests de letras a través del proxy
function handleLyricsRequest(req, res) {
    const urlParams = new URL(req.url, `http://localhost:${PORT}`);
    const artist = urlParams.searchParams.get('artist');
    const title = urlParams.searchParams.get('title');

    if (!artist || !title) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Faltan parámetros: artist y title' }));
        return;
    }

    console.log(`🔍 Buscando: ${artist} - ${title}`);

    // Intentar múltiples APIs
    fetchLyricsFromAPIs(artist, title)
        .then(lyrics => {
            if (lyrics) {
                console.log(`✅ Letra encontrada para: ${artist} - ${title}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ lyrics, source: 'proxy' }));
            } else {
                console.log(`❌ No se encontró letra para: ${artist} - ${title}`);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Letra no encontrada' }));
            }
        })
        .catch(error => {
            console.error('Error al buscar letra:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
}

// Buscar letras en múltiples APIs (SIN CORS desde servidor)
async function fetchLyricsFromAPIs(artist, title) {
    // Lista de APIs públicas a intentar en orden
    const apis = [
        { name: 'Lyrics.ovh', fn: () => fetchFromLyricsOvh(artist, title) },
        { name: 'ChartLyrics', fn: () => fetchFromChartLyrics(artist, title) }
    ];

    for (const api of apis) {
        try {
            console.log(`   Intentando ${api.name}...`);
            const lyrics = await api.fn();
            if (lyrics && lyrics.trim().length > 50) {
                console.log(`   ✅ ${api.name} encontró la letra`);
                return lyrics;
            }
        } catch (error) {
            console.log(`   ⚠️ ${api.name} falló:`, error.message);
        }
    }

    return null;
}

// Fetch con timeout
function fetchWithTimeout(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error('Error al parsear JSON'));
                    }
                } else {
                    reject(new Error(`Status: ${response.statusCode}`));
                }
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.setTimeout(timeout, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// API: lyrics.ovh
function fetchFromLyricsOvh(artist, title) {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    return fetchWithTimeout(url)
        .then(data => data.lyrics || null)
        .catch(() => null);
}

// API: ChartLyrics (sin restricciones CORS desde servidor)
function fetchFromChartLyrics(artist, title) {
    // ChartLyrics usa un formato XML/SOAP pero tiene un endpoint simple
    const url = `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(title)}`;
    
    return new Promise((resolve, reject) => {
        const urlParsed = new URL(url);
        const client = urlParsed.protocol === 'https:' ? https : http;
        
        const request = client.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    try {
                        // Extraer letra del XML (entre <Lyric> y </Lyric>)
                        const lyricMatch = data.match(/<Lyric>([\s\S]*?)<\/Lyric>/);
                        if (lyricMatch && lyricMatch[1] && lyricMatch[1].trim() !== '') {
                            resolve(lyricMatch[1].trim());
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        reject(new Error('Error al parsear XML'));
                    }
                } else {
                    reject(new Error(`Status: ${response.statusCode}`));
                }
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Manejar requests de conjugación de verbos a través del proxy
async function handleConjugateRequest(req, res) {
    const urlParams = new URL(req.url, `http://localhost:${PORT}`);
    const verb = urlParams.searchParams.get('verb');

    if (!verb) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Falta parámetro: verb' }));
        return;
    }

    try {
        const conjugation = await conjugationService.getConjugation(verb);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(conjugation));
    } catch (error) {
        console.error('❌ Error al conjugar verbo:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

server.listen(PORT, () => {
    console.log(`🚀 Servidor de guardado corriendo en http://localhost:${PORT}`);
    console.log('📝 Listo para guardar cambios en data/songs.js automáticamente');
    console.log('🎵 Proxy de letras activo en /api/lyrics');
    console.log('📚 Proxy de verbos activo en /api/conjugate');
});

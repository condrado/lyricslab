// Utilidad para obtener letras de canciones automáticamente

const LyricsAPI = {
    // API de letras de canciones - Usa proxy del servidor para evitar CORS
    async fetchLyrics(artist, title) {
        console.log(`🔍 Buscando letra: ${artist} - ${title}`);
        
        // Primero intentar con nuestro proxy (evita CORS)
        try {
            const lyrics = await this.fetchFromProxy(artist, title);
            if (lyrics) {
                console.log('✅ Letra obtenida del proxy del servidor');
                return this.formatLyrics(lyrics);
            }
        } catch (error) {
            console.log('⚠️ Proxy no disponible:', error.message);
        }
        
        // Si el proxy falla, intentar APIs directas (puede tener CORS)
        try {
            const lyrics = await this.fetchFromLyricsOvh(artist, title);
            if (lyrics) {
                console.log('✅ Letra obtenida de Lyrics.ovh');
                return this.formatLyrics(lyrics);
            }
        } catch (error) {
            console.log('⚠️ Lyrics.ovh no disponible');
        }
        
        console.log('❌ No se encontró la letra en ninguna fuente');
        return null;
    },
    
    // Usar nuestro servidor como proxy (evita CORS)
    async fetchFromProxy(artist, title) {
        const url = `http://localhost:3001/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 segundos
        
        try {
            const response = await fetch(url, { 
                signal: controller.signal 
            });
            clearTimeout(timeout);
            
            if (!response.ok) {
                return null;
            }
            
            const data = await response.json();
            return data.lyrics || null;
        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                throw new Error('Timeout al buscar letra');
            }
            throw error;
        }
    },

    // Formatear letras: reducir múltiples saltos de línea a máximo 1
    formatLyrics(lyrics) {
        if (!lyrics) return null;
        
        // Reemplazar 2 o más \n consecutivos por solo 1 \n
        return lyrics.replace(/\n{2,}/g, '\n').trim();
    },

    // API de Lyrics.ovh (fallback directo, puede tener CORS)
    async fetchFromLyricsOvh(artist, title) {
        try {
            const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            
            if (!response.ok) return null;
            
            const data = await response.json();
            return data.lyrics || null;
        } catch (error) {
            return null;
        }
    },

    // Extraer YouTube ID de una URL
    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    },

    // Generar ID único para la canción
    generateSongId(artist, title) {
        return `${artist.toLowerCase()}-${title.toLowerCase()}`
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LyricsAPI;
}

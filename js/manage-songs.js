// Gestión de Canciones - manage-songs.js

let songsData = [];
let originalSongsIds = []; // IDs de canciones originales de songs.js

// Elementos del DOM
const songSelect = document.getElementById('songSelect');
const addSongBtn = document.getElementById('addSongBtn');
const addSongModal = document.getElementById('addSongModal');
const closeAddSongModalBtn = document.querySelector('.close-add-song-modal');
const songArtistInput = document.getElementById('songArtistInput');
const songTitleInput = document.getElementById('songTitleInput');
const songYoutubeInput = document.getElementById('songYoutubeInput');
const songLyricsInput = document.getElementById('songLyricsInput');
const fetchLyricsBtn = document.getElementById('fetchLyricsBtn');
const addManualLyricsBtn = document.getElementById('addManualLyricsBtn');
const cancelAddSongBtn = document.getElementById('cancelAddSongBtn');
const manualLyricsGroup = document.getElementById('manualLyricsGroup');
const fetchLyricsStatus = document.getElementById('fetchLyricsStatus');

// Inicializar cuando el DOM esté listo
function init() {
    loadSongs();
    populateSongSelector();
    renderSongs();
    setupEventListeners();
    setupMenuToggle();
}

// Cargar canciones desde songs.js y localStorage
function loadSongs() {
    // Cargar canciones predefinidas de songs.js
    if (typeof songs !== 'undefined') {
        songsData = [...songs];
        // Guardar IDs de canciones originales
        originalSongsIds = songs.map(s => s.id);
    }

    // Cargar canciones personalizadas del localStorage
    const customSongs = localStorage.getItem('customSongs');
    if (customSongs) {
        try {
            const parsed = JSON.parse(customSongs);
            // Fusionar sin duplicados (por ID)
            parsed.forEach(customSong => {
                const exists = songsData.find(s => s.id === customSong.id);
                if (!exists) {
                    songsData.push(customSong);
                }
            });
        } catch (error) {
            console.error('Error al cargar canciones personalizadas:', error);
        }
    }

    console.log(`Total de canciones cargadas: ${songsData.length}`);
    console.log(`Canciones originales: ${originalSongsIds.length}`);
}

// Renderizar lista de canciones agrupadas por artista
function renderSongs() {
    const songsGrid = document.getElementById('songsGrid');
    const emptyState = document.getElementById('emptyState');
    const totalSongs = document.getElementById('totalSongs');

    totalSongs.textContent = songsData.length;

    if (songsData.length === 0) {
        songsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    songsGrid.style.display = 'flex';
    songsGrid.style.flexDirection = 'column';
    emptyState.style.display = 'none';
    songsGrid.innerHTML = '';

    // Agrupar canciones por artista
    const groupedByArtist = {};
    songsData.forEach(song => {
        if (!groupedByArtist[song.artist]) {
            groupedByArtist[song.artist] = [];
        }
        groupedByArtist[song.artist].push(song);
    });

    // Ordenar artistas alfabéticamente
    const sortedArtists = Object.keys(groupedByArtist).sort();

    // Crear acordeón para cada artista
    sortedArtists.forEach(artist => {
        const artistGroup = createArtistGroup(artist, groupedByArtist[artist]);
        songsGrid.appendChild(artistGroup);
    });
}

// Crear grupo de artista con acordeón
function createArtistGroup(artist, songs) {
    const group = document.createElement('div');
    group.className = 'artist-group';

    const header = document.createElement('div');
    header.className = 'artist-header';
    header.innerHTML = `
        <h3>${artist}</h3>
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="artist-count">${songs.length} ${songs.length === 1 ? 'canción' : 'canciones'}</span>
            <span class="artist-toggle">▼</span>
        </div>
    `;

    const songsContainer = document.createElement('div');
    songsContainer.className = 'artist-songs';

    // Añadir canciones del artista
    songs.forEach(song => {
        const card = createSongCard(song);
        songsContainer.appendChild(card);
    });

    // Toggle del acordeón
    header.addEventListener('click', () => {
        header.classList.toggle('active');
        songsContainer.classList.toggle('show');
    });

    group.appendChild(header);
    group.appendChild(songsContainer);

    return group;
}

// Crear tarjeta de canción
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.dataset.songId = song.id;

    const lyricsLength = song.lyrics ? song.lyrics.length : 0;

    card.innerHTML = `
        <div class="song-card-header" data-clickable="true">
            <div class="song-info">
                <h3>${song.title} - ${song.artist}</h3>
            </div>
            <div class="song-meta">
                <span>YouTube: ${song.youtubeId}</span>
                <span>${lyricsLength} caracteres</span>
            </div>
        </div>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteSong('${song.id}', '${song.title.replace(/'/g, "\\'")}')">
            Eliminar
        </button>
    `;

    // Hacer click en la canción para ir a reproducir
    card.addEventListener('click', (e) => {
        // No redirigir si se hizo clic en el botón de eliminar
        if (e.target.closest('.delete-btn')) {
            return;
        }
        
        // Guardar el índice de la canción en localStorage
        const songIndex = songsData.findIndex(s => s.id === song.id);
        localStorage.setItem('selectedSongIndex', songIndex);
        
        // Redirigir a index.html
        window.location.href = 'index.html';
    });

    // Cambiar cursor al hover (excepto en el botón)
    const header = card.querySelector('.song-card-header');
    header.style.cursor = 'pointer';

    return card;
}

// Eliminar canción
async function deleteSong(songId, songTitle) {
    if (!confirm(`¿Estás seguro de eliminar "${songTitle}"?\n\nEsto eliminará:\n- La canción de songs.js\n- Todas las notas asociadas\n- Los datos del localStorage`)) {
        return;
    }

    console.log(`[DELETE] Eliminando canción: ${songId}`);

    // 1. Eliminar del array local
    const index = songsData.findIndex(s => s.id === songId);
    if (index !== -1) {
        songsData.splice(index, 1);
    }

    // 2. Actualizar localStorage (solo canciones NO originales)
    const customSongsOnly = songsData.filter(song => !originalSongsIds.includes(song.id));
    localStorage.setItem('customSongs', JSON.stringify(customSongsOnly));
    console.log(`[STORAGE] CustomSongs actualizado: ${customSongsOnly.length} canciones personalizadas`);

    // 3. Eliminar notas asociadas
    const notes = JSON.parse(localStorage.getItem('notes') || '{}');
    if (notes[songId]) {
        delete notes[songId];
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // 4. Guardar en songs.js vía servidor (si está disponible)
    await saveSongsToServer();

    // 5. Re-renderizar
    renderSongs();
    populateSongSelector(); // Actualizar selector

    console.log(`[SUCCESS] Canción eliminada: ${songId}`);
}

// Guardar en songs.js vía servidor
async function saveSongsToServer() {
    try {
        // Verificar si el servidor está disponible
        const healthCheck = await fetch('http://localhost:3001/health').catch(() => null);
        
        if (!healthCheck || !healthCheck.ok) {
            console.log('[WARNING] Servidor no disponible - cambios solo en localStorage');
            return;
        }

        // Generar código de songs.js
        const jsCode = generateSongsCode();

        // Enviar al servidor
        const response = await fetch('http://localhost:3001/save-songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: jsCode })
        });

        const result = await response.json();

        if (result.success) {
            console.log(`[SUCCESS] songs.js actualizado: ${songsData.length} canciones`);
        }
    } catch (error) {
        console.log('[WARNING] No se pudo guardar en servidor:', error.message);
    }
}

// Generar código de songs.js
function generateSongsCode() {
    let jsCode = '// Base de datos de canciones\n';
    jsCode += '// Nota: Las letras deben ser añadidas por el usuario respetando los derechos de autor\n';
    jsCode += '// Este archivo contiene solo la estructura y ejemplos educativos\n\n';
    jsCode += 'const songs = [\n';
    
    songsData.forEach((song, index) => {
        jsCode += '    {\n';
        jsCode += `        id: '${song.id}',\n`;
        jsCode += `        title: '${song.title.replace(/'/g, "\\'")}',\n`;
        jsCode += `        artist: '${song.artist.replace(/'/g, "\\'")}',\n`;
        jsCode += `        youtubeId: '${song.youtubeId}',\n`;
        
        const lyricsEscaped = song.lyrics
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
        
        jsCode += `        lyrics: \`${lyricsEscaped}\`\n`;
        jsCode += '    }';
        
        if (index < songsData.length - 1) {
            jsCode += ',\n';
        } else {
            jsCode += '\n';
        }
    });
    
    jsCode += '];\n';
    
    return jsCode;
}

// Poblar selector de canciones
function populateSongSelector() {
    songSelect.innerHTML = '<option value="">-- Elige una canción --</option>';
    songsData.forEach((song, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${song.title} - ${song.artist}`;
        songSelect.appendChild(option);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Selector de canciones (solo visual, no hace nada)
    songSelect.addEventListener('change', function() {
        // No hacemos nada, solo está para visualizar
    });

    // Botón añadir canción
    addSongBtn.addEventListener('click', openAddSongModal);
    
    // Cerrar modal
    closeAddSongModalBtn.addEventListener('click', closeAddSongModal);
    cancelAddSongBtn.addEventListener('click', closeAddSongModal);
    
    // Buscar letra
    fetchLyricsBtn.addEventListener('click', handleFetchLyrics);
    
    // Añadir letra manual
    addManualLyricsBtn.addEventListener('click', handleAddManualLyrics);
}

// Abrir modal de añadir canción
function openAddSongModal() {
    addSongModal.style.display = 'flex';
    songArtistInput.value = '';
    songTitleInput.value = '';
    songYoutubeInput.value = '';
    songLyricsInput.value = '';
    manualLyricsGroup.style.display = 'none';
    fetchLyricsStatus.textContent = '';
    fetchLyricsBtn.style.display = 'inline-block';
    addManualLyricsBtn.style.display = 'none';
}

// Cerrar modal de añadir canción
function closeAddSongModal() {
    addSongModal.style.display = 'none';
}

// Manejar búsqueda de letra
async function handleFetchLyrics() {
    const artist = songArtistInput.value.trim();
    const title = songTitleInput.value.trim();
    const youtubeUrl = songYoutubeInput.value.trim();

    if (!artist || !title || !youtubeUrl) {
        showStatus('Por favor completa todos los campos', 'error');
        return;
    }

    const youtubeId = LyricsAPI.extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
        showStatus('URL de YouTube inválida', 'error');
        return;
    }

    showStatus('Buscando letra (puede tardar 10-15 segundos)...', 'loading');
    fetchLyricsBtn.disabled = true;

    try {
        const lyrics = await LyricsAPI.fetchLyrics(artist, title);

        if (!lyrics) {
            showStatus('Letra no encontrada en APIs públicas', 'error');
            fetchLyricsBtn.disabled = false;
            manualLyricsGroup.style.display = 'block';
            fetchLyricsBtn.style.display = 'none';
            addManualLyricsBtn.style.display = 'inline-block';
            return;
        }

        // Crear nueva canción
        const newSong = {
            id: LyricsAPI.generateSongId(artist, title),
            title: title,
            artist: artist,
            youtubeId: youtubeId,
            lyrics: lyrics.trim()
        };

        // Añadir a la lista
        songsData.push(newSong);
        saveCustomSongs();
        populateSongSelector();
        renderSongs();

        showStatus('Canción añadida correctamente', 'success');
        
        setTimeout(() => {
            closeAddSongModal();
        }, 1000);

    } catch (error) {
        showStatus('Error al buscar letra: ' + error.message, 'error');
        fetchLyricsBtn.disabled = false;
    }
}

// Manejar añadir letra manual
function handleAddManualLyrics() {
    const artist = songArtistInput.value.trim();
    const title = songTitleInput.value.trim();
    const youtubeUrl = songYoutubeInput.value.trim();
    const lyrics = songLyricsInput.value.trim();

    if (!artist || !title || !youtubeUrl) {
        showStatus('Por favor completa todos los campos', 'error');
        return;
    }

    if (!lyrics) {
        showStatus('Por favor añade la letra de la canción', 'error');
        return;
    }

    const youtubeId = LyricsAPI.extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
        showStatus('URL de YouTube inválida', 'error');
        return;
    }

    // Crear nueva canción
    const newSong = {
        id: LyricsAPI.generateSongId(artist, title),
        title: title,
        artist: artist,
        youtubeId: youtubeId,
        lyrics: lyrics
    };

    // Añadir a la lista
    songsData.push(newSong);
    saveCustomSongs();
    populateSongSelector();
    renderSongs();

    showStatus('Canción añadida correctamente', 'success');
    
    setTimeout(() => {
        closeAddSongModal();
    }, 1000);
}

// Guardar canciones personalizadas
function saveCustomSongs() {
    const customSongsOnly = songsData.filter(song => !originalSongsIds.includes(song.id));
    localStorage.setItem('customSongs', JSON.stringify(customSongsOnly));
    console.log(`[SAVE] ${songsData.length} canciones guardadas en localStorage`);
    
    // Auto-guardar en songs.js
    autoSaveToFile();
}

// Auto-guardar en songs.js vía servidor
async function autoSaveToFile() {
    console.log('[SYNC] Guardando automáticamente en songs.js...');
    
    const jsCode = generateSongsCode();
    const saved = await saveToServer(jsCode);
    
    if (saved) {
        console.log('[SUCCESS] Guardado automático exitoso');
    } else {
        console.log('[WARNING] Guardado automático falló - servidor no disponible');
    }
}

// Guardar en servidor
async function saveToServer(content) {
    try {
        const response = await fetch('http://localhost:3001/save-songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`[SUCCESS] songs.js actualizado: ${songsData.length} canciones`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log('[WARNING] Error al guardar en servidor:', error.message);
        return false;
    }
}

// Mostrar mensajes de estado
function showStatus(message, type) {
    fetchLyricsStatus.textContent = message;
    fetchLyricsStatus.className = `status-message ${type}`;
}

// Toggle menú hamburguesa
function setupMenuToggle() {
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuBtn.classList.toggle('active');
        menuDropdown.classList.toggle('show');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuBtn.classList.remove('active');
            menuDropdown.classList.remove('show');
        }
    });

    // Cerrar menú al hacer clic en un enlace
    menuDropdown.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            menuDropdown.classList.remove('show');
        });
    });
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Inicializar iconos Lucide
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

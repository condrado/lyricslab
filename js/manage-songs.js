// Gestión de Canciones - manage-songs.js

let songsData = [];
let originalSongsIds = []; // IDs de canciones originales de songs.js
let db = null; // Firestore database instance
let useFirebase = false; // Flag para saber si Firebase está disponible
let currentEditingSong = null; // Canción que se está editando
let currentTooltipLineIndex = null; // Índice de la línea del tooltip que se está editando

// Helper functions para manejar scroll del body
function lockBodyScroll() {
    document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
    document.body.classList.remove('modal-open');
}

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

// Elementos para editar canción
const editSongModal = document.getElementById('editSongModal');
const closeEditModalBtn = document.querySelector('.close-edit-modal');
const editSongTitle = document.getElementById('editSongTitle');
const editSongArtist = document.getElementById('editSongArtist');
const editSongNote = document.getElementById('editSongNote');
const editLyricsContainer = document.getElementById('editLyricsContainer');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Elementos para editar tooltip
const tooltipEditModal = document.getElementById('tooltipEditModal');
const closeTooltipEditModalBtn = document.querySelector('.close-tooltip-edit-modal');
const tooltipEditLyricText = document.getElementById('tooltipEditLyricText');
const tooltipEditText = document.getElementById('tooltipEditText');
const saveTooltipEditBtn = document.getElementById('saveTooltipEditBtn');
const removeTooltipEditBtn = document.getElementById('removeTooltipEditBtn');
const cancelTooltipEditBtn = document.getElementById('cancelTooltipEditBtn');

// Inicializar cuando el DOM esté listo
async function init() {
    console.log('🚀 Inicializando gestión de canciones...');
    
    // Intentar inicializar Firebase
    await initFirebase();
    
    // Cargar canciones desde Firebase o fallback a local
    if (useFirebase) {
        await loadSongsFromFirebase();
    } else {
        loadSongs();
    }
    
    populateSongSelector();
    renderSongs();
    setupEventListeners();
    setupMenuToggle();
    
    console.log('✅ Gestión de canciones inicializada');
}

// Inicializar Firebase
async function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK no disponible');
            useFirebase = false;
            return;
        }
        
        if (typeof window.firebaseConfig === 'undefined') {
            console.warn('⚠️ firebaseConfig no disponible');
            useFirebase = false;
            return;
        }
        
        // Inicializar Firebase
        firebase.initializeApp(window.firebaseConfig);
        db = firebase.firestore();
        useFirebase = true;
        console.log('✅ Firebase inicializado en manage-songs');
    } catch (error) {
        console.warn('⚠️ Error al inicializar Firebase:', error);
        console.log('📂 Usando modo local (localStorage)');
        useFirebase = false;
    }
}

// Cargar canciones desde Firebase
async function loadSongsFromFirebase() {
    try {
        console.log('📡 Cargando canciones desde Firebase...');
        const snapshot = await db.collection('songs').get();
        songsData = [];
        snapshot.forEach(doc => {
            songsData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(`✅ ${songsData.length} canciones cargadas desde Firebase`);
    } catch (error) {
        console.error('❌ Error al cargar desde Firebase:', error);
        console.log('📂 Fallback a modo local');
        useFirebase = false;
        loadSongs();
    }
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
    const tooltipsCount = song.tooltips ? Object.keys(song.tooltips).length : 0;
    const hasNote = song.songNote && song.songNote.trim() !== '';

    card.innerHTML = `
        <div class="song-card-header" data-clickable="true">
            <div class="song-info">
                <h3>${song.title} - ${song.artist}</h3>
            </div>
            <div class="song-meta">
                <span>YouTube: ${song.youtubeId}</span>
                <span>${lyricsLength} caracteres</span>
                ${tooltipsCount > 0 ? `<span>💬 ${tooltipsCount} tooltips</span>` : ''}
                ${hasNote ? '<span>📝 Nota</span>' : ''}
            </div>
        </div>
        <div class="song-actions">
            <button class="edit-btn" onclick="event.stopPropagation(); openEditSongModal('${song.id}')">
                ✏️ Editar
            </button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteSong('${song.id}', '${song.title.replace(/'/g, "\\'")}')">
                🗑️ Eliminar
            </button>
        </div>
    `;

    // Hacer click en la canción para ir a reproducir
    card.addEventListener('click', (e) => {
        // No redirigir si se hizo clic en los botones
        if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
            return;
        }
        
        // Guardar el índice de la canción en localStorage
        const songIndex = songsData.findIndex(s => s.id === song.id);
        localStorage.setItem('selectedSongIndex', songIndex);
        
        // Redirigir a index.html
        window.location.href = 'index.html';
    });

    // Cambiar cursor al hover (excepto en los botones)
    const header = card.querySelector('.song-card-header');
    header.style.cursor = 'pointer';

    return card;
}

// Eliminar canción
async function deleteSong(songId, songTitle) {
    if (!confirm(`¿Estás seguro de eliminar "${songTitle}"?\n\nEsto eliminará:\n- La canción\n- Todas las notas asociadas\n- Los datos del almacenamiento`)) {
        return;
    }

    console.log(`[DELETE] Eliminando canción: ${songId}`);

    try {
        // Eliminar de Firebase o localmente
        if (useFirebase) {
            await db.collection('songs').doc(songId).delete();
            console.log('[FIREBASE] Canción eliminada de Firebase');
        } else {
            // Modo local: eliminar del array y localStorage
            const customSongsOnly = songsData.filter(song => !originalSongsIds.includes(song.id) && song.id !== songId);
            localStorage.setItem('customSongs', JSON.stringify(customSongsOnly));
            console.log(`[STORAGE] CustomSongs actualizado: ${customSongsOnly.length} canciones personalizadas`);
            
            // Guardar en songs.js vía servidor
            await saveSongsToServer();
        }
        
        // Eliminar del array local
        const index = songsData.findIndex(s => s.id === songId);
        if (index !== -1) {
            songsData.splice(index, 1);
        }
        
        // Eliminar notas asociadas del localStorage (si existen)
        const notes = JSON.parse(localStorage.getItem('musicNotesApp') || '{}');
        if (notes[songId]) {
            delete notes[songId];
            localStorage.setItem('musicNotesApp', JSON.stringify(notes));
        }
        
        // Re-renderizar
        renderSongs();
        populateSongSelector();
        
        console.log(`[SUCCESS] Canción eliminada: ${songId}`);
        alert(`✅ Canción "${songTitle}" eliminada correctamente`);
        
    } catch (error) {
        console.error('[ERROR] Error al eliminar canción:', error);
        alert('❌ Error al eliminar la canción: ' + error.message);
    }
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
    
    // Cerrar modal añadir
    closeAddSongModalBtn.addEventListener('click', closeAddSongModal);
    cancelAddSongBtn.addEventListener('click', closeAddSongModal);
    
    // Buscar letra
    fetchLyricsBtn.addEventListener('click', handleFetchLyrics);
    
    // Añadir letra manual
    addManualLyricsBtn.addEventListener('click', handleAddManualLyrics);
    
    // Cerrar modal editar
    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditSongModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditSongModal);
    if (saveEditBtn) saveEditBtn.addEventListener('click', saveSongEdits);
    
    // Eliminar nota de canción
    const clearSongNoteBtn = document.getElementById('clearSongNoteBtn');
    console.log('clearSongNoteBtn encontrado:', clearSongNoteBtn);
    if (clearSongNoteBtn) {
        clearSongNoteBtn.addEventListener('click', () => {
            console.log('🗑️ Botón eliminar nota clickeado');
            clearSongNote();
        });
    }
    
    // Cerrar modal tooltip
    if (closeTooltipEditModalBtn) closeTooltipEditModalBtn.addEventListener('click', closeTooltipEditModal);
    if (cancelTooltipEditBtn) cancelTooltipEditBtn.addEventListener('click', closeTooltipEditModal);
    if (saveTooltipEditBtn) saveTooltipEditBtn.addEventListener('click', saveTooltipEdit);
    if (removeTooltipEditBtn) removeTooltipEditBtn.addEventListener('click', removeTooltipEdit);
    
    // Cerrar modales al hacer click fuera
    editSongModal.addEventListener('click', (e) => {
        if (e.target === editSongModal) closeEditSongModal();
    });
    
    tooltipEditModal.addEventListener('click', (e) => {
        if (e.target === tooltipEditModal) closeTooltipEditModal();
    });
}

// Abrir modal de añadir canción
function openAddSongModal() {
    addSongModal.style.display = 'flex';
    lockBodyScroll();
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
    unlockBodyScroll();
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
            title: title,
            artist: artist,
            youtubeId: youtubeId,
            lyrics: lyrics.trim(),
            tooltips: {},
            songNote: ""
        };

        // Guardar en Firebase o localmente
        if (useFirebase) {
            try {
                const docRef = await db.collection('songs').add({
                    ...newSong,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                newSong.id = docRef.id;
                songsData.push(newSong);
                console.log('[FIREBASE] Canción añadida con ID:', docRef.id);
                showStatus('Canción añadida a Firebase!', 'success');
            } catch (error) {
                console.error('[FIREBASE] Error:', error);
                showStatus('Error al guardar en Firebase: ' + error.message, 'error');
                fetchLyricsBtn.disabled = false;
                return;
            }
        } else {
            newSong.id = LyricsAPI.generateSongId(artist, title);
            songsData.push(newSong);
            await saveCustomSongs();
            showStatus('Canción añadida correctamente', 'success');
        }

        populateSongSelector();
        renderSongs();
        
        setTimeout(() => {
            closeAddSongModal();
        }, 1000);

    } catch (error) {
        showStatus('Error al buscar letra: ' + error.message, 'error');
        fetchLyricsBtn.disabled = false;
    }
}

// Manejar añadir letra manual
async function handleAddManualLyrics() {
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

    showStatus('Guardando canción...', 'loading');
    addManualLyricsBtn.disabled = true;

    try {
        // Crear nueva canción
        const newSong = {
            title: title,
            artist: artist,
            youtubeId: youtubeId,
            lyrics: lyrics,
            tooltips: {},
            songNote: ""
        };

        // Guardar en Firebase o localmente
        if (useFirebase) {
            try {
                const docRef = await db.collection('songs').add({
                    ...newSong,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                newSong.id = docRef.id;
                songsData.push(newSong);
                console.log('[FIREBASE] Canción añadida con ID:', docRef.id);
                showStatus('Canción añadida a Firebase!', 'success');
            } catch (error) {
                console.error('[FIREBASE] Error:', error);
                showStatus('Error al guardar en Firebase: ' + error.message, 'error');
                addManualLyricsBtn.disabled = false;
                return;
            }
        } else {
            newSong.id = LyricsAPI.generateSongId(artist, title);
            songsData.push(newSong);
            await saveCustomSongs();
            showStatus('Canción añadida correctamente', 'success');
        }

        populateSongSelector();
        renderSongs();
        
        setTimeout(() => {
            closeAddSongModal();
        }, 1000);
        
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        addManualLyricsBtn.disabled = false;
    }
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

// ==================== FUNCIONES DE EDICIÓN ====================

// Abrir modal de editar canción
function openEditSongModal(songId) {
    const song = songsData.find(s => s.id === songId);
    if (!song) return;
    
    currentEditingSong = song;
    
    editSongTitle.textContent = song.title;
    editSongArtist.textContent = song.artist;
    editSongNote.value = song.songNote || '';
    
    // Renderizar letra con tooltips
    renderLyricsForEdit(song);
    
    // Auto-guardar songNote al escribir (con debounce)
    let saveTimeout;
    editSongNote.oninput = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            await autoSaveSongNote();
        }, 1000); // Guarda 1 segundo después de dejar de escribir
    };
    
    editSongModal.style.display = 'flex';
    lockBodyScroll();
}

// Renderizar letra para edición
function renderLyricsForEdit(song) {
    editLyricsContainer.innerHTML = '';
    
    if (!song.lyrics || song.lyrics.trim() === '') {
        editLyricsContainer.innerHTML = '<p style="color: var(--text-secondary);">Esta canción no tiene letra</p>';
        return;
    }
    
    const lines = song.lyrics.split('\n');
    
    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'edit-lyric-line';
        lineDiv.dataset.lineIndex = index;
        
        if (line.trim() === '') {
            lineDiv.classList.add('empty');
            lineDiv.innerHTML = '&nbsp;';
        } else {
            lineDiv.textContent = line;
            
            // Marcar si tiene tooltip
            if (song.tooltips && song.tooltips[index]) {
                lineDiv.classList.add('has-tooltip');
                lineDiv.title = 'Click para editar tooltip';
            }
            
            // Click para editar tooltip
            lineDiv.addEventListener('click', () => {
                openTooltipEditModal(index, line, song);
            });
        }
        
        editLyricsContainer.appendChild(lineDiv);
    });
}

// Cerrar modal de editar canción
function closeEditSongModal() {
    editSongModal.style.display = 'none';
    unlockBodyScroll();
    currentEditingSong = null;
    editSongNote.value = '';
    editSongNote.oninput = null; // Limpiar event listener
    editLyricsContainer.innerHTML = '';
}

// Auto-guardar nota de canción
async function autoSaveSongNote() {
    if (!currentEditingSong) return;
    
    const noteContent = editSongNote.value.trim();
    
    // Actualizar objeto local
    currentEditingSong.songNote = noteContent;
    const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].songNote = noteContent;
    }
    
    // Guardar en Firebase
    if (useFirebase) {
        try {
            await db.collection('songs').doc(currentEditingSong.id).update({
                songNote: noteContent,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('[FIREBASE] 💾 Nota auto-guardada:', noteContent.substring(0, 30) + '...');
        } catch (error) {
            console.error('[FIREBASE] ❌ Error al auto-guardar nota:', error);
        }
    } else {
        localStorage.setItem('customSongs', JSON.stringify(songsData));
        await saveCustomSongs();
    }
}

// Eliminar nota de la canción
async function clearSongNote() {
    console.log('🗑️ clearSongNote() llamada');
    console.log('currentEditingSong:', currentEditingSong);
    console.log('useFirebase:', useFirebase);
    
    if (!currentEditingSong) {
        console.error('❌ No hay canción en edición');
        return;
    }
    
    if (!confirm('¿Eliminar la nota de esta canción?')) {
        console.log('❌ Usuario canceló');
        return;
    }
    
    // Limpiar textarea
    editSongNote.value = '';
    console.log('✅ Textarea limpiado');
    
    // Guardar inmediatamente en Firebase
    if (useFirebase) {
        try {
            console.log('[FIREBASE] Intentando eliminar nota de:', currentEditingSong.id);
            
            const updateData = {
                songNote: '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('📤 DATOS QUE SE ENVÍAN A FIREBASE:', {
                docId: currentEditingSong.id,
                songNote: updateData.songNote,
                songNoteLength: updateData.songNote.length,
                songNoteType: typeof updateData.songNote,
                songNoteValue: JSON.stringify(updateData.songNote)
            });
            
            await db.collection('songs').doc(currentEditingSong.id).update(updateData);
            
            console.log('[FIREBASE] ✅ Nota eliminada de canción:', currentEditingSong.id);
            
            // Validar que se guardó correctamente
            const docRef = await db.collection('songs').doc(currentEditingSong.id).get();
            const savedData = docRef.data();
            console.log('📥 VALIDACIÓN - Datos guardados en Firebase:', {
                songNote: savedData.songNote,
                songNoteLength: savedData.songNote ? savedData.songNote.length : 0,
                songNoteType: typeof savedData.songNote,
                songNoteIsEmpty: savedData.songNote === '',
                songNoteValue: JSON.stringify(savedData.songNote)
            });
            
            // Actualizar objeto local
            currentEditingSong.songNote = '';
            const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
            if (songIndex !== -1) {
                songsData[songIndex].songNote = '';
            }
            
            alert('✅ Nota eliminada correctamente');
        } catch (error) {
            console.error('[FIREBASE] Error al eliminar nota:', error);
            alert('❌ Error al eliminar la nota: ' + error.message);
            editSongNote.value = currentEditingSong.songNote || ''; // Restaurar
        }
    } else {
        // Modo local
        currentEditingSong.songNote = '';
        const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
        if (songIndex !== -1) {
            songsData[songIndex].songNote = '';
        }
        localStorage.setItem('customSongs', JSON.stringify(songsData));
        await saveCustomSongs();
        alert('✅ Nota eliminada correctamente');
    }
}

// Guardar cambios de la canción
async function saveSongEdits() {
    if (!currentEditingSong) return;
    
    const noteContent = editSongNote.value.trim();
    
    // Actualizar nota en el objeto actual
    currentEditingSong.songNote = noteContent;
    
    // Actualizar en el array principal
    const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].songNote = noteContent;
        songsData[songIndex].tooltips = currentEditingSong.tooltips || {};
    }
    
    // Guardar en Firebase o localmente
    if (useFirebase) {
        try {
            await db.collection('songs').doc(currentEditingSong.id).update({
                songNote: noteContent,
                tooltips: currentEditingSong.tooltips || {},
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('[FIREBASE] Canción actualizada:', {
                id: currentEditingSong.id,
                songNote: noteContent,
                songNoteLength: noteContent.length,
                tooltipsCount: Object.keys(currentEditingSong.tooltips || {}).length
            });
            
            // Recargar datos desde Firebase para asegurar sincronización
            await loadSongsFromFirebase();
        } catch (error) {
            console.error('[FIREBASE] Error:', error);
            alert('Error al guardar en Firebase: ' + error.message);
            return;
        }
    } else {
        // Actualizar en localStorage
        localStorage.setItem('customSongs', JSON.stringify(songsData));
        await saveCustomSongs();
    }
    
    closeEditSongModal();
    renderSongs();
    populateSongSelector();
    
    const message = noteContent 
        ? '✅ Cambios guardados correctamente' 
        : '✅ Cambios guardados (nota eliminada)';
    alert(message);
}

// ==================== FUNCIONES DE TOOLTIP ====================

// Abrir modal de editar tooltip
function openTooltipEditModal(lineIndex, lineText, song) {
    currentTooltipLineIndex = lineIndex;
    tooltipEditLyricText.textContent = lineText;
    
    // Si ya existe tooltip, mostrarlo
    if (song.tooltips && song.tooltips[lineIndex]) {
        tooltipEditText.value = song.tooltips[lineIndex];
        removeTooltipEditBtn.style.display = 'inline-block';
    } else {
        tooltipEditText.value = '';
        removeTooltipEditBtn.style.display = 'none';
    }
    
    tooltipEditModal.style.display = 'flex';
    lockBodyScroll();
    tooltipEditText.focus();
}

// Cerrar modal de editar tooltip
function closeTooltipEditModal() {
    tooltipEditModal.style.display = 'none';
    unlockBodyScroll();
    currentTooltipLineIndex = null;
    tooltipEditText.value = '';
}

// Guardar tooltip
function saveTooltipEdit() {
    if (currentTooltipLineIndex === null || !currentEditingSong) return;
    
    const tooltipContent = tooltipEditText.value.trim();
    
    if (!tooltipContent) {
        alert('Por favor, escribe un texto para el tooltip');
        return;
    }
    
    // Inicializar tooltips si no existe
    if (!currentEditingSong.tooltips) {
        currentEditingSong.tooltips = {};
    }
    
    // Guardar tooltip
    currentEditingSong.tooltips[currentTooltipLineIndex] = tooltipContent;
    
    console.log(`[TOOLTIP] Guardado para línea ${currentTooltipLineIndex}`);
    
    // Re-renderizar letra
    renderLyricsForEdit(currentEditingSong);
    
    closeTooltipEditModal();
}

// Eliminar tooltip
async function removeTooltipEdit() {
    if (currentTooltipLineIndex === null || !currentEditingSong) return;
    
    if (!confirm('¿Eliminar este tooltip?')) return;
    
    // Eliminar tooltip
    if (currentEditingSong.tooltips) {
        delete currentEditingSong.tooltips[currentTooltipLineIndex];
    }
    
    console.log(`[TOOLTIP] Eliminado de línea ${currentTooltipLineIndex}`);
    
    // Guardar en Firebase o localStorage
    if (useFirebase && db) {
        try {
            await db.collection('songs').doc(currentEditingSong.id).update({
                tooltips: currentEditingSong.tooltips || {},
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('[FIREBASE] ✅ Tooltip eliminado de Firebase');
            
            // Actualizar array local
            const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
            if (songIndex !== -1) {
                songsData[songIndex].tooltips = currentEditingSong.tooltips;
            }
        } catch (error) {
            console.error('[FIREBASE] ❌ Error al eliminar tooltip:', error);
            alert('Error al eliminar tooltip en Firebase: ' + error.message);
            closeTooltipEditModal();
            return;
        }
    } else {
        // Modo local
        const songIndex = songsData.findIndex(s => s.id === currentEditingSong.id);
        if (songIndex !== -1) {
            songsData[songIndex].tooltips = currentEditingSong.tooltips;
        }
        localStorage.setItem('customSongs', JSON.stringify(songsData));
        await saveCustomSongs();
    }
    
    // Re-renderizar letra
    renderLyricsForEdit(currentEditingSong);
    
    closeTooltipEditModal();
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

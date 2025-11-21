// Estado de la aplicación
let currentSong = null;
let selectedLineIndex = null;
let notes = {}; // { songId: { lineIndex: { text, link } } }
let songsData = []; // Copia mutable de songs

// Elementos del DOM
const songSelect = document.getElementById('songSelect');
const songTitle = document.getElementById('songTitle');
const videoContainer = document.getElementById('videoContainer');
const lyricsContainer = document.getElementById('lyricsContainer');
const notesContainer = document.getElementById('notesContainer');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const selectedLyricText = document.getElementById('selectedLyricText');
const noteText = document.getElementById('noteText');
const noteLink = document.getElementById('noteLink');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const closeModalBtn = document.querySelector('.close-modal');

// Elementos para añadir canciones
const addSongBtn = document.getElementById('addSongBtn');
const addSongModal = document.getElementById('addSongModal');
const closeAddSongModalBtn = document.querySelector('.close-add-song-modal');
const songArtistInput = document.getElementById('songArtistInput');
const songTitleInput = document.getElementById('songTitleInput');
const songYoutubeInput = document.getElementById('songYoutubeInput');
const songLyricsInput = document.getElementById('songLyricsInput');
const manualLyricsGroup = document.getElementById('manualLyricsGroup');
const fetchLyricsBtn = document.getElementById('fetchLyricsBtn');
const addManualLyricsBtn = document.getElementById('addManualLyricsBtn');
const cancelAddSongBtn = document.getElementById('cancelAddSongBtn');
const fetchLyricsStatus = document.getElementById('fetchLyricsStatus');

// Elementos para tooltips
const tooltipModal = document.getElementById('tooltipModal');
const closeTooltipModalBtn = document.querySelector('.close-tooltip-modal');
const tooltipLyricText = document.getElementById('tooltipLyricText');
const tooltipText = document.getElementById('tooltipText');
const saveTooltipBtn = document.getElementById('saveTooltipBtn');
const removeTooltipBtn = document.getElementById('removeTooltipBtn');
const cancelTooltipBtn = document.getElementById('cancelTooltipBtn');
const translateLineBtn = document.getElementById('translateLineBtn');
const copyLineBtn = document.getElementById('copyLineBtn');
let currentTooltipLineIndex = null;

// Elementos para nota general de la canción
const songNoteModal = document.getElementById('songNoteModal');
const closeSongNoteModalBtn = document.querySelector('.close-song-note-modal');
const songNoteTitle = document.getElementById('songNoteTitle');
const songNoteText = document.getElementById('songNoteText');
const saveSongNoteBtn = document.getElementById('saveSongNoteBtn');
const removeSongNoteBtn = document.getElementById('removeSongNoteBtn');
const cancelSongNoteBtn = document.getElementById('cancelSongNoteBtn');

// Inicializar la aplicación
function init() {
    loadNotes();
    loadSongsData();
    syncSongsWithLocalStorage(); // Sincronizar songs.js con localStorage
    populateSongSelector();
    setupEventListeners();
    setupBeforeUnloadHandler(); // Detectar cierre de pestaña
    
    // Prioridad 1: Cargar canción desde manage-songs.html
    const savedIndexFromManage = localStorage.getItem('selectedSongIndex');
    if (savedIndexFromManage !== null) {
        const songIndex = parseInt(savedIndexFromManage);
        if (songIndex >= 0 && songIndex < songsData.length) {
            songSelect.value = songIndex;
            loadSong(songsData[songIndex]);
            // Guardar como última canción y eliminar el temporal
            localStorage.setItem('lastSongIndex', songIndex);
            localStorage.removeItem('selectedSongIndex');
        }
    } 
    // Prioridad 2: Cargar última canción reproducida
    else {
        const lastSongIndex = localStorage.getItem('lastSongIndex');
        if (lastSongIndex !== null) {
            const songIndex = parseInt(lastSongIndex);
            if (songIndex >= 0 && songIndex < songsData.length) {
                songSelect.value = songIndex;
                loadSong(songsData[songIndex]);
            }
        }
    }
}

// Sincronizar songs.js con localStorage al cargar
function syncSongsWithLocalStorage() {
    // Al cargar, verificar si localStorage tiene datos
    const savedSongs = localStorage.getItem('customSongs');
    
    if (savedSongs) {
        try {
            const localStorageSongs = JSON.parse(savedSongs);
            
            // Si localStorage tiene más canciones que songs.js, usar localStorage
            if (localStorageSongs.length > songsData.length) {
                songsData = localStorageSongs;
                console.log(`[SYNC] Sincronizado desde localStorage: ${songsData.length} canciones`);
                console.log('[WARNING] localStorage tiene canciones más recientes. Exporta para actualizar songs.js');
            } else {
                // Si songs.js tiene más o igual, actualizar localStorage con songs.js
                localStorage.setItem('customSongs', JSON.stringify(songsData));
                console.log(`[SYNC] localStorage actualizado con songs.js: ${songsData.length} canciones`);
            }
        } catch (e) {
            console.error('Error al sincronizar:', e);
            // En caso de error, guardar songs.js en localStorage
            localStorage.setItem('customSongs', JSON.stringify(songsData));
        }
    } else {
        // Primera vez: copiar songs.js a localStorage
        localStorage.setItem('customSongs', JSON.stringify(songsData));
        console.log(`✨ Primera carga: ${songsData.length} canciones copiadas a localStorage`);
    }
}

// Detectar cierre de pestaña/navegador
function setupBeforeUnloadHandler() {
    // Función eliminada - ya no es necesaria con guardado automático
}

// Cargar canciones SOLO de songs.js
function loadSongsData() {
    // Cargar TODAS las canciones de songs.js (incluye las ya guardadas)
    songsData = typeof songs !== 'undefined' ? [...songs] : [];
    
    console.log(`[LOAD] ${songsData.length} canciones cargadas desde songs.js`);
}

// Guardar canciones: actualiza localStorage Y guarda automáticamente en songs.js
async function saveCustomSongs() {
    // Guardar TODO el array de canciones en localStorage
    localStorage.setItem('customSongs', JSON.stringify(songsData));
    console.log(`[SAVE] ${songsData.length} canciones guardadas en localStorage`);
    
    // Guardar automáticamente en songs.js
    await autoSaveToFile();
}

// Guardado automático en songs.js
async function autoSaveToFile() {
    console.log('[SYNC] Guardando automáticamente en songs.js...');
    
    const jsCode = generateSongsCode();
    
    // Verificar si el servidor está disponible
    const serverAvailable = await checkServerStatus();
    
    if (serverAvailable) {
        const saved = await saveToServer(jsCode);
        if (saved) {
            console.log('[OK] Guardado automático exitoso');
            return true;
        }
    }
    
    console.log('[WARNING] Guardado automático falló - servidor no disponible');
    return false;
}

// Actualizar indicador visual de cambios sin guardar
function updateUnsavedIndicator() {
    // Función eliminada - ya no es necesaria con guardado automático
}

// Cargar notas del localStorage
function loadNotes() {
    const saved = localStorage.getItem('musicNotesApp');
    if (saved) {
        try {
            notes = JSON.parse(saved);
        } catch (e) {
            console.error('Error al cargar notas:', e);
            notes = {};
        }
    }
}

// Guardar notas en localStorage
function saveNotes() {
    localStorage.setItem('musicNotesApp', JSON.stringify(notes));
}

// Poblar el selector de canciones
function populateSongSelector() {
    if (!songsData || songsData.length === 0) {
        songSelect.innerHTML = '<option value="">No hay canciones disponibles</option>';
        return;
    }

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
    console.log('🔧 Configurando event listeners...');
    
    // Event listeners de canciones
    songSelect.addEventListener('change', function() {
        const index = parseInt(this.value);
        if (!isNaN(index) && songsData[index]) {
            const song = songsData[index];
            loadSong(song);
            // Guardar la última canción seleccionada
            localStorage.setItem('lastSongIndex', index);
            console.log(`[STORAGE] Canción guardada en localStorage: ${song.title}`);
        } else if (this.value === '') {
            // Si se deselecciona, limpiar localStorage
            localStorage.removeItem('lastSongIndex');
        }
    });

    // Botón añadir canción
    if (addSongBtn) {
        console.log('[OK] Botón añadir canción encontrado');
        addSongBtn.addEventListener('click', openAddSongModal);
    } else {
        console.error('[ERROR] Botón addSongBtn NO encontrado en el DOM');
    }

    // Botón buscar letra
    if (fetchLyricsBtn) {
        fetchLyricsBtn.addEventListener('click', handleFetchLyrics);
    }

    // Botón añadir letra manual
    if (addManualLyricsBtn) {
        addManualLyricsBtn.addEventListener('click', handleAddManualLyrics);
    }

    // Botón cancelar añadir canción
    if (cancelAddSongBtn) {
        cancelAddSongBtn.addEventListener('click', closeAddSongModal);
    }
    
    // Event listeners para tooltips
    if (closeTooltipModalBtn) {
        closeTooltipModalBtn.addEventListener('click', closeTooltipModal);
    }
    
    if (saveTooltipBtn) {
        saveTooltipBtn.addEventListener('click', saveTooltip);
    }
    
    if (removeTooltipBtn) {
        removeTooltipBtn.addEventListener('click', removeTooltip);
    }
    
    if (cancelTooltipBtn) {
        cancelTooltipBtn.addEventListener('click', closeTooltipModal);
    }
    
    if (translateLineBtn) {
        translateLineBtn.addEventListener('click', translateLineText);
    }
    
    if (copyLineBtn) {
        copyLineBtn.addEventListener('click', copyLineText);
    }
    
    // Cerrar modal al hacer click fuera
    if (tooltipModal) {
        tooltipModal.addEventListener('click', (e) => {
            if (e.target === tooltipModal) {
                closeTooltipModal();
            }
        });
    }
    
    // Event listeners para nota general de la canción
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', openSongNoteModal);
    }
    
    if (closeSongNoteModalBtn) {
        closeSongNoteModalBtn.addEventListener('click', closeSongNoteModal);
    }
    
    if (saveSongNoteBtn) {
        saveSongNoteBtn.addEventListener('click', saveSongNote);
    }
    
    if (removeSongNoteBtn) {
        removeSongNoteBtn.addEventListener('click', removeSongNote);
    }
    
    if (cancelSongNoteBtn) {
        cancelSongNoteBtn.addEventListener('click', closeSongNoteModal);
    }
    
    // Cerrar modal al hacer click fuera
    if (songNoteModal) {
        songNoteModal.addEventListener('click', (e) => {
            if (e.target === songNoteModal) {
                closeSongNoteModal();
            }
        });
    }
    
    // Menú hamburguesa
    setupMenuToggle();
    
    console.log('[OK] Event listeners configurados');
}

// Manejar cambio de canción
function handleSongChange(e) {
    const index = e.target.value;
    
    if (index === '') {
        resetView();
        return;
    }

    currentSong = songsData[index];
    loadSong(currentSong);
}

// Resetear vista
function resetView() {
    currentSong = null;
    selectedLineIndex = null;
    songTitle.textContent = 'Selecciona una canción';
    videoContainer.innerHTML = '<p class="placeholder-text">Selecciona una canción para comenzar</p>';
    lyricsContainer.innerHTML = '<p class="placeholder-text">La letra aparecerá aquí</p>';
    notesContainer.innerHTML = '<p class="placeholder-text">Haz clic en una línea de la letra para añadir notas</p>';
    addNoteBtn.disabled = true;
}

// Cargar canción
function loadSong(song) {
    currentSong = song; // Asignar canción actual
    songTitle.textContent = `${song.title} - ${song.artist}`;
    loadVideo(song.youtubeId);
    loadLyrics(song);
    loadNotesForSong(song.id);
    addNoteBtn.disabled = false;
}

// Cargar video de YouTube
function loadVideo(youtubeId) {
    videoContainer.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${youtubeId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
    `;
}

// Cargar letra de la canción
function loadLyrics(song) {
    lyricsContainer.innerHTML = '';
    
    // Validar que la canción tenga letra
    if (!song.lyrics || song.lyrics.trim() === '') {
        lyricsContainer.innerHTML = '<p class="placeholder-text">Esta canción no tiene letra disponible</p>';
        return;
    }
    
    // Formatear letra: eliminar múltiples saltos de línea consecutivos
    const formattedLyrics = song.lyrics.replace(/\n{2,}/g, '\n');
    const lines = formattedLyrics.split('\n');
    
    lines.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';
        div.dataset.lineIndex = index;
        
        // Si la línea está vacía, añadir clase especial
        if (line.trim() === '') {
            div.classList.add('empty');
            div.innerHTML = '&nbsp;';
        } else {
            div.textContent = line;
        }
        
        // Añadir tooltip si existe
        if (song.tooltips && song.tooltips[index]) {
            div.dataset.tooltip = song.tooltips[index];
        }
        
        // Marcar si tiene nota
        if (notes[song.id] && notes[song.id][index]) {
            div.classList.add('has-note');
        }
        
        // Event listener click izquierdo
        div.addEventListener('click', (e) => {
            if (line.trim() === '') return;
            
            // Si tiene tooltip, mostrarlo
            if (song.tooltips && song.tooltips[index]) {
                toggleTooltipDisplay(div, song.tooltips[index]);
            } else {
                // Si no tiene tooltip, seleccionar línea para notas
                selectLyricLine(index, line, div);
            }
        });
        
        // Event listener click derecho para editar tooltip
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log('[CONTEXTMENU] Click derecho detectado en línea:', index);
            if (line.trim() !== '') {
                openTooltipModal(index, line, song);
            } else {
                console.log('[CONTEXTMENU] Línea vacía, ignorando');
            }
        });
        
        lyricsContainer.appendChild(div);
    });
}

// Seleccionar línea de letra
function selectLyricLine(index, text, element) {
    // Si la línea está vacía, no hacer nada
    if (text.trim() === '') return;
    
    // Verificar que hay una canción cargada
    if (!currentSong) return;
    
    // Remover selección anterior
    document.querySelectorAll('.lyric-line.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Añadir selección actual
    element.classList.add('selected');
    selectedLineIndex = index;
    
    // Mostrar nota existente o permitir crear nueva
    if (notes[currentSong.id] && notes[currentSong.id][index]) {
        // Ya hay una nota, scroll a la nota
        const noteCard = document.querySelector(`[data-note-index="${index}"]`);
        if (noteCard) {
            noteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            noteCard.style.animation = 'highlight 1s';
            setTimeout(() => {
                noteCard.style.animation = '';
            }, 1000);
        }
    }
}

// Abrir modal de nota
function openNoteModal() {
    if (!currentSong || selectedLineIndex === null) {
        alert('Por favor, selecciona una línea de la letra primero');
        return;
    }
    
    const lines = currentSong.lyrics.split('\n');
    const selectedLine = lines[selectedLineIndex];
    
    if (selectedLine.trim() === '') {
        alert('No puedes añadir notas a líneas vacías');
        return;
    }
    
    selectedLyricText.textContent = selectedLine;
    
    // Si ya existe una nota, cargar sus datos
    if (notes[currentSong.id] && notes[currentSong.id][selectedLineIndex]) {
        const existingNote = notes[currentSong.id][selectedLineIndex];
        noteText.value = existingNote.text;
        noteLink.value = existingNote.link || '';
    } else {
        noteText.value = '';
        noteLink.value = '';
    }
    
    noteModal.classList.add('active');
    noteText.focus();
}

// Cerrar modal
function closeNoteModal() {
    noteModal.classList.remove('active');
    noteText.value = '';
    noteLink.value = '';
}

// Guardar nota
function saveNote() {
    if (!currentSong || selectedLineIndex === null) return;
    
    const text = noteText.value.trim();
    const link = noteLink.value.trim();
    
    if (!text) {
        alert('Por favor, escribe una nota');
        return;
    }
    
    // Inicializar objeto de notas para la canción si no existe
    if (!notes[currentSong.id]) {
        notes[currentSong.id] = {};
    }
    
    // Guardar nota
    notes[currentSong.id][selectedLineIndex] = {
        text: text,
        link: link,
        lyric: currentSong.lyrics.split('\n')[selectedLineIndex]
    };
    
    saveNotes();
    closeNoteModal();
    
    // Recargar letra y notas
    loadLyrics(currentSong);
    loadNotesForSong(currentSong.id);
}

// Cargar notas para la canción actual
function loadNotesForSong(songId) {
    notesContainer.innerHTML = '';
    
    // Mostrar nota general de la canción si existe
    if (currentSong && currentSong.songNote && currentSong.songNote.trim() !== '') {
        const songNoteCard = createSongNoteCard(currentSong.songNote);
        notesContainer.appendChild(songNoteCard);
    }
    
    const songNotes = notes[songId];
    
    if (!songNotes || Object.keys(songNotes).length === 0) {
        // Si no hay notas de línea pero sí hay songNote, no mostrar placeholder
        if (currentSong && currentSong.songNote && currentSong.songNote.trim() !== '') {
            return;
        }
        notesContainer.innerHTML = '<p class="placeholder-text">No hay notas aún. Haz clic en una línea de la letra para añadir una nota.</p>';
        return;
    }
    
    // Ordenar notas por índice de línea
    const sortedIndices = Object.keys(songNotes).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedIndices.forEach(lineIndex => {
        const note = songNotes[lineIndex];
        const noteCard = createNoteCard(lineIndex, note);
        notesContainer.appendChild(noteCard);
    });
}

// Crear tarjeta de nota
function createNoteCard(lineIndex, note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.noteIndex = lineIndex;
    
    const reference = document.createElement('div');
    reference.className = 'note-reference';
    reference.textContent = `"${note.lyric}"`;
    card.appendChild(reference);
    
    const text = document.createElement('div');
    text.className = 'note-text';
    text.textContent = note.text;
    card.appendChild(text);
    
    if (note.link) {
        const link = document.createElement('a');
        link.className = 'note-link';
        link.href = note.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '🔗 Ver enlace';
        card.appendChild(link);
    }
    
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-small btn-edit';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => editNote(lineIndex));
    actions.appendChild(editBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-small btn-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteNote(lineIndex));
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);
    
    return card;
}

// Crear tarjeta de nota general de canción
function createSongNoteCard(songNoteText) {
    const card = document.createElement('div');
    card.className = 'note-card song-note-card';
    
    const header = document.createElement('div');
    header.className = 'song-note-header';
    header.innerHTML = '📝 Nota General de la Canción';
    card.appendChild(header);
    
    const text = document.createElement('div');
    text.className = 'note-text';
    text.innerHTML = markdownToHtml(songNoteText);
    card.appendChild(text);
    
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-small btn-edit';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => openSongNoteModal());
    actions.appendChild(editBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-small btn-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => removeSongNote());
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);
    
    return card;
}

// Editar nota
function editNote(lineIndex) {
    selectedLineIndex = parseInt(lineIndex);
    
    // Seleccionar la línea correspondiente
    const lyricLine = document.querySelector(`[data-line-index="${lineIndex}"]`);
    if (lyricLine) {
        document.querySelectorAll('.lyric-line.selected').forEach(el => {
            el.classList.remove('selected');
        });
        lyricLine.classList.add('selected');
        lyricLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    openNoteModal();
}

// Eliminar nota
function deleteNote(lineIndex) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        return;
    }
    
    if (notes[currentSong.id]) {
        delete notes[currentSong.id][lineIndex];
        
        // Si no quedan más notas para esta canción, eliminar la entrada
        if (Object.keys(notes[currentSong.id]).length === 0) {
            delete notes[currentSong.id];
        }
    }
    
    saveNotes();
    loadLyrics(currentSong);
    loadNotesForSong(currentSong.id);
}

// Añadir animación de highlight
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); box-shadow: 0 4px 16px var(--shadow); }
    }
`;
document.head.appendChild(style);

// ========== FUNCIONES PARA AÑADIR CANCIONES ==========

// Abrir modal de añadir canción
function openAddSongModal() {
    console.log('Abriendo modal de añadir canción');
    
    if (!addSongModal) {
        console.error('[ERROR] Modal no encontrado');
        alert('Error: No se puede abrir el modal. Recarga la página.');
        return;
    }
    
    songArtistInput.value = '';
    songTitleInput.value = '';
    songYoutubeInput.value = '';
    songLyricsInput.value = '';
    fetchLyricsStatus.textContent = '';
    fetchLyricsStatus.className = 'status-message';
    manualLyricsGroup.style.display = 'none';
    fetchLyricsBtn.style.display = 'inline-block';
    addManualLyricsBtn.style.display = 'none';
    addSongModal.classList.add('active');
    
    console.log('[OK] Modal abierto');
}

// Cerrar modal de añadir canción
function closeAddSongModal() {
    addSongModal.classList.remove('active');
}

// Manejar obtención de letra
async function handleFetchLyrics() {
    const artist = songArtistInput.value.trim();
    const title = songTitleInput.value.trim();
    const youtubeUrl = songYoutubeInput.value.trim();
    
    // Validar campos
    if (!artist || !title) {
        showStatus('Por favor, completa el artista y el título', 'error');
        return;
    }
    
    if (!youtubeUrl) {
        showStatus('Por favor, ingresa la URL de YouTube', 'error');
        return;
    }
    
    // Extraer YouTube ID
    const youtubeId = LyricsAPI.extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
        showStatus('URL de YouTube inválida', 'error');
        return;
    }
    
    // Verificar si el servidor está disponible
    const serverAvailable = await checkServerStatus();
    if (!serverAvailable) {
        showStatus('[WARNING] Servidor de guardado no disponible. Ejecuta: npm start', 'error');
        
        // Mostrar instrucciones adicionales
        setTimeout(() => {
            if (confirm('El servidor de guardado no está activo.\n\n¿Deseas ver las instrucciones para iniciarlo?')) {
                alert('Para iniciar el servidor:\n\n1. Abre una terminal\n2. Ejecuta: npm start\n3. El servidor se iniciará en http://localhost:3001\n\nO alternativamente:\nnode server/save-songs-server.js');
            }
        }, 100);
        
        return;
    }
    
    // Obtener letra
    showStatus('[SEARCH] Buscando letra (puede tardar 10-15 segundos)...', 'loading');
    fetchLyricsBtn.disabled = true;
    
    try {
        const lyrics = await LyricsAPI.fetchLyrics(artist, title);
        
        if (!lyrics) {
            showStatus('[ERROR] Letra no encontrada en APIs públicas', 'error');
            fetchLyricsBtn.disabled = false;
            
            // Mostrar opción de añadir manualmente
            manualLyricsGroup.style.display = 'block';
            fetchLyricsBtn.style.display = 'none';
            addManualLyricsBtn.style.display = 'inline-block';
            
            // Dar instrucciones al usuario
            setTimeout(() => {
                const sitios = [
                    '• https://genius.com',
                    '• https://www.azlyrics.com', 
                    '• https://www.letras.com',
                    '• Buscar en Google: "' + artist + ' ' + title + ' lyrics"'
                ].join('\n');
                
                alert('[INFO] La letra no está disponible en las APIs públicas\n\n' +
                      'Puedes añadirla manualmente desde estos sitios:\n\n' + 
                      sitios + '\n\n' +
                      'Copia la letra y pégala en el campo de abajo.\n\n' +
                      '[WARNING] Nota: Algunas canciones populares tienen restricciones de derechos de autor en las APIs.');
            }, 300);
            
            return;
        }
        
        // Crear nueva canción (sin propiedad custom)
        const newSong = {
            id: LyricsAPI.generateSongId(artist, title),
            title: title,
            artist: artist,
            youtubeId: youtubeId,
            lyrics: lyrics.trim(),
            tooltips: {}, // Inicializar tooltips vacío
            songNote: "" // Inicializar nota vacía
        };
        
        // Añadir a la lista
        songsData.push(newSong);
        saveCustomSongs();
        populateSongSelector();
        
        // Seleccionar la nueva canción
        songSelect.value = songsData.length - 1;
        handleSongChange({ target: songSelect });
        
        showStatus('[OK] Canción añadida y guardada automáticamente!', 'success');
        
        setTimeout(() => {
            closeAddSongModal();
        }, 1500);
        
    } catch (error) {
        showStatus('Error: ' + error.message + ' - Usa la opción manual', 'error');
        manualLyricsGroup.style.display = 'block';
        fetchLyricsBtn.style.display = 'none';
        addManualLyricsBtn.style.display = 'inline-block';
    } finally {
        fetchLyricsBtn.disabled = false;
    }
}

// Mostrar estado
function showStatus(message, type) {
    fetchLyricsStatus.textContent = message;
    fetchLyricsStatus.className = `status-message ${type}`;
}

// Añadir canción con letra manual
async function handleAddManualLyrics() {
    const artist = songArtistInput.value.trim();
    const title = songTitleInput.value.trim();
    const youtubeUrl = songYoutubeInput.value.trim();
    const lyrics = songLyricsInput.value.trim();
    
    // Validar campos
    if (!artist || !title) {
        showStatus('Por favor, completa el artista y el título', 'error');
        return;
    }
    
    if (!youtubeUrl) {
        showStatus('Por favor, ingresa la URL de YouTube', 'error');
        return;
    }
    
    if (!lyrics) {
        showStatus('Por favor, añade la letra de la canción', 'error');
        return;
    }
    
    // Extraer YouTube ID
    const youtubeId = LyricsAPI.extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
        showStatus('URL de YouTube inválida', 'error');
        return;
    }
    
    // Verificar servidor
    const serverAvailable = await checkServerStatus();
    if (!serverAvailable) {
        showStatus('[WARNING] Servidor de guardado no disponible. Ejecuta: npm start', 'error');
        return;
    }
    
    showStatus('Guardando canción...', 'loading');
    addManualLyricsBtn.disabled = true;
    
    try {
        // Crear nueva canción (sin propiedad custom)
        const newSong = {
            id: LyricsAPI.generateSongId(artist, title),
            title: title,
            artist: artist,
            youtubeId: youtubeId,
            lyrics: lyrics,
            tooltips: {}, // Inicializar tooltips vacío
            songNote: "" // Inicializar nota vacía
        };
        
        // Añadir a la lista
        songsData.push(newSong);
        saveCustomSongs();
        populateSongSelector();
        
        // Seleccionar la nueva canción
        songSelect.value = songsData.length - 1;
        handleSongChange({ target: songSelect });
        
        showStatus('[OK] Canción añadida y guardada automáticamente!', 'success');
        
        setTimeout(() => {
            closeAddSongModal();
        }, 1500);
        
    } catch (error) {
        showStatus('Error al añadir la canción: ' + error.message, 'error');
    } finally {
        addManualLyricsBtn.disabled = false;
    }
}

// Verificar estado del servidor de guardado
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:3001/health', {
            method: 'GET',
            signal: AbortSignal.timeout(2000) // Timeout de 2 segundos
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('[OK] Servidor de guardado:', data.message);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log('[ERROR] Servidor de guardado no disponible');
        return false;
    }
}

// Guardar directamente en el servidor (automático)
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
            console.log(`[OK] songs.js actualizado: ${songsData.length} canciones`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log('[WARNING] Error al guardar en servidor:', error.message);
        return false;
    }
}

// Generar código de songs.js
function generateSongsCode() {
    let jsCode = '// Base de datos de canciones\n';
    jsCode += '// Nota: Las letras deben ser añadidas por el usuario respetando los derechos de autor\n';
    jsCode += '// Este archivo contiene solo la estructura y ejemplos educativos\n\n';
    jsCode += 'const songs = [\n';
    
    // Añadir canciones
    songsData.forEach((song, index) => {
        jsCode += '    {\n';
        jsCode += `        id: '${song.id}',\n`;
        jsCode += `        title: '${song.title.replace(/'/g, "\\'")}',\n`;
        jsCode += `        artist: '${song.artist.replace(/'/g, "\\'")}',\n`;
        jsCode += `        youtubeId: '${song.youtubeId}',\n`;
        
        // Formatear lyrics para que sea legible
        const lyricsEscaped = song.lyrics
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
        
        jsCode += `        lyrics: \`${lyricsEscaped}\``;
        
        // Añadir tooltips
        if (song.tooltips && Object.keys(song.tooltips).length > 0) {
            jsCode += ',\n        tooltips: {\n';
            const tooltipEntries = Object.entries(song.tooltips);
            tooltipEntries.forEach(([lineIndex, tooltipText], i) => {
                const escapedTooltip = tooltipText
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n');
                jsCode += `            "${lineIndex}": "${escapedTooltip}"`;
                if (i < tooltipEntries.length - 1) {
                    jsCode += ',\n';
                } else {
                    jsCode += '\n';
                }
            });
            jsCode += '        }';
        } else {
            jsCode += ',\n        tooltips: {}';
        }
        
        // Añadir songNote
        if (song.songNote) {
            const escapedNote = song.songNote
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n');
            jsCode += `,\n        songNote: "${escapedNote}"\n`;
        } else {
            jsCode += ',\n        songNote: ""\n';
        }
        
        jsCode += '    }';
        
        if (index < songsData.length - 1) {
            jsCode += ',\n';
        } else {
            jsCode += '\n';
        }
    });
    
    jsCode += '];\n\n';
    jsCode += '// Cómo obtener el ID de YouTube:\n';
    jsCode += '// De una URL como: https://www.youtube.com/watch?v=kXYiU_JCYtU\n';
    jsCode += '// El ID es: kXYiU_JCYtU (lo que viene después de "v=")\n';
    
    return jsCode;
}

// ==================== FUNCIONES DE TOOLTIPS ====================

// Abrir modal de tooltip
function openTooltipModal(lineIndex, lineText, song) {
    console.log('[TOOLTIP] Abriendo modal para línea:', lineIndex, lineText);
    
    if (!currentSong) {
        console.error('[TOOLTIP] No hay canción cargada');
        return;
    }
    
    if (!tooltipModal) {
        console.error('[TOOLTIP] Modal no encontrado en el DOM');
        return;
    }
    
    currentTooltipLineIndex = lineIndex;
    tooltipLyricText.textContent = lineText;
    
    // Si ya existe un tooltip, mostrarlo en el textarea
    if (song.tooltips && song.tooltips[lineIndex]) {
        tooltipText.value = song.tooltips[lineIndex];
        removeTooltipBtn.style.display = 'inline-block';
    } else {
        tooltipText.value = '';
        removeTooltipBtn.style.display = 'none';
    }
    
    tooltipModal.style.display = 'flex';
    tooltipText.focus();
    
    console.log('[TOOLTIP] Modal abierto correctamente');
}

// Cerrar modal de tooltip
function closeTooltipModal() {
    tooltipModal.style.display = 'none';
    tooltipText.value = '';
    currentTooltipLineIndex = null;
}

// Guardar tooltip
async function saveTooltip() {
    if (currentTooltipLineIndex === null || !currentSong) return;
    
    const tooltipContent = tooltipText.value.trim();
    
    if (!tooltipContent) {
        alert('Por favor, escribe un texto para el tooltip');
        return;
    }
    
    // Inicializar tooltips si no existe
    if (!currentSong.tooltips) {
        currentSong.tooltips = {};
    }
    
    // Guardar tooltip
    currentSong.tooltips[currentTooltipLineIndex] = tooltipContent;
    
    // Actualizar en songsData
    const songIndex = songsData.findIndex(s => s.id === currentSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].tooltips = currentSong.tooltips;
    }
    
    // Guardar en localStorage
    localStorage.setItem('customSongs', JSON.stringify(songsData));
    console.log('[TOOLTIP] Guardado en localStorage');
    
    // Guardar en servidor (songs.js)
    await autoSaveToFile();
    
    // Recargar letra para mostrar tooltip en el HTML
    loadLyrics(currentSong);
    
    closeTooltipModal();
    
    console.log(`[TOOLTIP] Guardado para línea ${currentTooltipLineIndex}: ${tooltipContent}`);
}

// Eliminar tooltip
async function removeTooltip() {
    if (currentTooltipLineIndex === null || !currentSong) return;
    
    if (!confirm('¿Eliminar este tooltip?')) return;
    
    // Eliminar tooltip
    if (currentSong.tooltips) {
        delete currentSong.tooltips[currentTooltipLineIndex];
    }
    
    // Actualizar en songsData
    const songIndex = songsData.findIndex(s => s.id === currentSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].tooltips = currentSong.tooltips;
    }
    
    // Guardar en localStorage
    localStorage.setItem('customSongs', JSON.stringify(songsData));
    console.log('[TOOLTIP] Eliminado de localStorage');
    
    // Guardar en servidor (songs.js)
    await autoSaveToFile();
    
    // Recargar letra para actualizar HTML
    loadLyrics(currentSong);
    
    closeTooltipModal();
    
    console.log(`[TOOLTIP] Eliminado de línea ${currentTooltipLineIndex}`);
}

// Convertir Markdown a HTML (soporte para enlaces)
function markdownToHtml(text) {
    // Convertir enlaces: [texto](url) -> <a href="url" target="_blank">texto</a>
    let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convertir saltos de línea
    html = html.replace(/\n/g, '<br>');
    
    // Convertir negrita: **texto** -> <strong>texto</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convertir cursiva: *texto* -> <em>texto</em>
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return html;
}

// Mostrar/ocultar tooltip al hacer click
function toggleTooltipDisplay(element, tooltipText) {
    // Cerrar todos los tooltips abiertos
    document.querySelectorAll('.tooltip-popup').forEach(popup => popup.remove());
    
    // Si el elemento ya tenía el tooltip visible, solo cerrarlo
    if (element.classList.contains('tooltip-visible')) {
        element.classList.remove('tooltip-visible');
        return;
    }
    
    // Remover clase de otros elementos
    document.querySelectorAll('.tooltip-visible').forEach(el => {
        el.classList.remove('tooltip-visible');
    });
    
    // Marcar este elemento como visible
    element.classList.add('tooltip-visible');
    
    // Crear popup del tooltip
    const popup = document.createElement('div');
    popup.className = 'tooltip-popup';
    
    // Convertir Markdown a HTML
    const htmlContent = markdownToHtml(tooltipText);
    popup.innerHTML = htmlContent;
    
    // Posicionar el popup
    element.appendChild(popup);
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', function closeTooltip(e) {
            if (!element.contains(e.target)) {
                popup.remove();
                element.classList.remove('tooltip-visible');
                document.removeEventListener('click', closeTooltip);
            }
        });
    }, 10);
}

// Traducir texto de la línea usando Google Translate API (MyMemory)
async function translateLineText() {
    const textToTranslate = tooltipLyricText.textContent.trim();
    
    if (!textToTranslate) {
        alert('No hay texto para traducir');
        return;
    }
    
    // Deshabilitar botón mientras traduce
    translateLineBtn.disabled = true;
    translateLineBtn.textContent = '⏳ Traduciendo...';
    
    try {
        // Usar MyMemory Translation API (Google Translate gratuito, sin API key)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|es`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData.translatedText) {
            // Insertar traducción en el textarea
            const translation = data.responseData.translatedText;
            tooltipText.value = translation;
            tooltipText.focus();
            
            console.log('[TRANSLATE] Traducción exitosa:', translation);
        } else {
            throw new Error('No se pudo obtener la traducción');
        }
        
    } catch (error) {
        console.error('[TRANSLATE] Error:', error);
        alert('Error al traducir. Por favor, intenta de nuevo o escribe la traducción manualmente.');
    } finally {
        // Rehabilitar botón
        translateLineBtn.disabled = false;
        translateLineBtn.textContent = '🌐 Traducir';
    }
}

// Copiar texto en inglés al portapapeles
async function copyLineText() {
    const textToCopy = tooltipLyricText.textContent.trim();
    
    if (!textToCopy) {
        alert('No hay texto para copiar');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Feedback visual
        const originalText = copyLineBtn.textContent;
        copyLineBtn.textContent = '✅ Copiado';
        copyLineBtn.disabled = true;
        
        setTimeout(() => {
            copyLineBtn.textContent = originalText;
            copyLineBtn.disabled = false;
        }, 2000);
        
        console.log('[COPY] Texto copiado:', textToCopy);
    } catch (error) {
        console.error('[COPY] Error:', error);
        alert('Error al copiar el texto. Por favor, intenta de nuevo.');
    }
}

// ==================== FUNCIONES DE NOTA GENERAL DE CANCIÓN ====================

// Abrir modal de nota general
function openSongNoteModal() {
    if (!currentSong) {
        alert('Por favor, selecciona una canción primero');
        return;
    }
    
    songNoteTitle.textContent = `${currentSong.title} - ${currentSong.artist}`;
    
    // Si ya existe una nota, mostrarla
    if (currentSong.songNote) {
        songNoteText.value = currentSong.songNote;
        removeSongNoteBtn.style.display = 'inline-block';
    } else {
        songNoteText.value = '';
        removeSongNoteBtn.style.display = 'none';
    }
    
    songNoteModal.style.display = 'flex';
    songNoteText.focus();
    
    console.log('[SONG NOTE] Modal abierto para:', currentSong.title);
}

// Cerrar modal de nota general
function closeSongNoteModal() {
    songNoteModal.style.display = 'none';
    songNoteText.value = '';
}

// Guardar nota general de la canción
async function saveSongNote() {
    if (!currentSong) return;
    
    const noteContent = songNoteText.value.trim();
    
    // Permitir guardar nota vacía para limpiar
    currentSong.songNote = noteContent;
    
    // Actualizar en songsData
    const songIndex = songsData.findIndex(s => s.id === currentSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].songNote = noteContent;
    }
    
    // Guardar en localStorage
    localStorage.setItem('customSongs', JSON.stringify(songsData));
    console.log('[SONG NOTE] Guardado en localStorage');
    
    // Guardar en servidor (songs.js)
    await autoSaveToFile();
    
    closeSongNoteModal();
    
    // Actualizar la visualización de notas
    loadNotesForSong(currentSong.id);
    
    if (noteContent) {
        console.log(`[SONG NOTE] Nota guardada para: ${currentSong.title}`);
    } else {
        console.log(`[SONG NOTE] Nota eliminada de: ${currentSong.title}`);
    }
}

// Eliminar nota general de la canción
async function removeSongNote() {
    if (!currentSong) return;
    
    if (!confirm('¿Eliminar la nota general de esta canción?')) return;
    
    currentSong.songNote = '';
    
    // Actualizar en songsData
    const songIndex = songsData.findIndex(s => s.id === currentSong.id);
    if (songIndex !== -1) {
        songsData[songIndex].songNote = '';
    }
    
    // Guardar en localStorage
    localStorage.setItem('customSongs', JSON.stringify(songsData));
    console.log('[SONG NOTE] Nota eliminada de localStorage');
    
    // Guardar en servidor (songs.js)
    await autoSaveToFile();
    
    closeSongNoteModal();
    
    // Actualizar la visualización de notas
    loadNotesForSong(currentSong.id);
    
    console.log(`[SONG NOTE] Nota eliminada de: ${currentSong.title}`);
}

// Toggle menú hamburguesa
function setupMenuToggle() {
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');

    if (!menuBtn || !menuDropdown) return;

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

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Inicializar iconos Lucide
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// ============================================
// CONJUGACIÓN DE VERBOS EN INGLÉS
// ============================================

// Variables globales
let currentVerb = null;

// Elementos del DOM
const verbInput = document.getElementById('verbInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const retryBtn = document.getElementById('retryBtn');

const placeholderSection = document.getElementById('placeholderSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

const verbTitle = document.getElementById('verbTitle');
const basicForms = document.getElementById('basicForms');
const presentSimple = document.getElementById('presentSimple');
const pastSimple = document.getElementById('pastSimple');
const participle = document.getElementById('participle');
const gerund = document.getElementById('gerund');
const negative = document.getElementById('negative');
const errorMessage = document.getElementById('errorMessage');

// Inicialización
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    setupMenuToggle();
    console.log('[VERBS] Página de conjugación inicializada');
}

// Event Listeners
function setupEventListeners() {
    // Búsqueda
    searchBtn.addEventListener('click', searchVerb);
    verbInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchVerb();
    });

    // Limpiar resultados
    clearBtn.addEventListener('click', clearResults);
    retryBtn.addEventListener('click', clearResults);

    // Chips de ejemplo
    const verbChips = document.querySelectorAll('.verb-chip');
    verbChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const verb = chip.dataset.verb;
            verbInput.value = verb;
            searchVerb();
        });
    });
}

// Buscar verbo
async function searchVerb() {
    const verb = verbInput.value.trim().toLowerCase();
    
    if (!verb) {
        alert('Por favor, escribe un verbo');
        return;
    }

    console.log(`[VERBS] Buscando conjugación de: ${verb}`);
    
    // Mostrar loading
    searchBtn.disabled = true;

    try {
        const data = await conjugateVerb(verb);
        displayConjugation(data);
        currentVerb = verb;
    } catch (error) {
        console.error('[VERBS] Error al buscar verbo:', error);
        showError(verb);
    } finally {
        searchBtn.disabled = false;
    }
}

// Llamar a la API de conjugación
async function conjugateVerb(verb) {
    // Usar proxy local para evitar CORS (igual que lyrics)
    const url = `http://localhost:3001/api/conjugate?verb=${encodeURIComponent(verb)}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validar que la respuesta tiene datos útiles
        if (!data || !data.infinitive) {
            throw new Error('Verbo no encontrado');
        }
        
        console.log('[VERBS] Conjugación recibida:', data);
        return data;
    } catch (error) {
        console.error('[VERBS] Error en API:', error);
        throw error;
    }
}

// Mostrar conjugación
function displayConjugation(data) {
    // Ocultar placeholder y error
    placeholderSection.style.display = 'none';
    errorSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Título
    verbTitle.textContent = `Verbo: "${data.infinitive || currentVerb}"`;

    // Formas básicas
    const translation = data.translation || '(sin traducción)';
    basicForms.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">Infinitivo:</span>
            <span class="conjugation-value">${data.infinitive || '-'}</span>
        </div>
        <div class="conjugation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${translation}</span>
        </div>
    `;

    // Presente Simple
    const presentForms = data.present?.split('/') || [data.infinitive, data.infinitive + 's'];
    const presentTranslations = data.translations?.present?.split('/') || [];
    
    presentSimple.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">I/You/We/They:</span>
            <span class="conjugation-value">${presentForms[0] || '-'}</span>
        </div>
        ${presentTranslations[0] ? `
        <div class="conjugation-item translation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${presentTranslations[0]}</span>
        </div>
        ` : ''}
        <div class="conjugation-item">
            <span class="conjugation-label">He/She/It:</span>
            <span class="conjugation-value">${presentForms[1] || '-'}</span>
        </div>
        ${presentTranslations[2] ? `
        <div class="conjugation-item translation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${presentTranslations[2]}</span>
        </div>
        ` : ''}
    `;

    // Pasado Simple
    const pastTranslations = data.translations?.past?.split('/') || [];
    
    pastSimple.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">Todas las personas:</span>
            <span class="conjugation-value">${data.past || '-'}</span>
        </div>
        ${pastTranslations[0] ? `
        <div class="conjugation-item translation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${pastTranslations[0]}</span>
        </div>
        ` : ''}
        ${data.pastContinuous ? `
        <div class="conjugation-item">
            <span class="conjugation-label">Continuo:</span>
            <span class="conjugation-value">${data.pastContinuous}</span>
        </div>
        ` : ''}
    `;

    // Participio
    const participleTranslation = data.translations?.participle || null;
    
    participle.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">Past Participle:</span>
            <span class="conjugation-value">${data.participle || '-'}</span>
        </div>
        ${participleTranslation ? `
        <div class="conjugation-item translation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${participleTranslation}</span>
        </div>
        ` : ''}
        <div class="conjugation-item">
            <span class="conjugation-label">Uso:</span>
            <span class="conjugation-value">Perfect tenses, voz pasiva</span>
        </div>
    `;

    // Gerundio
    const gerundTranslation = data.translations?.gerund || null;
    
    gerund.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">Gerundio (-ing):</span>
            <span class="conjugation-value">${data.gerund || '-'}</span>
        </div>
        ${gerundTranslation ? `
        <div class="conjugation-item translation-item">
            <span class="conjugation-label">Traducción:</span>
            <span class="conjugation-value translation-text">${gerundTranslation}</span>
        </div>
        ` : ''}
        <div class="conjugation-item">
            <span class="conjugation-label">Uso:</span>
            <span class="conjugation-value">Continuous tenses</span>
        </div>
    `;

    // Forma negativa
    const negativePresent = data.present ? `don't/doesn't ${data.infinitive}` : '-';
    const negativePast = data.past ? `didn't ${data.infinitive}` : '-';
    
    negative.innerHTML = `
        <div class="conjugation-item">
            <span class="conjugation-label">Presente:</span>
            <span class="conjugation-value">${negativePresent}</span>
        </div>
        <div class="conjugation-item">
            <span class="conjugation-label">Pasado:</span>
            <span class="conjugation-value">${negativePast}</span>
        </div>
    `;

    // Scroll al inicio de resultados
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Mostrar error
function showError(verb) {
    placeholderSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'flex';
    
    errorMessage.textContent = `No se encontró el verbo "${verb}". Verifica que esté escrito correctamente en inglés.`;
}

// Limpiar resultados
function clearResults() {
    verbInput.value = '';
    verbInput.focus();
    
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    placeholderSection.style.display = 'flex';
    
    currentVerb = null;
}

// Toggle menú hamburguesa
function setupMenuToggle() {
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    
    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.classList.remove('show');
            }
        });
    }
}

// Inicializar iconos Lucide
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

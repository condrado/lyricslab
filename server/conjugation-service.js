// ============================================
// SERVICIO DE CONJUGACIÓN DE VERBOS EN INGLÉS
// ============================================

const http = require('http');

// Base de datos de verbos irregulares comunes
const irregularVerbs = {
    'be': { past: 'was/were', participle: 'been', present: 'am/is/are' },
    'have': { past: 'had', participle: 'had', present: 'have/has' },
    'do': { past: 'did', participle: 'done', present: 'do/does' },
    'go': { past: 'went', participle: 'gone', present: 'go/goes' },
    'get': { past: 'got', participle: 'gotten', present: 'get/gets' },
    'make': { past: 'made', participle: 'made', present: 'make/makes' },
    'see': { past: 'saw', participle: 'seen', present: 'see/sees' },
    'come': { past: 'came', participle: 'come', present: 'come/comes' },
    'take': { past: 'took', participle: 'taken', present: 'take/takes' },
    'know': { past: 'knew', participle: 'known', present: 'know/knows' },
    'give': { past: 'gave', participle: 'given', present: 'give/gives' },
    'find': { past: 'found', participle: 'found', present: 'find/finds' },
    'think': { past: 'thought', participle: 'thought', present: 'think/thinks' },
    'tell': { past: 'told', participle: 'told', present: 'tell/tells' },
    'become': { past: 'became', participle: 'become', present: 'become/becomes' },
    'leave': { past: 'left', participle: 'left', present: 'leave/leaves' },
    'feel': { past: 'felt', participle: 'felt', present: 'feel/feels' },
    'bring': { past: 'brought', participle: 'brought', present: 'bring/brings' },
    'begin': { past: 'began', participle: 'begun', present: 'begin/begins' },
    'keep': { past: 'kept', participle: 'kept', present: 'keep/keeps' },
    'hold': { past: 'held', participle: 'held', present: 'hold/holds' },
    'write': { past: 'wrote', participle: 'written', present: 'write/writes' },
    'stand': { past: 'stood', participle: 'stood', present: 'stand/stands' },
    'hear': { past: 'heard', participle: 'heard', present: 'hear/hears' },
    'let': { past: 'let', participle: 'let', present: 'let/lets' },
    'mean': { past: 'meant', participle: 'meant', present: 'mean/means' },
    'set': { past: 'set', participle: 'set', present: 'set/sets' },
    'meet': { past: 'met', participle: 'met', present: 'meet/meets' },
    'run': { past: 'ran', participle: 'run', present: 'run/runs' },
    'pay': { past: 'paid', participle: 'paid', present: 'pay/pays' },
    'sit': { past: 'sat', participle: 'sat', present: 'sit/sits' },
    'speak': { past: 'spoke', participle: 'spoken', present: 'speak/speaks' },
    'lie': { past: 'lay', participle: 'lain', present: 'lie/lies' },
    'lead': { past: 'led', participle: 'led', present: 'lead/leads' },
    'read': { past: 'read', participle: 'read', present: 'read/reads' },
    'grow': { past: 'grew', participle: 'grown', present: 'grow/grows' },
    'lose': { past: 'lost', participle: 'lost', present: 'lose/loses' },
    'fall': { past: 'fell', participle: 'fallen', present: 'fall/falls' },
    'send': { past: 'sent', participle: 'sent', present: 'send/sends' },
    'build': { past: 'built', participle: 'built', present: 'build/builds' },
    'understand': { past: 'understood', participle: 'understood', present: 'understand/understands' },
    'draw': { past: 'drew', participle: 'drawn', present: 'draw/draws' },
    'break': { past: 'broke', participle: 'broken', present: 'break/breaks' },
    'spend': { past: 'spent', participle: 'spent', present: 'spend/spends' },
    'cut': { past: 'cut', participle: 'cut', present: 'cut/cuts' },
    'rise': { past: 'rose', participle: 'risen', present: 'rise/rises' },
    'drive': { past: 'drove', participle: 'driven', present: 'drive/drives' },
    'buy': { past: 'bought', participle: 'bought', present: 'buy/buys' },
    'wear': { past: 'wore', participle: 'worn', present: 'wear/wears' },
    'choose': { past: 'chose', participle: 'chosen', present: 'choose/chooses' },
    'seek': { past: 'sought', participle: 'sought', present: 'seek/seeks' },
    'throw': { past: 'threw', participle: 'thrown', present: 'throw/throws' },
    'catch': { past: 'caught', participle: 'caught', present: 'catch/catches' },
    'deal': { past: 'dealt', participle: 'dealt', present: 'deal/deals' },
    'win': { past: 'won', participle: 'won', present: 'win/wins' },
    'forget': { past: 'forgot', participle: 'forgotten', present: 'forget/forgets' },
    'sell': { past: 'sold', participle: 'sold', present: 'sell/sells' },
    'fight': { past: 'fought', participle: 'fought', present: 'fight/fights' },
    'teach': { past: 'taught', participle: 'taught', present: 'teach/teaches' },
    'eat': { past: 'ate', participle: 'eaten', present: 'eat/eats' },
    'sing': { past: 'sang', participle: 'sung', present: 'sing/sings' },
    'swim': { past: 'swam', participle: 'swum', present: 'swim/swims' },
    'drink': { past: 'drank', participle: 'drunk', present: 'drink/drinks' },
    'fly': { past: 'flew', participle: 'flown', present: 'fly/flies' },
    'ride': { past: 'rode', participle: 'ridden', present: 'ride/rides' },
    'wake': { past: 'woke', participle: 'woken', present: 'wake/wakes' },
    'blow': { past: 'blew', participle: 'blown', present: 'blow/blows' },
    'shake': { past: 'shook', participle: 'shaken', present: 'shake/shakes' }
};

/**
 * Obtener conjugación de un verbo
 * @param {string} verb - Verbo en infinitivo
 * @returns {Promise<Object>} - Objeto con conjugaciones
 */
async function getConjugation(verb) {
    const normalizedVerb = verb.toLowerCase().trim();
    
    console.log(`📚 Conjugando: ${normalizedVerb}`);
    
    // Intentar API externa primero (si disponible)
    try {
        const externalData = await fetchFromExternalAPI(normalizedVerb);
        if (externalData) {
            console.log(`✅ Conjugación de API externa para: ${normalizedVerb}`);
            return externalData;
        }
    } catch (error) {
        console.log(`   ⚠️ API externa no disponible: ${error.message}`);
    }
    
    // Generar conjugación localmente
    const conjugation = createBasicConjugation(normalizedVerb);
    console.log(`✅ Conjugación generada localmente para: ${normalizedVerb}`);
    return conjugation;
}

/**
 * Intentar obtener de API externa (Verbix)
 */
function fetchFromExternalAPI(verb) {
    return new Promise((resolve, reject) => {
        const url = `http://api.verbix.com/conjugator/html?text=${encodeURIComponent(verb)}&language=en`;
        
        const request = http.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                if (response.statusCode === 200 && data.includes('Present')) {
                    resolve(parseVerbixHTML(verb, data));
                } else {
                    reject(new Error('No data'));
                }
            });
        });
        
        request.on('error', reject);
        request.setTimeout(3000, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
    });
}

/**
 * Parsear respuesta HTML de Verbix
 */
function parseVerbixHTML(verb, html) {
    // Por ahora usar generación local
    // TODO: Implementar parser HTML si se necesita
    return createBasicConjugation(verb);
}

/**
 * Crear conjugación usando reglas de inglés
 */
function createBasicConjugation(verb) {
    let past, participle, present, gerund;
    
    // Verificar si es irregular
    if (irregularVerbs[verb]) {
        const irregular = irregularVerbs[verb];
        past = irregular.past;
        participle = irregular.participle;
        present = irregular.present;
    } else {
        // Aplicar reglas regulares
        present = `${verb}/${addS(verb)}`;
        past = addEd(verb);
        participle = addEd(verb);
    }
    
    gerund = addIng(verb);
    
    const translation = getVerbTranslation(verb);
    const translations = getFormTranslations(verb, { present, past, participle, gerund }, translation);

    return {
        infinitive: verb,
        present: present,
        past: past,
        participle: participle,
        gerund: gerund,
        translation: translation,
        translations: translations
    };
}

/**
 * Obtener traducciones para cada forma verbal
 */
function getFormTranslations(verb, forms, baseTranslation) {
    if (!baseTranslation) return null;
    
    // Obtener primera traducción (la más común)
    const mainTranslation = baseTranslation.split('/')[0];
    
    return {
        infinitive: mainTranslation,
        present: conjugateSpanish(mainTranslation, 'present'),
        past: conjugateSpanish(mainTranslation, 'past'),
        participle: conjugateSpanish(mainTranslation, 'participle'),
        gerund: conjugateSpanish(mainTranslation, 'gerund')
    };
}

/**
 * Conjugar verbo español a diferentes tiempos
 */
function conjugateSpanish(spanishVerb, tense) {
    // Verbos irregulares comunes en español
    const irregularSpanish = {
        'ser': {
            present: 'soy/eres/es/somos/sois/son',
            past: 'fui/fuiste/fue/fuimos/fuisteis/fueron',
            participle: 'sido',
            gerund: 'siendo'
        },
        'estar': {
            present: 'estoy/estás/está/estamos/estáis/están',
            past: 'estuve/estuviste/estuvo/estuvimos/estuvisteis/estuvieron',
            participle: 'estado',
            gerund: 'estando'
        },
        'tener': {
            present: 'tengo/tienes/tiene/tenemos/tenéis/tienen',
            past: 'tuve/tuviste/tuvo/tuvimos/tuvisteis/tuvieron',
            participle: 'tenido',
            gerund: 'teniendo'
        },
        'hacer': {
            present: 'hago/haces/hace/hacemos/hacéis/hacen',
            past: 'hice/hiciste/hizo/hicimos/hicisteis/hicieron',
            participle: 'hecho',
            gerund: 'haciendo'
        },
        'ir': {
            present: 'voy/vas/va/vamos/vais/van',
            past: 'fui/fuiste/fue/fuimos/fuisteis/fueron',
            participle: 'ido',
            gerund: 'yendo'
        },
        'venir': {
            present: 'vengo/vienes/viene/venimos/venís/vienen',
            past: 'vine/viniste/vino/vinimos/vinisteis/vinieron',
            participle: 'venido',
            gerund: 'viniendo'
        },
        'decir': {
            present: 'digo/dices/dice/decimos/decís/dicen',
            past: 'dije/dijiste/dijo/dijimos/dijisteis/dijeron',
            participle: 'dicho',
            gerund: 'diciendo'
        },
        'dar': {
            present: 'doy/das/da/damos/dais/dan',
            past: 'di/diste/dio/dimos/disteis/dieron',
            participle: 'dado',
            gerund: 'dando'
        },
        'ver': {
            present: 'veo/ves/ve/vemos/veis/ven',
            past: 'vi/viste/vio/vimos/visteis/vieron',
            participle: 'visto',
            gerund: 'viendo'
        },
        'saber': {
            present: 'sé/sabes/sabe/sabemos/sabéis/saben',
            past: 'supe/supiste/supo/supimos/supisteis/supieron',
            participle: 'sabido',
            gerund: 'sabiendo'
        },
        'conocer': {
            present: 'conozco/conoces/conoce/conocemos/conocéis/conocen',
            past: 'conocí/conociste/conoció/conocimos/conocisteis/conocieron',
            participle: 'conocido',
            gerund: 'conociendo'
        },
        'poner': {
            present: 'pongo/pones/pone/ponemos/ponéis/ponen',
            past: 'puse/pusiste/puso/pusimos/pusisteis/pusieron',
            participle: 'puesto',
            gerund: 'poniendo'
        },
        'poder': {
            present: 'puedo/puedes/puede/podemos/podéis/pueden',
            past: 'pude/pudiste/pudo/pudimos/pudisteis/pudieron',
            participle: 'podido',
            gerund: 'pudiendo'
        },
        'querer': {
            present: 'quiero/quieres/quiere/queremos/queréis/quieren',
            past: 'quise/quisiste/quiso/quisimos/quisisteis/quisieron',
            participle: 'querido',
            gerund: 'queriendo'
        }
    };
    
    // Buscar verbo irregular
    if (irregularSpanish[spanishVerb]) {
        return irregularSpanish[spanishVerb][tense];
    }
    
    // Conjugación regular basada en terminación
    if (spanishVerb.endsWith('ar')) {
        const root = spanishVerb.slice(0, -2);
        switch (tense) {
            case 'present':
                return `${root}o/${root}as/${root}a/${root}amos/${root}áis/${root}an`;
            case 'past':
                return `${root}é/${root}aste/${root}ó/${root}amos/${root}asteis/${root}aron`;
            case 'participle':
                return `${root}ado`;
            case 'gerund':
                return `${root}ando`;
        }
    } else if (spanishVerb.endsWith('er')) {
        const root = spanishVerb.slice(0, -2);
        switch (tense) {
            case 'present':
                return `${root}o/${root}es/${root}e/${root}emos/${root}éis/${root}en`;
            case 'past':
                return `${root}í/${root}iste/${root}ió/${root}imos/${root}isteis/${root}ieron`;
            case 'participle':
                return `${root}ido`;
            case 'gerund':
                return `${root}iendo`;
        }
    } else if (spanishVerb.endsWith('ir')) {
        const root = spanishVerb.slice(0, -2);
        switch (tense) {
            case 'present':
                return `${root}o/${root}es/${root}e/${root}imos/${root}ís/${root}en`;
            case 'past':
                return `${root}í/${root}iste/${root}ió/${root}imos/${root}isteis/${root}ieron`;
            case 'participle':
                return `${root}ido`;
            case 'gerund':
                return `${root}iendo`;
        }
    }
    
    // Si no termina en ar/er/ir, asumir que es una palabra (como "obtener", "conseguir")
    return spanishVerb;
}

/**
 * Obtener traducción del verbo al español
 */
function getVerbTranslation(verb) {
    const translations = {
        'be': 'ser/estar',
        'have': 'tener',
        'do': 'hacer',
        'say': 'decir',
        'go': 'ir',
        'get': 'obtener/conseguir',
        'make': 'hacer',
        'know': 'saber/conocer',
        'think': 'pensar',
        'take': 'tomar/llevar',
        'see': 'ver',
        'come': 'venir',
        'want': 'querer',
        'use': 'usar',
        'find': 'encontrar',
        'give': 'dar',
        'tell': 'decir/contar',
        'work': 'trabajar',
        'call': 'llamar',
        'try': 'intentar',
        'ask': 'preguntar',
        'need': 'necesitar',
        'feel': 'sentir',
        'become': 'convertirse',
        'leave': 'dejar/salir',
        'put': 'poner',
        'mean': 'significar',
        'keep': 'mantener',
        'let': 'dejar/permitir',
        'begin': 'comenzar',
        'seem': 'parecer',
        'help': 'ayudar',
        'show': 'mostrar',
        'hear': 'oír',
        'play': 'jugar/tocar',
        'run': 'correr',
        'move': 'mover',
        'live': 'vivir',
        'believe': 'creer',
        'bring': 'traer',
        'happen': 'suceder',
        'write': 'escribir',
        'sit': 'sentar',
        'stand': 'estar de pie',
        'lose': 'perder',
        'pay': 'pagar',
        'meet': 'encontrar/conocer',
        'include': 'incluir',
        'continue': 'continuar',
        'set': 'establecer',
        'learn': 'aprender',
        'change': 'cambiar',
        'lead': 'liderar',
        'understand': 'entender',
        'watch': 'ver/mirar',
        'follow': 'seguir',
        'stop': 'parar',
        'create': 'crear',
        'speak': 'hablar',
        'read': 'leer',
        'spend': 'gastar/pasar',
        'grow': 'crecer',
        'open': 'abrir',
        'walk': 'caminar',
        'win': 'ganar',
        'teach': 'enseñar',
        'offer': 'ofrecer',
        'remember': 'recordar',
        'love': 'amar',
        'consider': 'considerar',
        'appear': 'aparecer',
        'buy': 'comprar',
        'serve': 'servir',
        'die': 'morir',
        'send': 'enviar',
        'build': 'construir',
        'stay': 'quedarse',
        'fall': 'caer',
        'cut': 'cortar',
        'reach': 'alcanzar',
        'kill': 'matar',
        'raise': 'levantar',
        'pass': 'pasar',
        'sell': 'vender',
        'decide': 'decidir',
        'return': 'regresar',
        'explain': 'explicar',
        'hope': 'esperar',
        'develop': 'desarrollar',
        'carry': 'llevar',
        'break': 'romper',
        'receive': 'recibir',
        'agree': 'acordar',
        'support': 'apoyar',
        'hit': 'golpear',
        'produce': 'producir',
        'eat': 'comer',
        'cover': 'cubrir',
        'catch': 'atrapar',
        'draw': 'dibujar',
        'choose': 'elegir',
        'cause': 'causar',
        'point': 'señalar',
        'allow': 'permitir',
        'wait': 'esperar',
        'turn': 'girar',
        'start': 'comenzar',
        'provide': 'proveer',
        'expect': 'esperar',
        'suggest': 'sugerir',
        'involve': 'involucrar',
        'report': 'reportar',
        'hold': 'sostener',
        'require': 'requerir',
        'pull': 'jalar',
        'represent': 'representar',
        'sing': 'cantar',
        'swim': 'nadar',
        'drink': 'beber',
        'fly': 'volar',
        'ride': 'montar',
        'drive': 'conducir',
        'throw': 'lanzar',
        'wear': 'llevar/vestir',
        'fight': 'pelear',
        'forget': 'olvidar',
        'wake': 'despertar',
        'blow': 'soplar',
        'shake': 'sacudir',
        'lie': 'mentir/yacer',
        'deal': 'tratar',
        'seek': 'buscar',
        'rise': 'elevar'
    };
    
    return translations[verb] || null;
}

/**
 * Añadir -s/-es para tercera persona presente
 */
function addS(verb) {
    if (verb.endsWith('s') || verb.endsWith('sh') || verb.endsWith('ch') || 
        verb.endsWith('x') || verb.endsWith('z')) {
        return verb + 'es';
    } else if (verb.endsWith('y') && !isVowel(verb[verb.length - 2])) {
        return verb.slice(0, -1) + 'ies';
    } else if (verb.endsWith('o')) {
        return verb + 'es';
    }
    return verb + 's';
}

/**
 * Añadir -ed para pasado/participio
 */
function addEd(verb) {
    if (verb.endsWith('e')) {
        return verb + 'd';
    } else if (verb.endsWith('y') && !isVowel(verb[verb.length - 2])) {
        return verb.slice(0, -1) + 'ied';
    } else if (shouldDouble(verb)) {
        return verb + verb[verb.length - 1] + 'ed';
    }
    return verb + 'ed';
}

/**
 * Añadir -ing para gerundio
 */
function addIng(verb) {
    if (verb.endsWith('ie')) {
        return verb.slice(0, -2) + 'ying';
    } else if (verb.endsWith('e') && verb.length > 2 && !verb.endsWith('ee')) {
        return verb.slice(0, -1) + 'ing';
    } else if (shouldDouble(verb)) {
        return verb + verb[verb.length - 1] + 'ing';
    }
    return verb + 'ing';
}

/**
 * Verificar si es vocal
 */
function isVowel(char) {
    return char && 'aeiou'.includes(char.toLowerCase());
}

/**
 * Verificar si debe duplicar consonante final
 */
function shouldDouble(verb) {
    if (verb.length < 3) return false;
    
    const last = verb[verb.length - 1];
    const secondLast = verb[verb.length - 2];
    const thirdLast = verb[verb.length - 3];
    
    // No duplicar w, x, y
    if ('wxy'.includes(last)) return false;
    
    // Patrón: consonante + vocal + consonante (ej: stop, run, prefer)
    return !isVowel(last) && isVowel(secondLast) && !isVowel(thirdLast);
}

module.exports = {
    getConjugation
};

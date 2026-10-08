import axios from 'axios';
import { store } from '../store';
import { toSttReadyWav } from './audioConvert';

// Service URLs (Render endpoints by default, configurable via REACT_APP_* environment variables)
const API_BASE_URL = process.env.REACT_APP_AGENT_URL || 'https://wakilibot-agent-0wm0.onrender.com';
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'https://wakilibot-main-tum2.onrender.com';
const ATEKER_TRANSLATION_API_URL = 'https://translate.atekervoices.com/translate';

// Speech and translation are routed through the agent backend, which reaches the Ateker
// services server-side. This avoids CORS issues and keeps credentials off the client.
// See services/sparkTTS.js for the WebSocket TTS streaming path.
const ATEKER_LANGUAGE_MAP = {
  en: { translation: 'eng', asr: 'eng', tts: 'eng' },
  sw: { translation: 'swh', asr: 'swa', tts: 'swa' },
  lg: { translation: 'lug', asr: 'lug', tts: 'lug' },
  ac: { translation: 'ach', asr: 'ach', tts: 'ach' },
  at: { translation: 'teo', asr: 'teo', tts: 'teo' },
  nyn: { translation: 'nyn', asr: 'nyn', tts: 'nyn' },
  xog: { translation: 'xog', asr: 'xog', tts: 'xog' },
};

const LANGUAGE_ALIASES = {
  english: 'en', eng: 'en', en: 'en',
  swahili: 'sw', swa: 'sw', swh: 'sw', sw: 'sw',
  luganda: 'lg', lug: 'lg', lg: 'lg',
  acholi: 'ac', ach: 'ac', ac: 'ac',
  ateso: 'at', teo: 'at', at: 'at',
  runyankole: 'nyn', nyn: 'nyn',
  lusoga: 'xog', xog: 'xog',
};

const normalizeLanguageCode = (language) => {
  if (!language) return 'en';
  const normalized = String(language).trim().toLowerCase();
  const resolved = LANGUAGE_ALIASES[normalized] || normalized;
  if (Object.prototype.hasOwnProperty.call(ATEKER_LANGUAGE_MAP, resolved)) {
    return resolved;
  }
  return 'en';
};

const mapLanguageForService = (language, service = 'translation') => {
  const normalized = normalizeLanguageCode(language);
  const mapping = ATEKER_LANGUAGE_MAP[normalized] || { translation: 'eng', asr: 'eng', tts: 'eng' };
  return mapping[service] || mapping.translation || 'eng';
};

const mapToAtekerLanguage = (language) => mapLanguageForService(language, 'translation');
const mapToAtekerAsrLanguage = (language) => mapLanguageForService(language, 'asr');
const mapToAtekerTtsLanguage = (language) => mapLanguageForService(language, 'tts');

const sanitizeSpeechText = (text) => {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    .replace(/https?:\/\/[^\s]+/gi, ' ')
    .replace(/www\.[^\s]+/gi, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\b(?:Reference|References|Source|Sources|URL|URLs)\b[:-]?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

const extractHumanReadableCaption = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    return sanitizeSpeechText(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractHumanReadableCaption(item))
      .filter(Boolean)
      .join('. ');
  }

  if (typeof value === 'object') {
    const flatParts = [];
    const keysToRead = ['caption', 'title', 'description', 'summary', 'generation_info', 'generationInfo', 'message', 'text'];

    for (const key of keysToRead) {
      if (key in value) {
        const extracted = extractHumanReadableCaption(value[key]);
        if (extracted) flatParts.push(extracted);
      }
    }

    if (!flatParts.length) {
      return Object.values(value)
        .map((item) => extractHumanReadableCaption(item))
        .filter(Boolean)
        .join('. ');
    }

    return flatParts.join('. ');
  }

  return '';
};

const prepareTTSContent = (text, responseData = null) => {
  const parts = [];

  const primaryText = sanitizeSpeechText(text);
  if (primaryText) parts.push(primaryText);

  if (responseData) {
    const responseDataValues = [];

    const candidateKeys = ['caption', 'image_caption', 'imageCaption', 'description', 'summary', 'generation_info', 'generationInfo'];
    for (const key of candidateKeys) {
      if (responseData[key]) {
        const sentence = extractHumanReadableCaption(responseData[key]);
        if (sentence) responseDataValues.push(sentence);
      }
    }

    if (responseDataValues.length) {
      parts.push(responseDataValues.join('. '));
    }
  }

  const composed = parts.join('. ')
    .replace(/\s+/g, ' ')
    .trim();

  return composed || 'Here is the response.';
};

// Browser locale per supported language, used when the reply is spoken with a voice
// installed on the device. Luganda, Ateso, Acholi and Runyankole have no widely shipped
// locale yet, so those fall back to a Ugandan English voice where one exists.
const SPEECH_LOCALES = {
  en: 'en-UG',
  sw: 'sw-KE',
  lg: 'en-UG',
  ac: 'en-UG',
  at: 'en-UG',
  nyn: 'en-UG',
  xog: 'en-UG',
};

const getSpeechLocale = (language) => SPEECH_LOCALES[normalizeLanguageCode(language)] || 'en-UG';

/**
 * Turn a rendered chat answer into something worth reading aloud.
 *
 * Markdown structure (**bold**, bullets, headings) is stripped because it is synthesised
 * as pauses or noise, and links are dropped because a listener cannot follow them. Phone
 * numbers are deliberately kept and written out in spoken groups - the CTDRU helpline is
 * often the single most useful thing in a reply, and the previous cleaner deleted it.
 */
const cleanSpeechText = (text) => {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*?([^*]*)\*\*?/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.[^\s]+/gi, ' ');

  // "+256-41-4230060" reads as nothing; spaced digits read as a number.
  cleaned = cleaned.replace(/\+?(\d{2,4})[-.\s]?(\d{2,4})[-.\s]?(\d{3,10})\b/g, (_m, a, b, c) =>
    `${a} ${b} ${c}`.trim()
  );

  cleaned = cleaned
    .replace(/[|{}<>~]/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

const translateTextClientSide = async (text, sourceLanguage, targetLanguage = 'en') => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text || '';
  }

  const normalizedSource = normalizeLanguageCode(sourceLanguage);
  const normalizedTarget = normalizeLanguageCode(targetLanguage);

  if (normalizedSource === normalizedTarget) {
    return text;
  }

  try {
    const response = await fetch(ATEKER_TRANSLATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_lang: mapToAtekerLanguage(normalizedSource),
        target_lang: mapToAtekerLanguage(normalizedTarget),
      }),
    });

    if (!response.ok) {
      console.warn('🌍 [CLIENT TRANSLATION] Translation failed:', response.status, await response.text());
      return text;
    }

    const data = await response.json();
    return data?.translated_text || text;
  } catch (error) {
    console.warn('🌍 [CLIENT TRANSLATION] Error translating locally:', error);
    return text;
  }
};

// Get current language from Redux store
const getCurrentLanguageFromStore = () => {
  try {
    const state = store.getState();
    const language = state.language?.selectedLanguage || 'en';
    console.log('🌍 [API DEBUG] getCurrentLanguageFromStore() returned:', language);
    return language;
  } catch (error) {
    console.warn('🌍 [API DEBUG] Error accessing Redux store:', error);
    return getCurrentLanguageFallback();
  }
};

// Fallback language getter (should use Redux store when available)
const getCurrentLanguageFallback = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      const language = localStorage.getItem('wakilibot_language') || 'en';
      console.log('🌍 [API DEBUG] getCurrentLanguageFallback() returned:', language);
      return language;
    }
  } catch (error) {
    console.warn('🌍 [API DEBUG] Error accessing localStorage:', error);
  }
  console.log('🌍 [API DEBUG] getCurrentLanguageFallback() fallback to: en');
  return 'en';
};

// Generate a unique user ID for this session (guest-capable)
const generateUserId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store user ID in session storage for persistence
const getUserId = () => {
  let userId = sessionStorage.getItem('ctdru_user_id');
  if (!userId) {
    userId = generateUserId();
    sessionStorage.setItem('ctdru_user_id', userId);
  }
  return userId;
};

/** Create or return a guest session identity for ChatGPT-style try-without-login. */
const ensureGuestUser = () => {
  try {
    const existing = JSON.parse(sessionStorage.getItem('wakilibot_guest') || 'null');
    if (existing?.user_id && existing?.isGuest) {
      sessionStorage.setItem('ctdru_user_id', existing.user_id);
      return existing;
    }
  } catch {
    /* ignore */
  }
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('ctdru_user_id', guestId);
  const guest = {
    user_id: guestId,
    full_name: 'Guest',
    isGuest: true,
    preferred_language: 'english',
  };
  sessionStorage.setItem('wakilibot_guest', JSON.stringify(guest));
  return guest;
};

// Store conversation ID in session storage for persistence
const getConversationId = () => {
  return sessionStorage.getItem('ctdru_conversation_id');
};

const setConversationId = (conversationId) => {
  if (conversationId) {
    sessionStorage.setItem('ctdru_conversation_id', conversationId);
  }
};

const clearConversationId = () => {
  sessionStorage.removeItem('ctdru_conversation_id');
};

// Get the appropriate user ID (authenticated user from localStorage or session user)
const getAppropriateUserId = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('wakilibot_user'));
    if (storedUser && storedUser.user_id) {
      console.log('Using authenticated user ID:', storedUser.user_id);
      return storedUser.user_id;
    }
  } catch (error) {
    console.warn('Could not parse stored user data:', error);
  }

  const sessionUserId = getUserId();
  console.log('Using session user ID:', sessionUserId);
  return sessionUserId;
};

// Mirror of GET /intents on the agent, used only when the catalog cannot be fetched
// (offline, agent restarting) so the topic menu never disappears from the chat screen.
// Ids must stay aligned with Wakilibot-agent/utils/intent_catalog.py.
// Translations cover all 7 supported UI languages.
const FALLBACK_INTENTS_BY_LANG = {
  en: [
    {
      id: 'submit_complaint',
      label: 'File a complaint',
      description: 'Something went wrong with a provider and you want CTDRU to act on it.',
      icon: 'file-text',
      examples: [
        'MTN MoMo sent my money to the wrong number and they refuse to reverse it',
        'My bank deducted a subscription fee I never authorised',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Report fraud',
      description: 'Urgent: scams, PIN theft, SIM swap or an account you did not touch.',
      icon: 'shield-alert',
      examples: ['Someone withdrew money from my wallet after asking for my PIN'],
    },
    {
      id: 'check_status',
      label: 'Check complaint status',
      description: 'Follow up on a case you already filed with a complaint ID.',
      icon: 'search-check',
      examples: ['What is the status of complaint CTDRU-283746?'],
    },
    {
      id: 'consumer_rights',
      label: 'Know my rights',
      description: 'What Ugandan financial regulations entitle you to expect from a provider.',
      icon: 'scale',
      examples: ['Is my bank allowed to charge me for a failed transaction?'],
    },
    {
      id: 'general_inquiry',
      label: 'Ask about CTDRU',
      description: 'General questions about the platform, its services and how intake works.',
      icon: 'circle-help',
      examples: ['What is CTDRU and how does it help me?'],
    },
    {
      id: 'auto',
      label: 'Chat freely',
      description: 'No topic selected - the assistant works out what you need.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  sw: [
    {
      id: 'submit_complaint',
      label: 'Wasilisha malalamiko',
      description: 'Kuna tatizo na mtoa huduma na unataka CTDRU ichukue hatua.',
      icon: 'file-text',
      examples: [
        'MTN MoMo ilituma pesa zangu kwa nambari mbaya na wanakataa kuirejesha',
        'Benki yangu ilikata ada ambayo sikuidhini',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Ripoti ulaghai',
      description: 'Dharura: udanganyifu, wizi wa PIN, ubadilishaji wa SIM au akaunti uliyoguswa.',
      icon: 'shield-alert',
      examples: ['Mtu alitoa pesa kwenye mkoba wangu baada ya kuniuliza PIN yangu'],
    },
    {
      id: 'check_status',
      label: 'Angalia hali ya malalamiko',
      description: 'Fuatilia kesi uliyowasilisha tayari ukitumia kitambulisho cha malalamiko.',
      icon: 'search-check',
      examples: ['Hali ya malalamiko CTDRU-283746 ni nini?'],
    },
    {
      id: 'consumer_rights',
      label: 'Jua haki zangu',
      description: 'Kanuni za fedha za Uganda zinakupa haki gani kutoka kwa mtoa huduma.',
      icon: 'scale',
      examples: ['Je, benki yangu inaruhusiwa kunilipisha ada kwa muamala ulioshindwa?'],
    },
    {
      id: 'general_inquiry',
      label: 'Uliza kuhusu CTDRU',
      description: 'Maswali ya jumla kuhusu jukwaa, huduma zake na jinsi ya kuwasilisha.',
      icon: 'circle-help',
      examples: ['CTDRU ni nini na inanisaidiaje?'],
    },
    {
      id: 'auto',
      label: 'Zungumza huru',
      description: 'Hakuna mada iliyochaguliwa - msaidizi ataamua unachohitaji.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  lg: [
    {
      id: 'submit_complaint',
      label: 'Waayo obukaaba',
      description: 'Kintu kibi kyatuuka n\'omuweereza era oyagala CTDRU ikole.',
      icon: 'file-text',
      examples: [
        'MTN MoMo yatuma ssente zange ku nambala endala era baakakamira okuzizzaayo',
        'Ebbanka lyange lyakwata ssente ze sinanukula',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Buulira obulimba',
      description: 'Omutawaana: okulimba, okuba PIN, okusindika SIM oba akawunti gye toakwata.',
      icon: 'shield-alert',
      examples: ['Omuntu yava n\'ensimbi mu ppuusa lyange ng\'abuuza PIN yange'],
    },
    {
      id: 'check_status',
      label: 'Kebera embeera y\'obukaaba',
      description: 'Goberera kesi gye wawaayo n\'endagaano y\'obukaaba.',
      icon: 'search-check',
      examples: ['Embeera y\'obukaaba CTDRU-283746 gy\'iri?'],
    },
    {
      id: 'consumer_rights',
      label: 'Manya eddembe lyange',
      description: 'Amateeka g\'ensimbi g\'Uganda agakuwa eddembe ki okuva eri omuweereza.',
      icon: 'scale',
      examples: ['Ebbanka lyange liyinzika okusoola omusolo ku nkola eyanguyirwako?'],
    },
    {
      id: 'general_inquiry',
      label: 'Buuza ku CTDRU',
      description: 'Ebibuuzo by\'enjawulo ku platform, emikolere n\'engeri y\'okuwaayo.',
      icon: 'circle-help',
      examples: ['CTDRU kye ki era kiyambiziangwa atya?'],
    },
    {
      id: 'auto',
      label: 'Ganira obwereere',
      description: 'Tekigatta kirendedwa - omuyambi alaba gy\'oyagala.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  ac: [
    {
      id: 'submit_complaint',
      label: 'Cwal lok me peko',
      description: 'Gin mogo olare ki lakor kit ma imito CTDRU otime tic.',
      icon: 'file-text',
      examples: [
        'MTN MoMo ocwalo moni mera bot dano marac ci gikwero ciko odwogo',
        'Bang mera ocako lim me rwee ma pe amiyo',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Tyen lok me twero',
      description: 'Pek: twero, kayo PIN, sim swap onyo akaunti ma pe ibedo iye.',
      icon: 'shield-alert',
      examples: ['Dano ocako moni ki ppuusa mera ka openyo PIN mera'],
    },
    {
      id: 'check_status',
      label: 'Nen kit me lok',
      description: 'Lubo kec ma icwalo keni ki namba me lok.',
      icon: 'search-check',
      examples: ['Kit me lok CTDRU-283746 ango?'],
    },
    {
      id: 'consumer_rights',
      label: 'Ngi twero mera',
      description: 'Cik me lim me Uganda miyomi twero mene ki lakor.',
      icon: 'scale',
      examples: ['Bang mera twero coko lim ki tyen ma pe otimme maber?'],
    },
    {
      id: 'general_inquiry',
      label: 'Penyi lok me CTDRU',
      description: 'Penyo me nyig nying ku platform, tic me en ki kit me cwalo.',
      icon: 'circle-help',
      examples: ['CTDRU en ango ci konyo niŋ?'],
    },
    {
      id: 'auto',
      label: 'Lok maber',
      description: 'Pe tye lok ma giryemo - lakonyi neno gin ma imito.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  at: [
    {
      id: 'submit_complaint',
      label: 'Tuur apeny me akilit',
      description: 'Aimukar aca otimme ki lakor ci imito CTDRU otim tic.',
      icon: 'file-text',
      examples: [
        'MTN MoMo otuur moni mera i nambala adiet ci gikwero ituyet',
        'Benki mera oteer lim ma pe amio',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Tyen lok me twero',
      description: 'Pek: twero, kayo PIN, sim swap onyo akaunti ma pe ibet iye.',
      icon: 'shield-alert',
      examples: ['Aimukar oteer moni ki ppuusa mera ka openyo PIN mera'],
    },
    {
      id: 'check_status',
      label: 'Nen kit me apeny',
      description: 'Lubo kec ma ituur keni ki namba me apeny.',
      icon: 'search-check',
      examples: ['Kit me apeny CTDRU-283746 ango?'],
    },
    {
      id: 'consumer_rights',
      label: 'Ngi twero mera',
      description: 'Cik me lim me Uganda miyomi twero mene ki lakor.',
      icon: 'scale',
      examples: ['Benki mera twero coko lim ki aimukar ma pe otimme maber?'],
    },
    {
      id: 'general_inquiry',
      label: 'Penyi lok me CTDRU',
      description: 'Penyo me nyig nying ku platform, tic me en ki kit me tuur.',
      icon: 'circle-help',
      examples: ['CTDRU en ango ci konyo niŋ?'],
    },
    {
      id: 'auto',
      label: 'Eong akeresi',
      description: 'Ere eong aimukar - aikonu aneno gin ma imito.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  nyn: [
    {
      id: 'submit_complaint',
      label: 'Tanga obukaaba',
      description: 'Ekintu kibi kyatuuka n\'omuweereza era oyagala CTDRU ikore.',
      icon: 'file-text',
      examples: [
        'MTN MoMo yatumire ssente zange ku nambari endala era baakakamira okuzibweza',
        'Ebbanka ryange ryakwatira ssente ze sinakubagiranwa',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Tuura oburyarya',
      description: 'Omutawaana: okulimba, okuba PIN, SIM swap onyo akawunti gye toakwata.',
      icon: 'shield-alert',
      examples: ['Omuntu yakuura ensimbi mu ppuusa ryange akanyuza PIN yange'],
    },
    {
      id: 'check_status',
      label: 'Kebera embeera y\'obukaaba',
      description: 'Goberera ekibiina gye watangiire n\'endagaano y\'obukaaba.',
      icon: 'search-check',
      examples: ['Embeera y\'obukaaba CTDRU-283746 ey\'ohe?'],
    },
    {
      id: 'consumer_rights',
      label: 'Manya amafaranga game',
      description: 'Amateeka g\'ensimbi g\'Uganda agakuha eddembe ki okuva eri omuweereza.',
      icon: 'scale',
      examples: ['Ebbanka ryange riyinzika okusoora omusoro ku nkora eyongirwako?'],
    },
    {
      id: 'general_inquiry',
      label: 'Buuza ku CTDRU',
      description: 'Ebibuuzo by\'enjawulo ku platform, emikorere n\'enkora y\'okutanga.',
      icon: 'circle-help',
      examples: ['CTDRU ni eki era erikora nihe?'],
    },
    {
      id: 'auto',
      label: 'Gamba obwereere',
      description: 'Nta kiraka kihangirwe - omujuni azironda ebirikukendeera.',
      icon: 'sparkles',
      examples: [],
    },
  ],
  xog: [
    {
      id: 'submit_complaint',
      label: 'Waaya obukaaba',
      description: 'Kintu kibi kyafuuka n\'omuweereza era oyagala CTDRU ikole.',
      icon: 'file-text',
      examples: [
        'MTN MoMo yatumya ssente zange ku nambala endala era baakakamira okuzizzawo',
        'Ebbanka lyange lyakwata ssente ze sinanukula',
      ],
    },
    {
      id: 'fraud_alert',
      label: 'Buulira obulimba',
      description: 'Omutawaana: okulimba, okuba PIN, SIM swap oba akawunti gye toakwata.',
      icon: 'shield-alert',
      examples: ['Omuntu yakuula ensimbi mu ppuusa lyange ng\'abuuza PIN yange'],
    },
    {
      id: 'check_status',
      label: 'Kebera embeera y\'obukaaba',
      description: 'Goberera ekibiina gye wawaaya n\'endagaano y\'obukaaba.',
      icon: 'search-check',
      examples: ['Embeera y\'obukaaba CTDRU-283746 gy\'iri?'],
    },
    {
      id: 'consumer_rights',
      label: 'Manya eddembe lyange',
      description: 'Amateeka g\'ensimbi g\'Uganda agakuwa eddembe ki okuva eri omuweereza.',
      icon: 'scale',
      examples: ['Ebbanka lyange liyinzika okusoola omusoro ku nkola eyaliwa?'],
    },
    {
      id: 'general_inquiry',
      label: 'Buuza ku CTDRU',
      description: 'Ebibuuzo by\'enjawulo ku platform, emikolere n\'engeri y\'okuwaayo.',
      icon: 'circle-help',
      examples: ['CTDRU kye ki era kiyambiria atya?'],
    },
    {
      id: 'auto',
      label: 'Ganira obwereere',
      description: 'Tekigatta tekyarendedwa - omuyambi alaba gy\'oyagala.',
      icon: 'sparkles',
      examples: [],
    },
  ],
};

// Helper: get the right fallback intent list for a given language code
const getFallbackIntents = (lang) => FALLBACK_INTENTS_BY_LANG[lang] || FALLBACK_INTENTS_BY_LANG.en;

// Build a lookup map: intent id → translated entry, for quick overlay
const getTranslationMap = (lang) => {
  const list = getFallbackIntents(lang);
  return Object.fromEntries(list.map((item) => [item.id, item]));
};

// Overlay our local translations onto agent-returned intents.
// The agent keeps authority over which intents exist (id, icon); we supply the
// user-visible text (label, description, examples) from our translation table
// so cards always appear in the selected language regardless of what the agent returns.
const localiseIntents = (agentIntents, lang) => {
  if (lang === 'en') return agentIntents; // English is already correct from the agent
  const map = getTranslationMap(lang);
  return agentIntents.map((intent) => {
    const local = map[intent.id];
    if (!local) return intent; // unknown intent → leave as-is (agent text)
    return {
      ...intent,
      label: local.label,
      description: local.description,
      examples: local.examples.length > 0 ? local.examples : intent.examples,
    };
  });
};

const api = {
  // Fetch the intent menu the agent exposes; the chat screen renders it as a topic
  // selector and echoes the chosen id back on every message so the agent can skip
  // its own intent classification.
  getIntents: async (language = 'en') => {
    const fallback = getFallbackIntents(language);
    try {
      // Pass the current UI language so the agent can return localised labels when supported.
      const response = await axios.get(`${API_BASE_URL}/intents`, {
        params: { language },
        timeout: 8000,
      });
      const intents = Array.isArray(response.data?.intents) ? response.data.intents : null;
      if (!intents || intents.length === 0) {
        return { intents: fallback, default: 'auto', source: 'fallback' };
      }
      // Apply local translations on top of whatever the agent returned
      return { intents: localiseIntents(intents, language), default: response.data.default || 'auto', source: 'agent' };
    } catch (error) {
      console.warn('Could not load intents from agent, using built-in menu:', error.message);
      return { intents: fallback, default: 'auto', source: 'fallback' };
    }
  },

  // Send text message to the agent (Main conversation endpoint)
  sendMessage: async (message, conversationId = null, language = null, onStream = null, intent = null) => {
    console.log('🌍 [API DEBUG] sendMessage called with:');
    console.log('   - message:', message);
    console.log('   - conversationId:', conversationId);
    console.log('   - language parameter:', language);
    console.log('   - localStorage language:', localStorage.getItem('wakilibot_language'));

    const formData = new FormData();
    formData.append('query', message);

    // Use authenticated user ID from localStorage if available, otherwise fallback to session user ID
    const userId = getAppropriateUserId();
    formData.append('user_id', userId);

    // Get current language from provided parameter or Redux store
    const currentLanguage = language || getCurrentLanguageFromStore();
    console.log('🌍 [API DEBUG] sendMessage - Final language to use:', currentLanguage);
    console.log('🌍 [API DEBUG] sendMessage - localStorage value:', localStorage.getItem('wakilibot_language'));
    formData.append('language', currentLanguage);

    // Use stored conversation ID if not provided
    const currentConversationId = conversationId || getConversationId();
    if (currentConversationId) {
      formData.append('conversation_id', currentConversationId);
    }

    // Topic picked in the chat menu; 'auto'/null leaves routing to the agent
    if (intent && intent !== 'auto') {
      formData.append('intent', intent);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/conversations`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store conversation ID if returned
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Send streaming message (simulated streaming for now)
  sendMessageStream: async (message, conversationId = null, language = null, onChunk = null, intent = null) => {
    console.log('🌍 [API DEBUG] sendMessageStream called with:');
    console.log('   - message:', message);
    console.log('   - conversationId:', conversationId);
    console.log('   - language parameter:', language);
    console.log('   - localStorage language:', localStorage.getItem('wakilibot_language'));

    const formData = new FormData();
    formData.append('query', message);

    // Use authenticated user ID from localStorage if available, otherwise fallback to session user ID
    const userId = getAppropriateUserId();
    formData.append('user_id', userId);

    // Get current language from provided parameter or Redux store
    const currentLanguage = language || getCurrentLanguageFromStore();
    console.log('🌍 [API DEBUG] sendMessageStream - Final language to use:', currentLanguage);
    console.log('🌍 [API DEBUG] sendMessageStream - localStorage value:', localStorage.getItem('wakilibot_language'));
    formData.append('language', currentLanguage);

    // Use stored conversation ID if not provided
    const currentConversationId = conversationId || getConversationId();
    if (currentConversationId) {
      formData.append('conversation_id', currentConversationId);
    }

    if (intent && intent !== 'auto') {
      formData.append('intent', intent);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agents/conversations`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store conversation ID if returned
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Simulate character-by-character streaming like ChatGPT
      if (onChunk && data.answer) {
        const fullText = data.answer;
        let currentText = '';

        for (let i = 0; i < fullText.length; i++) {
          currentText += fullText[i];
          const isComplete = i === fullText.length - 1;
          onChunk(currentText, isComplete, data);

          // Variable delay for natural typing effect
          let delay = 30; // Base delay

          // Faster for spaces
          if (fullText[i] === ' ') {
            delay = 20;
          }
          // Slower for punctuation
          else if (/[.!?]/.test(fullText[i])) {
            delay = 200;
          }
          // Medium for commas
          else if (fullText[i] === ',') {
            delay = 100;
          }
          // Faster for common characters
          else if (/[aeiou]/.test(fullText[i].toLowerCase())) {
            delay = 25;
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return data;
    } catch (error) {
      console.error('Error sending streaming message:', error);
      throw error;
    }
  },

  // Get user session information
  getUserSession: async (userId = null) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sessions/${userId || getUserId()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user session:', error);
      throw error;
    }
  },

  // Endpoints and base URLs
  urls: {
    agent: API_BASE_URL,
    backend: BACKEND_API_URL,
    agentHealth: `${API_BASE_URL}/health`,
    agentDocs: `${API_BASE_URL}/docs`,
    mainBackendDocs: `${BACKEND_API_URL}/docs`,
    translation: ATEKER_TRANSLATION_API_URL,
  },

  // Get agent system health status (endpoint /health discovered from /docs and /openapi.json)
  getHealthStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 15000 });
      return response.data;
    } catch (error) {
      console.error('Error getting agent health status:', error);
      throw error;
    }
  },

  // Get main backend health status
  getMainBackendHealthStatus: async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/openapi.json`, { timeout: 15000 });
      return {
        status: 'healthy',
        service: response.data?.info?.title || 'Fintech Complaints API',
        version: response.data?.info?.version || '0.1.0',
        url: BACKEND_API_URL,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Main backend health check warning:', error.message || error);
      return {
        status: 'error',
        error: error.message || 'Connection failed',
        url: BACKEND_API_URL,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Perform background health check on both agent and main backend services
  performBackgroundHealthCheck: async () => {
    console.log('🩺 [Health Check] Performing background health check on backend services...');
    const startTime = Date.now();
    const results = {
      agent: null,
      mainBackend: null,
      timestamp: new Date().toISOString(),
    };

    const agentPromise = axios
      .get(`${API_BASE_URL}/health`, { timeout: 20000 })
      .then((res) => {
        const duration = Date.now() - startTime;
        results.agent = {
          status: 'healthy',
          endpoint: `${API_BASE_URL}/health`,
          data: res.data,
          responseTimeMs: duration,
        };
        console.log(`✅ [Health Check] Agent is healthy (${duration}ms):`, `${API_BASE_URL}/health`, res.data);
      })
      .catch((err) => {
        results.agent = {
          status: 'unreachable',
          endpoint: `${API_BASE_URL}/health`,
          error: err.message,
        };
        console.warn(`⚠️ [Health Check] Agent health check failed/warming up:`, `${API_BASE_URL}/health`, err.message);
      });

    const mainBackendPromise = axios
      .get(`${BACKEND_API_URL}/openapi.json`, { timeout: 20000 })
      .then((res) => {
        const duration = Date.now() - startTime;
        results.mainBackend = {
          status: 'healthy',
          endpoint: `${BACKEND_API_URL}/openapi.json`,
          title: res.data?.info?.title,
          version: res.data?.info?.version,
          responseTimeMs: duration,
        };
        console.log(`✅ [Health Check] Main backend is healthy (${duration}ms):`, BACKEND_API_URL, res.data?.info);
      })
      .catch((err) => {
        results.mainBackend = {
          status: 'unreachable',
          endpoint: `${BACKEND_API_URL}/openapi.json`,
          error: err.message,
        };
        console.warn(`⚠️ [Health Check] Main backend check failed/warming up:`, BACKEND_API_URL, err.message);
      });

    await Promise.allSettled([agentPromise, mainBackendPromise]);
    return results;
  },

  // Get service information
  getServiceInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting service info:', error);
      throw error;
    }
  },

  // Get user conversations
  getUserConversations: async (userId = null, limit = 50) => {
    try {
      const targetUserId = userId || getAppropriateUserId();
      const response = await axios.get(`${API_BASE_URL}/agents/conversations/${targetUserId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Get conversation history
  getConversationHistory: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents/conversations/${conversationId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  },

  // Send audio for voice chat processing. The real-time WebSocket ASR in VoiceRecorder
  // handles transcription directly; this method is kept as a fallback for non-browser
  // channels that POST a file upload.
  sendVoiceMessage: async (audioBlob, language = null, intent = null) => {
    try {
      const conversationId = getConversationId();
      const currentLanguage = language || getCurrentLanguageFallback();

      const transcribedText = await api.transcribeAudio(audioBlob, currentLanguage);
      if (!transcribedText || !transcribedText.trim()) {
        const error = new Error('No speech was detected in the uploaded audio.');
        error.code = 'ASR_EMPTY';
        throw error;
      }

      const agentResponse = await api.sendMessage(transcribedText, conversationId, currentLanguage, null, intent);

      return {
        answer: agentResponse?.answer || agentResponse?.message || 'I could not process your voice request.',
        voice_chat_info: {
          transcribed_text: transcribedText,
          language: currentLanguage,
          transcription_language: mapToAtekerAsrLanguage(currentLanguage),
          source: 'agent-asr',
          conversation_id: agentResponse?.conversation_id || conversationId,
        },
        ...agentResponse,
      };
    } catch (error) {
      console.error('Voice message error:', error);
      throw error;
    }
  },

  // Submit complaint to Backend API
  submitComplaint: async (complaintData) => {
    try {
      console.log('API: Submitting complaint to Backend:', complaintData);
      console.log('API: Backend URL:', BACKEND_API_URL + '/complaints');

      const response = await axios.post(BACKEND_API_URL + '/complaints', complaintData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('API: Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error submitting complaint:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error headers:', error.response?.headers);
      throw error;
    }
  },

  // Get complaint status from Backend API
  getComplaintStatus: async (complaintId) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/complaints/${complaintId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting complaint status:', error);
      throw error;
    }
  },

  // Submit incident to Backend API
  submitIncident: async (incidentData) => {
    try {
      const response = await axios.post(BACKEND_API_URL + '/incidents', incidentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting incident:', error);
      throw error;
    }
  },

  // Get incident status from Backend API
  getIncidentStatus: async (incidentId) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/incidents/${incidentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting incident status:', error);
      throw error;
    }
  },

  // Authentication endpoints
  registerUser: async (userData) => {
    try {
      console.log('API: Registering user:', userData);
      const response = await axios.post(BACKEND_API_URL + '/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('API: Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error registering user:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  loginUser: async (loginData) => {
    try {
      console.log('API: Logging in user:', loginData);
      const response = await axios.post(BACKEND_API_URL + '/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('API: Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error logging in user:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      console.log('API: Getting user profile:', userId);
      const response = await axios.get(`${BACKEND_API_URL}/auth/user/${userId}`, {
        timeout: 10000, // 10 second timeout
      });

      console.log('API: User profile retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error getting user profile:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Document Management endpoints (Backend service)
  // Get all documents with pagination and filtering
  getDocuments: async (params = {}) => {
    try {
      const {
        page = 1,
        page_size = 20,
        category = null,
        search = null,
        sort_by = 'upload_date',
        sort_order = 'desc'
      } = params;

      let url = `${BACKEND_API_URL}/documents?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_order=${sort_order}`;

      if (category && category !== 'all') {
        url += `&category=${category}`;
      }

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log('API: Fetching documents from:', url);
      const response = await axios.get(url, {
        timeout: 10000,
      });

      console.log('API: Documents fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching documents:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId) => {
    try {
      console.log('API: Fetching document:', documentId);
      const response = await axios.get(`${BACKEND_API_URL}/documents/${documentId}`, {
        timeout: 10000,
      });

      console.log('API: Document fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching document:', error);
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (file, documentData) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', documentData.title);
      formData.append('description', documentData.description);
      formData.append('category', documentData.category);
      formData.append('tags', documentData.tags || '');
      formData.append('user_id', getAppropriateUserId());

      console.log('API: Uploading document:', documentData.title);
      const response = await axios.post(BACKEND_API_URL + '/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file upload
      });

      console.log('API: Document uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error uploading document:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  // Update document
  updateDocument: async (documentId, updateData) => {
    try {
      console.log('API: Updating document:', documentId, updateData);
      const response = await axios.put(`${BACKEND_API_URL}/documents/${documentId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('API: Document updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      console.log('API: Deleting document:', documentId);
      const response = await axios.delete(`${BACKEND_API_URL}/documents/${documentId}`, {
        timeout: 10000,
      });

      console.log('API: Document deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error deleting document:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId) => {
    try {
      console.log('API: Downloading document:', documentId);
      const response = await axios.get(`${BACKEND_API_URL}/documents/download/${documentId}`, {
        responseType: 'blob',
        timeout: 30000, // 30 seconds for file download
      });

      console.log('API: Document downloaded successfully');
      return response.data;
    } catch (error) {
      console.error('API: Error downloading document:', error);
      throw error;
    }
  },

  // Get document statistics
  getDocumentStats: async () => {
    try {
      console.log('API: Fetching document statistics');
      const response = await axios.get(BACKEND_API_URL + '/documents/stats/overview', {
        timeout: 10000,
      });

      console.log('API: Document statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching document statistics:', error);
      throw error;
    }
  },

  // Knowledge Base Re-index (Agent service)
  reindexKnowledgeBase: async () => {
    try {
      console.log('API: Triggering knowledge base re-indexing...');
      const response = await axios.post(`${API_BASE_URL}/knowledge/reindex`, {}, {
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('API: Error reindexing knowledge base:', error);
      throw error;
    }
  },

  // Password Reset endpoints (Backend service)
  resetPassword: async (email, newPassword, confirmPassword) => {
    try {
      console.log('API: Resetting password for:', email);
      const response = await axios.post(BACKEND_API_URL + '/auth/reset-password', {
        email: email,
        new_password: newPassword,
        confirm_password: confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('API: Password reset successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error resetting password:', error);
      throw error;
    }
  },

  changePassword: async (email, currentPassword, newPassword) => {
    try {
      console.log('API: Changing password for:', email);
      const response = await axios.post(BACKEND_API_URL + '/auth/change-password', {
        email: email,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('API: Password changed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error changing password:', error);
      throw error;
    }
  },

  // Utility functions
  utils: {
    // Get current user ID (authenticated user from localStorage or session user)
    getCurrentUserId: () => getAppropriateUserId(),

    // Guest session (no account required)
    ensureGuestUser: () => ensureGuestUser(),
    clearGuestUser: () => {
      sessionStorage.removeItem('wakilibot_guest');
    },
    isGuestUser: (user) => Boolean(user?.isGuest),

    // Get session user ID (legacy function)
    getSessionUserId: () => getUserId(),

    // Get current conversation ID
    getCurrentConversationId: () => getConversationId(),

    /**
     * The documents API returns relative paths ("/documents/download/<id>"), which a browser would
     * otherwise open against its own origin - the dev server, not the API. Anything relative is
     * resolved against the backend here so a card can hand back one usable URL.
     */
    resolveFileUrl: (pathOrUrl) => {
      if (!pathOrUrl) return null;
      if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
      const base = BACKEND_API_URL.replace(/\/+$/, '');
      return `${base}/${String(pathOrUrl).replace(/^\/+/, '')}`;
    },

    /**
     * Conversation times come back from the agent as unix seconds (Firebase server timestamps).
     * Passed straight to new Date() they are read as milliseconds and every saved chat lands in
     * January 1970, so anything coming out of the API is normalised to milliseconds here.
     * Returns null when the value is missing or unreadable, letting callers fall back cleanly.
     */
    toMillis: (value) => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'string' && /^\d{10}$/.test(value.trim())) {
        return Number(value.trim()) * 1000;
      }
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric < 1e12 ? numeric * 1000 : numeric;
      }
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : parsed;
    },

    // Get current language with debug info (Redux method)
    getCurrentLanguage: () => {
      const lang = getCurrentLanguageFromStore();
      console.log('🌍 [API UTILS] getCurrentLanguage() called, returning:', lang);
      return lang;
    },

    // Generate new user ID
    generateNewUserId: () => {
      const newUserId = generateUserId();
      sessionStorage.setItem('ctdru_user_id', newUserId);
      return newUserId;
    },

    // Clear user session
    clearUserSession: () => {
      sessionStorage.removeItem('ctdru_user_id');
    },

    // Clear conversation
    clearConversation: () => {
      clearConversationId();
    },

    // Start new conversation
    startNewConversation: () => {
      clearConversationId();
      return getUserId();
    },

    // Local Storage utilities for persistent login
    // Store authenticated user data
    storeUserData: (userData) => {
      try {
        localStorage.setItem('wakilibot_user', JSON.stringify(userData));
        console.log('User data stored in localStorage:', userData);
      } catch (error) {
        console.error('Error storing user data:', error);
      }
    },

    // Get stored user data
    getStoredUserData: () => {
      try {
        const userData = localStorage.getItem('wakilibot_user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
      }
    },

    // Clear stored user data (logout)
    clearStoredUserData: () => {
      try {
        localStorage.removeItem('wakilibot_user');
        console.log('User data cleared from localStorage');
      } catch (error) {
        console.error('Error clearing user data:', error);
      }
    },

    // Check if user is logged in
    isUserLoggedIn: () => {
      const userData = api.utils.getStoredUserData();
      return userData && userData.user_id;
    },

    // Get current authenticated user
    getCurrentUser: () => {
      return api.utils.getStoredUserData();
    },

    // Client-side translation using the Ateker translation API
    translateTextClientSide: async (text, sourceLanguage, targetLanguage = 'en') => {
      return translateTextClientSide(text, sourceLanguage, targetLanguage);
    },

    // Build natural speech text without reading references, URLs, or raw metadata.
    prepareTTSContent: (text, responseData = null) => {
      return prepareTTSContent(text, responseData);
    },

    // Canonical language code ('en', 'sw', 'lg', ...) for callers that only have a name
    normalizeLanguageCode: (language) => normalizeLanguageCode(language),

    // Format response time
    formatResponseTime: (timeInSeconds) => {
      if (timeInSeconds < 1) {
        return `${(timeInSeconds * 1000).toFixed(0)}ms`;
      }
      return `${timeInSeconds.toFixed(2)}s`;
    },

    // Check if response is cached
    isResponseCached: (response) => {
      return response?.performance?.cached === true;
    },

    // Get task status
    getTaskStatus: (response) => {
      return response?.task_status || 'unknown';
    },

    // Get intent from response
    getIntent: (response) => {
      return response?.intent || 'unknown';
    },

    // Clean text for TTS generation
    cleanTextForTTS: (text) => cleanSpeechText(text),

    // Ateker language code used by the speech synthesis service
    ttsLanguageCode: (language) => mapToAtekerTtsLanguage(language),

    // Browser locale that best matches the chosen language, for device voices
    speechLocale: (language) => getSpeechLocale(language)
  }
};

// ─── Speech endpoints (routed through the agent) ──────────────────────────────
// The frontend sends audio/text to the agent; the agent contacts Ateker STT and Spark TTS
// server-side, bypassing all CORS restrictions and keeping credentials off the client.

/**
 * Transcribe a recorded blob via the agent's /transcribe endpoint.
 * The agent forwards to the Ateker STT service server-side.
 */
api.transcribeAudio = async (audioBlob, language = 'en') => {
  if (!audioBlob || audioBlob.size === 0) {
    const error = new Error('No recording to transcribe');
    error.code = 'ASR_NO_AUDIO';
    throw error;
  }

  // The Ateker STT server can't decode the browser's WebM/Opus recording, so
  // convert to a 16 kHz mono WAV here — matches what the /transcribe decoder wants.
  const uploadBlob = await toSttReadyWav(audioBlob);

  const formData = new FormData();
  formData.append('audio_file', uploadBlob, 'recording.wav');
  formData.append('language', normalizeLanguageCode(language));

  let response;
  try {
    response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  } catch (networkError) {
    const error = new Error(
      networkError.response?.data?.detail || 'Transcription service unreachable'
    );
    error.code = 'ASR_UNAVAILABLE';
    error.status = networkError.response?.status;
    throw error;
  }

  return response.data?.text || '';
};

/**
 * Synthesize speech from text via the agent's /tts endpoint (Spark TTS fallback).
 * The primary TTS path is the WebSocket streaming in sparkTTS.js; this is the
 * agent-proxied HTTP fallback for cases where WebSocket is unavailable.
 */
api.synthesizeSpeech = async (text, language = null) => {
  const speechText = cleanSpeechText(prepareTTSContent(text));
  if (!speechText) {
    const error = new Error('Nothing to read aloud');
    error.code = 'TTS_EMPTY_TEXT';
    throw error;
  }

  const currentLanguage = language || getCurrentLanguageFromStore();

  const formData = new FormData();
  formData.append('text', speechText.slice(0, 5000));
  formData.append('language', normalizeLanguageCode(currentLanguage));

  let response;
  try {
    response = await axios.post(`${API_BASE_URL}/tts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      timeout: 30000,
    });
  } catch (error) {
    const wrapped = new Error('Speech synthesis unavailable');
    wrapped.code = 'TTS_REMOTE_UNAVAILABLE';
    wrapped.status = error.response?.status;
    throw wrapped;
  }

  const audioUrl = URL.createObjectURL(response.data);

  return {
    audioUrl,
    engine: 'spark-tts-proxy',
    text: speechText,
    language: currentLanguage,
  };
};

/**
 * Translate text via the agent's /translate endpoint.
 */
api.translateText = async (text, sourceLang = 'eng', targetLang = 'eng') => {
  if (!text || !text.trim()) return text;
  try {
    const formData = new FormData();
    formData.append('text', text.trim());
    formData.append('source_lang', sourceLang);
    formData.append('target_lang', targetLang);
    const response = await axios.post(`${API_BASE_URL}/translate`, formData, { timeout: 15000 });
    return response.data?.translated_text || text;
  } catch (error) {
    console.warn('Translation unavailable:', error.message);
    return text;
  }
};

export default api;
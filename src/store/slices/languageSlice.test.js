import reducer, {
  LANGUAGE_OPTIONS,
  setLanguage,
  initializeLanguage,
  resetLanguage,
  selectLanguage,
  selectIsInitialized,
  selectLanguageOptions,
  selectCurrentLanguageInfo,
} from './languageSlice';

const baseState = {
  selectedLanguage: 'en',
  isInitialized: false,
  languageOptions: LANGUAGE_OPTIONS,
};

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(window.localStorage.__proto__, 'setItem');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('languageSlice reducer', () => {
  test('setLanguage updates selectedLanguage, marks initialized, and mirrors to localStorage', () => {
    const state = reducer(baseState, setLanguage('lg'));
    expect(state.selectedLanguage).toBe('lg');
    expect(state.isInitialized).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('wakilibot_language', 'lg');
  });

  test('setLanguage with an unrecognized code is a no-op', () => {
    const state = reducer(baseState, setLanguage('fr'));
    expect(state.selectedLanguage).toBe('en');
    expect(state.isInitialized).toBe(false);
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  test('initializeLanguage reads from localStorage and marks initialized', () => {
    window.localStorage.setItem('wakilibot_language', 'sw');
    const state = reducer(baseState, initializeLanguage());
    expect(state.selectedLanguage).toBe('sw');
    expect(state.isInitialized).toBe(true);
  });

  test('initializeLanguage falls back to English when localStorage has no recognized value', () => {
    const state = reducer(baseState, initializeLanguage());
    expect(state.selectedLanguage).toBe('en');
    expect(state.isInitialized).toBe(true);
  });

  test('resetLanguage resets to English and mirrors to localStorage', () => {
    const dirtyState = { selectedLanguage: 'xog', isInitialized: true, languageOptions: LANGUAGE_OPTIONS };
    const state = reducer(dirtyState, resetLanguage());
    expect(state.selectedLanguage).toBe('en');
    expect(state.isInitialized).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('wakilibot_language', 'en');
  });
});

describe('languageSlice selectors', () => {
  const rootState = { language: { selectedLanguage: 'ac', isInitialized: true, languageOptions: LANGUAGE_OPTIONS } };

  test('selectLanguage/selectIsInitialized/selectLanguageOptions read through to state.language', () => {
    expect(selectLanguage(rootState)).toBe('ac');
    expect(selectIsInitialized(rootState)).toBe(true);
    expect(selectLanguageOptions(rootState)).toBe(LANGUAGE_OPTIONS);
  });

  test('selectCurrentLanguageInfo finds the matching option', () => {
    expect(selectCurrentLanguageInfo(rootState)).toEqual(
      LANGUAGE_OPTIONS.find((lang) => lang.code === 'ac')
    );
  });

  test('selectCurrentLanguageInfo falls back to the first option for an unknown code', () => {
    const unknownState = { language: { selectedLanguage: 'zz', isInitialized: true, languageOptions: LANGUAGE_OPTIONS } };
    expect(selectCurrentLanguageInfo(unknownState)).toEqual(LANGUAGE_OPTIONS[0]);
  });
});

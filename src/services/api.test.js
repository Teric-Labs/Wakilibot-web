// axios@1.8+ ships an ESM-only "main" entry that CRA's bundled Jest can't
// parse; a plain jest.mock('axios') still loads the real module to derive
// its shape, so it must be fully replaced with an explicit factory instead.
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
jest.mock('../store', () => ({
  store: { getState: () => ({ language: { selectedLanguage: 'en' } }) },
}));

import axios from 'axios';
import api from './api';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

describe('loginUser', () => {
  test('posts to the auth/login endpoint and returns response data', async () => {
    axios.post.mockResolvedValue({ data: { user: { user_id: 'u1' } } });

    const result = await api.loginUser({ email: 'a@b.com', password: 'secret' });

    expect(axios.post).toHaveBeenCalledWith(
      'https://wakilibot-main-tum2.onrender.com/auth/login',
      { email: 'a@b.com', password: 'secret' },
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
    expect(result).toEqual({ user: { user_id: 'u1' } });
  });

  test('propagates errors from the API', async () => {
    axios.post.mockRejectedValue(new Error('network down'));
    await expect(api.loginUser({ email: 'a@b.com', password: 'x' })).rejects.toThrow('network down');
  });
});

describe('registerUser', () => {
  test('posts to the auth/register endpoint', async () => {
    axios.post.mockResolvedValue({ data: { user_id: 'u2' } });

    const result = await api.registerUser({ full_name: 'Jane', email: 'jane@x.com' });

    expect(axios.post).toHaveBeenCalledWith(
      'https://wakilibot-main-tum2.onrender.com/auth/register',
      { full_name: 'Jane', email: 'jane@x.com' },
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
    expect(result).toEqual({ user_id: 'u2' });
  });
});

describe('resetPassword', () => {
  test('posts email/new/confirm password to the reset endpoint', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    await api.resetPassword('a@b.com', 'newpass1', 'newpass1');

    expect(axios.post).toHaveBeenCalledWith(
      'https://wakilibot-main-tum2.onrender.com/auth/reset-password',
      { email: 'a@b.com', new_password: 'newpass1', confirm_password: 'newpass1' },
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
  });
});

describe('getDocuments', () => {
  test('builds the query string with default pagination/sort params', async () => {
    axios.get.mockResolvedValue({ data: { documents: [] } });

    await api.getDocuments();

    expect(axios.get).toHaveBeenCalledWith(
      'https://wakilibot-main-tum2.onrender.com/documents?page=1&page_size=20&sort_by=upload_date&sort_order=desc',
      expect.objectContaining({ timeout: 10000 })
    );
  });

  test('appends category and search when provided', async () => {
    axios.get.mockResolvedValue({ data: { documents: [] } });

    await api.getDocuments({ category: 'legislation', search: 'tax law' });

    const [url] = axios.get.mock.calls[0];
    expect(url).toContain('&category=legislation');
    expect(url).toContain('&search=tax%20law');
  });
});

describe('uploadDocument', () => {
  test('sends a multipart FormData with the document metadata', async () => {
    axios.post.mockResolvedValue({ data: { document_id: 'd1' } });
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await api.uploadDocument(file, { title: 'Test Doc', description: 'desc', category: 'legislation' });

    const [url, formData, config] = axios.post.mock.calls[0];
    expect(url).toBe('https://wakilibot-main-tum2.onrender.com/documents/upload');
    expect(formData.get('title')).toBe('Test Doc');
    expect(formData.get('description')).toBe('desc');
    expect(formData.get('category')).toBe('legislation');
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
  });
});

describe('sendMessage', () => {
  test('posts a FormData query via fetch and stores the returned conversation id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'Hello there', conversation_id: 'conv-42' }),
    });

    const data = await api.sendMessage('Hi', null, 'en');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://wakilibot-agent-0wm0.onrender.com/agents/conversations',
      expect.objectContaining({ method: 'POST' })
    );
    expect(data.answer).toBe('Hello there');
    expect(sessionStorage.getItem('ctdru_conversation_id')).toBe('conv-42');
  });

  test('throws when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });

    await expect(api.sendMessage('Hi')).rejects.toThrow('HTTP error! status: 500');
  });
});

describe('synthesizeSpeech', () => {
  const fakeBlob = { type: 'audio/wav' };

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-audio-url');
  });

  test('posts text + language as multipart form data to the agent /tts endpoint', async () => {
    axios.post.mockResolvedValue({ data: fakeBlob });

    const result = await api.synthesizeSpeech('Hello there', 'en');

    expect(axios.post).toHaveBeenCalledWith(
      'https://wakilibot-agent-0wm0.onrender.com/tts',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      })
    );
    const [, formData] = axios.post.mock.calls[0];
    expect(formData.get('text')).toBe('Hello there');
    expect(formData.get('language')).toBe('en');

    expect(result.audioUrl).toBe('blob:mock-audio-url');
    expect(result.engine).toBe('spark-tts-proxy');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
  });

  test('cleans markdown/emoji out of the text before sending', async () => {
    axios.post.mockResolvedValue({ data: fakeBlob });

    await api.synthesizeSpeech('**Bold** text 🎉', 'en');

    const [, formData] = axios.post.mock.calls[0];
    expect(formData.get('text')).toBe('Bold text');
  });

  test('falls back to a default phrase for empty input, rather than failing silently', async () => {
    axios.post.mockResolvedValue({ data: fakeBlob });

    await api.synthesizeSpeech('', 'en');

    const [, formData] = axios.post.mock.calls[0];
    expect(formData.get('text')).toBe('Here is the response.');
  });

  test('throws a TTS_REMOTE_UNAVAILABLE error when the request fails', async () => {
    axios.post.mockRejectedValue({ response: { status: 502 } });

    await expect(api.synthesizeSpeech('Hello', 'en')).rejects.toMatchObject({
      code: 'TTS_REMOTE_UNAVAILABLE',
      status: 502,
    });
  });
});

describe('utils.cleanTextForTTS', () => {
  test('strips markdown, urls, and emoji', () => {
    const cleaned = api.utils.cleanTextForTTS('**Hello** visit https://example.com now 🎉');
    expect(cleaned).toBe('Hello visit now');
  });

  test('returns a fallback string for empty input', () => {
    expect(api.utils.cleanTextForTTS('')).toBe('');
    expect(api.utils.cleanTextForTTS(null)).toBe('');
  });
});

describe('utils.formatResponseTime', () => {
  test('formats sub-second durations in milliseconds', () => {
    expect(api.utils.formatResponseTime(0.234)).toBe('234ms');
  });

  test('formats durations of 1 second or more in seconds', () => {
    expect(api.utils.formatResponseTime(1.5)).toBe('1.50s');
  });
});

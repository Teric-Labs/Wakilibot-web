import { render, screen } from '@testing-library/react';
import ChatInterface from './ChatInterface';

jest.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    selectedLanguage: 'en',
    getCurrentLanguageInfo: () => ({ code: 'en', name: 'English' }),
    t: (section, key) => key,
  }),
}));

// These children are irrelevant to the mount-rehydration behaviour under
// test and pull in MUI/Redux/mic-permission machinery that isn't needed
// here - stub them so the test only exercises ChatInterface's own logic.
jest.mock('./Sidebar', () => () => null);
jest.mock('./Archive', () => () => null);
jest.mock('./Help', () => () => null);
jest.mock('./ConversationHistory', () => () => null);
jest.mock('./VoiceModeOverlay', () => () => null);
jest.mock('./AccountPanel', () => () => null);
jest.mock('./MethodologyBar', () => () => null);
jest.mock('./StandardPanel', () => () => null);
jest.mock('./LanguageSettings', () => () => null);
jest.mock('./IntentSelector', () => ({
  TopicHeader: () => null,
  TopicPicker: () => null,
  TopicBrief: () => null,
}));
jest.mock('./MessageInput', () => () => null);

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getIntents: jest.fn().mockResolvedValue({ intents: [] }),
    getUserConversations: jest.fn().mockResolvedValue({ conversations: [] }),
    getConversationHistory: jest.fn(),
    utils: {
      getCurrentConversationId: jest.fn(),
      setCurrentConversationId: jest.fn(),
      getCurrentUserId: jest.fn().mockReturnValue('test-user'),
      toMillis: (ts) => (ts ? ts * 1000 : Date.now()),
    },
  },
}));

// eslint-disable-next-line import/first
import api from '../services/api';

describe('ChatInterface conversation rehydration on mount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getIntents.mockResolvedValue({ intents: [] });
    api.getUserConversations.mockResolvedValue({ conversations: [] });
    api.utils.getCurrentUserId.mockReturnValue('test-user');
  });

  test('restores the persisted conversation instead of showing the welcome message', async () => {
    api.utils.getCurrentConversationId.mockReturnValue('conv-42');
    api.getConversationHistory.mockResolvedValue({
      conversation_id: 'conv-42',
      history: [
        { id: 'm1', role: 'user', query: 'What is CTDRU?', text: 'What is CTDRU?', timestamp: 1000 },
        {
          id: 'm2',
          role: 'assistant',
          response: 'CTDRU protects consumers in digital financial services.',
          text: 'CTDRU protects consumers in digital financial services.',
          timestamp: 1001,
          response_data: {},
        },
      ],
    });

    render(<ChatInterface user={{ user_id: 'test-user', isGuest: true }} />);

    expect(await screen.findByText('What is CTDRU?')).toBeInTheDocument();
    expect(
      screen.getByText('CTDRU protects consumers in digital financial services.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Karibu \/ Hello/i)).not.toBeInTheDocument();
  });

  test('does not fetch history when there is no persisted conversation', async () => {
    api.utils.getCurrentConversationId.mockReturnValue(null);

    render(<ChatInterface user={{ user_id: 'test-user', isGuest: true }} />);

    // Nothing to assert visually here - with only the welcome message in
    // state the topic picker (mocked to null) covers the message list by
    // design, same as any other fresh session. The behaviour under test is
    // that rehydration is skipped entirely when there's no stored id.
    await Promise.resolve();
    expect(api.getConversationHistory).not.toHaveBeenCalled();
  });

  test('leaves the fresh/welcome state in place when the history fetch fails (e.g. agent restarted)', async () => {
    api.utils.getCurrentConversationId.mockReturnValue('conv-stale');
    api.getConversationHistory.mockRejectedValue(new Error('not found'));

    render(<ChatInterface user={{ user_id: 'test-user', isGuest: true }} />);

    await screen.findByText(/CTDRU AI Assistant|Ask Wakili|guestMode/i);
    expect(api.getConversationHistory).toHaveBeenCalledWith('conv-stale');
    // The failed fetch must not leave the component crashed or stuck - the
    // header chrome used elsewhere in the app still renders normally.
  });
});

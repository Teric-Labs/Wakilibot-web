jest.mock('./VoiceNoteBubble', () => (props) => (
  <div data-testid="voice-note-bubble" data-is-user={String(props.isUser)} data-autoplay={String(props.autoplay)}>
    voice note: {props.audioUrl}
  </div>
));

import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';

describe('MessageBubble', () => {
  test('renders a plain user-typed message', () => {
    render(<MessageBubble message="I have a complaint" isUser={true} />);

    expect(screen.getByText('I have a complaint')).toBeInTheDocument();
    expect(screen.queryByTestId('voice-note-bubble')).not.toBeInTheDocument();
  });

  test('renders a plain bot text reply', () => {
    render(<MessageBubble message="How can I help you today?" isUser={false} />);

    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });

  test('shows the user voice note bubble when a voice message has captured audio', () => {
    render(
      <MessageBubble
        message="transcribed text"
        isUser={true}
        viaVoice={true}
        audioUrl="blob:user-recording"
        audioDuration={4}
      />
    );

    const bubble = screen.getByTestId('voice-note-bubble');
    expect(bubble).toHaveAttribute('data-is-user', 'true');
    expect(bubble).toHaveTextContent('blob:user-recording');
  });

  test('shows a "Spoken" badge when a voice message has no captured audio to play back', () => {
    render(<MessageBubble message="transcribed text" isUser={true} viaVoice={true} />);

    expect(screen.getByText(/Spoken/i)).toBeInTheDocument();
    expect(screen.queryByTestId('voice-note-bubble')).not.toBeInTheDocument();
  });

  test('shows a loading state while a bot voice reply is being prepared', () => {
    render(<MessageBubble message="" isUser={false} autoSpeak={true} ttsError={false} replyAudioUrl={null} />);

    expect(screen.getByText(/Thinking/i)).toBeInTheDocument();
    expect(screen.queryByTestId('voice-note-bubble')).not.toBeInTheDocument();
  });

  test('shows the bot voice note, autoplaying, once reply audio is ready', () => {
    render(
      <MessageBubble
        message="Here is your answer"
        isUser={false}
        autoSpeak={true}
        replyAudioUrl="blob:bot-reply"
      />
    );

    const bubble = screen.getByTestId('voice-note-bubble');
    expect(bubble).toHaveAttribute('data-is-user', 'false');
    expect(bubble).toHaveAttribute('data-autoplay', 'true');
    expect(bubble).toHaveTextContent('blob:bot-reply');
  });

  test('falls back to the text transcript when TTS fails for a voice reply', () => {
    render(
      <MessageBubble
        message="Here is your answer as text"
        isUser={false}
        autoSpeak={true}
        ttsError={true}
        replyAudioUrl={null}
      />
    );

    expect(screen.getByText(/Audio unavailable\. Transcript:/i)).toBeInTheDocument();
    expect(screen.getByText('Here is your answer as text')).toBeInTheDocument();
    expect(screen.queryByTestId('voice-note-bubble')).not.toBeInTheDocument();
  });

  test('renders complaint reference and source links for a bot text reply', () => {
    render(
      <MessageBubble
        message="Your complaint was submitted"
        isUser={false}
        responseData={{
          complaintId: 'CTDRU-1234',
          references: [{ title: 'Bank of Uganda Consumer Affairs', url: 'https://example.test' }],
        }}
      />
    );

    expect(screen.getByText(/CTDRU-1234/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bank of Uganda Consumer Affairs' })).toHaveAttribute(
      'href',
      'https://example.test'
    );
  });

  test('does not render reference metadata for the welcome message', () => {
    render(
      <MessageBubble
        message="Welcome to WakiliBot"
        isUser={false}
        isWelcome={true}
        responseData={{ complaintId: 'CTDRU-1234' }}
      />
    );

    expect(screen.queryByText(/CTDRU-1234/)).not.toBeInTheDocument();
  });
});

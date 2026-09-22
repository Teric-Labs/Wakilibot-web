jest.mock('../services/api', () => ({
  generateTTS: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageBubble from './MessageBubble';
import api from '../services/api';

// jsdom has no Web Audio API - MessageBubble decodes raw PCM bytes into an
// AudioBuffer and plays it via AudioContext/AudioBufferSourceNode, so both
// need a manual mock. Each createBufferSource() call is recorded in
// sourceNodes so tests can inspect/trigger it (e.g. fire onended).
let sourceNodes;
let createBufferMock;

beforeEach(() => {
  jest.clearAllMocks();
  sourceNodes = [];
  createBufferMock = jest.fn((channels, length, sampleRate) => ({
    channels,
    length,
    sampleRate,
    copyToChannel: jest.fn(),
  }));

  global.AudioContext = jest.fn().mockImplementation(function () {
    this.destination = {};
    this.createBuffer = createBufferMock;
    this.createBufferSource = jest.fn(() => {
      const node = {
        buffer: null,
        onended: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      sourceNodes.push(node);
      return node;
    });
    this.close = jest.fn();
  });
});

const renderBubble = (props = {}) =>
  render(<MessageBubble message="Hello world" isUser={false} {...props} />);

test('generates and plays audio on first click, decoding PCM at 16kHz mono', async () => {
  const pcm = new ArrayBuffer(8); // 4 Int16 samples
  api.generateTTS.mockResolvedValue({ pcm, sampleRate: 16000 });

  renderBubble();
  await userEvent.click(screen.getByRole('button', { name: 'Convert to speech' }));

  expect(await screen.findByRole('button', { name: 'Stop audio' })).toBeInTheDocument();
  expect(api.generateTTS).toHaveBeenCalledWith('Hello world');
  expect(createBufferMock).toHaveBeenCalledWith(1, 4, 16000);
  expect(sourceNodes).toHaveLength(1);
  expect(sourceNodes[0].start).toHaveBeenCalled();
});

test('clicking again while playing stops the current source', async () => {
  api.generateTTS.mockResolvedValue({ pcm: new ArrayBuffer(4), sampleRate: 16000 });

  renderBubble();
  await userEvent.click(screen.getByRole('button', { name: 'Convert to speech' }));
  await screen.findByRole('button', { name: 'Stop audio' });

  await userEvent.click(screen.getByRole('button', { name: 'Stop audio' }));

  expect(sourceNodes[0].stop).toHaveBeenCalled();
  expect(await screen.findByRole('button', { name: 'Play audio' })).toBeInTheDocument();
});

test('replaying after generation reuses the decoded buffer without calling generateTTS again', async () => {
  api.generateTTS.mockResolvedValue({ pcm: new ArrayBuffer(4), sampleRate: 16000 });

  renderBubble();
  await userEvent.click(screen.getByRole('button', { name: 'Convert to speech' }));
  await screen.findByRole('button', { name: 'Stop audio' });
  await userEvent.click(screen.getByRole('button', { name: 'Stop audio' }));
  await screen.findByRole('button', { name: 'Play audio' });

  await userEvent.click(screen.getByRole('button', { name: 'Play audio' }));

  expect(api.generateTTS).toHaveBeenCalledTimes(1);
  expect(sourceNodes).toHaveLength(2); // a fresh source node per play, same decoded buffer
});

test('reverts to the play state on its own once playback ends naturally', async () => {
  api.generateTTS.mockResolvedValue({ pcm: new ArrayBuffer(4), sampleRate: 16000 });

  renderBubble();
  await userEvent.click(screen.getByRole('button', { name: 'Convert to speech' }));
  await screen.findByRole('button', { name: 'Stop audio' });

  sourceNodes[0].onended();

  expect(await screen.findByRole('button', { name: 'Play audio' })).toBeInTheDocument();
});

test('shows a TTS error and does not create an audio buffer when generation fails', async () => {
  api.generateTTS.mockRejectedValue(new Error('Text is required for TTS generation'));

  renderBubble();
  await userEvent.click(screen.getByRole('button', { name: 'Convert to speech' }));

  expect(
    await screen.findByRole('button', { name: 'TTS Error: Text is required for TTS generation' })
  ).toBeInTheDocument();
  expect(createBufferMock).not.toHaveBeenCalled();
});

test('does not render the TTS button for the user\'s own messages', () => {
  renderBubble({ isUser: true });
  expect(screen.queryByRole('button', { name: 'Convert to speech' })).not.toBeInTheDocument();
});

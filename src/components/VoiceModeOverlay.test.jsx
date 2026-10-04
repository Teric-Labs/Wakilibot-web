import { render, screen, fireEvent } from '@testing-library/react';
import VoiceModeOverlay from './VoiceModeOverlay';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    transcribeAudio: jest.fn().mockResolvedValue(''),
  },
}));

describe('VoiceModeOverlay', () => {
  test('shows a clear denied state when microphone access is refused, and End closes it', async () => {
    const onClose = jest.fn();
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')) },
    });

    render(<VoiceModeOverlay onClose={onClose} onSend={jest.fn()} />);

    expect(await screen.findByText(/microphone access denied/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /end voice conversation/i }));
    expect(onClose).toHaveBeenCalled();

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    });
  });

  test('renders the listening state once the microphone is granted', async () => {
    const stopTrack = jest.fn();
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });

    const originalMediaRecorder = global.MediaRecorder;
    global.MediaRecorder = class {
      constructor() { this.state = 'recording'; }
      static isTypeSupported() { return true; }
      start() {}
      stop() { this.state = 'inactive'; this.onstop?.(); }
    };

    const originalAudioContext = global.AudioContext;
    global.AudioContext = class {
      createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
      createAnalyser() {
        return {
          fftSize: 0,
          smoothingTimeConstant: 0,
          frequencyBinCount: 8,
          connect: jest.fn(),
          disconnect: jest.fn(),
          getByteFrequencyData: (buf) => buf.fill(0),
        };
      }
      close() { return Promise.resolve(); }
    };

    render(<VoiceModeOverlay onClose={jest.fn()} onSend={jest.fn()} />);

    expect(await screen.findByText(/listening/i)).toBeInTheDocument();

    global.MediaRecorder = originalMediaRecorder;
    global.AudioContext = originalAudioContext;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    });
  });
});

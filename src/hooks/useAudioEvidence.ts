import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { uploadEvidence, startAudioRecording, stopAudioRecording } from '../lib/evidence';

type Status = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

interface HookResult {
  status: Status;
  error?: string;
  startRecording: () => Promise<void>;
  stopAndUpload: () => Promise<{ evidenceId: string }>;
  reset: () => void;
}

/**
 * Hook to record audio and upload as evidence for a given incident.
 */
export function useAudioEvidence(
  incidentId: string,
  contentType: string = 'audio/mpeg'
): HookResult {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | undefined>();
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(undefined);
      setStatus('recording');
      recordingRef.current = await startAudioRecording();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to start audio recording');
      throw err;
    }
  }, []);

  const stopAndUpload = useCallback(async () => {
    if (!recordingRef.current) {
      const message = 'No active audio recording';
      setError(message);
      setStatus('error');
      throw new Error(message);
    }

    try {
      setStatus('uploading');
      const uri = await stopAudioRecording(recordingRef.current);
      const evidenceId = await uploadEvidence(incidentId, uri, 'AUDIO', contentType);
      setStatus('done');
      return { evidenceId };
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to upload audio evidence');
      throw err;
    } finally {
      recordingRef.current = null;
    }
  }, [incidentId, contentType]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
    recordingRef.current = null;
  }, []);

  return {
    status,
    error,
    startRecording,
    stopAndUpload,
    reset,
  };
}



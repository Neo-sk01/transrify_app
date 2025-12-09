import React from 'react';
import { useCallback, useRef, useState } from 'react';
import { CameraRecordingOptions } from 'expo-camera';
import { uploadEvidence, startVideoRecording, stopVideoRecording, CameraRef } from '../lib/evidence';

type Status = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

interface HookResult {
  status: Status;
  error?: string;
  startRecording: (options?: CameraRecordingOptions) => Promise<void>;
  stopAndUpload: () => Promise<{ evidenceId: string }>;
  reset: () => void;
}

/**
 * Hook to record video via Expo Camera and upload as evidence.
 */
export function useVideoEvidence(
  incidentId: string,
  cameraRef: React.RefObject<CameraRef>,
  contentType: string = 'video/mp4'
): HookResult {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | undefined>();
  const recordingPromiseRef = useRef<Promise<CameraCapturedVideo> | null>(null);

  const startRecording = useCallback(
    async (options?: CameraRecordingOptions) => {
      try {
        setError(undefined);
        setStatus('recording');
        recordingPromiseRef.current = await startVideoRecording(cameraRef, options);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to start video recording');
        throw err;
      }
    },
    [cameraRef]
  );

  const stopAndUpload = useCallback(async () => {
    if (!recordingPromiseRef.current) {
      const message = 'No active video recording';
      setError(message);
      setStatus('error');
      throw new Error(message);
    }

    try {
      setStatus('uploading');
      const uri = await stopVideoRecording(cameraRef, recordingPromiseRef.current);
      const evidenceId = await uploadEvidence(incidentId, uri, 'VIDEO', contentType);
      setStatus('done');
      return { evidenceId };
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to upload video evidence');
      throw err;
    } finally {
      recordingPromiseRef.current = null;
    }
  }, [cameraRef, incidentId, contentType]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
    recordingPromiseRef.current = null;
  }, []);

  return {
    status,
    error,
    startRecording,
    stopAndUpload,
    reset,
  };
}


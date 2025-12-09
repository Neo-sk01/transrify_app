/**
 * Duress Recording Service
 * Manages automatic audio and video recording when duress mode is activated.
 * Recording starts immediately after duress PIN is entered and alert is sent.
 */

import { Audio } from 'expo-av';
import { startAudioRecording, stopAudioRecording, uploadEvidence } from './evidence';

/**
 * Duress recording state
 */
interface DuressRecordingState {
  incidentId: string | null;
  audioRecording: Audio.Recording | null;
  isRecording: boolean;
}

/**
 * Global state for duress recording
 */
let recordingState: DuressRecordingState = {
  incidentId: null,
  audioRecording: null,
  isRecording: false,
};

/**
 * Manually set the current incident ID for duress evidence.
 * Useful to prime state before recording starts (e.g., right after login verdict).
 */
export function setDuressIncidentId(incidentId: string | null): void {
  recordingState.incidentId = incidentId;
}

/**
 * Start duress recording (audio only - video requires camera component)
 * This is called immediately after duress alert is sent.
 * 
 * @param incidentId - The alert ID to use as incident ID for evidence
 * @throws Error if recording fails to start
 */
export async function startDuressRecording(incidentId: string): Promise<void> {
  try {
    console.log('🎥 [duressRecording] Starting duress recording for incident:', incidentId);
    
    // Store incident ID
    recordingState.incidentId = incidentId;
    
    // Start audio recording
    console.log('🎤 [duressRecording] Starting audio recording...');
    recordingState.audioRecording = await startAudioRecording();
    recordingState.isRecording = true;
    
    console.log('✅ [duressRecording] Audio recording started successfully');
  } catch (error) {
    console.error('❌ [duressRecording] Failed to start recording:', error);
    recordingState.isRecording = false;
    throw error;
  }
}

/**
 * Stop duress recording and upload evidence
 * Called when duress mode ends or app closes
 * 
 * @returns Promise resolving when upload completes
 */
export async function stopDuressRecording(): Promise<void> {
  if (!recordingState.isRecording) {
    console.log('ℹ️ [duressRecording] No active recording to stop');
    return;
  }

  try {
    console.log('🛑 [duressRecording] Stopping duress recording...');
    
    // Stop and upload audio
    if (recordingState.audioRecording && recordingState.incidentId) {
      console.log('🎤 [duressRecording] Stopping audio recording...');
      const audioUri = await stopAudioRecording(recordingState.audioRecording);
      
      console.log('📤 [duressRecording] Uploading audio evidence...');
      await uploadEvidence(
        recordingState.incidentId,
        audioUri,
        'AUDIO',
        'audio/mpeg'
      );
      console.log('✅ [duressRecording] Audio evidence uploaded');
    }
    
    // Reset state
    recordingState.audioRecording = null;
    recordingState.isRecording = false;
    recordingState.incidentId = null;
    
    console.log('✅ [duressRecording] Duress recording stopped and uploaded');
  } catch (error) {
    console.error('❌ [duressRecording] Failed to stop recording:', error);
    // Reset state even on error
    recordingState.audioRecording = null;
    recordingState.isRecording = false;
    throw error;
  }
}

/**
 * Get current recording state
 */
export function getDuressRecordingState(): DuressRecordingState {
  return { ...recordingState };
}

/**
 * Get current incident ID (alert ID)
 */
export function getDuressIncidentId(): string | null {
  return recordingState.incidentId;
}

/**
 * Check if duress recording is active
 */
export function isDuressRecording(): boolean {
  return recordingState.isRecording;
}

/**
 * Upload video evidence (called from camera component)
 * 
 * @param videoUri - URI of the recorded video file
 * @throws Error if upload fails
 */
export async function uploadDuressVideo(videoUri: string): Promise<void> {
  const incidentId = recordingState.incidentId;
  
  if (!incidentId) {
    throw new Error('No active duress incident ID');
  }
  
  try {
    console.log('📤 [duressRecording] Uploading video evidence...');
    await uploadEvidence(incidentId, videoUri, 'VIDEO', 'video/mp4');
    console.log('✅ [duressRecording] Video evidence uploaded');
  } catch (error) {
    console.error('❌ [duressRecording] Failed to upload video:', error);
    throw error;
  }
}



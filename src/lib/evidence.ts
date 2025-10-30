import * as Crypto from 'expo-crypto';
import { Camera, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { api } from './api';

/**
 * Evidence kind types supported by the API
 */
export type EvidenceKind = 'VIDEO' | 'AUDIO' | 'PHOTO' | 'NEARBY' | 'TEXT';

/**
 * Permission status result
 */
export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Response from presign endpoint
 */
interface PresignResponse {
  url: string;  // Presigned PUT URL (5 min expiry)
  key: string;  // S3 object key
}

/**
 * Request payload for finalize endpoint
 */
interface FinalizeRequest {
  incidentId: string;
  kind: EvidenceKind;
  key: string;
  size: number;
  sha256: string;
  encIv?: string;
}

/**
 * Response from finalize endpoint
 */
interface FinalizeResponse {
  ok: true;
  id: string;
}

/**
 * Request a presigned URL for uploading evidence to S3
 * @param incidentId - The incident ID associated with the evidence
 * @param contentType - MIME type of the file (e.g., 'video/mp4', 'audio/mp3', 'image/jpeg')
 * @returns Presigned URL and S3 key
 */
export async function presignEvidence(
  incidentId: string,
  contentType: string
): Promise<PresignResponse> {
  return api<PresignResponse>('/v1/evidence/presign', {
    method: 'POST',
    body: JSON.stringify({ incidentId, contentType }),
  });
}

/**
 * Finalize evidence upload after successful S3 PUT
 * @param input - Evidence metadata including incident ID, kind, key, size, and hash
 * @returns Confirmation with evidence ID
 */
export async function finalizeEvidence(
  input: FinalizeRequest
): Promise<FinalizeResponse> {
  return api<FinalizeResponse>('/evidence/finalize', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Compute SHA-256 hash of a string
 * @param s - String to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function sha256String(s: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    s
  );
}

/**
 * Upload file to S3 using presigned URL
 * @param presignedUrl - Presigned PUT URL from presignEvidence
 * @param file - File data as Blob
 * @param contentType - MIME type of the file
 * @throws Error if upload fails
 */
export async function uploadToS3(
  presignedUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });
  
  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.status}`);
  }
}

/**
 * Request camera permission
 * @returns Permission result with granted status
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain,
  };
}

/**
 * Request microphone permission
 * @returns Permission result with granted status
 */
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Audio.requestPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain,
  };
}

/**
 * Capture a photo using the device camera
 * @returns URI of the captured photo
 * @throws Error if camera permission is not granted or capture fails
 */
export async function capturePhoto(): Promise<string> {
  const permission = await requestCameraPermission();
  
  if (!permission.granted) {
    throw new Error('Camera permission not granted');
  }
  
  // Note: This is a helper function that returns a URI placeholder
  // In a real implementation, this would be called from a component
  // that has a Camera component mounted and can call camera.takePictureAsync()
  throw new Error('capturePhoto must be called from a component with Camera mounted');
}

/**
 * Start recording audio
 * @returns Recording instance
 * @throws Error if microphone permission is not granted or recording fails
 */
export async function startAudioRecording(): Promise<Audio.Recording> {
  const permission = await requestMicrophonePermission();
  
  if (!permission.granted) {
    throw new Error('Microphone permission not granted');
  }
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  
  return recording;
}

/**
 * Stop audio recording and return the file URI
 * @param recording - Recording instance from startAudioRecording
 * @returns URI of the recorded audio file
 * @throws Error if stopping recording fails
 */
export async function stopAudioRecording(recording: Audio.Recording): Promise<string> {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });
  
  const uri = recording.getURI();
  if (!uri) {
    throw new Error('Failed to get recording URI');
  }
  
  return uri;
}

/**
 * Compute SHA-256 hash of a file
 * @param fileUri - File URI (e.g., from FileSystem or Camera)
 * @returns Hex-encoded SHA-256 hash
 */
export async function sha256File(fileUri: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    fileUri,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
}

/**
 * Complete evidence upload flow with retry logic
 * @param incidentId - The incident ID associated with the evidence
 * @param fileUri - Local file URI to upload
 * @param kind - Evidence kind (VIDEO, AUDIO, PHOTO, etc.)
 * @param contentType - MIME type of the file
 * @returns Evidence ID from finalize response
 * @throws Error if upload or finalize fails after retries
 */
export async function uploadEvidence(
  incidentId: string,
  fileUri: string,
  kind: EvidenceKind,
  contentType: string
): Promise<string> {
  // Step 1: Get presigned URL
  const { url: presignedUrl, key } = await presignEvidence(incidentId, contentType);
  
  // Step 2: Read file and compute hash
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }
  
  const fileSize = fileInfo.size || 0;
  const fileHash = await sha256File(fileUri);
  
  // Step 3: Read file as blob
  const fileBlob = await fetch(fileUri).then(res => res.blob());
  
  // Step 4: Upload to S3
  await uploadToS3(presignedUrl, fileBlob, contentType);
  
  // Step 5: Finalize with retry logic (up to 2 retries)
  const finalizeResult = await finalizeWithRetry(
    {
      incidentId,
      kind,
      key,
      size: fileSize,
      sha256: fileHash,
    },
    2
  );
  
  return finalizeResult.id;
}

/**
 * Finalize evidence with exponential backoff retry logic
 * @param input - Finalize request payload
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @param attempt - Current attempt number (internal use)
 * @returns Finalize response with evidence ID
 * @throws Error if all retries are exhausted
 */
async function finalizeWithRetry(
  input: FinalizeRequest,
  maxRetries: number = 2,
  attempt: number = 0
): Promise<FinalizeResponse> {
  try {
    return await finalizeEvidence(input);
  } catch (error) {
    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return finalizeWithRetry(input, maxRetries, attempt + 1);
    }
    throw error;
  }
}

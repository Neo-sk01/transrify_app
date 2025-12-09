# Camera Implementation Documentation

## Overview
This document details the current camera and video recording implementation for duress evidence capture in the Transrify Expo mobile app.

---

## Architecture

### 1. **Component Structure**

#### **LandingScreen.tsx** (Main Camera Component)
- **Location**: `src/screens/LandingScreen.tsx`
- **Purpose**: Main screen that displays after authentication; contains hidden camera for duress video recording
- **Key Features**:
  - Conditionally renders hidden `CameraView` when `limitedMode === true` (duress mode)
  - Manages camera lifecycle and video recording state
  - Handles automatic video recording start/stop during duress

#### **evidence.ts** (Core Evidence Library)
- **Location**: `src/lib/evidence.ts`
- **Purpose**: Centralized module for all evidence-related operations
- **Key Functions**:
  - Permission management (camera, microphone)
  - Audio/video recording helpers
  - File validation and hashing
  - Evidence upload flow (presign → S3 → finalize)

#### **duressRecording.ts** (Duress Recording Service)
- **Location**: `src/lib/duressRecording.ts`
- **Purpose**: Manages automatic audio recording during duress mode
- **Key Functions**:
  - Start/stop audio recording
  - Upload audio evidence
  - Store incident ID for evidence linkage

#### **LoginScreen.tsx** (Duress Trigger)
- **Location**: `src/screens/LoginScreen.tsx`
- **Purpose**: Initiates duress recording when duress PIN is entered
- **Key Action**: Calls `startDuressRecording()` when `verdict === 'DURESS'`

---

## 2. **Camera Component Implementation**

### **CameraView Setup** (LandingScreen.tsx, lines 499-518)

```typescript
{limitedMode && (
  <View style={styles.hiddenCameraContainer}>
    <CameraView
      ref={cameraRef}
      style={styles.hiddenCamera}
      facing="back"
      onCameraReady={() => {
        console.log('✅ [LandingScreen] Camera ready callback fired');
        setCameraReady(true);
      }}
      onMountError={(error) => {
        console.error('❌ [LandingScreen] Camera mount error:', error);
      }}
    />
  </View>
)}
```

**Key Properties**:
- **`ref={cameraRef}`**: React ref of type `useRef<CameraView>(null)`
- **`facing="back"`**: Uses back-facing camera
- **`onCameraReady`**: Callback that sets `cameraReady` state to `true`
- **`onMountError`**: Error handler for camera mount failures
- **Hidden Styling**: Positioned off-screen (`top: -1000, left: -1000, width: 1, height: 1, opacity: 0`)

**Missing Properties** (Potential Issues):
- ❌ No `mode` prop specified (defaults to `'picture'` - may need `'video'`)
- ❌ No `active` prop specified (defaults to `true` but not explicit)
- ❌ No `mute` prop (audio recording enabled by default)

---

## 3. **Video Recording Flow**

### **Recording Start Logic** (LandingScreen.tsx, lines 283-391)

**Step 1: Permission Check**
```typescript
const cameraPermission = await requestCameraPermission();
const micPermission = await requestMicrophonePermission();
if (!cameraPermission.granted || !micPermission.granted) {
  return; // Abort if permissions not granted
}
```

**Step 2: Camera Readiness Wait**
```typescript
let retries = 0;
const maxRetries = 10;
while (!cameraReady && retries < maxRetries) {
  await new Promise(resolve => setTimeout(resolve, 500));
  retries++;
}
```

**Step 3: Camera State Validation**
```typescript
if (!mounted || !cameraRef.current || !cameraReady) {
  console.warn('⚠️ Camera not ready for video recording');
  return; // Abort if camera not ready
}
```

**Step 4: Start Recording**
```typescript
const recordingOptions: CameraRecordingOptions = {
  maxDuration: 3600, // 1 hour max
  maxFileSize: 100 * 1024 * 1024, // 100 MB max
};

const recordMethod = (cameraRef.current as any)?.recordAsync || (cameraRef.current as any)?.record;
if (cameraViewInstance && typeof recordMethod === 'function') {
  videoRecordingPromiseRef.current = recordMethod.call(cameraViewInstance, recordingOptions);
}
```

**Step 5: Auto-Stop Timer**
```typescript
videoStopTimeoutRef.current = setTimeout(stopVideoRecording, 8_000); // 8 seconds
```

### **Recording Stop Logic** (LandingScreen.tsx, lines 259-281)

```typescript
const stopVideoRecording = async () => {
  if (videoStoppingRef.current) return; // Prevent double-stop
  videoStoppingRef.current = true;
  
  if (cameraRef.current && videoRecordingPromiseRef.current) {
    cameraRef.current.stopRecording(); // Stop the recording
    const result = await videoRecordingPromiseRef.current; // Wait for promise
    if (result?.uri) {
      await uploadDuressVideo(result.uri); // Upload video
    }
  }
};
```

---

## 4. **Permission Management**

### **Camera Permission** (evidence.ts, lines 161-167)

```typescript
export async function requestCameraPermission(): Promise<PermissionResult> {
  const response: PermissionResponse = await Camera.requestCameraPermissionsAsync();
  return {
    granted: response.granted,
    canAskAgain: response.canAskAgain,
  };
}
```

**Implementation Details**:
- Uses `expo-camera`'s `Camera.requestCameraPermissionsAsync()`
- Returns simplified `PermissionResult` interface
- Called before video recording starts

### **Microphone Permission** (evidence.ts, lines 173-179)

```typescript
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  const response: PermissionResponse = await Camera.requestMicrophonePermissionsAsync();
  return {
    granted: response.granted,
    canAskAgain: response.canAskAgain,
  };
}
```

**Implementation Details**:
- Uses `expo-camera`'s `Camera.requestMicrophonePermissionsAsync()`
- Required for video recording with audio
- Called before video recording starts

---

## 5. **Evidence Upload Flow**

### **Upload Pipeline** (evidence.ts, lines 363-396)

**Step 1: File Validation**
```typescript
const fileInfo = await validateFile(fileUri);
const fileSize = (fileInfo as any).size || 0;
const fileHash = await sha256File(fileUri);
```

**Step 2: Get Presigned URL**
```typescript
const { url: presignedUrl, key } = await presignEvidence(incidentId, contentType);
// POST /v1/evidence/presign
// Body: { incidentId, contentType }
// Response: { url, key }
```

**Step 3: Upload to S3**
```typescript
const fileBlob = await fetch(fileUri).then(res => res.blob());
await uploadToS3(presignedUrl, fileBlob, contentType);
// PUT to presigned URL with file blob
```

**Step 4: Finalize Evidence**
```typescript
await finalizeWithRetry({
  incidentId,
  kind: 'VIDEO' | 'AUDIO',
  key,
  size: fileSize,
  sha256: fileHash,
}, 2);
// POST /evidence/finalize
// Body: { incidentId, kind, key, size, sha256 }
// Response: { ok: true, id: evidenceId }
```

**Retry Logic**: Exponential backoff (1s, 2s, 4s) with max 2 retries

---

## 6. **State Management**

### **Camera State** (LandingScreen.tsx)

```typescript
const cameraRef = useRef<CameraView>(null);
const videoRecordingPromiseRef = useRef<Promise<{ uri: string } | undefined> | null>(null);
const videoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const videoStoppingRef = useRef(false);
const [cameraReady, setCameraReady] = useState(false);
```

**State Variables**:
- **`cameraRef`**: Reference to CameraView component
- **`videoRecordingPromiseRef`**: Promise that resolves when recording stops
- **`videoStopTimeoutRef`**: Timer reference for auto-stop
- **`videoStoppingRef`**: Flag to prevent double-stop
- **`cameraReady`**: Boolean state set by `onCameraReady` callback

### **Duress Recording State** (duressRecording.ts, lines 22-26)

```typescript
let recordingState: DuressRecordingState = {
  incidentId: string | null,
  audioRecording: Audio.Recording | null,
  isRecording: boolean,
};
```

**Global State**:
- **`incidentId`**: Current incident ID for evidence linkage
- **`audioRecording`**: Active audio recording instance
- **`isRecording`**: Flag indicating active recording

---

## 7. **Duress Flow Integration**

### **Login Screen** (LoginScreen.tsx)

When duress PIN is entered:
1. Login API returns `verdict: 'DURESS'` with `incidentId`
2. `startDuressRecording(incidentId)` is called
3. Audio recording starts immediately
4. User navigates to LandingScreen

### **Landing Screen** (LandingScreen.tsx)

When `limitedMode === true`:
1. Hidden `CameraView` is mounted
2. `onCameraReady` callback fires → sets `cameraReady = true`
3. `useEffect` hook triggers `startVideoRecording()` after 1 second delay
4. Video recording starts with 8-second auto-stop timer
5. On stop, video is uploaded via `uploadDuressVideo()`

---

## 8. **File Handling**

### **File Validation** (evidence.ts, lines 214-227)

```typescript
async function validateFile(fileUri: string): Promise<FileSystem.FileInfo> {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) {
    throw new Error('File does not exist');
  }
  const size = info.size ?? 0;
  const maxBytes = 100 * 1024 * 1024; // 100 MB
  if (size > maxBytes) {
    throw new Error('File exceeds 100MB limit');
  }
  return info;
}
```

### **SHA-256 Hashing** (evidence.ts, lines 340-352)

```typescript
export async function sha256File(fileUri: string): Promise<string> {
  await validateFile(fileUri);
  const response = await fetch(fileUri);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const digest = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytes
  );
  return arrayBufferToHex(digest);
}
```

---

## 9. **Error Handling**

### **Camera Errors**
- **Mount Errors**: Handled by `onMountError` callback
- **Permission Denied**: Logged and recording aborted
- **Camera Not Ready**: Retry loop (10 attempts, 500ms intervals)
- **Recording Errors**: Caught in promise `.catch()` handler

### **Upload Errors**
- **S3 Upload Failure**: Throws error with status code
- **Finalize Failure**: Retries with exponential backoff (max 2 retries)
- **File Validation Failure**: Throws descriptive error messages

---

## 10. **Known Issues**

### **Issue 1: Camera Ready State Race Condition**
- **Problem**: `onCameraReady` fires, but `cameraReady` state may not be updated when recording starts
- **Symptom**: Logs show `cameraReady: false` even after `onCameraReady` callback fired
- **Location**: LandingScreen.tsx, line 325

### **Issue 2: Missing Camera Mode**
- **Problem**: `CameraView` doesn't specify `mode="video"` prop
- **Impact**: Camera may default to picture mode, affecting video recording capability
- **Location**: LandingScreen.tsx, line 501

### **Issue 3: Camera Ref Method Detection**
- **Problem**: Uses `as any` type casting to access `recordAsync` method
- **Impact**: Type safety compromised, potential runtime errors
- **Location**: LandingScreen.tsx, lines 341-345

### **Issue 4: Timing Issues**
- **Problem**: 1-second delay before starting recording may not be sufficient
- **Impact**: Camera may not be fully initialized when recording starts
- **Location**: LandingScreen.tsx, line 394

---

## 11. **Dependencies**

### **Expo Packages**
- `expo-camera`: Camera component and permissions
- `expo-av`: Audio recording (deprecated, will be replaced)
- `expo-file-system`: File operations
- `expo-crypto`: SHA-256 hashing

### **React Native**
- `react-native`: Core framework
- `@react-navigation/native`: Navigation

---

## 12. **API Endpoints**

### **Presign Evidence**
- **Endpoint**: `POST /v1/evidence/presign`
- **Body**: `{ incidentId: string, contentType: string }`
- **Response**: `{ url: string, key: string }`

### **Finalize Evidence**
- **Endpoint**: `POST /evidence/finalize`
- **Body**: `{ incidentId, kind, key, size, sha256 }`
- **Response**: `{ ok: true, id: string }`

### **List Evidence**
- **Endpoint**: `GET /v1/evidence/list?incidentId=<id>`
- **Response**: `EvidenceItem[]`

### **Download Evidence**
- **Endpoint**: `GET /v1/evidence/download?evidenceId=<id>`
- **Response**: `{ url: string }`

---

## 13. **Logging and Debugging**

### **Console Logs**
- **Camera Ready**: `✅ [LandingScreen] Camera ready callback fired`
- **Permission Status**: `🎥 [LandingScreen] Camera perm granted: true`
- **Recording Start**: `🎥 [LandingScreen] Starting video recording...`
- **Recording Stop**: `🛑 [LandingScreen] Stopping video recording...`
- **Upload Status**: `📤 [LandingScreen] Uploading final video...`
- **Errors**: `❌ [LandingScreen] ...` prefix

### **State Logging**
- Camera state object logged before recording starts
- Includes: `mounted`, `hasRef`, `cameraReady`, `refMethods`

---

## 14. **Styling**

### **Hidden Camera Container** (LandingScreen.tsx, lines 801-813)

```typescript
hiddenCameraContainer: {
  position: 'absolute',
  top: -1000,      // Off-screen
  left: -1000,    // Off-screen
  width: 1,       // Minimal size
  height: 1,      // Minimal size
  overflow: 'hidden',
  opacity: 0,     // Invisible
},
hiddenCamera: {
  width: 1,
  height: 1,
},
```

**Purpose**: Camera is completely hidden from user view while still functional

---

## 15. **Current Behavior**

### **Working**
✅ Audio recording starts immediately on duress
✅ Audio uploads successfully
✅ Camera permissions are requested correctly
✅ Camera component mounts and `onCameraReady` fires
✅ Camera ref has `recordAsync` and `stopRecording` methods available

### **Not Working**
❌ Video recording never starts (blocked by `cameraReady === false`)
❌ `cameraReady` state doesn't update reliably after `onCameraReady` fires
❌ Video file is never created or uploaded

---

## 16. **Next Steps for Fix**

1. **Add `mode="video"` prop** to `CameraView` component
2. **Fix state update timing** - ensure `cameraReady` updates before recording check
3. **Add `active={true}` prop** explicitly
4. **Consider using `useEffect` dependency on `cameraReady`** instead of polling
5. **Add proper TypeScript types** for camera ref methods
6. **Increase initial delay** or use `onCameraReady` to trigger recording start

---

## Summary

The implementation has a solid foundation with proper permission handling, upload flow, and error handling. However, there's a critical issue with the camera readiness state management that prevents video recording from starting. The `onCameraReady` callback fires, but the state update doesn't happen in time for the recording start logic, causing the recording to be aborted.


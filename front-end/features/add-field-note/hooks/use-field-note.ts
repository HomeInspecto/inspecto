import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useState, useRef, useCallback } from 'react';
import type { AddFieldNoteProps } from '../views/add-field-note-view';
import { Keyboard, Alert } from 'react-native';
import { Audio } from 'expo-av';


const API_BASE = 'https://inspecto-production.up.railway.app';
const TRANSCRIBE_PATH = '/api/transcriptions/transcribe';  

export function useFieldNotes(goToLogObservation: () => void): AddFieldNoteProps {
  const note = useActiveObservationStore(s => s.fieldNote);
  const setFieldNote = useActiveObservationStore(s => s.setFieldNote);

  const [focused, setFocus] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isRecordingRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [perm, requestPerm] = Audio.usePermissions();


  const startRecording = useCallback(async () => {
    try {
      if (!perm?.granted) {
        const p = await requestPerm();
        if (!p.granted) {
          Alert.alert('Microphone permission is required');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      recordingRef.current = rec;
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err: any) {
      Alert.alert('Could not start recording', err?.message ?? 'Unknown error');
    }
  }, [perm, requestPerm]);

  const uploadAndTranscribe = useCallback(async (uri: string) => {
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('file', {
        uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);

      const res = await fetch(`${API_BASE}${TRANSCRIBE_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Transcription failed (${res.status})`);
      }

      // Try common response shapes, fall back to stringify
      const text =
        json?.transcription ??
        json?.text ??
        json?.transcript ??
        json?.data?.transcription ??
        json?.data?.text ??
        json?.data?.transcript;

      if (typeof text === 'string') {
        const newNote = note && note.trim().length ? `${note.trim()}\n${text.trim()}` : text.trim();
        setFieldNote(newNote);
      } else {
        Alert.alert('Unexpected response format');
        console.log('Full response:', json);
      }

    } catch (err: any) {
      Alert.alert('Upload error', err?.message ?? 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  }, [setFieldNote, note]);

  const stopRecording = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      isRecordingRef.current = false;
      setIsRecording(false);

      if (!uri) {
        Alert.alert('No recording file found');
        return;
      }

      await uploadAndTranscribe(uri);
    } catch (err: any) {
      Alert.alert('Stop failed', err?.message ?? 'Unknown error');
      setIsRecording(false);
      isRecordingRef.current = false;
      recordingRef.current = null;
    }
  }, [uploadAndTranscribe]);

  const onFocus = () => {
    setFocus(true);
  };
  const onBlur = () => {
    setFocus(false);
  };

  function onMicStart() {
    startRecording();
  }

  function onMicStop() {
    stopRecording();
  }

  function onNextPress() {
    Keyboard.dismiss();
    goToLogObservation();
  }

  function onChangeText(text: string) {
    setFieldNote(text);
  }

  return {
    note,
    focused,
    isRecording,
    isUploading,
    onFocus,
    onBlur,
    onChangeText,
    onMicStart,
    onMicStop,
    onNextPress,
  };
}

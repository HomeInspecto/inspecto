// app/record.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');


export default function RecordScreen() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [polished, setPolished] = useState('');
  const recordingUriRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const res = await requestPermission();
        if (res.status !== 'granted') {
          Alert.alert('Permission needed', 'Microphone permission is required to record.');
        }
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      setTranscript(''); setPolished('');
      const options: Audio.RecordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(options);
      await rec.startAsync();
      setRecording(rec); setIsRecording(true);
    } catch (e: any) { console.error(e); Alert.alert('Error', 'Failed to start recording.'); }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      recordingUriRef.current = recording.getURI();
      setRecording(null); setIsRecording(false);
    } catch (e: any) { console.error(e); Alert.alert('Error', 'Failed to stop recording.'); }
  };

  const uploadAndProcess = async () => {
    try {
      const uri = recordingUriRef.current;
      if (!uri) return Alert.alert('No audio', 'Please record something first.');
      setUploading(true);
      const form = new FormData();
      form.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as any);
      const res = await fetch(`${API_BASE}/api/transcribe-and-rewrite`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { console.error('Upload error', data); Alert.alert('Server error', data?.error ?? 'Unknown'); }
      setTranscript(data?.transcript ?? ''); setPolished(data?.polished ?? '');
      setUploading(false);
    } catch (e: any) { console.error(e); Alert.alert('Network error', e?.message ?? 'Failed to upload'); setUploading(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '600' }}>Record & Review</Text>
        <Text style={{ opacity: 0.7 }}>Record your voice → Stop → Review to see polished sentences.</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {!isRecording ? (
            <Pressable onPress={startRecording} style={{ backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>● Record</Text>
            </Pressable>
          ) : (
            <Pressable onPress={stopRecording} style={{ backgroundColor: '#ef4444', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>■ Stop</Text>
            </Pressable>
          )}

          <Pressable onPress={uploadAndProcess} disabled={uploading} style={{ backgroundColor: uploading ? '#94a3b8' : '#10b981', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>{uploading ? 'Uploading…' : 'Review'}</Text>
          </Pressable>
        </View>

        {uploading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator /><Text>Sending audio to server…</Text>
          </View>
        )}

        {polished ? (
          <View style={{ marginTop: 8, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>Polished</Text>
            <Text style={{ lineHeight: 22 }}>{polished}</Text>
          </View>
        ) : null}

        {transcript ? (
          <View style={{ marginTop: 8, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6, opacity: 0.8 }}>Transcript (raw)</Text>
            <Text style={{ lineHeight: 22, opacity: 0.9 }}>{transcript}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

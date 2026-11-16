import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Camera, Images, Info, RotateCw, X, Zap, ZapOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateDocument } from '@/features/documents/hooks/use-documents';
import { usePendingDocumentStore } from '@/features/documents/stores/pending-document-store';
import type { PickedFile } from '@/features/documents/types';
import { useProduct } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { ScannerFrame } from '@/features/receipt-scanner/components/scanner-frame';
import { receiptFileName, rotateImage } from '@/features/receipt-scanner/services/image-adjuster';
import { useScanResultStore } from '@/features/receipt-scanner/stores/scan-result-store';
import { toast } from '@/shared/components/feedback/toast-store';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { mediaPicker } from '@/shared/services/media-picker';

type ScannerMode = 'product' | 'draft' | 'library';

function RoundButton({ icon: Icon, label, onPress, disabled }: { icon: typeof Camera; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className="h-12 w-12 items-center justify-center rounded-full active:opacity-70"
      style={{ backgroundColor: 'rgba(255,255,255,0.16)', opacity: disabled ? 0.4 : 1 }}
    >
      <Icon size={22} color="#FFFFFF" strokeWidth={2} />
    </Pressable>
  );
}

export default function ScannerScreen() {
  const params = useLocalSearchParams<{ mode?: ScannerMode; productId?: string; requestId?: string }>();
  const mode: ScannerMode = params.mode ?? 'library';
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState<PickedFile | null>(null);
  const publish = useScanResultStore((state) => state.publish);
  const setPendingDocument = usePendingDocumentStore((state) => state.set);
  const product = useProduct(mode === 'product' ? params.productId : undefined);
  const createDocument = useCreateDocument();

  const capture = async () => {
    if (!cameraRef.current || busy) {
      return;
    }
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCaptured({ uri: photo.uri, name: receiptFileName(), mimeType: 'image/jpeg', size: null });
    } catch {
      toast.error(t.scanner.captureFailed);
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const file = await mediaPicker.pickImage({ allowsEditing: true });
      if (file) {
        setCaptured({ ...file, name: receiptFileName() });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const rotate = async () => {
    if (!captured) {
      return;
    }
    setBusy(true);
    try {
      setCaptured(await rotateImage(captured, 90));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const use = () => {
    if (!captured) {
      return;
    }
    if (mode === 'draft' && params.requestId) {
      publish(params.requestId, captured);
      router.back();
      return;
    }
    if (mode === 'product' && product.data) {
      const title = getProductTitle(product.data);
      createDocument.mutate(
        { input: { file: captured, type: 'receipt', name: captured.name.replace(/\.jpg$/, ''), productId: product.data.id }, subject: title },
        {
          onSuccess: () => {
            toast.success(t.documents.saved);
            router.back();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        },
      );
      return;
    }
    setPendingDocument(captured);
    router.replace('/documents/new');
  };

  const close = () => router.back();

  const topBar = (
    <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 12 }}>
      <RoundButton icon={X} label={t.common.close} onPress={close} />
      <Text accessibilityRole="header" className="font-display text-[17px] text-[#FFFFFF]">
        {captured ? t.scanner.previewTitle : t.scanner.title}
      </Text>
      {captured || !permission?.granted || unavailable ? (
        <View className="w-12" />
      ) : (
        <RoundButton icon={torch ? ZapOff : Zap} label={torch ? t.scanner.flipFlashOff : t.scanner.flipFlashOn} onPress={() => setTorch((value) => !value)} />
      )}
    </View>
  );

  if (captured) {
    return (
      <View className="flex-1" style={{ backgroundColor: '#0B0F0C' }}>
        <StatusBar style="light" />
        {topBar}
        <View className="flex-1 px-5 py-5">
          <Image source={{ uri: captured.uri }} style={{ flex: 1, borderRadius: 16 }} contentFit="contain" accessibilityLabel={t.scanner.previewTitle} />
        </View>
        <View className="gap-3 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="flex-row items-start gap-2.5 rounded-sm px-3.5 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <Info size={16} color="#CFD6CE" strokeWidth={2} />
            <Text className="flex-1 font-body text-[12.5px] leading-[18px] text-[#CFD6CE]">{t.scanner.ocrNote}</Text>
          </View>
          <View className="flex-row gap-2.5">
            <Button label={t.scanner.retake} variant="secondary" className="flex-1" disabled={busy || createDocument.isPending} onPress={() => setCaptured(null)} />
            <Button label={t.scanner.rotate} icon={RotateCw} variant="secondary" className="flex-1" disabled={busy || createDocument.isPending} onPress={rotate} />
          </View>
          <Button label={t.scanner.usePhoto} block loading={busy || createDocument.isPending} onPress={use} />
        </View>
      </View>
    );
  }

  const cameraBlocked = permission && !permission.granted;

  return (
    <View className="flex-1" style={{ backgroundColor: '#0B0F0C' }}>
      <StatusBar style="light" />
      {permission?.granted && !unavailable ? (
        <CameraView
          ref={cameraRef}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          facing="back"
          enableTorch={torch}
          onCameraReady={() => setReady(true)}
          onMountError={() => setUnavailable(true)}
        />
      ) : null}
      {topBar}
      <View className="flex-1 justify-center px-6">
        {!permission ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : cameraBlocked || unavailable ? (
          <View className="items-center gap-4 rounded-lg p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Camera size={28} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <Text className="text-center font-display text-[17px] text-[#FFFFFF]">{unavailable ? t.scanner.title : t.scanner.permissionTitle}</Text>
            <Text className="text-center font-body text-[13.5px] leading-[20px] text-[#CFD6CE]">
              {unavailable ? t.scanner.cameraUnavailable : permission.canAskAgain ? t.scanner.permissionDescription : t.scanner.permissionDenied}
            </Text>
            {!unavailable ? (
              permission.canAskAgain ? (
                <Button label={t.scanner.grant} block onPress={() => void requestPermission()} />
              ) : (
                <Button label={t.common.openSettings} block onPress={() => void Linking.openSettings()} />
              )
            ) : null}
            <Button label={t.scanner.gallery} variant="secondary" block onPress={pickFromGallery} />
          </View>
        ) : (
          <View className="gap-5">
            <ScannerFrame />
            <Text className="text-center font-semibold text-[13.5px] text-[#FFFFFF]">{t.scanner.hint}</Text>
          </View>
        )}
      </View>
      {permission?.granted && !unavailable ? (
        <View className="flex-row items-center justify-between px-10" style={{ paddingBottom: insets.bottom + 24 }}>
          <RoundButton icon={Images} label={t.scanner.gallery} onPress={pickFromGallery} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.scanner.capture}
            disabled={!ready || busy}
            onPress={capture}
            className="h-[76px] w-[76px] items-center justify-center rounded-full border-4 active:opacity-80"
            style={{ borderColor: '#FFFFFF', opacity: ready ? 1 : 0.5 }}
          >
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <View className="h-[58px] w-[58px] rounded-full bg-[#FFFFFF]" />}
          </Pressable>
          <View className="w-12" />
        </View>
      ) : null}
    </View>
  );
}

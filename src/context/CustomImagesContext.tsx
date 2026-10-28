import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem, getItemImage } from '../data/menuData';
import {
  loadAllCustomImages,
  saveCustomImageToDB,
  deleteCustomImageFromDB,
  clearAllCustomImagesFromDB,
  optimizeImage,
} from '../utils/imageStorage';

export interface ToastInfo {
  id: number;
  text: string;
  image?: string;
  type: 'success' | 'info' | 'error';
}

interface CustomImagesContextType {
  customImages: Record<string, string>;
  isLoading: boolean;
  getImage: (item: MenuItem) => string;
  hasCustomImage: (itemId: string) => boolean;
  saveImage: (itemId: string, source: File | Blob | string, itemName?: string) => Promise<boolean>;
  pasteFromClipboard: (itemId: string, itemName?: string) => Promise<{ success: boolean; message?: string }>;
  removeImage: (itemId: string, itemName?: string) => Promise<void>;
  resetAllImages: () => Promise<void>;
  toast: ToastInfo | null;
  dismissToast: () => void;
}

const CustomImagesContext = createContext<CustomImagesContextType | undefined>(undefined);

export const CustomImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Load custom images from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    loadAllCustomImages()
      .then((loaded) => {
        if (isMounted) {
          setCustomImages(loaded);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = useCallback((text: string, image?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const newToast: ToastInfo = {
      id: Date.now(),
      text,
      image,
      type,
    };
    setToast(newToast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToast((curr) => (curr?.id === newToast.id ? null : curr));
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Resolves the image for an item, preferring user-pasted custom image
  const getImage = useCallback(
    (item: MenuItem): string => {
      if (customImages[item.id]) {
        return customImages[item.id];
      }
      return getItemImage(item);
    },
    [customImages]
  );

  const hasCustomImage = useCallback(
    (itemId: string): boolean => {
      return Boolean(customImages[itemId]);
    },
    [customImages]
  );

  // Saves a new image (from file, blob, or base64) and automatically updates storage and UI
  const saveImage = useCallback(
    async (itemId: string, source: File | Blob | string, itemName?: string): Promise<boolean> => {
      try {
        let finalDataUrl = '';

        if (typeof source === 'string') {
          // If already a dataUrl or URL
          if (source.startsWith('data:image')) {
            finalDataUrl = source;
          } else {
            // Fetch and convert external URL
            try {
              const res = await fetch(source);
              const blob = await res.blob();
              finalDataUrl = await optimizeImage(blob);
            } catch {
              finalDataUrl = source;
            }
          }
        } else {
          finalDataUrl = await optimizeImage(source);
        }

        if (!finalDataUrl) {
          showToast('تعذر معالجة الصورة المحددة', undefined, 'error');
          return false;
        }

        // 1. Save to persistent DB
        await saveCustomImageToDB(itemId, finalDataUrl, itemName);

        // 2. Update reactive state immediately
        setCustomImages((prev) => ({
          ...prev,
          [itemId]: finalDataUrl,
        }));

        // 3. User feedback
        const displayName = itemName ? `«${itemName}»` : 'الصنف';
        showToast(`تم حفظ ونشر صورة ${displayName} كصورة عامة للجميع بنجاح! 🌐`, finalDataUrl, 'success');
        return true;
      } catch (err) {
        console.error('Failed to save custom image:', err);
        showToast('حدث خطأ أثناء حفظ الصورة', undefined, 'error');
        return false;
      }
    },
    [showToast]
  );

  // Reads image directly from system clipboard via Navigator Clipboard API
  const pasteFromClipboard = useCallback(
    async (itemId: string, itemName?: string): Promise<{ success: boolean; message?: string }> => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.read) {
          return {
            success: false,
            message: 'متصفحك يطلب الضغط على Ctrl+V للصق الصورة مباشرةً.',
          };
        }

        const clipboardItems = await navigator.clipboard.read();
        let foundImageBlob: Blob | null = null;

        for (const item of clipboardItems) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            foundImageBlob = await item.getType(imageType);
            break;
          }
        }

        if (!foundImageBlob) {
          return {
            success: false,
            message: 'لا توجد صورة في الحافظة حالياً. انسخ صورة أولاً ثم الصقها أو استخدم زر رفع صورة.',
          };
        }

        const saved = await saveImage(itemId, foundImageBlob, itemName);
        return {
          success: saved,
          message: saved ? 'تم لصق وحفظ الصورة تلقائياً' : 'فشل حفظ الصورة',
        };
      } catch (err) {
        // Clipboard permission denied or gesture required
        return {
          success: false,
          message: 'يرجى الضغط على مفتاحي Ctrl + V (أو ⌘+V) للصق الصورة مباشرةً.',
        };
      }
    },
    [saveImage]
  );

  // Removes custom image and restores original default
  const removeImage = useCallback(
    async (itemId: string, itemName?: string): Promise<void> => {
      await deleteCustomImageFromDB(itemId);
      setCustomImages((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      const displayName = itemName ? `«${itemName}»` : 'الصنف';
      showToast(`تمت استعادة الصورة الافتراضية لـ ${displayName}`, undefined, 'info');
    },
    [showToast]
  );

  // Resets all custom images
  const resetAllImages = useCallback(async (): Promise<void> => {
    await clearAllCustomImagesFromDB();
    setCustomImages({});
    showToast('تمت استعادة كافة الصور الافتراضية للمنيو', undefined, 'info');
  }, [showToast]);

  return (
    <CustomImagesContext.Provider
      value={{
        customImages,
        isLoading,
        getImage,
        hasCustomImage,
        saveImage,
        pasteFromClipboard,
        removeImage,
        resetAllImages,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CustomImagesContext.Provider>
  );
};

export const useCustomImages = () => {
  const context = useContext(CustomImagesContext);
  if (!context) {
    throw new Error('useCustomImages must be used within a CustomImagesProvider');
  }
  return context;
};

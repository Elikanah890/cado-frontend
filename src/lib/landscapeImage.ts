export async function normalizeLandscapeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = bitmap.width / bitmap.height;

    // Already 16:9 — keep the original quality/format.
    if (Math.abs(ratio - 16 / 9) <= 0.02) {
      bitmap.close?.();
      return file;
    }

    const width = 1920;
    const height = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    // Cover-crop to fill the 16:9 frame (no bars/letterboxing).
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const drawWidth = bitmap.width * scale;
    const drawHeight = bitmap.height * scale;
    ctx.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return file;

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, '') || 'image'}.jpg`,
      { type: 'image/jpeg' }
    );
  } catch {
    return file;
  }
}

export async function normalizePortraitImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = bitmap.width / bitmap.height;
    if (Math.abs(ratio - 4 / 5) <= 0.02) {
      bitmap.close?.();
      return file;
    }

    const width = 1080;
    const height = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    const coverScale = Math.max(width / bitmap.width, height / bitmap.height);
    const coverWidth = bitmap.width * coverScale;
    const coverHeight = bitmap.height * coverScale;
    ctx.filter = 'blur(32px)';
    ctx.drawImage(bitmap, (width - coverWidth) / 2, (height - coverHeight) / 2, coverWidth, coverHeight);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(0, 0, width, height);

    const containScale = Math.min(width / bitmap.width, height / bitmap.height);
    const containWidth = bitmap.width * containScale;
    const containHeight = bitmap.height * containScale;
    ctx.drawImage(bitmap, (width - containWidth) / 2, (height - containHeight) / 2, containWidth, containHeight);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

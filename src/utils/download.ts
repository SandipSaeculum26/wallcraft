export async function downloadImage(url: string, filename: string) {
  try {
    const img = new Image();

    // allow cross-origin image loading
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    // wait for image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });

    // create canvas and draw image
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.drawImage(img, 0, 0);

    // convert canvas to blob and download
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;

        document.body.appendChild(link); // more real-world approach
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(downloadUrl);
      },
      "image/jpeg",
      0.9,
    );
  } catch (err) {
    console.error("Download failed:", err);

    // fallback: open image in new tab
    window.open(url, "_blank");
  }
}

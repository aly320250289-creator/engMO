import React, { useEffect, useRef } from 'react';

// هذا المكون يستقبل الصورة الكاملة ومربع الإحداثيات ويقوم بقص الجزء المطلوب فوراً وبأداء فائق السرعة
export default function DynamicCrop({ imageUrl, boundingBox }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !boundingBox || boundingBox.length !== 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      // إحداثيات Gemini تأتي منسوبة لقيم تتراوح بين 0 و 1000 [ymin, xmin, ymax, xmax]
      const [ymin, xmin, ymax, xmax] = boundingBox;

      // تحويل الإحداثيات النسبية إلى قيم حقيقية متوافقة مع الأبعاد الأصلية للصورة المعالجة
      const x = (xmin / 1000) * img.naturalWidth;
      const y = (ymin / 1000) * img.naturalHeight;
      const width = ((xmax - xmin) / 1000) * img.naturalWidth;
      const height = ((ymax - ymin) / 1000) * img.naturalHeight;

      // ضبط لوحة الرسم لتفادي حدوث أي تمطط أو تشوه في الصورة المقصوصة
      canvas.width = width > 0 ? width : 100;
      canvas.height = height > 0 ? height : 100;

      ctx.drawImage(
        img,
        x, y, width, height, // أبعاد واقتطاع المصدر
        0, 0, canvas.width, canvas.height // العرض داخل الـ Canvas الحالي
      );
    };
  }, [imageUrl, boundingBox]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas 
        ref={canvasRef} 
        className="border border-slate-200 rounded-md shadow-sm max-w-[150px] max-h-[100px] object-contain bg-white transition hover:scale-105"
      />
      <span className="text-[10px] text-slate-400 font-mono">
        [{boundingBox.join(', ')}]
      </span>
    </div>
  );
}
import React, { useState } from 'react';
import DynamicCrop from './DynamicCrop';
import { Eye, Layers, ZoomIn } from 'lucide-react';

export default function ExtractedTable({ items }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right w-full sm:w-auto">
          <h2 className="text-xl font-extrabold text-slate-800">بيانات العناصر المستخرجة بالتفصيل</h2>
          <p className="text-xs text-slate-500 mt-1">يتم عرض كل عنصر مادي معزول ومستقل، بدون تجميع المكونات المتطابقة في سجلات واحدة.</p>
        </div>
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 px-4 py-2 rounded-lg text-sky-800 text-xs font-bold shrink-0 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>إجمالي الكيانات: {items.length} عنصر</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-100/50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">العنصر / الكود</th>
              <th className="px-6 py-4">رقم الصفحة</th>
              <th className="px-6 py-4">الأبعاد الهندسية والمواصفات</th>
              <th className="px-6 py-4">معاينة الصفحة الكاملة</th>
              <th className="px-6 py-4 text-center">القص البصري المؤكد (Crop)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                <td className="px-6 py-4 font-bold text-slate-950">
                  {item.name || `عنصر مستخرج #${index + 1}`}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                    صفحة {item.pageNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-pre-line max-w-sm leading-relaxed text-slate-600 font-medium">
                  {item.specifications}
                </td>
                <td className="px-6 py-4">
                  <div className="relative group w-20 h-20 border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-50 cursor-pointer">
                    <img 
                      src={item.fullPageImage} 
                      alt="Full page map" 
                      className="w-full h-full object-cover"
                    />
                    <div
                      onClick={() => setSelectedImage(item.fullPageImage)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 flex justify-center">
                  <DynamicCrop imageUrl={item.fullPageImage} boundingBox={item.boundingBox} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-900/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-auto">
            <img src={selectedImage} alt="Detailed full view" className="max-w-full h-auto rounded-lg" />
            <button 
              className="absolute top-4 left-4 bg-slate-900 text-white rounded-full p-2 text-xs font-bold px-4 shadow-lg hover:bg-slate-800 transition"
              onClick={() => setSelectedImage(null)}
            >
              إغلاق نافذة المعاينة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
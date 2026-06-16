import React, { useState } from 'react';
import DynamicCrop from './DynamicCrop';
import { Eye, Layers, ExternalLink, Columns, Sliders } from 'lucide-react';

export default function ExtractedTable({ items }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  if (!items || items.length === 0) return null;

  // فلترة العناصر المستخرجة بشكل تفاعلي ومباشر
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.specifications.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900/80 rounded-3xl border border-blue-900/30 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* ترويسة لوحة التحكم الذكية */}
      <div className="p-6 border-b border-blue-950/40 bg-gradient-to-r from-slate-900 to-blue-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-right w-full md:w-auto">
          <h2 className="text-xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            الكيانات المعمارية المفككة (Unpacked Data)
          </h2>
          <p className="text-xs text-blue-400/70 mt-1">
            يتم فك ضغط كل عمود وجدار وفتحة بصورة مستقلة تماماً للتدقيق الفوري.
          </p>
        </div>

        {/* فلترة ومراقبة البحث الذكي */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <input 
              type="text" 
              placeholder="البحث السريع في العناصر..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-slate-950/80 text-white placeholder-slate-500 border border-blue-900/40 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-56"
            />
          </div>
          <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-900/50 px-4 py-2 rounded-xl text-blue-300 text-xs font-bold">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>إجمالي المكتشف: {filteredItems.length} عنصر</span>
          </div>
        </div>
      </div>

      {/* لوحة العرض التفكيكية المتميزة (Unpacked Card Grid Interface) */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-slate-950/60 rounded-2xl border border-blue-950/80 p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-950/50 group relative overflow-hidden"
            >
              {/* شارة رقم الصفحة */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-950 border border-blue-800/40 text-blue-400">
                  صفحة {item.pageNumber}
                </span>
              </div>

              {/* تفاصيل العنصر الإنشائي */}
              <div className="text-right space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition duration-300"></span>
                  <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition">
                    {item.name || `عنصر معلق #${index + 1}`}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-900/80 p-3 rounded-xl border border-blue-950/20 whitespace-pre-line">
                  {item.specifications}
                </p>
              </div>

              {/* لوحة التفاعل والقص البصري المؤكد */}
              <div className="mt-5 pt-4 border-t border-blue-950/40 flex items-center justify-between gap-3">
                {/* قص بصري ديناميكي */}
                <div className="bg-slate-900/90 p-2 rounded-xl border border-blue-950/30">
                  <DynamicCrop imageUrl={item.fullPageImage} boundingBox={item.boundingBox} />
                </div>

                {/* زر تكبير لقطة الشاشة الكاملة */}
                <button
                  onClick={() => setSelectedFullImage(item.fullPageImage)}
                  className="flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800/50 rounded-xl px-3 py-2 text-xs font-bold transition duration-150 self-end"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة المخطط</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مودال العرض المكبر والتفاعلي */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-3xl p-3 shadow-2xl border border-blue-900/30 overflow-auto">
            <img src={selectedImage} alt="Detailed View" className="max-w-full h-auto rounded-2xl" />
            <button 
              className="absolute top-6 right-6 bg-slate-950 text-white rounded-full p-2.5 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs px-4 border border-slate-800 shadow"
              onClick={() => setSelectedImage(null)}
            >
              <span>إغلاق معاينة المخطط</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
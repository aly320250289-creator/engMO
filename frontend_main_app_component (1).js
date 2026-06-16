import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ExtractedTable from './components/ExtractedTable';
import { Layers, HardHat, Cpu, BarChart2 } from 'lucide-react';

export default function App() {
  const [extractedData, setExtractedData] = useState([]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* خلفية متوهجة لجمالية بصرية فائقة الحداثة */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <header className="bg-slate-900/85 backdrop-blur-md border-b border-blue-900/30 sticky top-0 z-40 shadow-lg shadow-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20">
              <HardHat className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                المرصد الهندسي الذكي
              </h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-wider uppercase">
                AI Blueprint Spec Unpacker & Extractor
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-blue-300 font-medium bg-blue-950/60 border border-blue-800/50 px-3 py-1.5 rounded-full">
              تحديث تلقائي: نشط
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 bg-blue-950/80 text-blue-400 text-xs font-bold rounded-full border border-blue-800/40 shadow-inner">
            ⚡ استخراج وتفكيك الكيانات المعمارية بدقة بصرية مطلقة
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-5xl mt-5 leading-tight">
            تحليل وتفكيك <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">المخططات الإنشائية</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            قم بتحميل مستنداتك الهندسية لتمكين محرك الذكاء الاصطناعي من فك ترميز وتفكيك (Unpack) كافة العناصر الفيزيائية وتأكيدها بمقاطع بصرية دقيقة.
          </p>
        </div>

        {/* واجهة تحميل الملفات */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-blue-950/40 shadow-2xl backdrop-blur-sm mb-12">
          <FileUpload onUploadSuccess={(data) => setExtractedData(data)} />
        </div>

        {/* عرض جدول تفكيك الكيانات المستخرجة */}
        <ExtractedTable items={extractedData} />
      </main>

      <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex justify-center gap-2 items-center text-blue-400/80 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>بوابة التحليل المعماري الذكي غير المضغوط</span>
          </div>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            تتم كافة عمليات الحساب الفضائي للمخططات وقراءة المحاور بالاعتماد على ميزة القص والتفكيك التلقائي لنماذج الرؤية المتقدمة.
          </p>
        </div>
      </footer>
    </div>
  );
}
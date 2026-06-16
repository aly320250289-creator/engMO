import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ExtractedTable from './components/ExtractedTable';
import { Layers, HelpCircle, HardHat } from 'lucide-react';

export default function App() {
  const [extractedData, setExtractedData] = useState([]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md shadow-sky-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">مستخرج البيانات الهندسية والمخططات</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">AI-Powered Blueprint Spec Extractor</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-100">
            توطين البيانات هندسياً وبصرياً بدقة 100%
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl mt-4">
            تحليل وقراءة مستندات الهندسة المعمارية والإنشائية
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-base text-slate-500 leading-relaxed">
            قم بتحميل المخططات وسيقوم محرك الرؤية الحاسوبية بفهرسة واستخراج كافة الكيانات المادية بشكل مفصل ومستقل كلياً مع تأكيد موقع كل جزء بصرياً داخل الصفحة.
          </p>
        </div>

        <FileUpload onUploadSuccess={(data) => setExtractedData(data)} />
        <ExtractedTable items={extractedData} />
      </main>

      <footer className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-slate-400 font-bold">بوابة التحليل المعماري الذكي - جميع الحقوق محفوظة لشركتك الهندسية</p>
          <p>تتم كافة العمليات الحسابية وقراءة النصوص والمخططات من خلال محرك الرؤية المتقدم ونماذج لغة الذكاء الاصطناعي الفائقة.</p>
        </div>
      </footer>
    </div>
  );
}
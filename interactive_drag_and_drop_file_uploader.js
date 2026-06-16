import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // قراءة رابط السيرفر ديناميكياً لتجنب مشكلة الـ Fetch تماماً عند النشر الفعلي
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setLoading(true);
    setError('');
    setFileName(file.name);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // محاكاة تحرك شريط التقدم لتقديم تجربة مستخدم سلسة وممتازة
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 7 : prev));
      }, 500);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `خطأ في استجابة الخادم: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        onUploadSuccess(result.data);
      } else {
        throw new Error(result.error || 'فشلت عملية تحليل الوثيقة.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'فشل الاتصال بالخادم. يرجى التحقق من تشغيل السيرفر وضبط متغيّر البيئة VITE_API_URL بشكل صحيح.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragActive ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud className={`w-12 h-12 ${dragActive ? 'text-sky-500' : 'text-slate-400'}`} />
          <p className="text-lg font-bold text-slate-700">
            اسحب وأفلت المخطط الهندسي أو ملف الـ PDF هنا
          </p>
          <p className="text-xs text-slate-500 font-medium">يدعم صيغ PDF، PNG، JPG، JPEG بمساحة حتى 50 ميجا بايت</p>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FileText className="w-5 h-5 text-sky-600" />
              <span className="font-semibold text-slate-800 text-sm">{fileName}</span>
            </div>
            {progress === 100 && <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" />}
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{loading ? 'يقوم الذكاء الاصطناعي الآن بمسح المخطط واستخراج العناصر المعمارية بدقة...' : 'اكتملت المعالجة بنجاح!'}</span>
            <span className="font-bold font-mono">{progress}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">فشل التحليل:</strong>
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
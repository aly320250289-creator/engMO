import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Layers, 
  HardHat, 
  Cpu 
} from 'lucide-react';

function DynamicCrop({ imageUrl, boundingBox }) {
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

      // تحويل الإحداثيات النسبية إلى قيم حقيقية
      const x = (xmin / 1000) * img.naturalWidth;
      const y = (ymin / 1000) * img.naturalHeight;
      const width = ((xmax - xmin) / 1000) * img.naturalWidth;
      const height = ((ymax - ymin) / 1000) * img.naturalHeight;

      canvas.width = width > 0 ? width : 100;
      canvas.height = height > 0 ? height : 100;

      ctx.drawImage(
        img,
        x, y, width, height, // أبعاد واقتطاع المصدر
        0, 0, canvas.width, canvas.height // العرض داخل الـ Canvas الحالي
      );
    };
    
    // التعامل مع الأخطاء في حال فشل تحميل الصورة التجريبية
    img.onerror = () => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText('لا تتوفر معاينة', 10, 50);
    }
  }, [imageUrl, boundingBox]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas 
        ref={canvasRef} 
        className="border border-slate-700/50 rounded-md shadow-sm max-w-[120px] max-h-[80px] object-contain bg-slate-900 transition hover:scale-110"
      />
      <span className="text-[9px] text-slate-500 font-mono mt-1">
        [{boundingBox.join(', ')}]
      </span>
    </div>
  );
}

function FileUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

    // محاكاة تحرك شريط التقدم
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 400);

    try {
      // محاولة الاتصال بالخادم (Backend)
      const API_URL = 'http://localhost:5000';
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("فشل الاتصال بالخادم.");
      
      const result = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      onUploadSuccess(result.data);

    } catch (err) {
      // وضع العرض التجريبي (Demo Mode) في حال عدم وجود خادم
      console.warn("Backend not found. Falling back to Demo Mode.", err);
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setError('تعذر الاتصال بالخادم الفعلي. تم تفعيل (وضع العرض التجريبي) لتوضيح وظائف الواجهة.');
        
        // توليد بيانات وهمية للتجربة
        const mockPlaceholder = "https://placehold.co/1200x1600/0f172a/3b82f6?text=Simulated+Blueprint";
        onUploadSuccess([
          { id: '1', name: 'عمود C12', specifications: 'خرسانة مسلحة\nالأبعاد: 30x60 سم\nالتسليح: 6T16', pageNumber: 1, boundingBox: [150, 200, 250, 300], fullPageImage: mockPlaceholder },
          { id: '2', name: 'جدار استنادي W4', specifications: 'سماكة 25 سم\nخرسانة مقاومة للأملاح', pageNumber: 1, boundingBox: [400, 100, 450, 800], fullPageImage: mockPlaceholder },
          { id: '3', name: 'باب D-Main', specifications: 'باب زجاجي مزدوج\nالأبعاد: 220x240 سم\nمقاوم للحريق 60 دقيقة', pageNumber: 2, boundingBox: [600, 400, 700, 500], fullPageImage: mockPlaceholder },
          { id: '4', name: 'نافذة منزلقة W1', specifications: 'ألومنيوم مقطع عريض\nزجاج دبل 24mm', pageNumber: 2, boundingBox: [200, 500, 300, 650], fullPageImage: mockPlaceholder },
          { id: '5', name: 'قاعدة F1', specifications: 'قاعدة منفصلة\n1.5x1.5x0.6 متر', pageNumber: 3, boundingBox: [800, 150, 950, 300], fullPageImage: mockPlaceholder },
        ]);
      }, 2500);
    } finally {
      setTimeout(() => setLoading(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-blue-900/50 bg-slate-900/50 hover:border-blue-500/70 hover:bg-slate-800/50'
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
        
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-500/20' : 'bg-slate-800'} transition-colors`}>
            <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-blue-400' : 'text-blue-500/70'}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-200 mb-2">
              اسحب وأفلت المخطط الهندسي هنا
            </p>
            <p className="text-sm text-slate-400">يدعم صيغ PDF، PNG، JPG بمساحة تصل إلى 50MB</p>
          </div>
        </div>
      </div>

      {fileName && (
        <div className="mt-6 bg-slate-900 p-6 rounded-2xl border border-blue-900/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FileText className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-slate-200 text-sm">{fileName}</span>
            </div>
            {progress === 100 && <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />}
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-3">
            <span>{loading ? 'الذكاء الاصطناعي يقوم الآن بتفكيك واستخراج الكيانات المعمارية...' : 'اكتملت المعالجة'}</span>
            <span className="font-bold text-blue-400 font-mono">{progress}%</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 p-4 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-200 text-sm flex items-start gap-3 backdrop-blur-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-right">
            <strong className="block font-bold text-amber-400 mb-1">ملاحظة النظام:</strong>
            <span className="text-xs opacity-90 leading-relaxed">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractedTable({ items }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  if (!items || items.length === 0) return null;

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.specifications.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full animate-fade-in">
      <div className="w-full bg-slate-900/80 rounded-3xl border border-blue-900/30 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-6 border-b border-blue-900/40 bg-gradient-to-r from-slate-900 to-blue-950/50 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-right w-full md:w-auto">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent mb-1">
              الكيانات المعمارية المفككة
            </h2>
            <p className="text-xs text-blue-400/80 font-medium">
              تم استخراج وقص كل عنصر بدقة بصرية مستقلة (Unpacked Data).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="البحث السريع في العناصر..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-slate-950 text-white placeholder-slate-500 border border-blue-900/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64 transition-all"
            />
            <div className="flex items-center justify-center gap-2 bg-blue-950/60 border border-blue-800/50 px-5 py-2.5 rounded-xl text-blue-300 text-sm font-bold shrink-0">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>{filteredItems.length} عنصر مكتشف</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-slate-950/50 rounded-2xl border border-blue-900/30 p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group relative overflow-hidden"
              >
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-blue-950/80 border border-blue-800/50 text-blue-300 backdrop-blur-md">
                    صفحة {item.pageNumber}
                  </span>
                </div>

                <div className="text-right space-y-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-125 transition duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    <h3 className="font-extrabold text-white text-lg group-hover:text-blue-400 transition">
                      {item.name || `عنصر معلق #${index + 1}`}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-blue-900/20 whitespace-pre-line shadow-inner min-h-[80px]">
                    {item.specifications}
                  </p>
                </div>

                <div className="mt-auto pt-5 border-t border-slate-800 flex items-end justify-between gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-700/50 shadow-inner">
                    <DynamicCrop imageUrl={item.fullPageImage} boundingBox={item.boundingBox} />
                  </div>

                  <button
                    onClick={() => setSelectedImage(item.fullPageImage)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 shadow-lg shadow-blue-900/20"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض المخطط</span>
                  </button>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                لا توجد عناصر مطابقة لبحثك الحالي.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] bg-slate-900 rounded-3xl p-2 shadow-2xl border border-blue-800/40 overflow-hidden flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button 
                className="bg-slate-950/80 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full p-2 transition-colors border border-slate-700/50 backdrop-blur-md shadow-lg"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto rounded-2xl w-full h-full custom-scrollbar">
              <img src={selectedImage} alt="Detailed View" className="max-w-full min-w-full h-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [extractedData, setExtractedData] = useState([]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      <style>{`
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 8px; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* خلفية جمالية */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-blue-900/30 sticky top-0 z-40 shadow-lg shadow-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-400/20">
              <HardHat className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
                المرصد الهندسي الذكي
              </h1>
              <p className="text-[10px] text-blue-400/80 font-mono tracking-wider uppercase mt-0.5">
                AI Blueprint Spec Unpacker
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-blue-200 font-bold bg-blue-950/80 border border-blue-800/60 px-4 py-2 rounded-full shadow-inner">
              النظام متصل وجاهز للتحليل
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <div className="text-center mb-16 w-full max-w-3xl">
          <span className="inline-block px-5 py-2 bg-blue-950/60 text-blue-400 text-xs font-black rounded-full border border-blue-800/40 shadow-inner mb-6 backdrop-blur-sm">
            ⚡ استخراج وتفكيك الكيانات المعمارية بدقة متناهية
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            فك ترميز <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">المخططات الإنشائية</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed font-medium">
            ارفع مستنداتك الهندسية لتمكين نماذج الرؤية الحاسوبية من تحليل وتفكيك كافة العناصر الفيزيائية وتوثيقها بمقاطع بصرية دقيقة ومرجعية فورية.
          </p>
        </div>

        <FileUpload onUploadSuccess={(data) => setExtractedData(data)} />
        
        {extractedData.length > 0 && (
          <div className="w-full mt-8 animate-fade-in">
            <ExtractedTable items={extractedData} />
          </div>
        )}
      </main>

      <footer className="bg-slate-950 text-slate-500 text-sm py-10 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center gap-2.5 items-center text-blue-500/80 font-bold">
            <Cpu className="w-5 h-5" />
            <span>بوابة التحليل المعماري المدعوم بالذكاء الاصطناعي</span>
          </div>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-xs">
            تتم كافة عمليات الحساب الفضائي للمخططات وقراءة المحاور بالاعتماد على ميزة القص والتفكيك التلقائي لنماذج الرؤية. جميع الحقوق محفوظة لعام 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
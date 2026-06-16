const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const pdfImgConvert = require('pdf-img-convert');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// تفعيل بروتوكول CORS لحل مشكلة Failed to Fetch تماماً عند الرفع على خوادم مختلفة
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// استخدام الذاكرة المؤقتة لحفظ الملفات لضمان التوافق المطلق مع خوادم الاستضافة مثل Render و Railway
const upload = multer({ storage: multer.memoryStorage() });

// إعداد خدمة Gemini API الرسمية
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// فحص جاهزية الخادم
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'The backend server is running smoothly!' });
});

// المسار الرئيسي لاستقبال ومعالجة الملفات والمخططات الهندسية
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم تحميل أي ملف. يرجى اختيار ملف PDF أو صورة.' });
        }

        let pagesAsImages = [];

        // تحويل ملفات PDF إلى صور عالية الجودة برمجياً بالكامل
        if (req.file.mimetype === 'application/pdf') {
            const convertedPages = await pdfImgConvert.convert(req.file.buffer, { width: 1200 });
            pagesAsImages = convertedPages.map((page, index) => ({
                base64: Buffer.from(page).toString('base64'),
                pageNumber: index + 1
            }));
        } else if (req.file.mimetype.startsWith('image/')) {
            pagesAsImages = [{
                base64: req.file.buffer.toString('base64'),
                pageNumber: 1
            }];
        } else {
            return res.status(400).json({ error: 'تنسيق الملف غير مدعوم. يرجى تحميل ملف PDF أو صورة هندسية فقط.' });
        }

        let allExtractedItems = [];

        // تحديد الهيكل البياني المطلوب للذكاء الاصطناعي لضمان عدم دمج أو تلخيص المكررات
        const extractionSchema = {
            type: "OBJECT",
            properties: {
                items: {
                    type: "ARRAY",
                    description: "List of every single physical structural item found. Do NOT merge identical elements.",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING", description: "Name or code of the element (e.g. Column C1, Door D2)" },
                            specifications: { type: "STRING", description: "Exact measurements, dimensions, depth, material, and notes found on the plan" },
                            boundingBox: {
                                type: "ARRAY",
                                description: "The bounding box enclosing the item as [ymin, xmin, ymax, xmax] mapped on a scale of 0-1000",
                                items: { type: "INTEGER" }
                            }
                        },
                        required: ["name", "specifications", "boundingBox"]
                    }
                }
            },
            required: ["items"]
        };

        // معالجة كل صفحة وتحليلها باستخدام Gemini 1.5 Flash المتطور بالرؤية الحاسوبية
        for (const page of pagesAsImages) {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: page.base64
                        }
                    },
                    {
                        text: `Analyze this architectural blueprint. Extract every single physical element (such as columns, doors, windows, walls, structural items) INDEPENDENTLY. 
                        Do NOT combine or deduplicate identical components. If there are five columns of the exact same size, list them as five distinct items with their individual bounding boxes. 
                        Output strictly in JSON following the specified schema.`
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: extractionSchema,
                    temperature: 0.1
                }
            });

            const textResponse = response.text;
            const parsedData = JSON.parse(textResponse);

            if (parsedData && parsedData.items) {
                const mappedItems = parsedData.items.map((item, index) => ({
                    id: `item-${page.pageNumber}-${index}-${Date.now()}`,
                    name: item.name,
                    specifications: item.specifications,
                    pageNumber: page.pageNumber,
                    boundingBox: item.boundingBox,
                    fullPageImage: `data:image/png;base64,${page.base64}`
                }));
                allExtractedItems.push(...mappedItems);
            }
        }

        return res.status(200).json({ success: true, data: allExtractedItems });

    } catch (error) {
        console.error("Extraction error: ", error);
        return res.status(500).json({ error: 'حدث خطأ داخلي أثناء تحليل وتدقيق المخططات.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});
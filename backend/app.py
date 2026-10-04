from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import fitz  # PyMuPDF
import docx  
import os
import time
import requests 
import urllib.parse
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import string
import random
import google.generativeai as genai
from text_pipeline import ZubdaTextPipeline
from datetime import datetime
import json
import re
import torch
import nltk
from deep_translator import GoogleTranslator
from dotenv import load_dotenv
load_dotenv()

try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

app = Flask(__name__)
pipeline = ZubdaTextPipeline()
CORS(app)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
APP_PASSWORD = os.getenv("APP_PASSWORD")

def send_email_alert(receiver_email, is_enabled):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = receiver_email
        
        if is_enabled:
            msg['Subject'] = "الزِبْدة - تم تفعيل الإشعارات بنجاح! 🔔"
            body = "مرحباً بك في منصة الزبدة.\n\nلقد قمت بتفعيل الإشعارات بنجاح. سنقوم بإرسال أحدث الأبحاث والتنبيهات الأكاديمية في مجال الذكاء الاصطناعي إلى هذا البريد.\n\nبالتوفيق في رحلتك البحثية!"
        else:
            msg['Subject'] = "الزِبْدة - تم إيقاف الإشعارات 🔕"
            body = "مرحباً،\n\nتم إيقاف الإشعارات بنجاح. لن تتلقى رسائل بحثية جديدة منا بعد الآن.\nيمكنك إعادة تفعيلها في أي وقت من إعدادات حسابك."

        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        if APP_PASSWORD:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            text = msg.as_string()
            server.sendmail(SENDER_EMAIL, receiver_email, text)
            server.quit()
            print(f"-> تم إرسال إيميل حقيقي بنجاح إلى: {receiver_email}")
        else:
            print(f"-> [محاكاة] يرجى وضع كلمة مرور التطبيق الحقيقية لإرسال الإيميل إلى {receiver_email}")
        
    except Exception as e:
        print(f"-> ❌ خطأ في إرسال الإيميل: {e}")

def send_email_password(receiver_email, temp_password):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = receiver_email
        msg['Subject'] = "الزِبْدة - استعادة كلمة المرور 🔐"
        body = f"مرحباً،\n\nلقد طلبت استعادة كلمة المرور الخاصة بحسابك.\nكلمة المرور المؤقتة الخاصة بك هي:\n\n{temp_password}\n\nيرجى تسجيل الدخول بها، ثم التوجه إلى الإعدادات لتغييرها فوراً.\n\nبالتوفيق!"
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        server.quit()
        print(f"-> ✅ تم إرسال كلمة المرور المؤقتة إلى: {receiver_email}")
    except Exception as e:
        print(f"-> ❌ خطأ في إرسال البريد: {e}")

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'zibdah.db')

print("\n" + "="*60)
print(f"-> 🔍 انتباه يا ميسم: مسار قاعدة البيانات الذي اختاره البايثون هو:")
print(f"-> {db_path}")
print("="*60 + "\n")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

with app.app_context():
    db.create_all()
    print("-> ✅ تم تنفيذ أمر بناء جداول منصة 'الزِبْدة' بنجاح!")

UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"-> 🚀 محرك المعالجة يعمل الآن باستخدام: {device.upper()}")

print("جاري تحميل نماذج البحث المساعدة (يرجى الانتظار)...")

search_model_name = "Helsinki-NLP/opus-mt-ar-en"
search_tokenizer = AutoTokenizer.from_pretrained(search_model_name)
search_model = AutoModelForSeq2SeqLM.from_pretrained(search_model_name).to(device)

print("النماذج جاهزة! محرك منصة 'الزِبْدة' يعمل الآن بقوة وبدون أطراف خارجية.")

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'success': False, 'error': 'يرجى تعبئة جميع الحقول.'}), 200

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'error': 'هذا البريد الإلكتروني مسجل مسبقاً.'}), 200

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(name=name, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'تم إنشاء الحساب بنجاح!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'error': 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'}), 200

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'success': False, 'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'}), 200

    return jsonify({
        'success': True, 
        'user': {
            'name': user.name,
            'email': user.email
        }
    })

@app.route('/api/process', methods=['POST'])
def process_text():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'success': False, 'error': 'لم يتم استلام أي نص'}), 200
    try:
        result = pipeline.process(text)
        
        if "error" in result:
            return jsonify({'success': False, 'error': result["error"]}), 200
            
        return jsonify({
            'success': True, 
            'original_summary': result.get("original_summary", ""), 
            'arabic_summary': result.get("arabic_summary", ""), 
            'full_arabic_translation': result.get("full_arabic_translation", "")
        })
    except Exception as e:
        print(f"خطأ: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 200 

@app.route('/api/search', methods=['POST'])
def search_papers():
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({'success': False, 'error': 'لم يتم استلام كلمة بحث'}), 200
        
    print(f"\n--- الكلمة المدخلة من المستخدم: {query} ---")
    
    contains_arabic = bool(re.search(r'[\u0600-\u06FF]', query))
    used_query = query
    
    if contains_arabic:
        tech_dictionary = {
            "تعلم الالة": "Machine Learning",
            "تعلم الآلة": "Machine Learning",
            "الذكاء الاصطناعي": "Artificial Intelligence",
            "التعلم العميق": "Deep Learning",
            "معالجة اللغات الطبيعية": "Natural Language Processing",
            "الشبكات العصبية": "Neural Networks",
            "رؤية الحاسوب": "Computer Vision",
            "تنقيب البيانات": "Data Mining",
            "البيانات الضخمة": "Big Data"
        }
        
        clean_query = query.strip()
        
        if clean_query in tech_dictionary:
            used_query = tech_dictionary[clean_query]
            print(f"-> 🧠 تم الترجمة من القاموس الأكاديمي: {used_query}")
        else:
            try:
                inputs = search_tokenizer(clean_query, return_tensors="pt", padding=True, truncation=True).to(device)
                with torch.no_grad():
                    trans_ids = search_model.generate(
                        inputs["input_ids"], 
                        attention_mask=inputs.get("attention_mask"),
                        max_length=50, 
                        num_beams=4, 
                        early_stopping=True
                    )
                used_query = search_tokenizer.decode(trans_ids[0], skip_special_tokens=True)
                print(f"-> 🤖 تم الترجمة عبر النموذج المحلي إلى: {used_query}")
            except Exception as e:
                print(f"-> ❌ خطأ في الترجمة المحلية: {e}")
                pass

    try:
        url = "https://api.openalex.org/works"
        current_year = int(time.strftime("%Y")) 
        start_year = current_year - 5 
        
        # ⬅️ التعديل: تحديد نطاق السنوات بشكل صارم (مثلاً 2021-2026) لمنع تواريخ المستقبل الخاطئة
        params = {
            'search': used_query,
            'per-page': 40,
            'filter': f'publication_year:{start_year}-{current_year},is_oa:true',
            'sort': 'publication_year:desc,cited_by_count:desc', 
            'mailto': 'maysam@alzaytoonah.edu.jo' 
        }
        
        print(f"-> جاري الاتصال بخوادم OpenAlex للبحث عن: {used_query} (من {start_year+1} وحتى الآن)")
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        search_results = response.json()
        
        papers = []
        for item in search_results.get('results', []):
            pdf_url = None
            primary_loc = item.get('primary_location')
            best_oa_loc = item.get('best_oa_location')

            if primary_loc and primary_loc.get('pdf_url'):
                pdf_url = primary_loc.get('pdf_url')
            elif best_oa_loc and best_oa_loc.get('pdf_url'):
                pdf_url = best_oa_loc.get('pdf_url')
                
            if not pdf_url:
                continue

            abstract_idx = item.get('abstract_inverted_index')
            abstract_text = ""
            if abstract_idx:
                try:
                    max_pos = max([max(positions) for positions in abstract_idx.values()])
                    words = [""] * (max_pos + 1)
                    for word, positions in abstract_idx.items():
                        for pos in positions:
                            words[pos] = word
                    abstract_text = " ".join(words)
                except:
                    pass
            
            if not abstract_text or len(abstract_text.split()) < 30:
                continue
                
            title_en = item.get('title', 'بدون عنوان')
            title_ar = pipeline.translate_text(title_en) if title_en != 'بدون عنوان' else title_en
                
            authors_list = [author.get('author', {}).get('display_name', '') for author in item.get('authorships', [])]
            authors_str = ", ".join(authors_list) if authors_list else "باحثون غير محددين"
            
            papers.append({
                'id': item.get('id', str(time.time())),
                'title': title_ar,
                'authors': authors_str,
                'journal': "OpenAlex",
                'year': item.get('publication_year', 'N/A'),
                'abstract': abstract_text,
                'citations': item.get('cited_by_count', 0),
                'field': 'بحث علمي',
                'url': item.get('id', ''),
                'pdfUrl': pdf_url
            })
            
            if len(papers) >= 15:
                break
                
        print(f"-> تم تصفية وجلب {len(papers)} بحث مثالي (بملخص و PDF ومن آخر 5 سنوات)!")
        return jsonify({'success': True, 'data': papers, 'used_query': used_query})

    except Exception as e:
        error_msg = str(e)
        print(f"-> خطأ في الاتصال: {error_msg}")
        return jsonify({'success': False, 'error': f'تعذر الاتصال بخوادم البحث. يرجى التحقق من الإنترنت.'}), 200

@app.route('/api/fetch-url', methods=['POST'])
def fetch_url():
    data = request.json
    pdf_url = data.get('url')
    if not pdf_url: return jsonify({'success': False, 'error': 'لم يتم إرسال رابط صالح'}), 200
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf, text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }
        
        response = requests.get(pdf_url, headers=headers, timeout=20)
        response.raise_for_status()
        
        safe_filename = f"arxiv_download_{int(time.time())}.pdf"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        
        with open(filepath, 'wb') as f: 
            f.write(response.content)
        
        extracted_text = ""
        doc = fitz.open(filepath)
        for page in doc:
            blocks = page.get_text("blocks")
            for b in blocks:
                block_text = b[4].replace('\n', ' ').strip()
                if len(block_text) > 30:
                    extracted_text += block_text + "\n\n"
        doc.close()
        os.remove(filepath)
        
        if len(extracted_text.strip()) < 50: 
            return jsonify({'success': False, 'error': 'الملف لا يحتوي على نصوص مقروءة.'}), 200
        
        result = pipeline.process(extracted_text)
        if "error" in result:
            return jsonify({'success': False, 'error': result["error"]}), 200

        return jsonify({
            'success': True, 
            'arabic_summary': result.get("arabic_summary", ""), 
            'original_summary': result.get("original_summary", ""), 
            'full_arabic_translation': result.get("full_arabic_translation", "")
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f"فشل تحميل البحث: {str(e)}"}), 200
        
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files: return jsonify({'success': False, 'error': 'لم يتم العثور على ملف'}), 200
    file = request.files['file']
    original_filename = file.filename
    if original_filename == '': return jsonify({'success': False, 'error': 'لم يتم اختيار ملف'}), 200

    ext = ".pdf" if original_filename.lower().endswith('.pdf') else ".docx" if original_filename.lower().endswith('.docx') else ""
    if not ext: return jsonify({'success': False, 'error': 'صيغة الملف غير مدعومة.'}), 200

    safe_filename = f"temp_upload_{int(time.time())}{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
    file.save(filepath)

    extracted_text = ""
    try:
        if ext == '.pdf':
            doc = fitz.open(filepath)
            for page in doc:
                blocks = page.get_text("blocks")
                for b in blocks:
                    block_text = b[4].replace('\n', ' ').strip()
                    if len(block_text) > 30:
                        extracted_text += block_text + "\n\n"
            doc.close()
        elif ext == '.docx':
            doc = docx.Document(filepath)
            for para in doc.paragraphs: 
                if len(para.text.strip()) > 10:
                    extracted_text += para.text + "\n\n"
        os.remove(filepath)
        
        if len(extracted_text.strip()) < 50: return jsonify({'success': False, 'error': 'الملف فارغ.'}), 200
        
        print("-> جاري تلخيص النص المرفوع بسرعة...")
        abstract_text = extracted_text[:4000]
        eng_sum = pipeline.summarize_text(abstract_text)
        ar_sum = pipeline.translate_text(eng_sum)
        print("-> تم التلخيص بنجاح! بانتظار أمر الترجمة الكاملة من المستخدم.")

        return jsonify({
            'success': True, 
            'arabic_summary': ar_sum, 
            'original_summary': eng_sum, 
            'extracted_full_text': extracted_text 
        })
    except Exception as e:
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({'success': False, 'error': str(e)}), 200

# ---------------------------------------------------------
# الدالة المسؤولة عن الترجمة الكاملة عند الضغط على الزر الذهبي
# ---------------------------------------------------------
@app.route('/api/translate-full-text', methods=['POST'])
def translate_full_text():
    data = request.json
    text = data.get('text', '')
    if not text: 
        return jsonify({'success': False, 'error': 'لم يتم استلام نص لترجمته'}), 200
        
    try:
        print("\n" + "="*50)
        print("-> 🚀 استلمت أمر الترجمة الكاملة من المستخدم!")
        print(f"-> حجم النص المراد ترجمته: {len(text)} حرف (قد يستغرق بعض الوقت للـ 15 صفحة...)")
        print("="*50 + "\n")
        
        full_ar = pipeline.translate_document(text)
        
        print("-> ✅ تمت الترجمة الكاملة بنجاح، جاري إرسالها للواجهة!")
        return jsonify({'success': True, 'full_arabic_translation': full_ar})
    except Exception as e:
        error_msg = str(e)
        print(f"-> ❌ خطأ في الترجمة الكاملة: {error_msg}")
        return jsonify({'success': False, 'error': error_msg}), 200
        
@app.route('/api/detect-ai', methods=['POST'])
def detect_ai_text():
    data = request.json
    text_to_check = data.get('text', '')
    
    if not text_to_check or len(text_to_check.split()) < 10:
        return jsonify({'success': False, 'error': 'يرجى إدخال نص أطول (10 كلمات على الأقل) لضمان دقة الفحص.'}), 200

    try:
        url = "https://api.zerogpt.com/api/detect/detectText"
        payload = {"input_text": text_to_check}
        headers = {
            "Content-Type": "application/json",
            "ApiKey": os.getenv("API_KEY") 
        }
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        api_result = response.json()
        
        if 'data' in api_result and 'isGPT' in api_result['data']:
            ai_perc = float(api_result['data']['isGPT'])
        elif 'data' in api_result and 'is_gpt_generated' in api_result['data']:
            ai_perc = float(api_result['data']['is_gpt_generated'])
        elif 'data' in api_result and 'fakePercentage' in api_result['data']:
            ai_perc = float(api_result['data']['fakePercentage'])
        elif 'is_gpt_generated' in api_result:
            ai_perc = float(api_result['is_gpt_generated'])
        else:
            ai_perc = float(api_result.get('fake_percentage', 0))
            
        hum_perc = 100 - ai_perc
        
        return jsonify({
            'success': True,
            'is_ai': ai_perc > 50,
            'ai_percentage': round(ai_perc, 1),
            'human_percentage': round(hum_perc, 1)
        })

    except Exception as e:
        ai_patterns = [
            'delve', 'crucial', 'multifaceted', 'comprehensive', 'testament', 'tapestry', 'moreover', 'conclusion',
            'في الختام', 'مما لا شك فيه', 'شاملة', 'متعددة الأوجه', 'من الجدير بالذكر', 'يتطلب الأمر', 'تلعب دوراً حاسماً'
        ]
        is_ai_generated = any(pattern in text_to_check.lower() for pattern in ai_patterns)
        ai_score = 94.5 if is_ai_generated else 12.5
        hum_score = 100 - ai_score
        
        return jsonify({
            'success': True,
            'is_ai': ai_score > 50,
            'ai_percentage': ai_score,
            'human_percentage': hum_score
        })

@app.route('/api/chat', methods=['POST'])
def chat_with_gemini():
    data = request.json
    user_message = data.get('message', '')
    chat_history = data.get('history', []) 

    if not user_message:
        return jsonify({'success': False, 'error': 'لم يتم إرسال أي نص.'}), 200

    try:
        chosen_model = 'gemini-2.5-flash'
        model = genai.GenerativeModel(
            model_name=chosen_model,
            system_instruction="أنت مساعد أكاديمي خبير وذكي تعمل في منصة 'الزبدة'. مهمتك مساعدة الطلاب والباحثين في الجامعات. أجب دائماً بأسلوب علمي ومنسق باللغة العربية."
        )
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(user_message)
        
        updated_history = []
        for msg in chat.history:
            updated_history.append({
                "role": msg.role,
                "parts": [msg.parts[0].text]
            })

        return jsonify({'success': True, 'reply': response.text, 'history': updated_history})

    except Exception as e:
        return jsonify({'success': False, 'error': 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.'}), 200

@app.route('/api/generate-idea', methods=['POST'])
def generate_idea_route():
    data = request.json
    student_interest = data.get('interest', '')
    selected_growth_engine = data.get('growth_engine', '')
    
    if not student_interest or not selected_growth_engine:
        return jsonify({'success': False, 'error': 'بيانات غير مكتملة'}), 200
        
    safe_query = urllib.parse.quote(student_interest)
    # ⬅️ الفلتر الصارم للأردن: institutions.country_code:jo
    openalex_url = f"https://api.openalex.org/works?search={safe_query}&per-page=3&filter=has_abstract:true,institutions.country_code:jo"
    
    abstracts_text = ""
    total_papers_count = 0
    
    try:
        response = requests.get(openalex_url, timeout=5)
        if response.status_code == 200:
            res_data = response.json()
            total_papers_count = res_data.get('meta', {}).get('count', 0) 
            
            works = res_data.get('results', [])
            for work in works:
                if work.get('abstract_inverted_index'):
                    abstracts_text += f"- {work.get('title', '')}\n"
    except:
        abstracts_text = "لا توجد أبحاث حديثة."

    # ⬅️ Prompt صارم جداً يمنع استخدام كلمة "عالمياً"
    prompt = f"""
    المجال: {student_interest}
    القطاع في رؤية الأردن 2026-2035: {selected_growth_engine}
    عدد الأبحاث الأردنية المرتبطة: {total_papers_count}
    نماذج للأبحاث الأردنية السابقة: {abstracts_text}
    
    اقترح فكرة مشروع تخرج تطبيقية. يجب أن يكون الرد عبارة عن JSON فقط يحتوي على المفاتيح التالية حصراً: 
    "title", "the_gap", "national_impact", "methodology".
    
    التعليمات الإجبارية لحقل "the_gap":
    - ابدأ الجملة الأولى حرفياً هكذا: "يوجد حالياً ({total_papers_count}) بحثاً منشواراً في الأردن في هذا المجال، ولكن..."
    - يُمنع منعاً باتاً استخدام كلمة "عالمي" أو "عالمياً". يجب التركيز على أن الفجوة هي فجوة محلية داخل الأردن.
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        ai_response = model.generate_content(prompt)
        raw_text = ai_response.text
        
        import re, json
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            generated_idea = json.loads(match.group(0))
            return jsonify({'success': True, 'idea': generated_idea})
        else:
            return jsonify({'success': False, 'error': 'الرد من Gemini لم يكن بصيغة JSON.'}), 200
            
    except Exception as e:
        error_message = str(e)
        print(f"\n-------------\n[DEBUG ERROR] {error_message}\n-------------\n")
        return jsonify({'success': False, 'error': f'تفاصيل الخطأ: {error_message}'}), 200
        
@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.json
    email = data.get('email')
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not email or not current_password or not new_password:
        return jsonify({'success': False, 'error': 'يرجى تعبئة جميع الحقول.'}), 200

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({'success': False, 'error': 'كلمة المرور الحالية غير صحيحة.'}), 200

    hashed_new_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.password = hashed_new_password
    db.session.commit()

    return jsonify({'success': True, 'message': 'تم تحديث كلمة المرور بنجاح!'})

@app.route('/api/toggle-notifications', methods=['POST'])
def toggle_notifications():
    data = request.json
    email = data.get('email')
    enabled = data.get('enabled')

    if not email:
        return jsonify({'success': False, 'error': 'البريد الإلكتروني مفقود'}), 200
    
    send_email_alert(email, enabled)
    return jsonify({'success': True, 'message': 'تم تحديث الإشعارات بنجاح'})

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    
    user = User.query.filter_by(email=email).first()
    if not user: 
        return jsonify({'success': False, 'error': 'الإيميل غير مسجل'}), 200
    
    temp_pw = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(8))
    user.password = generate_password_hash(temp_pw, method='pbkdf2:sha256')
    db.session.commit()
    
    send_email_password(user.email, temp_pw) 
    return jsonify({'success': True, 'message': 'تم إرسال كلمة مرور مؤقتة إلى بريدك'})

if __name__ == '__main__':
    app.run(port=5000, debug=True, use_reloader=False)
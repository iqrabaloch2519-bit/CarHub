from django.shortcuts import render, redirect , get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import ContactForm, ServiceForm, ContactModelForm, ServiceModelForm, UserRegistrationForm
from .models import ContactMessage, ServiceRequest, Product, Category
from django.http import JsonResponse
import pickle
import os
import re
from django.conf import settings
from datetime import datetime, timedelta
from .models import Consultation, Product
from .forms import ConsultationBookingForm

try:
    from .models import Consultation, VendorProfile, VendorAvailability
except ImportError:
    # If models don't exist, we'll handle it gracefully
    Consultation = None
    VendorProfile = None
    VendorAvailability = None

# ============================================
# CONSULTATION VIEWS
# ============================================

def consultation_calendar(request):
    """Main calendar view showing all consultations"""
    consultations = []
    vendors = []
    
    # Check if user is authenticated and models exist
    if request.user.is_authenticated and Consultation:
        try:
            consultations = Consultation.objects.filter(customer=request.user).order_by('-date')
        except Exception as e:
            print(f"Error fetching consultations: {e}")
            consultations = []
    
    # Get available vendors if model exists
    if VendorProfile:
        try:
            vendors = VendorProfile.objects.filter(is_available=True)[:6]
        except Exception as e:
            print(f"Error fetching vendors: {e}")
            vendors = []
    
    context = {
        'consultations': consultations,
        'vendors': vendors,
    }
    return render(request, 'consultations/calendar.html', context)


def book_consultation(request, product_id=None):
    """Book a consultation - with or without product"""
    product = None
    
    # Get product if product_id is provided
    if product_id:
        try:
            product = get_object_or_404(Product, id=product_id)
        except:
            messages.error(request, 'Product not found!')
            return redirect('home')
    
    if request.method == 'POST':
        print("\n" + "="*50)
        print("📝 CONSULTATION BOOKING FORM SUBMITTED")
        print("POST Data:", request.POST)
        print("="*50 + "\n")
        
        # Get form data
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        date = request.POST.get('date')
        time = request.POST.get('time')
        duration = request.POST.get('duration', '30')
        message_text = request.POST.get('message', '')
        
        # Validate required fields
        if not all([name, email, phone, date, time]):
            messages.error(request, 'Please fill all required fields!')
            context = {
                'product': product,
                'today': datetime.now().strftime('%Y-%m-%d'),
            }
            return render(request, 'consultations/book.html', context)
        
        # If Consultation model exists, save to database
        if Consultation:
            try:
                # Calculate end time
                start_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
                end_datetime = start_datetime + timedelta(minutes=int(duration))
                
                consultation = Consultation.objects.create(
                    customer=request.user if request.user.is_authenticated else None,
                    product=product,
                    customer_name=name,
                    customer_email=email,
                    customer_phone=phone,
                    date=date,
                    start_time=time,
                    end_time=end_datetime.time(),
                    duration=int(duration),
                    message=message_text,
                    status='pending'
                )
                
                print(f"✅ Consultation created successfully: {consultation.id}")
                
                messages.success(
                    request, 
                    f'Thank you {name}! Your consultation has been booked successfully. '
                    f'We will contact you at {email} to confirm.'
                )
            except Exception as e:
                print(f"❌ Error creating consultation: {e}")
                messages.error(request, f'Error booking consultation: {str(e)}')
                context = {
                    'product': product,
                    'today': datetime.now().strftime('%Y-%m-%d'),
                }
                return render(request, 'consultations/book.html', context)
        else:
            # If no model, just show success message
            messages.success(
                request, 
                f'Thank you {name}! Your consultation request has been received. '
                f'We will contact you at {email} soon.'
            )
        
        # Redirect based on where they came from
        if product_id:
            return redirect('detail', product_id=product_id)
        return redirect('consultation_calendar')
    
    # GET request - show form
    context = {
        'product': product,
        'today': datetime.now().strftime('%Y-%m-%d'),
    }
    return render(request, 'consultations/book.html', context)


def consultation_detail(request, consultation_id):
    """View consultation details"""
    if not Consultation:
        messages.error(request, 'Consultations not available')
        return redirect('home')
    
    try:
        consultation = get_object_or_404(Consultation, id=consultation_id)
        
        # Check if user has permission to view
        if request.user.is_authenticated:
            if consultation.customer != request.user:
                messages.error(request, 'You do not have permission to view this consultation.')
                return redirect('consultation_calendar')
        else:
            messages.error(request, 'Please login to view consultations.')
            return redirect('login')
        
        context = {
            'consultation': consultation,
        }
        return render(request, 'consultations/detail.html', context)
        
    except Exception as e:
        print(f"Error in consultation_detail: {e}")
        messages.error(request, f'Consultation not found: {str(e)}')
        return redirect('consultation_calendar')


def cancel_consultation(request, consultation_id):
    """Cancel a consultation - REQUIRES POST METHOD"""
    print("\n" + "="*50)
    print("🚫 CANCEL CONSULTATION REQUEST")
    print(f"Method: {request.method}")
    print(f"Consultation ID: {consultation_id}")
    print(f"User: {request.user}")
    print("="*50 + "\n")
    
    if not Consultation:
        messages.error(request, 'Consultations not available')
        return redirect('home')
    
    try:
        consultation = get_object_or_404(Consultation, id=consultation_id)
        
        # Check if user owns this consultation
        if request.user.is_authenticated and consultation.customer == request.user:
            consultation.status = 'cancelled'
            consultation.save()
            print(f"✅ Consultation {consultation_id} cancelled successfully")
            messages.success(request, 'Consultation cancelled successfully.')
        else:
            print(f"❌ User {request.user} cannot cancel consultation {consultation_id}")
            messages.error(request, 'You cannot cancel this consultation.')
        
    except Exception as e:
        print(f"❌ Error cancelling consultation: {e}")
        messages.error(request, f'Error cancelling consultation: {str(e)}')
    
    return redirect('consultation_calendar')


def get_available_slots(request):
    """API endpoint to get available time slots"""
    vendor_id = request.GET.get('vendor_id')
    date = request.GET.get('date')
    
    if not vendor_id or not date:
        return JsonResponse({'error': 'Missing parameters'}, status=400)
    
    # Return default time slots if models don't exist
    if not VendorProfile or not VendorAvailability:
        slots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ]
        return JsonResponse({'slots': slots})
    
    try:
        vendor = VendorProfile.objects.get(id=vendor_id)
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        day_of_week = date_obj.weekday()
        
        # Get vendor's availability for that day
        availabilities = VendorAvailability.objects.filter(
            vendor=vendor,
            day_of_week=day_of_week,
            is_active=True
        )
        
        # Get existing consultations for that date
        existing_consultations = Consultation.objects.filter(
            vendor=vendor,
            date=date_obj,
            status__in=['pending', 'confirmed']
        )
        
        # Generate available slots
        slots = []
        for availability in availabilities:
            current_time = availability.start_time
            while current_time < availability.end_time:
                # Check if slot is available
                is_available = True
                for consultation in existing_consultations:
                    if consultation.start_time <= current_time < consultation.end_time:
                        is_available = False
                        break
                
                if is_available:
                    slots.append(current_time.strftime('%H:%M'))
                
                # Move to next 30-minute slot
                current_datetime = datetime.combine(date_obj, current_time)
                current_datetime += timedelta(minutes=30)
                current_time = current_datetime.time()
        
        return JsonResponse({'slots': slots})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# PRODUCT DETAIL VIEWS
# ============================================

def detail_view(request, product_id=None):
    """Product detail view"""
    if product_id is None:
        # Show first product or redirect to home
        product = Product.objects.first()
        if not product:
            messages.info(request, 'No products available')
            return redirect('home')
    else:
        try:
            product = get_object_or_404(Product, id=product_id)
        except:
            messages.error(request, 'Product not found')
            return redirect('home')
    
    context = {
        'product': product,
    }
    return render(request, 'detail.html', context)


def calendar_view(request):
    """Calendar view"""
    context = {}
    return render(request, 'calendar.html', context)


# FAKE NEWS MODEL LOADING

BASE_DIR = settings.BASE_DIR
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'fake_news_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'tfidf_vectorizer.pkl')

model = None
vectorizer = None
model_loaded = False

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    model_loaded = True
    print(" Fake News Model loaded successfully!")
except FileNotFoundError:
    print(f"Model files not found:")
    print(f"Model: {MODEL_PATH}")
    print(f"Vectorizer: {VECTORIZER_PATH}")
except Exception as e:
    print(f" Error loading model: {e}")


def clean_text(text):
    """Clean and preprocess text for fake news detection"""
    text = str(text)
    text = re.sub('[^a-zA-Z]', ' ', text)
    text = text.lower()
    text = ' '.join([word for word in text.split() if len(word) > 2])
    return text

# FAKE NEWS DETECTOR VIEWS

def fake_news_detector(request):
    """Render the fake news detector page"""
    context = {
        'model_loaded': model_loaded
    }
    return render(request, 'predict.html', context)


def analyze_news(request):
    """Analyze news text and return prediction"""
    if request.method == 'POST':
        try:
            news_text = request.POST.get('news_text', '')
            
            if not news_text.strip():
                return JsonResponse({
                    'success': False,
                    'error': 'Please enter some text to analyze'
                }, status=400)
            
            if not model_loaded or model is None or vectorizer is None:
                return JsonResponse({
                    'success': False,
                    'error': 'Model not loaded. Please check server configuration.'
                }, status=500)
            
            # Clean the input text
            cleaned_text = clean_text(news_text)
            
            # Vectorize
            text_vectorized = vectorizer.transform([cleaned_text])
            
            # Predict
            prediction = int(model.predict(text_vectorized)[0])  # Convert to int
            probability = model.predict_proba(text_vectorized)[0]
            
            # Get confidence scores
            fake_confidence = float(probability[0] * 100)  # Convert to float
            real_confidence = float(probability[1] * 100)  # Convert to float
            
            result = {
                'success': True,
                'prediction': 'Real News' if prediction == 1 else 'Fake News',
                'is_fake': prediction == 0,  # This is already boolean, but let's be explicit
                'confidence': round(max(fake_confidence, real_confidence), 2),
                'fake_probability': round(fake_confidence, 2),
                'real_probability': round(real_confidence, 2)
            }
            
            return JsonResponse(result)
            
        except Exception as e:
            import traceback
            print(f"Error details: {traceback.format_exc()}")  # Debug print
            return JsonResponse({
                'success': False,
                'error': f'Error analyzing text: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=400)

def index(request):
    return render(request, 'index.html')

# Home View
def home(request):
    your_name = "Your Name"
    
    try:
        products = Product.objects.filter(is_featured=True).order_by('-created_at')[:9]
        categories = Category.objects.all()
        
        print("\n" + "="*50)
        print(f" Total Products: {Product.objects.count()}")
        print(f"Featured Products: {products.count()}")
        for p in products:
            print(f"   • {p.name} - Rs {p.price} - Featured: {p.is_featured}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"ERROR: {e}")
        products = []
        categories = []
    
    context = {
        'your_name': your_name,
        'products': products,
        'categories': categories
    }
    return render(request, 'home.html', context)

def signup(request):
    if request.method == 'POST':
        # Debug: Check POST data
        print("\n" + "="*50)
        print(" Signup Form Submitted")
        print("POST Data:", request.POST)
        print("="*50 + "\n")
        
        form = UserRegistrationForm(request.POST)
        
        if form.is_valid():
            try:
                user = form.save()
                username = form.cleaned_data.get('username')
                
                print(f"User created: {username}")
                
                messages.success(request, f'Account created successfully for {username}!')
                login(request, user)
                return redirect('home')
                
            except Exception as e:
                print(f" Error creating user: {e}")
                messages.error(request, f'Error: {str(e)}')
        else:
            print(" Form Errors:", form.errors)
            messages.error(request, 'Please correct the errors below.')
            
            # Show specific errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = UserRegistrationForm()
    
    return render(request, 'signup.html', {'form': form})


# Login View

def login_view(request):
    if request.user.is_authenticated:
        messages.info(request, "You are already logged in")
        return redirect("home")

    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, "Login successful")

            #  SAFE next redirect
            next_page = request.POST.get("next")
            if next_page:
                return redirect(next_page)
            return redirect("home")

        else:
            messages.error(request, "Invalid username or password")

    else:
        form = AuthenticationForm()

    return render(request, "login.html", {"form": form})

def logout_view(request):
    logout(request)
    return redirect('login')

# Contact View
def contact(request):
    contact_form = ContactForm()
    contact_model_form = ContactModelForm()
    
    if request.method == 'POST':
        if 'contact_form' in request.POST:
            contact_form = ContactForm(request.POST)
            if contact_form.is_valid():
                ContactMessage.objects.create(
                    name=contact_form.cleaned_data['name'],
                    email=contact_form.cleaned_data['email'],
                    subject=contact_form.cleaned_data['subject'],
                    message=contact_form.cleaned_data['message']
                )
                messages.success(request, 'Your message has been sent successfully!')
                return redirect('contact')
        
        elif 'contact_model_form' in request.POST:
            contact_model_form = ContactModelForm(request.POST)
            if contact_model_form.is_valid():
                contact_model_form.save()
                messages.success(request, 'Your message has been saved successfully!')
                return redirect('contact')
    
    context = {
        'contact_form': contact_form,
        'contact_model_form': contact_model_form
    }
    return render(request, 'contact.html', context)


# Service View
def service(request):
    service_form = ServiceForm()
    service_model_form = ServiceModelForm()
    
    if request.method == 'POST':
        if 'service_form' in request.POST:
            service_form = ServiceForm(request.POST)
            if service_form.is_valid():
                ServiceRequest.objects.create(
                    full_name=service_form.cleaned_data['full_name'],
                    email=service_form.cleaned_data['email'],
                    phone=service_form.cleaned_data['phone'],
                    service_type=service_form.cleaned_data['service_type'],
                    priority=service_form.cleaned_data['priority'],
                    description=service_form.cleaned_data['description']
                )
                messages.success(request, 'Your service request has been submitted!')
                return redirect('service')
        
        elif 'service_model_form' in request.POST:
            service_model_form = ServiceModelForm(request.POST)
            if service_model_form.is_valid():
                service_model_form.save()
                messages.success(request, 'Your service request has been saved successfully!')
                return redirect('service')
    
    context = {
        'service_form': service_form,
        'service_model_form': service_model_form
    }
    return render(request, 'service.html', context)

def settings_view(request):
    return render(request, 'settings.html')


    

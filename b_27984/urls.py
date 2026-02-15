from django.urls import path
from .api_views import CarListCreateAPIView
from . import views


urlpatterns = [

    path('', views.home, name='home'),
    path('settings/', views.settings_view, name='settings'),
    path('search/', views.home, name='search'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('contact/', views.contact, name='contact'),
    path('service/', views.service, name='service'),
    path('predict/', views.fake_news_detector, name='predict'),  
    path('analyze/', views.analyze_news, name='analyze_news'),   
    path('api/cars/', CarListCreateAPIView.as_view()),
    path('consultations/calendar/', views.consultation_calendar, name='consultation_calendar'),
    path('consultations/book/', views.book_consultation, name='book_consultation'),
    path('consultations/book/<int:product_id>/', views.book_consultation, name='book_consultation_product'),
    path('consultations/<int:consultation_id>/', views.consultation_detail, name='consultation_detail'),
    path('consultations/<int:consultation_id>/cancel/', views.cancel_consultation, name='cancel_consultation'),
    
    # Product detail URLs
    path('detail/', views.detail_view, name='detail_no_id'),
    path('detail/<int:product_id>/', views.detail_view, name='detail'),
    
    # Other URLs
    path('calendar/', views.calendar_view, name='calendar'),
 
]

from django.contrib import admin
from .models import Category, Product, Order, ContactMessage, ServiceRequest
from .models import VendorProfile, VendorAvailability, Consultation

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'expertise', 'hourly_rate', 'is_available']
    list_filter = ['is_available']
    search_fields = ['user__username', 'expertise']

@admin.register(VendorAvailability)
class VendorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active']

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['customer', 'vendor', 'date', 'start_time', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['customer__username', 'vendor__user__username']
    date_hierarchy = 'date'

# Task 7: Register Tables in Admin with Complete Configuration
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    ordering = ['-created_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'stock', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['category', 'is_featured', 'created_at']
    list_editable = ['price', 'stock', 'is_featured']
    ordering = ['-created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'quantity', 'total_price', 'status', 'order_date']
    search_fields = ['user__username', 'product__name']
    list_filter = ['status', 'order_date']
    list_editable = ['status']
    ordering = ['-order_date']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'subject', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'email', 'service_type', 'priority', 'created_at']
    search_fields = ['full_name', 'email', 'service_type', 'description']
    list_filter = ['priority', 'created_at']
    list_editable = ['priority']
    ordering = ['-created_at']
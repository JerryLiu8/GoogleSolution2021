from django.urls import path

from . import views

app_name = 'avs'
urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload, name='upload'),
    path('summary/', views.summary_page, name='summary')
]

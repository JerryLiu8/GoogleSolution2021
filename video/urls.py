from django.urls import path
from django.views.generic import TemplateView

from . import views

app_name = 'avs'
urlpatterns = [
    path('',TemplateView.as_view(template_name='index.html')),
    # path('', views.home, name="home"),
    path('upload/', views.upload, name='upload'),
    path('summary/', views.summary_page, name='summary'),
    path('results/', views.results, name='results')
]

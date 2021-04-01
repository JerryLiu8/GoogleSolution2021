from django.shortcuts import render, HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from os import remove
import pose_class_train
from pose_classification import classify


def convert_file(file):
    filename = f'tmp/{str(file)}'
    with open(f'tmp/{str(file)}', 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    reps = classify(filename)
    remove(filename)
    return reps


@csrf_exempt
def upload(request):
    if request.method == 'POST':
        request.session['summary'] = convert_file(request.FILES['video'])

    return HttpResponse(status=200)


def results(request):
    if request.method == 'GET':
        data={
            'wallPushups':request.session.get('summary', '')
        }
        print(data)
        return JsonResponse(data)


def summary_page(request):
    summary = request.session.get('summary', '')
    return render(request, 'video/summary.html', context={'summary': summary})


def home(request):
    return render(request, 'video/home.html')

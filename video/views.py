from django.shortcuts import render, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
import ffmpeg
from os import remove
import pose_class_train
from pose_classification import classify


def convert_file(file):
    filename = f'tmp/{str(file)}'
    mp4_filename = filename[:-4] + 'mp4'
    with open(f'tmp/{str(file)}', 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    ffmpeg.input(filename).output(mp4_filename).overwrite_output().run()
    remove(filename)
    # do machine learning stuff
    reps = classify(mp4_filename)
    remove(mp4_filename)
    return reps


@csrf_exempt
def upload(request):
    if request.method == 'POST':
        # print(request.POST)
        # print(request.FILES)
        # print(request.FILES['video'])
        # print(dir(request.FILES['video']))

        request.session['summary'] = convert_file(request.FILES['video'])

    return HttpResponseRedirect('')


def summary_page(request):
    summary = request.session.get('summary', '')
    return render(request, 'video/summary.html', context={'summary': summary})


def home(request):
    return render(request, 'video/home.html')

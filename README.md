# GoogleSolution2021
Google Solution Challenge 2021

Check out the demo [video](https://youtu.be/sJjPFmnNey0)!

Check out the webapp https://google-solution.herokuapp.com/physiodash !

## To Run Locally:

### Setup Node.js
Ensure you have the appropriate node_modules installed.
```
cd physiodash/
npm install
npm run build
```

### Setup Python

Run `python -m pip install -r requirements.txt`

Train the model using `python pose_class_train.py`

Run the Django webserver using `python manage.py runserver`

Access the webapp at `http://127.0.0.1:8000/physiodash`

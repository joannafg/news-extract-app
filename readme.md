<!-- # git push heroku backend:master

heroku apps //find app name 
app name: pacific-stream-59101
heroku git:remote -a pacific-stream-59101 //to set up heroku with git 

heroku logs -n 200
heroku logs --tail -->

appname: news-extract-app-fly
flyctl deploy -a news-extract-app-fly
fly info -a news-extract-app-fly
flyctl status -a news-extract-app-fly
flyctl logs -a news-extract-app-fly
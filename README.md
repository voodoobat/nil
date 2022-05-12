# nil

## basic usage:

`pnpm run build` - runs all tasks

`pnpm run dev` - runs all tasks with file watchers and browser-sync server 

## deploy to heroku:

### login & create app
```
heroku login
heroku apps:create [app name]
```

### add buildpacks
```
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
```

### set env variables
```
heroku config:set VARIABLE=value
```

### deploy
```
git push heroku master
```

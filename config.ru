require 'sinatra'
require './feed'
require './projects'

mime_type :less, 'text/css'

get '/' do
  redirect '/index.html'
end

get '/feed.js' do
  Feed.retrieve
end

get '/projects.js' do
  Projects.retrieve
end

run Sinatra::Application

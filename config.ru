require 'sinatra'
require './feed'

mime_type :less, 'text/css'

get '/' do
  redirect '/index.html'
end

get '/feed.js' do
  Feed.retrieve
end

run Sinatra::Application

require 'sinatra'
require './feed'
require './code'

mime_type :less, 'text/css'

get '/' do
  File.new('public/index.html').readlines
end

get '/feed.js' do
  Feed.retrieve
end

get '/code.js' do
  Code.retrieve
end

run Sinatra::Application

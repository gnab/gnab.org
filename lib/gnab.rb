require 'sinatra'

module Gnab
  autoload :Feed,  'gnab/feed'
  autoload :Code,  'gnab/code'

  class Application < Sinatra::Base
    mime_type :less, 'text/css'

    set :root, File.join(File.dirname(__FILE__), '..')

    get '/' do
      File.new('public/index.html').readlines
    end

    get '/feed.json' do
      Feed.retrieve
    end

    get '/code.json' do
      Code.retrieve
    end
  end
end

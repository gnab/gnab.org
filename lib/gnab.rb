require 'sinatra'

module Gnab
  autoload :Feed,  'gnab/feed'
  autoload :Code,  'gnab/code'
  autoload :Cache, 'gnab/cache'

  class Application < Sinatra::Base
    mime_type :less, 'text/css'

    get '/' do
      File.new('public/index.html').readlines
    end

    get '/feed.json' do
      Feed.retrieve
    end

    get '/code.json' do
      Code.retrieve
    end

    get '/ping' do
      Cache.refresh!
      Cache.stats
    end
  end
end

$LOAD_PATH.unshift '../lib'

require 'rack/test'
require 'sinatra'
require 'json'

require 'gnab'

set :environment, :test
set :run, false
set :raise_errors, true
set :logging, false

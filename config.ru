$LOAD_PATH.unshift('./lib')

set :environment, :production

require 'gnab'

run Gnab::Application

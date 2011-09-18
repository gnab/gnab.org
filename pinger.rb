require 'simple_worker'
require 'open-uri'

class Pinger < SimpleWorker::Base
  def run
    open 'http://gnab.org/ping'
  end
end

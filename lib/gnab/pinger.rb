require 'simple_worker'
require 'open-uri'

module Gnab
  class Pinger < SimpleWorker::Base
    def run
      open 'http://gnab.org/ping'
    end
  end
end

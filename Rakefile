require './pinger'

SimpleWorker.configure do |config|
  config.access_key = ENV['SIMPLE_WORKER_ACCESS_KEY']
  config.secret_key = ENV['SIMPLE_WORKER_SECRET_KEY']
end

namespace :ping do
  task :start do
    pinger = Pinger.new
    pinger.schedule(:start_at => Time.now, :run_every => 60*15)
  end
  task :test do
    pinger = Pinger.new
    pinger.run_local
  end
end

task :server do
 sh %{shotgun -s thin}
end

task :default => :server

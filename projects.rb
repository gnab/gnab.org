require 'json'
require 'octopussy'
require './feed'

module Projects
  def self.get_updated_at(entry)
    datetime = DateTime.parse(entry[:pushed_at]).to_time
    Feed.format_datetime(datetime)
  end

  def self.retrieve
    entries = Octopussy::Client.new.list_repos('gnab')  
  
    projects = entries.sort_by {|e| e[:pushed_at]}.reverse.collect do |entry|
      {
        :name => entry[:name],
        :description => entry[:description],
        :url => entry[:url],
        :created_at => entry[:created_at],
        :updated_at => get_updated_at(entry),
        :language => entry[:language],
        :url => entry[:url],
        :watchers => entry[:watchers],
        :forks => entry[:forks]
      }
    end

    JSON(projects)
  end
end

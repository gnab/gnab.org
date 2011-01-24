require 'json'
require 'octopussy'

module Projects
  def self.retrieve
    entries = Octopussy::Client.new.list_repos('gnab')  
  
    projects = entries.collect do |entry|
      entry
      {
        :name => entry[:name],
        :description => entry[:description],
        :url => entry[:url],
        :created_at => entry[:created_at],
        :updated_at => entry[:pushed_at],
        :language => entry[:language],
        :url => entry[:url]
      }
    end

    JSON(projects)
  end
end

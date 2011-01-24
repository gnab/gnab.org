require 'json'
require 'octopussy'

module Projects
  def self.retrieve
    entries = Octopussy::Client.new.list_repos('gnab')  
  
    projects = entries.collect do |entry|
      entry
    end

    JSON(projects)
  end
end

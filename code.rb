require 'json'
require 'uri'
require 'net/http'
require './common'

module Code
  extend Common

  URL = 'http://github.com/api/v2/json/repos/search/username:gnab'
  FIELDS = [:name, :description, :url, :pushed_at, :language, :url, :watchers, 
            :forks] 

  def self.retrieve
    data = Net::HTTP.get_response(URI.parse(URL)).body
    
    repos = JSON.parse(data)['repositories'].collect do |entry|
      FIELDS.inject({}) do |repo, field|
        repo[field] = entry[field.to_s]
        repo[:kind] = :project
        repo
      end
    end

    repos = sort_by_and_format_datetime(repos, :pushed_at)

    JSON(repos)
  end
end

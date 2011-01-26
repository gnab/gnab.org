require 'json'
require 'uri'
require 'net/http'
require './feed'

module Projects
  URL = 'http://github.com/api/v2/json/repos/search/username:gnab'

  def self.get_updated_at(entry)
    datetime = DateTime.parse(entry['pushed_at']).to_time
    Feed.format_datetime(datetime)
  end

  def self.retrieve
    data = Net::HTTP.get_response(URI.parse(URL)).body
    entries = JSON.parse(data)['repositories']

    projects = entries.sort_by {|e| e[:pushed_at]}.reverse.collect do |entry|
      {
        :name => entry['name'],
        :description => entry['description'],
        :url => entry['url'],
        :created_at => entry['created_at'],
        :updated_at => get_updated_at(entry),
        :language => entry['language'],
        :url => entry['url'],
        :watchers => entry['watchers'],
        :forks => entry['forks']
      }
    end

    JSON(projects)
  end
end

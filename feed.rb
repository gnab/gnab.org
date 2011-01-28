require 'json'
require 'twitter'
require 'net/http'
require 'net/https'
require 'rss'
require './common'

module Feed
  def self.get_created_at(entry)
    datetime = DateTime.parse(entry['created_at']) + 
      entry['user']['utc_offset'].to_f / 3600 / 24
    Common.format_datetime(datetime)
  end

  def self.get_text(entry)
    text = entry['text']

    text.gsub!(/(https?:\/\/[^\s]+)/, '<a href="\1">\1</a>')
    text.gsub!(/@([a-z][a-z0-9_]*)/i, '@<a href="http://twitter.com/\1">\1</a>')
    text.gsub!(/(#[a-z][a-z0-9_]*)/i) do |match|
      '<a href="http://twitter.com/search?q=' +
        CGI::escape(match) + '">' + match + '</a>'
    end

    text
  end

  def self.retrieve_activities
    http = Net::HTTP.new('github.com', 443)
    http.use_ssl = true
    resp, data = http.get('/gnab.atom')
    rss = RSS::Parser.parse(data, false)
    rss.methods
  end

  def self.retrieve
    timeline = Twitter.user_timeline('gnab', :include_rts => true)

    feed = timeline.collect do |entry|
      forwarded = entry.has_key?('retweeted_status')
      entry = entry['retweeted_status'] if forwarded

      {
        :forwarded => forwarded,
        :source => entry['source'],
        :text => get_text(entry),
        :created_at => get_created_at(entry),
        :user => entry['user']['screen_name'],
        :id => entry['id_str']
      }
    end

    JSON(feed)
  end
end

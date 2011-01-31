require 'json'
require 'twitter'
require 'net/http'
require 'net/https'
require 'rss'
require './common'

module Feed
  def self.format_tweet_text(entry)
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
    rss.entries.collect do |entry|
      {
        :title => entry.title.content,
        :created_at => entry.published.content,
        :source => entry.link.href,
        :text => entry.content.content,
        :kind => 'github'
      }
    end
  end

  def self.retrieve_tweets
    timeline = Twitter.user_timeline('gnab', :include_rts => true)

    timeline.collect do |entry|
      forwarded = entry.has_key?('retweeted_status')
      entry = entry['retweeted_status'] if forwarded
      created_at = DateTime.parse(entry['created_at']) + 
          entry['user']['utc_offset'].to_f / 3600 / 24
      {
        :forwarded => forwarded,
        :source => entry['source'],
        :text => format_tweet_text(entry),
        :created_at => created_at.to_time,
        :user => entry['user']['screen_name'],
        :id => entry['id_str'],
        :kind => 'twitter'
      }
    end
  end

  def self.retrieve
    activities = retrieve_activities
    tweets = retrieve_tweets

    feed = activities + tweets

    feed.sort_by!{ |e| e[:created_at] }.reverse!

    JSON(feed)
  end
end

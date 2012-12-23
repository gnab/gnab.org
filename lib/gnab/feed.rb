require 'json'
require 'twitter'
require 'net/http'
require 'net/https'
require 'gnab/common'

module Gnab::Feed
  extend Gnab::Common

  ITEMS_URL = 'http://www.google.no/reader/public/javascript/user/16092426485513345180/state/com.google/%s?n=20'

  def self.retrieve
    activities = retrieve_activities
    tweets = retrieve_tweets
    posts = retrieve_shared_posts

    feed = sort_by_and_format_datetime(activities + tweets + posts, :created_at)

    JSON(feed)
  end

  def self.retrieve_activities
    http = Net::HTTP.new('api.github.com', 443)
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    http.use_ssl = true
    data = http.request(Net::HTTP::Get.new('/users/gnab/events')).body

    JSON.parse(data).select { |entry| entry['type'] == 'PushEvent' }.collect do |entry|
      {
        :type => 'push',
        :created_at => DateTime.parse(entry['created_at']).to_time,
        :repository => {
          :name => entry['repo']['name'],
          :description => entry['repo']['description'],
          :url => entry['repo']['url']
        },
        :commits => entry['payload']['commits'].collect { |commit|
          {
            :message => commit['message'],
            :sha => commit['sha']
          }
        }.reverse,
        :kind => 'github'
      }
    end
  end

  def self.retrieve_shared_posts
    data = Net::HTTP.get_response(URI.parse(ITEMS_URL % ['broadcast'])).body

    JSON.parse(data)['items'].collect do |entry|
      {
        :forwarded => true,
        :title => entry['title'],
        :text => format_post_text(entry['content'].to_s),
        :created_at => Time.at(entry['published'].to_i),
        :url => entry['alternate']['href'],
        :author => entry['author'],
        :source => {
          :title => entry['origin']['title'],
          :url => entry['origin']['htmlUrl']
        },
        :kind => 'reader'
      }
    end
  end

  def self.format_post_text(text)
    text
      .gsub(/\[image:[^\]]+?\]/i, '')
      .format_and_escape_urls
  end

  def self.retrieve_tweets
    begin
      timeline = Twitter.user_timeline('gnab', :include_rts => true)
    rescue
      return []
    end

    timeline.collect do |entry|
      entry = entry.retweeted_status if entry.retweeted?
      created_at = entry.created_at + entry.user.utc_offset.to_f / 3600 / 24
      {
        :forwarded => entry.retweeted?,
        :source => entry.source,
        :text => format_tweet_text(entry.text),
        :created_at => created_at.to_time,
        :user => entry.user.screen_name,
        :id => entry.id,
        :kind => 'twitter'
      }
    end
  end

  def self.format_tweet_text(text)
    text
      .format_and_escape_urls
      .gsub(/@([a-z][a-z0-9_]*)/i, '@<a href="http://twitter.com/\1">\1</a>')
      .gsub(/(#[a-z][a-z0-9_]*)/i) do |match|
        '<a href="http://twitter.com/search?q=%s">%s</a>' %
          [CGI::escape(match), match]
      end
  end
end

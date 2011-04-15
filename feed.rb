require 'json'
require 'twitter'
require 'octopussy'
require './common'

module Feed
  extend Common

  ITEMS_URL = 'http://www.google.no/reader/public/javascript/user/16092426485513345180/state/com.google/%s?n=20'

  def self.retrieve
    activities = retrieve_activities
    tweets = retrieve_tweets
    posts = retrieve_shared_posts

    feed = sort_by_and_format_datetime(activities + tweets + posts, :created_at)

    JSON(feed)
  end

  def self.retrieve_activities
    begin
      timeline = Octopussy::Client.new.public_timeline('gnab')
    rescue Twitter::BadRequest
      return []
    end

    timeline.select{ |entry| entry.type == 'PushEvent' }.collect do |entry|
      { 
        :type => 'push',
        :created_at => DateTime.parse(entry.created_at).to_time,
        :repository => {
          :name => entry.repository.name,
          :description => entry.repository.description,
          :url => entry.repository.url,
          :owner => entry.repository.owner
        },
        :commits => entry.payload.shas.collect { |sha| 
          {
            :message => sha[2],
            :sha => sha[0]
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
    timeline = Twitter.user_timeline('gnab', :include_rts => true)

    timeline.collect do |entry|
      forwarded = entry.has_key?('retweeted_status')
      entry = entry['retweeted_status'] if forwarded
      created_at = DateTime.parse(entry['created_at']) + 
          entry['user']['utc_offset'].to_f / 3600 / 24
      {
        :forwarded => forwarded,
        :source => entry['source'],
        :text => format_tweet_text(entry['text']),
        :created_at => created_at.to_time,
        :user => entry['user']['screen_name'],
        :id => entry['id_str'],
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

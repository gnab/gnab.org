require 'json'
require 'twitter'
require 'octopussy'
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
    timeline = Octopussy::Client.new.public_timeline('gnab')

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
        },
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

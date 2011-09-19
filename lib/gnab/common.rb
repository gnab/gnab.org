require 'date'

module Gnab::Common
  def sort_by_and_format_datetime(list, field)
    list.sort_by { |e| e[field] }.reverse.collect do |e|
      e[field] = DateTime.parse(e[field]).to_time if e[field].is_a?(String)
      e[field] = Gnab::Common.format_datetime(e[field])
      e
    end
  end

  def self.format_datetime(datetime)
    datetime.strftime('%d %b %Y %T %z')
  end
end

class String
  def format_and_escape_urls
    self.gsub(/(https?:\/\/[^\s]+)/i) do |match|
      escaped_url = CGI::escape_html(match)
      '<a href="%s">%s</a>' % [escaped_url, escaped_url]
    end
  end
end

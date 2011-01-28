module Common
  def self.format_datetime(datetime)
    datetime.strftime("%k:%M %b %e") + case datetime.day % 10
      when 1
        'st'
      when 2
        'nd'
      when 3
        'rd'
      else
        'th'
    end
  end
end

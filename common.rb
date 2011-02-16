module Common
  def self.format_datetime(datetime)
    datetime.strftime('%d %b %Y %T %z')
  end
end

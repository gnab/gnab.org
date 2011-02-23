module Common
  def sort_by_and_format_datetime(list, field)
    list.sort_by { |e| e[field] }.reverse.collect do |e|
      e[field] = DateTime.parse(e[field]).to_time if e[field].is_a?(String)
      e[field] = Common.format_datetime(e[field])
      e
    end
  end

  def self.format_datetime(datetime)
    datetime.strftime('%d %b %Y %T %z')
  end
end

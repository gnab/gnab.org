require 'json'
require 'uri'
require 'net/http'
require 'net/https'
require 'gnab/common'

module Gnab::Code
  extend Gnab::Common

  FIELDS = [:name, :description, :pushed_at, :language, :watchers, :forks,
            :html_url => :url]

  def self.retrieve
    http = Net::HTTP.new('api.github.com', 443)
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    http.use_ssl = true
    data = http.request(Net::HTTP::Get.new('/users/gnab/repos')).body

    repos = JSON.parse(data).collect do |entry|
      FIELDS.inject({}) do |repo, field|
        if field.is_a?(Hash)
          from, to = field.first
          repo[to] = entry[from.to_s]
        else
          repo[field] = entry[field.to_s]
        end
        repo[:kind] = :project
        repo
      end
    end

    repos = sort_by_and_format_datetime(repos, :pushed_at)

    JSON(repos)
  end
end

require 'spec_helper'

describe Gnab::Application do
  include Rack::Test::Methods 

  def app
    Gnab::Application
  end

  def json
    @json ||= JSON.parse(last_response.body)
  end

  describe '/feed.json' do
    it 'should return feed JSON' do
      Gnab::Feed.stub!(:retrieve).and_return(%{[{"key":"value"}]})
      get '/feed.json'
      json.should == [{'key' => 'value'}]
    end
  end

  describe '/code.json' do
    it 'should return code JSON' do
      Gnab::Code.stub!(:retrieve).and_return(%{[{"key":"value"}]})
      get '/code.json'
      json.should == [{'key' => 'value'}]
    end
  end
end

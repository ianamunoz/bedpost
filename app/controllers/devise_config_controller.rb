require "responders/devise_responder"
class DeviseConfigController < ApplicationController
	self.responder = DeviseResponder
	respond_to :json, :html

	def render *args
		gon_client_validators(resource)
		super
	end
end

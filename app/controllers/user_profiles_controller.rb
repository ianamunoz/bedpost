class UserProfilesController < ProfilesController
	protected
	def set_profile
		@profile = current_user
	end
end

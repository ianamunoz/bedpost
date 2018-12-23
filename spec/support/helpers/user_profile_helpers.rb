module UserProfileHelpers
	private
	@@_dummy_user = nil
	@@_dummy_pronoun = nil

	public
	def dummy_user
		dummy_pronoun
		@@_dummy_user ||= FactoryBot.create(:user_profile)

		return @@_dummy_user
	end

	def dummy_pronoun
		@@_dummy_pronoun ||= FactoryBot.create(:pronoun)
		return @@_dummy_pronoun
	end

	def dummy_user_session
		{user_id: dummy_user.id}
	end

	def clear_dummy_user
		@@_dummy_user.destroy if @@_dummy_user
		@@_dummy_user = nil
	end

	def clear_all_dummies
		clear_dummy_user
		@@_dummy_pronoun.destroy if @@_dummy_pronoun
		@@dummy_pronoun = nil
	end
end

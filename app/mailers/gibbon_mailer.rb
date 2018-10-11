module GibbonMailer
	private
	# TODO put these in a database or something
	@@list = "f8579e37ce"
	@@automation = "a70a7ca550"
	@@welcomeQueue = "fd3865a10d"
	@@resetQueue = "b2b54cb1da"

	def sendWelcome(user_profile)
		# new_request.lists(@@list).members.create(body: {email_address: user_profile.email, status: "subscribed", merge_fields: {NAME: user_profile.name}})
		logger.debug "sending welcome email to ${user_profile.email} for new user with id ${user_profile.id}"
	end

	def resendWelcome(user_profile)
		add_to_automation_queue(@@welcomeQueue, user_profile.email)
	end

	def sendReset(user_profile)
		token = UserToken.reset_token!(user_profile.id)
		logger.debug "sending password reset token ${token.id} to user email ${user_profile.email}"
		# gib = new_request
		# email_hash = hashed_email(user_profile)

		# gib.lists(@@list).members(email_hash).update(body: {merge_fields: {R_TOKEN: token.id}})
	end

	private
	def add_to_automation_queue(email_id, email_to_add)
		new_request.automations(@@automation).emails(email_id).queue.create(body: {email_address: email_to_add})
	end
	def hashed_email(user_profile)
		Digest::MD5.hexdigest user_profile.email
	end
	def new_request
		Gibbon::Request.new(api_key: ENV["MAILCHIMP_API_KEY"])
	end
end

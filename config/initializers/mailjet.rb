# kindly generated by appropriated Rails generator
Mailjet.configure do |config|
  config.api_key = Rails.application.credentials.mailjet!.fetch(:api_key) {raise 'no mailjet api key found'}
  config.secret_key = Rails.application.credentials.mailjet!.fetch(:secret_key) {raise 'no mailjet secret key found'}
  config.default_from = 'support@bedpost.me'
  # Mailjet API v3.1 is at the moment limited to Send API.
  # We’ve not set the version to it directly since there is no other endpoint in that version.
  # We recommend you create a dedicated instance of the wrapper set with it to send your emails.
  # If you're only using the gem to send emails, then you can safely set it to this version.
  # Otherwise, you can remove the dedicated line into config/initializers/mailjet.rb.
  config.api_version = 'v3.1'
end

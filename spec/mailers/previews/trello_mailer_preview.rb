# Preview all emails at http://localhost:3000/rails/mailers/trello_mailer
class TrelloMailerPreview < ActionMailer::Preview
	def bug_report
		report = {
			title: "A bug has appeared!",
			reproduced_times: 3,
			expected_behavior: "nothing",
			actual_behavior: "something",
			steps: "some steps",
			notes: ""
		}

		TrelloMailer.bug_report(report)
	end
end

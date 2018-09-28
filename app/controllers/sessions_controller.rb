class SessionsController < ApplicationController
	skip_before_action :require_user, only: [:new, :create]
  before_action :require_no_user, only: [:new, :create]

	def new
		@url = params[:r]
	end

	def create
		email = params[:session][:email]
    @user = UserProfile.find_by(email: email.downcase)
    password = params[:session][:password]
    if @user && @user.authenticate(password)
      session[:user_id] = @user.id
      redirect_to params[:r] || user_profile_path
    else
    	flash[:error] = "oops, wrong email or password"
      #keep the entered email address, but clear the password
      flash[:email] = email
      redirect_to login_path
    end
  end
  def destroy
    session[:user_id] = nil
    redirect_to '/'
  end
end

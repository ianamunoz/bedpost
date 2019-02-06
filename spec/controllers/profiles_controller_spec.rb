require 'rails_helper'

# This spec was generated by rspec-rails when you ran the scaffold generator.
# It demonstrates how one might use RSpec to specify the controller code that
# was generated by Rails when you ran the scaffold generator.
#
# It assumes that the implementation code is generated by the rails scaffold
# generator.  If you are using any extension libraries to generate different
# controller code, this generated spec may or may not pass.
#
# It only uses APIs available in rails and/or rspec-rails.  There are a number
# of tools you can use to make these specs even more expressive, but we're
# sticking to rails and rspec-rails APIs to keep things simple and stable.
#
# Compared to earlier versions of this generator, there is very limited use of
# stubs and message expectations in this spec.  Stubs are only used when there
# is no simpler way to get a handle on the object needed for the example.
# Message expectations are only used when there is no simpler way to specify
# that an instance is receiving a specific message.
#
# Also compared to earlier versions of this generator, there are no longer any
# expectations of assigns and templates rendered. These features have been
# removed from Rails core in Rails 5, but can be added back in via the
# `rails-controller-testing` gem.

RSpec.describe ProfilesController, type: :controller do

  # This should return the minimal set of attributes required to create a valid
  # Profile. As you add validations to Profile, be sure to
  # adjust the attributes here as well.

  before :each do
    @partnership = nil
    @prof = nil
  end

  after :each do
    @partnership.destroy if @partnership.present? && @partnership.persisted?
    @prof.destroy if @prof.present? && @prof.persisted?
  end

  describe "GET #show" do
    it "shows the profile of the partner in the partnership" do
      @prof = create(:profile)
      @partnership = dummy_user.partnerships.create(partner: @prof)

      get :show, params: {partnership_id: @partnership.to_param}, session: dummy_user_session
      expect(response).to be_successful
      expect(assigns(:profile)).to eq @prof
    end
  end

  describe "GET #new" do
    it "returns a success response" do
      get :new, params: {}, session: dummy_user_session
      expect(response).to be_successful
    end
  end

  describe "GET #edit" do
    context "the user made a dummy profile for their partner" do
      it "returns the edit page for that dummy partner" do
        @prof = create(:profile)
        @partnership = dummy_user.partnerships.create(partner: @prof)
        get :edit, params: {partnership_id: @partnership.to_param}, session: dummy_user_session
        expect(response).to be_successful
        expect(assigns(:profile)).to eq @prof
      end
    end

    context "the user is partnered with another user on the platform" do
      it "redirects the user to the partnership page" do
        @prof = create(:user_profile)
        @partnership = dummy_user.partnerships.create(partner: @prof)
        get :edit, params: {partnership_id: @partnership.to_param}, session: dummy_user_session

        expect(response).to redirect_to @partnership
      end
    end
  end

  describe "POST #create" do
    context "with valid params" do
      # before :each do
      #   @prof = nil
      # end

      def get_valid_params
        {profile: attributes_for(:profile)}
      end

      def get_new_prof(params)
        Profile.last
      end

      it "creates a new Profile" do
        session = dummy_user_session
        expect {
          post :create, params: get_valid_params, session: session
        }.to change(Profile, :count).by(1)
        @prof = Profile.last
      end

      it "redirects to the new partnership page with the new profile as the partner" do
        post :create, params: get_valid_params, session: dummy_user_session
        @prof = Profile.last
        expect(response).to redirect_to new_partnership_path(p_id: @prof.id)
      end
    end

    context "with invalid params" do
      it "redirects to the new partner profile page to try again" do
        post :create, params: {profile: {name: "name"}}, session: dummy_user_session
        expect(response).to redirect_to new_profile_path
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      before :each do
        @prof = create(:profile)
        @partnership = dummy_user.partnerships.create(partner: @prof)
      end

      it "updates the requested profile" do
        put :update, params: {partnership_id: @partnership.to_param, profile: {external_name: "something"}}, session: dummy_user_session
        @prof.reload
        expect(@prof.external_name).to eq "something"
      end

      it "redirects to the partnership the profile is attached to" do
        put :update, params: {partnership_id: @partnership.to_param, profile: {external_name: "something"}}, session: dummy_user_session
        expect(response).to redirect_to @partnership
      end
    end

    # context "with invalid params" do
    #   it "returns a success response (i.e. to display the 'edit' template)" do
    #     profile = Profile.create! valid_attributes
    #     put :update, params: {id: profile.to_param, profile: invalid_attributes}, session: dummy_user_session
    #     expect(response).to be_successful
    #   end
    # end
  end

  # describe "DELETE #destroy" do
  #   it "destroys the requested profile" do
  #     profile = Profile.create! valid_attributes
  #     expect {
  #       delete :destroy, params: {id: profile.to_param}, session: dummy_user_session
  #     }.to change(Profile, :count).by(-1)
  #   end

  #   it "redirects to the profiles list" do
  #     profile = Profile.create! valid_attributes
  #     delete :destroy, params: {id: profile.to_param}, session: dummy_user_session
  #     expect(response).to redirect_to(profiles_url)
  #   end
  # end
end

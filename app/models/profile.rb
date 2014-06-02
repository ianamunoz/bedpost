class Profile < ActiveRecord::Base
  attr_accessible :anus_name, :email, :genital_name, :name, :password_digest, :pronoun, :password, :password_confirmation, :uid
  has_many :partnerships, foreign_key: "user_id"
  has_many :partners, :through => :partnerships, :source => :partner
  has_many :sti_tests
  has_many :encounters
  has_secure_password
end

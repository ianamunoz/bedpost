class EncounterContact
  include Mongoid::Document
  include NormalizeBlankValues

  attr_accessor :risk

  field :barriers, type: Array, default: []
  field :position, type: Integer, default: -> {encounter.present? ? encounter.contacts.length : 0}
  field :object, type: Symbol, default: :partner
  field :subject, type: Symbol, default: :user

  embedded_in :encounter
  belongs_to :possible_contact

  validates_uniqueness_of :position
  validates_presence_of :position, :object, :subject

  def barrier_validations
  end

  def is_self?
    return subject == object
  end

  def has_barrier?
    barriers.any? && barriers.include?(:old) || barriers.include?(:fresh)
  end

  def self.display_fields
    [:possible_contact, :barriers, :subject, :object, :risk]
  end
end

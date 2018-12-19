module VuelidateForm; class VuelidateFormBuilder < ActionView::Helpers::FormBuilder

	include VuelidateFormUtils

	attr_reader :validations

	(field_helpers - [:fields_for, :fields, :label, :check_box, :hidden_field, :password_field]).each do |selector|
    class_eval <<-RUBY_EVAL, __FILE__, __LINE__ + 1
      def #{selector}(method, options = {})  # def text_field(method, options = {})
        field_builder(method, options).field do
        	super
        end
      end                                    # end
    RUBY_EVAL
  end

  def field_builder(attribute, options)
  	VuelidateFieldBuilder.new(attribute, options, self, @template)
  end

  def hidden_field(attribute, options={})
  	options = options.merge({label: false, validate: false})
  	field_builder(attribute, options).field do
  		super
  	end
  end

  def check_box(attribute, args={}, checked_value = "1", unchecked_value = "0")
  	add_to_class(args, "inline", :field_class)
  	field_builder(attribute, args).field do
  		super
  	end
  end

  def toggle(attribute, options={}, toggle_options={})
		add_to_class(options, "inline")
		options[:before_label] = true unless options.has_key?(:before_label)
		field_builder(attribute, options).field do
			toggle_tag(attribute, toggle_options)
		end
	end

  def select(attribute, choices = nil, options = {}, html_options=nil, &block)
		html_options ||= options[:html] || {}
		html_options[:label] = options.delete(:label) if html_options[:label].nil?
		html_options[:class] ||= options.delete(:class)
  	field_builder(attribute, html_options).field do
  		super
  	end
  end

  def password_field(attribute, args={})
  	args[:":type"] = "toggles['password']"
  	after_method = args[:show_toggle] ? :password_toggle : nil
  	field_builder(attribute, args).field(after_method) do
  		super
  	end
  end

  def password_toggle
  	@template.content_tag(:div, {class: "additional", slot: "additional"}) do
  		@template.content_tag(:p) do
  			toggle_tag(:password, {class: "no-line", :":symbols" => "['hide_password', 'show_password']", :":translate" => true, :":vals" => "['text', 'password']"})
  		end
  	end
  end

	def form_errors
		@template.content_tag("form-errors", {:":submission-error" => "submissionError"}) do
			errors = @template.flash[:submission_error]
			if errors.present?
				@template.content_tag(:noscript) do
					@template.content_tag(:div, {class: "errors"}) do
						delim = I18n.t(:join_delimeter)
						errors.each do |att, errs|
							err_text = errs.join(delim)
							@template.concat(@template.content_tag(:div, err_text, {id: "#{att}-error"}))
						end
					end
				end
			end
		end
	end

	def tooltip(attribute, key=true, html_options={})
		t_key = key == true ? attribute : key;
		content = ActionView::Helpers::Tags::Translator.new(@object, @object_name, t_key, scope: "helpers.tooltip").translate
		add_to_class(html_options, "tooltip")
		@template.content_tag :div, html_options do
			@template.content_tag(:div, {class: "tooltip-icon"}) do
				@template.content_tag(:button, "?", {class: "inner not-button", type: "button", role: "tooltip"}) +
				@template.content_tag(:div, content, {class: "tooltip-content", id: "#{attribute}-tooltip-content"})
			end
		end
	end

	def toggle_tag(attribute, toggle_options)
		clear_opt = toggle_options.delete :":clear"
		if clear_opt
			clear_attr = clear_opt == true ? attribute : clear_opt
			toggle_options[:":clear"] = "'#{full_v_name(clear_attr)}'"
		end

		toggle_options.merge! ({
			:"@toggle-event" => "toggle",
			:":val" => "toggles['#{attribute}']",
			:field=> attribute
		})
		@template.content_tag(:toggle, "", toggle_options)
	end


	def objectify_options(options)
	  super.except(:label, :validate, :show_toggle, :"v-show", :show_if, :tooltip, :before_label)
	end

	def add_validation(attribute)
		@validations ||= []
		@validations << attribute unless @validations.include?(attribute)
	end
end; end

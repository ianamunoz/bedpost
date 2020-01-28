module StaticResource
	extend ActiveSupport::Concern

	included do
		after_save :clear_all_caches if respond_to? :after_save
		after_destroy :clear_all_caches if respond_to? :after_destroy
	end

	def clear_all_caches
		if Rails.env.development?
			Rails.cache.delete_matched(self.class.name)
		else
			Rails.cache.delete_matched('*', namespace: self.class.name)
		end
	end

	class_methods do
		def list
			Rails.cache.fetch('list', namespace: name) { all.to_a }
		end

		def as_map
			Rails.cache.fetch('as_map', namespace: name) {HashWithIndifferentAccess[all.map { |i| [i.id, i] }] }
		end

		def newest(**args)
			return Rails.cache.fetch('newest', namespace: name) { order(updated_at: :asc).last(id_sort: :none) } unless args.any?

			key = args.to_json
			return Rails.cache.fetch("newest#{key}", namespace: name) { where(args).order(updated_at: :asc).last(id_sort: :none) }
		end

		def grouped_by(column, instantiate=true)
			Rails.cache.fetch("#{column}_#{instantiate}", namespace: name) do
				query = collection.aggregate([{
					'$group' => {
						'_id' => "$#{column}",
						'members' => { '$push' => '$$ROOT' }
						}
					}])

				HashWithIndifferentAccess[query.map do |col|
					members = col[:members]
					[col[:_id], instantiate ? members.map { |m| new(m) } : members]
				end
				]
			end
		end

		def cached(key)
			Rails.cache.fetch(key, namespace: name) do
				yield
			end
		end
	end
end

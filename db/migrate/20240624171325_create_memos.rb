class CreateMemos < ActiveRecord::Migration[7.0]
  def change
    create_table :memos do |t|
      t.text :notes
      t.string :name
      t.boolean :bookmarked, null: false, default: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

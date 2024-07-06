# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
require 'open-uri'

if User.exists? && Rails.env.development?
  p "destroying all DB data..."
  Memo.destroy_all
  User.destroy_all
end

p "Creating Admin User..."
admin = User.create!(
  email: "admin@testmail.com",
  password: "test-1234",
  name: "admin user",
  admin: true
)
p "DONE"


p "Creating Dev Memos..."
dev_audio_files = [
  "https://upload.wikimedia.org/wikipedia/commons/0/09/Harry_S._Truman_1948_Victory_speech.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/3/39/From_the_Battlefields_of_France.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/d/d4/Syllable_timing_isochrony.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b8/Willie_Gallacher_Speech_from_Lansbury%27s_Labour_Weekly.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/6/63/Thomas_Edison_Mary_had_lamb.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/4/40/Mi_salutas_vin%2C_karaj_samideanoj%2C_fratoj_kaj_fratinoj_el_la_granda_tutmonda_homa_familio.ogg",
  "https://upload.wikimedia.org/wikipedia/commons/0/03/The_Navy_is_Ready_%28Josephus_Daniels%29.ogg"
]

dev_audio_files.count.times do |n|
  new_memo = Memo.create!(
    name: "Memo #{n + 1}",
    notes: Faker::Lorem.paragraph(sentence_count: 3),
    user: admin
  )

  new_memo.audio_file.attach(io: URI.open(dev_audio_files[n]), filename: "sample.ogg", content_type: 'audio/ogg')
  p new_memo
end

p "DONE"
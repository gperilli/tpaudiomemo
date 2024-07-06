class MemosController < ApplicationController
  before_action :authenticate_user!

  require 'cloudinary'
  require 'cloudinary/uploader'
  require 'cloudinary/utils'
  require 'open-uri'
  require 'streamio-ffmpeg'

  def index
    @memos = current_user.memos.order(created_at: :desc)
  end

  def destroy_all_user_memos
    current_user.memos.each do |memo|
      memo.destroy
    end
  end

  def create
    if memo_params[:audio_file].present?
      begin

        # Convert audio to mp3
        input_file = FFMPEG::Movie.new(memo_params[:audio_file].tempfile.path)
        output_file_path = "#{Rails.root}/tmp/output.mp3"
        input_file.transcode(output_file_path, audio_codec: 'libmp3lame')
      
        # Upload the audio file to Cloudinary
        uploaded_audio = Cloudinary::Uploader.upload(
          output_file_path,
          resource_type: "video" # Still using 'video' since 'auto' or 'raw' were not solving the issue
        )

        # Log the uploaded audio details
        Rails.logger.info("Uploaded audio: #{uploaded_audio}")
    
        # Get the URL of the uploaded file
        audio_url = uploaded_audio['secure_url']
          
        # Log the generated URL
        Rails.logger.info("Generated MP3 URL: #{audio_url}")
    
        # Attach the converted audio URL to the new memo
        new_memo = Memo.new(memo_params)
        new_memo.audio_file.attach(
          io: URI.open(audio_url), 
          filename: "output.mp3", 
          content_type: 'audio/mp3',
        )
        new_memo.user = current_user

        # Save the memo record
        new_memo.save

        # Delete temp file
        File.delete(output_file_path) if File.exist?(output_file_path)

      rescue StandardError => e
        Rails.logger.error("Audio processing or uploading failed: #{e.message}")
        # Handle the error appropriately
      end
    else

      # Use blank audio
      new_memo = Memo.new(memo_params)
      new_memo.audio_file.attach(
          io: URI.open("https://res.cloudinary.com/#{ENV['CLOUDINARY_CLOUD_NAME']}/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm"), 
          filename: "output.mp3", 
          content_type: 'audio/mp3',
        )
      new_memo.user = current_user
      new_memo.save
    end

    head :no_content
  end

  def update
    Memo.find(params[:id]).update(memo_params)
  end

  def destroy 
    Memo.find(params[:id]).destroy
  end

  private

  def memo_params
    params.require(:memo).permit(
      :name,
      :notes,
      :audio_file,
      :bookmarked
    )
  end
end

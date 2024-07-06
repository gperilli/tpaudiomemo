class PagesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:home]

  def home
  end

  def account
  end

  def bookmarks
    @memos = current_user.memos.where(bookmarked: true)
  end
end

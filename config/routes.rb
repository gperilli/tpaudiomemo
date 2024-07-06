Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'registrations' }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "pages#home"

  resources :memos, only: [:create, :update, :destroy, :index]
  get '/memos/destroy_all', to: 'memos#destroy_all_user_memos'
  
  get '/account', to: 'pages#account'
  get '/bookmarks', to: 'pages#bookmarks'

  namespace :admin do      
    get '/edithomepage', to: 'pages#edithomepage'
  end
end
